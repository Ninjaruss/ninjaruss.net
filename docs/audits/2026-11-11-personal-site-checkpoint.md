# Personal-site refinement checkpoint

## Chosen and implemented locally

- Keep Home / About / Now / Shelf navigation and the established P4G visuals.
- Approved homepage introduction: otaku, aspiring storyteller, over-the-top stories encouraging effort in the life the author already has.
- Keep Now prominent beside the introduction on desktop and directly after it on phones. Show the latest existing title/date and the context “Where I’m at.”
- Move Traces below the tile grid; retain its full-width guestbook treatment.
- Refresh homepage labels and descriptive copy; obtain L-file status from its project metadata. Retain build-time Substack feed links.
- Keep the existing Marie essay discoverable with “My Marie video essay,” linking to its project page and existing YouTube embed. The author stands by the feelings and effort but is less certain about its expression, so “Start here” was deliberately removed.
- Replace About’s large repeated Making cards with three short verbatim excerpts and dated/source links: Coincidences (November 2026), Marie essay, Utasync. Keep compact links to the work, current update, practice journal, map and contact. Existing #making URLs continue working.

## Evidence and verification

- Read current repository pages and project/Now source. Public homepage and internal sections inspected in the preceding review; the four-link menu is deployed.
- This implementation: 244 tests pass; production build and git diff whitespace check pass.
- Running localhost checked at 1280px and 390px without horizontal overflow. Now stays before Writing; Traces is after the grid. About’s three excerpts render; Map and Along the way switch correctly; the dated Now link reaches /now/2026-11; the video entry link reaches its project page with the expected embed. Video playback and guestbook submission were not tested.
- Substack fetch can fall back to its direct link in development; the earlier verified built homepage contained three actual article links. No new feed behavior introduced.

## Unresolved / next action

- Author subsequently chose to restore website-only writing. /notes is now the local dated archive; original note URLs render locally; /journal and /writing redirect to /notes. The RSS endpoint is local. No remote Substack posts were changed.
- Changes are local, not committed or pushed. Review and publish only when requested.
- Preserve unrelated .DS_Store, package.json changes and the private-life-archive design document.


## Writing restoration — final handoff

- User authorized removing Substack links and restoring notes with dates.
- 24 original notes restored, including one undated piece at the end. Japanese
  practice stays separate. Publication dates are preserved; article pages also
  show edit dates when later. Archive and adjacent-note navigation work.
- Homepage displays the latest three dated local notes. About/profile Writing
  links and RSS autodiscovery point locally. Four-item global navigation retained.
- Removed unused external-feed and redirect utilities plus their obsolete tests;
  added public-note selection/order tests.
- Verified 226 tests pass; Astro check: zero errors/warnings; final build passes.
  Confirmed all 25 original Markdown bodies (including practice) unchanged.
- Browser: archive and article at 390px, archive at 320px and 1280px without
  horizontal overflow; archive-to-note and back navigation; published/edit dates.
  HTTP checks: unknown note 404, practice alias redirects to practice page,
  /journal reaches /notes, /rss.xml returns parseable XML with 23 local items.
- Generated site has zero outgoing Substack links or Substack redirects. Historical
  substackUrl metadata remains non-rendered provenance. Repository originals were
  restored; no remote comparison or import of Substack-only revisions was done.
- Local changes only; next action is review/push when requested. Preserve unrelated
  package.json, .DS_Store and private-archive-design changes.
