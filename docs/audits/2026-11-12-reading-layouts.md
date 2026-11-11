# Now and Writing reading layouts — November 12, 2026

## Scope and local design choices

User requested improved Now and Writing views. Preserve article/note text, dates, the four-link global menu, and the P4G visual language. These presentation choices are implemented locally for review, not new author content.

- Generalized the existing WritingLayout into ReadingLayout, shared by notes, Now, historical updates and both archive views. Consistent heading/date hierarchy, gold divider, readable prose width, 18px desktop / 17px phone text and restrained subsection headings.
- Writing archive: latest dated note gets a linked entry panel with an excerpt taken directly from its opening paragraph, ending on a sentence when possible. Remaining notes stay newest-first with aligned date/title rows; all 24 notes are present exactly once. Undated note stays undated and last. RSS and Japanese practice remain accessible.
- Note reader: clearer separated previous/next labels and titles; archive links at top and bottom; original publication/edit dates retained.
- Now: the existing current-arc decision is beside the update on desktop (sticky sidebar), and a keyboard-operable native disclosure on smaller screens. Existing October card timestamp and November post timestamp remain distinct. The card opens by default on desktop, collapses initially below 1024px, and stays expanded without JavaScript so its content remains available. Past-update links available at top/bottom.
- Now archive/history share date formatting and reader spacing with the writing pages; these remain separate collections and destinations.

## Verification and handoff

- 226 tests pass; Astro check has zero errors/warnings; production build and diff whitespace check pass.
- No changes to any content collection files, note text, Now text, current-arc data or dates.
- Running app: 320/390px phones and 1280px desktop; no horizontal overflow in Now, Writing archive, long-title note, undated note, Now archive or October snapshot. Focus card confirmed closed on phones and open on desktop; Enter expands it.
- Checked newest-note link, archive return, undated-note neighbor and Now archive-to-October navigation. All 24 archive destinations unique. Edit-date display retained.
- Local/unpushed. About/Home wording and About layout changes from the preceding requests also remain local and authorized. Preserve unrelated .DS_Store, package.json and private-life-archive design edits. Next action: review/push if requested.
