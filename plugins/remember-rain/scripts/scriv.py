#!/usr/bin/env python3
"""scriv — the Remember Rain Scrivener bridge.

Reads and writes the live Scrivener package, which is the source of truth for
Remember Rain. `src/content/novel/` is compile output and is overwritten on
every export, so never treat an edit there as durable.

Commands
    doctor                  package health, safety state, counts
    list [--arc A]          scene cards with label, words, brief status
    read <card>             a card's body and its index-card brief
    brief <card>            assemble the drafting brief for one scene
    next                    the next unwritten card in spine order
    write <card>            replace a card's body (backup + verified)
    synopsis <card>         replace a card's index-card brief
    label <card> Raw|Drafting|Done
    backups                 list package backups
    restore <n>             restore a backup (backs up the current state first)

<card> is a UUID, a `Folder/Title` path, or a title unique across the binder.

Every mutating command refuses to run while Scrivener is open, duplicates the
whole package to `Scrivener Backup/` first, and verifies its own write. Nothing
is written that does not read back exactly as intended.
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from scrivlib import (  # noqa: E402
    Binder,
    ScrivError,
    arc_of,
    backup_package,
    content_digest,
    list_backups,
    read_synopsis,
    read_text,
    resolve_project,
    scrivener_running,
    set_label,
    word_count,
    write_synopsis,
    write_text,
)

# A scene card whose body is only its `aNsNN_slug` label is unwritten. Nine
# whitespace tokens is comfortably above a label and below any real prose.
STUB_WORDS = 9

# The decision docs a drafting session must obey, with the headings that matter.
LAW_DOCS = [
    ("Themes and Motifs", "Story Plan", ["Gold Vocabulary", "Global Drafting Risks"]),
    ("Choice Points", "Story Plan", ["Protected Non-Choices", "Choice Rules"]),
    ("1 The Spine", "Story Plan", ["Genre Architecture"]),
    ("Magic System", "World", []),
]

PROTOCOL = """\
One session = one card moved forward. Any words count; forty on a bad night is a
session. No word target, no timer.

Chronological through the spine, Arc 1 -> Arc 5. When a later scene is burning,
dictate it into the Inbox: that is idea-building, not out-of-order drafting, and
the card still gets written in sequence.

The stuck ladder - descend one rung at a time, never choose a rung:
  1. Write it badly. Flat dialogue and thin stage direction are pre-authorized.
  2. `{TK}` whatever is blocking. Do not go look, do not decide.
  3. Drop to a beat summary and finish the card anyway:
     `{TK beat: they argue, she walks out}`.
  4. Stop for the day, leaving `{TK next: ...}` so resuming costs nothing.

A first draft is allowed to be bad. It is not allowed to be unfinished.
Unknowns are `{TK ...}` in prose, never a blank or a prose-shaped placeholder.
"""


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def load(args) -> Binder:
    return Binder(resolve_project(getattr(args, "project", None)))


def is_stub(text: str) -> bool:
    return word_count(text) <= STUB_WORDS


def source_text(args) -> str:
    """Read the new body from --from FILE, or stdin when it is '-'."""
    if getattr(args, "from_file", None):
        if args.from_file == "-":
            return sys.stdin.read()
        return Path(args.from_file).read_text(encoding="utf-8")
    if getattr(args, "text", None):
        return args.text
    if not sys.stdin.isatty():
        return sys.stdin.read()
    raise ScrivError("Nothing to write: pass --from FILE, --text, or pipe to stdin.")


def spine_entry(binder: Binder, card):
    """The `1 The Spine` bullet for this card, if one matches.

    The spine numbers every scene within its arc (`- **2 - The vault** - ...`),
    which is exactly the leading number in the card title.
    """
    spine = binder.find_by_title("1 The Spine")
    if spine is None:
        return ""
    number = re.match(r"\s*(\d+)\s", card.title)
    if not number:
        return ""
    arc_num = re.match(r"Arc (\d+)", arc_of(card))
    if not arc_num:
        return ""
    text = read_text(spine)
    # Split into arc sections, then into bullets, and take the bullet whose
    # leading number matches. Arc headings look like "### Arc 1 - The Fugitive".
    sections = re.split(r"\n#{2,4}\s*Arc\s+(\d+)[^\n]*\n", text)
    body = None
    for i in range(1, len(sections) - 1, 2):
        if sections[i] == arc_num.group(1):
            body = sections[i + 1]
            break
    if body is None:
        return ""
    want = number.group(1)
    pattern = r"\s*[-*]\s*\*\*\s*" + re.escape(want) + r"\s*[\u00b7.\u2013-]"
    for line in body.split("\n"):
        if re.match(pattern, line):
            return line.strip()
    return ""


def cast_of(brief: str) -> str:
    """The cast/POV tag line some briefs carry: `Rain, Roxana | prison intake`."""
    for line in reversed(brief.split("\n")):
        if "|" in line and len(line.strip()) < 120:
            return line.strip()
    return ""


# Tokens that appear in brief cast lines but are not character documents.
NON_CHARACTERS = {"group", "suit-self", "the selves", "selves", "everyone", "player"}


def character_index(binder: Binder) -> dict:
    """Map a brief's cast token to its `Characters/` document.

    Document titles carry a binder-order prefix (`1 Vesper`, `0 Rain`) that the
    briefs do not use, so both forms are indexed. Scoped to `Characters/` so a
    same-named card elsewhere in the binder cannot be matched by mistake.
    """
    index = {}
    for card in binder.cards:
        if card.type != "Text" or card.parents[:1] != ["Characters"]:
            continue
        name = re.sub(r"^\d+\s+", "", card.title)
        for key in {name.lower(), card.title.lower(), name.lower().replace("the ", "")}:
            index[key] = card
    return index


def neighbours(binder: Binder, card) -> str:
    scenes = binder.scenes()
    index = scenes.index(card)
    out = []
    for label, i in (("prev", index - 1), ("next", index + 1)):
        if 0 <= i < len(scenes):
            other = scenes[i]
            body = read_text(other)
            state = "stub" if is_stub(body) else "{} words".format(word_count(body))
            out.append("  {}  {}  ({})".format(label, other.title, state))
    return "\n".join(out) if out else "  (none)"


def arc_progress(binder: Binder, card) -> str:
    arc = arc_of(card)
    scenes = [c for c in binder.scenes() if arc_of(c) == arc]
    if not scenes:
        return ""
    done = sum(1 for c in scenes if not is_stub(read_text(c)))
    words = sum(word_count(read_text(c)) for c in scenes)
    return "{}: {}/{} cards have prose, {} words".format(arc, done, len(scenes), words)


# --------------------------------------------------------------------------
# Commands
# --------------------------------------------------------------------------

def cmd_doctor(args) -> int:
    project = resolve_project(args.project)
    binder = Binder(project)
    scenes = binder.scenes()
    written = [c for c in scenes if not is_stub(read_text(c))]

    size = sum(f.stat().st_size for f in project.rglob("*") if f.is_file()) / 1e6
    print("project        {}".format(project))
    print("size           {:.1f} MB".format(size))
    print("scrivener      {}".format(
        "RUNNING - writes will be refused" if scrivener_running() else "not running"
    ))
    print("binder items   {}".format(len(binder.cards)))
    print("scene cards    {} ({} with prose, {} stubs)".format(
        len(scenes), len(written), len(scenes) - len(written)
    ))
    print("manuscript     {} words".format(sum(word_count(read_text(c)) for c in scenes)))
    print("labels         {}".format(
        ", ".join("{}={}".format(k, v)
                  for k, v in sorted(binder.labels.items(), key=lambda kv: int(kv[0])))
    ))
    print("backups        {} in {}".format(
        len(list_backups(project)), project.parent / "Scrivener Backup"
    ))
    print("digest         {}".format(content_digest(project)))

    print("\nArcs")
    for arc in binder.arc_titles():
        cards = [c for c in scenes if arc_of(c) == arc]
        done = sum(1 for c in cards if not is_stub(read_text(c)))
        words = sum(word_count(read_text(c)) for c in cards)
        print("  {:<20} {:>2}/{:<2} cards  {:>5} words".format(arc, done, len(cards), words))

    missing = [c for c in scenes if c.synopsis_txt is None]
    if missing:
        print("\nScene cards with no brief ({}):".format(len(missing)))
        for c in missing:
            print("  {}".format(c.path))
    return 0


def cmd_list(args) -> int:
    binder = load(args)
    scenes = binder.scenes()
    if args.arc:
        needle = args.arc.lower()
        scenes = [c for c in scenes if needle in arc_of(c).lower()]
    rows = []
    for card in scenes:
        body = read_text(card)
        words = word_count(body)
        rows.append({
            "path": card.path,
            "uuid": card.uuid,
            "arc": arc_of(card),
            "title": card.title,
            "label": binder.label_of(card),
            "words": words,
            "state": "stub" if is_stub(body) else "drafted",
            "has_brief": card.synopsis_txt is not None,
        })
    if args.json:
        print(json.dumps(rows, indent=2))
        return 0
    current = None
    for row in rows:
        if row["arc"] != current:
            current = row["arc"]
            print("\n{}".format(current))
        print("  {:<8} {:>5}w  {:<9} {}".format(
            row["state"], row["words"], row["label"], row["title"]
        ))
    return 0


def cmd_read(args) -> int:
    binder = load(args)
    card = binder.find(args.card)
    body = read_text(card)
    brief = read_synopsis(card)
    print("# {}".format(card.path))
    print("label: {}   words: {}".format(binder.label_of(card), word_count(body)))
    if brief:
        print("\n## Index-card brief\n\n{}".format(brief))
    print("\n## Body\n\n{}".format(body.strip() or "(empty)"))
    return 0


def cmd_brief(args) -> int:
    binder = load(args)
    card = binder.find(args.card)
    body = read_text(card)
    brief = read_synopsis(card)
    words = word_count(body)

    print("# Drafting brief - {}".format(card.path))
    print("label: {}   current: {} words{}".format(
        binder.label_of(card), words, "  (STUB - unwritten)" if is_stub(body) else ""
    ))
    print("arc:   {}".format(arc_progress(binder, card)))

    print("\n## What this card is for (your own index-card brief)\n")
    print(brief or "(no index-card brief exists)")

    spine = spine_entry(binder, card)
    if spine:
        print("\n## What The Spine requires of this scene\n")
        print(spine)

    cast = cast_of(brief)
    if cast:
        print("\n## Cast, POV and place\n")
        print(cast)
        index = character_index(binder)
        for name in [n.strip() for n in cast.split("|")[0].split(",") if n.strip()]:
            if name.lower() in NON_CHARACTERS:
                continue
            key = name.lower()
            person = index.get(key) or index.get(key.replace("the ", ""))
            if person:
                print("  - {:<12} -> {}".format(name, person.path))
            else:
                print("  - {:<12} (no character document found)".format(name))

    print("\n## The laws that bind this scene\n")
    for title, folder, headings in LAW_DOCS:
        if binder.find_by_title(title) is None:
            continue
        pointer = "{}/{}".format(folder, title)
        if headings:
            pointer += "   [{}]".format(", ".join("SS " + h for h in headings))
        print("  - {}".format(pointer))

    print("\n## Where this card sits\n")
    print(neighbours(binder, card))

    print("\n## Session protocol\n")
    print(PROTOCOL)
    print("Write it back into the package with:")
    print("  scriv.py write {!r} --from <draft.md> --label Drafting".format(card.path))
    return 0


def cmd_next(args) -> int:
    binder = load(args)
    for card in binder.scenes():
        if is_stub(read_text(card)):
            print(card.path)
            if not args.quiet:
                print("\n{}".format(read_synopsis(card) or "(no brief)"))
                spine = spine_entry(binder, card)
                if spine:
                    print("\n{}".format(spine))
            return 0
    print("Every scene card has prose. The draft exists; revision is a different job.")
    return 0


def cmd_write(args) -> int:
    binder = load(args)
    card = binder.find(args.card)
    text = source_text(args)
    if not text.strip():
        raise ScrivError("Refusing to write an empty body.")
    before = word_count(read_text(card))
    target, backup = write_text(binder, card, text, reason="body", dry_run=args.dry_run)
    if args.dry_run:
        print("dry run: would write {} words to {}".format(word_count(text), target))
        return 0
    print("wrote {} words (was {}) to {}".format(word_count(text), before, card.path))
    print("  body    {}".format(target))
    print("  backup  {}".format(backup))
    if args.label:
        set_label(binder, card, args.label, reason="label")
        print("  label   {}".format(args.label))
    return 0


def cmd_synopsis(args) -> int:
    binder = load(args)
    card = binder.find(args.card)
    text = source_text(args)
    if not text.strip():
        raise ScrivError("Refusing to write an empty synopsis.")
    target, backup = write_synopsis(binder, card, text, dry_run=args.dry_run)
    if args.dry_run:
        print("dry run: would write the brief for {}".format(card.path))
        return 0
    print("wrote the brief for {}".format(card.path))
    print("  brief   {}".format(target))
    print("  backup  {}".format(backup))
    return 0


def cmd_label(args) -> int:
    binder = load(args)
    card = binder.find(args.card)
    _, backup = set_label(binder, card, args.name, dry_run=args.dry_run)
    if args.dry_run:
        print("dry run: would label {} as {}".format(card.path, args.name))
        return 0
    print("{} -> {}".format(card.path, args.name))
    print("  backup  {}".format(backup))
    return 0


def cmd_backups(args) -> int:
    project = resolve_project(args.project)
    backups = list_backups(project)
    if not backups:
        print("No backups in {}".format(project.parent / "Scrivener Backup"))
        return 0
    for i, path in enumerate(backups):
        when = datetime.datetime.fromtimestamp(
            path.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
        print("[{}]  {}  {}".format(i, when, path.name))
    return 0


def cmd_restore(args) -> int:
    project = resolve_project(args.project)
    backups = list_backups(project)
    if not backups:
        raise ScrivError("No backups to restore from.")
    if args.index >= len(backups):
        raise ScrivError(
            "Backup index {} out of range (0-{}).".format(args.index, len(backups) - 1)
        )
    source = backups[args.index]
    if scrivener_running():
        raise ScrivError("Quit Scrivener before restoring.")
    if not args.yes:
        print("Would restore  {}".format(source.name))
        print("           over  {}".format(project))
        print("Re-run with --yes. The current state is backed up first.")
        return 1
    safety = backup_package(project, "pre-restore")
    shutil.rmtree(project)
    shutil.copytree(source, project, symlinks=True)
    print("restored {} -> {}".format(source.name, project))
    print("  previous state saved at {}".format(safety))
    return 0


# --------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="scriv",
        description="Read and write the Remember Rain Scrivener package.",
    )
    parser.add_argument("--project", help="path to the .scriv package")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("doctor", help="package health and counts").set_defaults(func=cmd_doctor)

    p = sub.add_parser("list", help="scene cards and their state")
    p.add_argument("--arc", help="filter to one arc")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("read", help="a card's body and brief")
    p.add_argument("card")
    p.set_defaults(func=cmd_read)

    p = sub.add_parser("brief", help="assemble the drafting brief for a scene")
    p.add_argument("card")
    p.set_defaults(func=cmd_brief)

    p = sub.add_parser("next", help="next unwritten card in spine order")
    p.add_argument("--quiet", action="store_true")
    p.set_defaults(func=cmd_next)

    p = sub.add_parser("write", help="replace a card's body")
    p.add_argument("card")
    p.add_argument("--from", dest="from_file", metavar="FILE",
                   help="read the body from FILE ('-' for stdin)")
    p.add_argument("--text", help="inline body")
    p.add_argument("--label", help="set the label after writing")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_write)

    p = sub.add_parser("synopsis", help="replace a card's index-card brief")
    p.add_argument("card")
    p.add_argument("--from", dest="from_file", metavar="FILE")
    p.add_argument("--text")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_synopsis)

    p = sub.add_parser("label", help="set a card's label")
    p.add_argument("card")
    p.add_argument("name", choices=["Raw", "Drafting", "Done"])
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_label)

    sub.add_parser("backups", help="list package backups").set_defaults(func=cmd_backups)

    p = sub.add_parser("restore", help="restore a package backup")
    p.add_argument("index", type=int, help="index from `scriv backups`")
    p.add_argument("--yes", action="store_true")
    p.set_defaults(func=cmd_restore)

    return parser


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except ScrivError as exc:
        print("error: {}".format(exc), file=sys.stderr)
        return 2
    except BrokenPipeError:
        return 0
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
