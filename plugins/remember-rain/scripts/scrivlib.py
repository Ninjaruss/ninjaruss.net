"""Core library for the Remember Rain Scrivener bridge.

The Scrivener package is the source of truth for Remember Rain;
`src/content/novel/` in the repo is a *compile output* that Scrivener
overwrites on every export. Any edit made to the export is therefore
provisional until it is mirrored back into the package. This library is the
supported way to read and write the package, so that mirroring is a command
rather than a hand-built script.

Package layout (Scrivener 3, macOS) that this module depends on:

    <Project>.scriv/
      <Project>.scrivx                binder tree, titles, labels, statuses (XML)
      Files/Data/<UUID>/content.rtf   the document body
      Files/Data/<UUID>/synopsis.txt  the index-card synopsis (scene brief)
      Files/user.lock                 present on disk whether or not Scrivener runs

Only `content.rtf`, `synopsis.txt` and a single `<LabelID>` element are ever
written. The binder is never restructured here.

Python 3.9 compatible, standard library only, macOS only (uses `textutil`,
Apple's own RTF parser — the same one Scrivener uses).
"""

from __future__ import annotations

import hashlib
import os
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

DEFAULT_PROJECT = Path.home() / "Documents" / "Remember Rain.scriv"
ENV_PROJECT = "RR_SCRIV"

# Labels and statuses are defined inside the .scrivx; these are only fallbacks
# for a package that has lost its LabelSettings block.
LABEL_FALLBACK = {"-1": "No Label", "13": "Raw", "14": "Drafting", "15": "Done"}
STATUS_FALLBACK = {"-1": "No Status", "8": "Web Ready", "1": "To Do", "6": "In Progress"}

# A pristine RTF prologue, used only when a document has no content.rtf yet.
# Mirrors the Palatino style of the existing scene cards.
DEFAULT_RTF_HEADER = (
    "{\\rtf1\\ansi\\ansicpg1252\\cocoartf2870\n"
    "\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\froman\\fcharset0 Palatino-Roman;"
    "\\f1\\froman\\fcharset0 Palatino-Bold;}\n"
    "{\\colortbl;\\red255\\green255\\blue255;}\n"
    "{\\*\\expandedcolortbl;;}\n"
    "\\pard\\tx360\\tx720\\tx1080\\tx1440\\tx1800\\tx2160\\tx2880\\tx3600\\tx4320"
    "\\fi360\\sl264\\slmult1\\pardirnatural\\partightenfactor0\n\n"
    "\\f0\\fs26 \\cf0 "
)


class ScrivError(RuntimeError):
    """Any refusal or failure the caller is expected to act on."""


# --------------------------------------------------------------------------
# Project location and the safety gate
# --------------------------------------------------------------------------

def resolve_project(explicit: Optional[str] = None) -> Path:
    """Find the Scrivener package: --project, then $RR_SCRIV, then the default."""
    for candidate in (explicit, os.environ.get(ENV_PROJECT), str(DEFAULT_PROJECT)):
        if not candidate:
            continue
        path = Path(candidate).expanduser()
        if path.name.endswith(".scriv") and path.is_dir():
            return path
    raise ScrivError(
        "Could not find the Scrivener project. Pass --project <path to .scriv> "
        "or set ${}.".format(ENV_PROJECT)
    )


def scrivener_running() -> bool:
    """True if a Scrivener process is alive.

    `pgrep` rather than the lock file: `Files/user.lock` is left on disk after a
    clean quit (ticket 17 regenerates it), so its presence says nothing.
    """
    try:
        result = subprocess.run(
            ["pgrep", "-x", "Scrivener"], capture_output=True, text=True
        )
    except OSError:
        return False
    return bool(result.stdout.strip())


def assert_safe_to_write(project: Path, force: bool = False) -> None:
    """Refuse to touch the package while Scrivener holds it open.

    Scrivener caches the whole project in memory and writes it out on save, so a
    write made underneath a running app is silently discarded at best and
    corrupting at worst. There is no safe override short of quitting the app.
    """
    if scrivener_running():
        raise ScrivError(
            "Scrivener is running. Quit it completely (Cmd-Q) before writing to "
            "the package — it holds the binder in memory and will overwrite "
            "anything written underneath it."
        )
    find_scrivx(project)  # raises if this is not a package


def backup_root_for(project: Path) -> Path:
    """Sibling `Scrivener Backup/` directory, matching the author's convention."""
    return project.parent / "Scrivener Backup"


def backup_package(project: Path, reason: str) -> Path:
    """Duplicate the whole package before a write. 2 MB, so this is cheap.

    Returns the backup path. Never prunes: the author empties these by hand.
    """
    root = backup_root_for(project)
    root.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    safe_reason = re.sub(r"[^a-z0-9]+", "-", reason.lower()).strip("-") or "write"
    dest = root / "{} {} ({}).scriv".format(project.stem, stamp, safe_reason)
    if dest.exists():
        dest = root / "{} {} ({}).scriv".format(
            project.stem, datetime.now().strftime("%Y-%m-%d-%H%M%S-%f"), safe_reason
        )
    shutil.copytree(project, dest, symlinks=True)
    return dest


def list_backups(project: Path) -> List[Path]:
    root = backup_root_for(project)
    if not root.is_dir():
        return []
    return sorted(
        (p for p in root.glob("*.scriv") if p.is_dir()),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )


# --------------------------------------------------------------------------
# The binder
# --------------------------------------------------------------------------

class Card:
    """One binder item: a folder, a text document, or a research item."""

    __slots__ = (
        "uuid", "title", "type", "depth", "order", "parents",
        "label_id", "status_id", "data_dir",
    )

    def __init__(self, uuid, title, type_, depth, order, parents, label_id, status_id, data_dir):
        self.uuid = uuid
        self.title = title
        self.type = type_
        self.depth = depth
        self.order = order
        self.parents = parents          # list of ancestor titles, outermost first
        self.label_id = label_id
        self.status_id = status_id
        self.data_dir = data_dir        # Path or None

    @property
    def path(self) -> str:
        return "/".join(self.parents + [self.title])

    @property
    def is_text(self) -> bool:
        return self.type in ("Text", "Folder") and self.data_dir is not None

    @property
    def content_rtf(self) -> Optional[Path]:
        if not self.data_dir:
            return None
        p = self.data_dir / "content.rtf"
        return p if p.is_file() else None

    @property
    def synopsis_txt(self) -> Optional[Path]:
        if not self.data_dir:
            return None
        p = self.data_dir / "synopsis.txt"
        return p if p.is_file() else None

    def __repr__(self) -> str:
        return "<Card {}>".format(self.path)


def find_scrivx(project: Path) -> Path:
    """Locate the `.scrivx` inside a package.

    A Scrivener package normally holds `<folder name>.scrivx`, but backups and
    duplicates are renamed on the outside while the file inside keeps its
    original name (`Remember Rain.scriv` -> `Remember Rain <date>.scriv`, still
    containing `Remember Rain.scrivx`). Resolving by folder name alone would make
    every backup unreadable, so fall back to the single `.scrivx` present.
    """
    preferred = project / (project.stem + ".scrivx")
    if preferred.is_file():
        return preferred
    found = sorted(project.glob("*.scrivx"))
    if len(found) == 1:
        return found[0]
    if not found:
        raise ScrivError("No .scrivx found in {}".format(project))
    raise ScrivError(
        "Several .scrivx files in {}: {}".format(
            project, ", ".join(p.name for p in found)
        )
    )


class Binder:
    """The parsed `.scrivx`, in document (binder) order."""

    def __init__(self, project: Path):
        self.project = project
        self.scrivx = find_scrivx(project)
        self._root = ET.parse(str(self.scrivx)).getroot()
        self.data_root = project / "Files" / "Data"
        self.cards: List[Card] = []
        self.by_uuid: Dict[str, Card] = {}
        self._parse()
        self.labels = self._read_definition("LabelSettings", "Labels", "Label", LABEL_FALLBACK)
        self.statuses = self._read_definition(
            "StatusSettings", "StatusItems", "Status", STATUS_FALLBACK
        )

    # -- parsing ----------------------------------------------------------

    def _parse(self) -> None:
        binder = self._root.find("Binder")
        if binder is None:
            raise ScrivError("No <Binder> element in {}".format(self.scrivx))
        order = [0]

        def walk(item: ET.Element, depth: int, parents: List[str]) -> None:
            md = item.find("MetaData")
            label = md.findtext("LabelID") if md is not None else None
            status = md.findtext("StatusID") if md is not None else None
            uuid = item.get("UUID")
            data_dir = None
            if uuid:
                candidate = self.data_root / uuid
                if candidate.is_dir():
                    data_dir = candidate
            card = Card(
                uuid=uuid,
                title=item.findtext("Title") or "(untitled)",
                type_=item.get("Type"),
                depth=depth,
                order=order[0],
                parents=list(parents),
                label_id=label,
                status_id=status,
                data_dir=data_dir,
            )
            order[0] += 1
            self.cards.append(card)
            if uuid:
                self.by_uuid[uuid] = card
            children = item.find("Children")
            if children is not None:
                for child in children.findall("BinderItem"):
                    walk(child, depth + 1, parents + [card.title])

        for item in binder.findall("BinderItem"):
            walk(item, 0, [])

    def _read_definition(self, settings_tag, items_tag, item_tag, fallback) -> Dict[str, str]:
        settings = self._root.find(settings_tag)
        if settings is None:
            return dict(fallback)
        container = settings.find(items_tag)
        if container is None:
            return dict(fallback)
        out: Dict[str, str] = {}
        for el in container.findall(item_tag):
            out[el.get("ID")] = (el.text or "").strip()
        return out or dict(fallback)

    def label_of(self, card: Card) -> str:
        if card.label_id is None:
            return self.labels.get("-1", "No Label")
        return self.labels.get(card.label_id, "ID {}".format(card.label_id))

    def status_of(self, card: Card) -> str:
        if card.status_id is None:
            return self.statuses.get("-1", "No Status")
        return self.statuses.get(card.status_id, "ID {}".format(card.status_id))

    def label_id_for(self, name: str) -> str:
        for lid, label in self.labels.items():
            if label.lower() == name.lower():
                return lid
        raise ScrivError(
            "Unknown label {!r}. Known labels: {}".format(
                name, ", ".join(sorted(self.labels.values()))
            )
        )

    # -- lookup -----------------------------------------------------------

    def find(self, ref: str) -> Card:
        """Resolve a card by UUID, by title, or by `Folder/Sub/Title` path.

        Titles repeat across the binder (there are several `1 ...` cards), so an
        ambiguous reference is an error rather than a guess.
        """
        ref = ref.strip()
        if ref in self.by_uuid:
            return self.by_uuid[ref]

        needle = ref.lower().strip("/")
        exact = [
            c for c in self.cards
            if c.path.lower() == needle or (c.uuid and c.uuid.lower() == needle)
        ]
        if len(exact) == 1:
            return exact[0]
        if len(exact) > 1:
            raise ScrivError(
                "Ambiguous reference {!r}; matches:\n  {}".format(
                    ref, "\n  ".join(c.path for c in exact)
                )
            )

        # Fall back to a suffix match, e.g. "Arc 1 - Fugitive/2 The vault" or
        # just "2 The vault" when it is unique across the binder.
        suffix = [c for c in self.cards if c.path.lower().endswith(needle)]
        if len(suffix) == 1:
            return suffix[0]
        if len(suffix) > 1:
            raise ScrivError(
                "Ambiguous reference {!r}; matches:\n  {}".format(
                    ref, "\n  ".join(c.path for c in suffix)
                )
            )
        partial = [c for c in self.cards if needle in c.title.lower()]
        if len(partial) == 1:
            return partial[0]
        if len(partial) > 1:
            raise ScrivError(
                "Ambiguous reference {!r}; matches:\n  {}".format(
                    ref, "\n  ".join(c.path for c in partial)
                )
            )
        raise ScrivError("No binder item matches {!r}".format(ref))

    def find_by_title(self, title: str) -> Optional[Card]:
        for card in self.cards:
            if card.title == title:
                return card
        return None

    def folders(self) -> List[Card]:
        return [
            c for c in self.cards
            if c.type in ("Folder", "DraftFolder", "ResearchFolder")
        ]

    def scenes(self) -> List[Card]:
        """Text cards inside the Manuscript, in binder order."""
        out = []
        for card in self.cards:
            if card.type != "Text":
                continue
            if not card.parents or card.parents[0] != "Manuscript":
                continue
            out.append(card)
        return out

    def arc_titles(self) -> List[str]:
        return [
            c.title for c in self.cards
            if c.type in ("Folder", "DraftFolder") and c.parents[-1:] == ["Manuscript"]
        ]

    def children_of(self, card: Card) -> List[Card]:
        return [
            c for c in self.cards
            if c.parents and c.parents[-1] == card.title
            and len(c.parents) == len(card.parents) + 1
        ]


# --------------------------------------------------------------------------
# RTF <-> text
# --------------------------------------------------------------------------

def rtf_to_text(path: Path) -> str:
    """Decode a content.rtf through `textutil`, Apple's RTF parser."""
    try:
        result = subprocess.run(
            ["textutil", "-convert", "txt", "-stdout", str(path)],
            capture_output=True,
        )
    except OSError as exc:  # pragma: no cover - textutil is always on macOS
        raise ScrivError("textutil unavailable: {}".format(exc))
    if result.returncode != 0:
        raise ScrivError(
            "textutil failed on {}: {}".format(
                path, result.stderr.decode("utf-8", "replace").strip()
            )
        )
    return result.stdout.decode("utf-8", "replace")


def _escape_rtf(text: str) -> str:
    r"""Escape a plain-text body for RTF.

    Newlines become `\par`; verified to round-trip byte-exactly through
    textutil for ASCII, curly quotes, em-dashes, CJK and astral emoji.
    """
    out: List[str] = []
    for ch in text:
        code = ord(ch)
        if ch == "\\":
            out.append("\\\\")
        elif ch == "{":
            out.append("\\{")
        elif ch == "}":
            out.append("\\}")
        elif ch == "\n":
            out.append("\\par\n")
        elif code < 128:
            out.append(ch)
        elif code <= 0xFFFF:
            out.append("\\u{}?".format(code if code < 0x8000 else code - 0x10000))
        else:
            code -= 0x10000
            hi = 0xD800 + (code >> 10)
            lo = 0xDC00 + (code & 0x3FF)
            out.append("\\u{}?".format(hi - 0x10000))
            out.append("\\u{}?".format(lo - 0x10000))
    return "".join(out)


def rtf_header_of(template: Optional[Path]) -> str:
    """Reuse a document's own RTF prologue so its font, tabs and margins survive.

    Falls back to a built-in Palatino prologue for a card with no content yet.
    """
    if template is not None and template.is_file():
        raw = template.read_text(encoding="utf-8", errors="replace")
        match = re.match(r"^(.*?\\cf\d+ )", raw, re.S)
        if match:
            return match.group(1)
    return DEFAULT_RTF_HEADER


def text_to_rtf(text: str, template: Optional[Path] = None) -> str:
    """Encode plain text as an RTF document body."""
    normalised = text.replace("\r\n", "\n").replace("\r", "\n")
    return rtf_header_of(template) + _escape_rtf(normalised) + "}"


def word_count(text: str) -> int:
    """Whitespace-delimited words — the same measure `src/utils/novel.ts` uses."""
    return len(re.findall(r"\S+", text))


# --------------------------------------------------------------------------
# Reads
# --------------------------------------------------------------------------

def read_text(card: Card) -> str:
    rtf = card.content_rtf
    if rtf is None:
        return ""
    return rtf_to_text(rtf)


def read_synopsis(card: Card) -> str:
    path = card.synopsis_txt
    if path is None:
        return ""
    return path.read_text(encoding="utf-8", errors="replace").strip()


def content_digest(project: Path) -> str:
    """Cheap fingerprint of the package, used to check a write landed."""
    h = hashlib.sha256()
    for path in sorted((project / "Files" / "Data").glob("*/content.rtf")):
        h.update(path.read_bytes())
    return h.hexdigest()[:12]


def arc_of(card: Card) -> str:
    return card.parents[1] if len(card.parents) > 1 else ""


# --------------------------------------------------------------------------
# Writes
# --------------------------------------------------------------------------

def write_text(
    binder: Binder,
    card: Card,
    text: str,
    *,
    reason: str = "write",
    dry_run: bool = False,
) -> Tuple[Path, Path]:
    """Replace a card's body. Backs up, writes, then verifies by decoding back.

    The verification step is the point: if `textutil` does not return exactly
    what we intended, the original file is restored and the command fails.
    """
    if card.data_dir is None:
        raise ScrivError(
            "{} has no Files/Data directory; create the card in Scrivener first.".format(card.path)
        )

    assert_safe_to_write(binder.project)

    target = card.data_dir / "content.rtf"
    original = target.read_bytes() if target.is_file() else None
    rendered = text_to_rtf(text, template=target if target.is_file() else None)

    if dry_run:
        return target, Path("(dry run)")

    backup = backup_package(binder.project, reason)
    try:
        target.write_text(rendered, encoding="utf-8")
        decoded = rtf_to_text(target)
        expected = text.replace("\r\n", "\n").replace("\r", "\n")
        if decoded != expected:
            raise ScrivError(
                "RTF round-trip mismatch after writing {}.\n"
                "  expected {!r}\n  got      {!r}\n"
                "Restored the original; nothing changed.".format(
                    card.path, expected[:120], decoded[:120]
                )
            )
    except Exception:
        if original is None:
            if target.exists():
                target.unlink()
        else:
            target.write_bytes(original)
        raise
    return target, backup


def write_synopsis(
    binder: Binder,
    card: Card,
    text: str,
    *,
    reason: str = "synopsis",
    dry_run: bool = False,
) -> Tuple[Path, Path]:
    """Replace a card's index-card synopsis (the drafting brief)."""
    if card.data_dir is None:
        raise ScrivError(
            "{} has no Files/Data directory; create the card in Scrivener first.".format(card.path)
        )
    assert_safe_to_write(binder.project)
    target = card.data_dir / "synopsis.txt"
    original = target.read_bytes() if target.is_file() else None
    body = text.strip() + "\n"
    if dry_run:
        return target, Path("(dry run)")
    backup = backup_package(binder.project, reason)
    try:
        target.write_text(body, encoding="utf-8")
        if target.read_text(encoding="utf-8") != body:
            raise ScrivError("Synopsis write did not verify for {}".format(card.path))
    except Exception:
        if original is None:
            if target.exists():
                target.unlink()
        else:
            target.write_bytes(original)
        raise
    return target, backup


def set_label(
    binder: Binder,
    card: Card,
    label: str,
    *,
    reason: str = "label",
    dry_run: bool = False,
) -> Tuple[Path, Path]:
    """Set a card's label (Raw / Drafting / Done).

    This is the one operation that edits the `.scrivx`. It is done as a surgical
    text replacement inside that single BinderItem's block and re-parsed
    afterwards, rather than by re-serialising the XML — ElementTree would drop
    the indentation and attribute ordering the rest of the file uses.
    """
    if not card.uuid:
        raise ScrivError("{} has no UUID and cannot be labelled.".format(card.path))
    assert_safe_to_write(binder.project)
    label_id = binder.label_id_for(label)

    raw = binder.scrivx.read_text(encoding="utf-8")
    marker = '<BinderItem UUID="{}"'.format(card.uuid)
    start = raw.find(marker)
    if start < 0:
        raise ScrivError("Could not locate {} in the binder XML.".format(card.uuid))
    # The block ends at the matching close tag; UUIDs are unique so the first
    # close tag after the marker is the right one for a leaf card.
    end = raw.find("</BinderItem>", start)
    if end < 0:
        raise ScrivError("Malformed binder XML around {}".format(card.uuid))
    block = raw[start:end]
    if "<Children>" in block:
        raise ScrivError(
            "{} has children; labelling folders is not supported.".format(card.path)
        )

    if re.search(r"<LabelID>[^<]*</LabelID>", block):
        new_block = re.sub(
            r"<LabelID>[^<]*</LabelID>",
            "<LabelID>{}</LabelID>".format(label_id),
            block,
            count=1,
        )
    elif "<MetaData>" in block:
        new_block = block.replace(
            "<MetaData>", "<MetaData>\n<LabelID>{}</LabelID>".format(label_id), 1
        )
    else:
        raise ScrivError(
            "{} has no <MetaData> block to hold a label; set one in Scrivener first.".format(
                card.path
            )
        )

    updated = raw[:start] + new_block + raw[end:]
    if dry_run:
        return binder.scrivx, Path("(dry run)")

    original = binder.scrivx.read_bytes()
    backup = backup_package(binder.project, reason)
    try:
        binder.scrivx.write_text(updated, encoding="utf-8")
        ET.parse(str(binder.scrivx))  # must still be well-formed XML
        check = Binder(binder.project)
        if check.label_of(check.by_uuid[card.uuid]) != label:
            raise ScrivError("Label did not read back as {!r}".format(label))
    except Exception:
        binder.scrivx.write_bytes(original)
        raise
    return binder.scrivx, backup
