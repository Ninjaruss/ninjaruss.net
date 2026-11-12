# Homepage card balance — November 12, 2026

- Request: reduce unused space and improve presentation/contrast in the Now tile and main card. Interpreted main card as the homepage introduction; clarification offered. No Current arc, menu, or author-content edits in this pass.
- Changed `src/pages/index.astro`: 2:1 introduction/Now columns (300px minimum Now width); introduction text grows to 65ch; top alignment. Now labels share a row, title and reading action use existing gold, and its preview comes from the latest update's actual first sentence using the existing Markdown utility.
- Verified running local app at 1280, 768, 390 and 320px; no horizontal overflow, title stays readable, and clicking the Now tile navigates to the current update. Desktop screenshot: `homepage-card-balance.png` in the existing visualization folder.
- Tests: all 226 pass. Production build and diff whitespace check pass. No content collection changes. Local only; unrelated .DS_Store, package.json and private-life-archive spec preserved.
- Next action: user review; push only when requested.

## Approved compact-navigation pass

- User approved equal Projects/Remember Rain widths, linked section headings, inline writing dates where room permits, a shorter phone video crop, and consistent primary links. Implemented in the same homepage file; no author prose changed.
- Projects/novel now each span six columns. Four creative section headings link directly to their destinations with 44px minimum targets. Writing uses its own available width to place dates beside titles from 420px, otherwise below. Phone video artwork is 16:9, retaining the existing portrait asset. Primary card actions use consistent arrows and gold (black on the gold Writing card); secondary video links are muted. Tightened heading/caption spacing.
- Running-app checks: desktop, 768px tablet, 390px and 320px phones; no horizontal overflow at 320/768, new heading targets measure 44px. Observed visible black keyboard-focus outline on the gold Writing card. Clicked the novel heading into /novel and Writing into /notes. Screenshot: homepage-compact-navigation.png in the existing visualization folder.
- All 226 tests and production build pass; diff whitespace check passes. Local only. Preserve earlier card edits and unrelated working-tree changes.

## Homepage copy reduction

- User identified remaining redundant writing. Removed the introduction's activity list (already represented by the cards), Where I'm at, Writing's category/description, Projects' generic description, and duplicate All writing/Explore links. Linked headings with arrows now serve as the main destinations.
- Videos has one YouTube heading link plus its existing artwork link; removed the repeated YouTube chip/button. Retained its specific subject description, Marie essay and Twitch links. Combined novel format/status into one chip, retained the complete premise, removed the redundant destination inventory. Removed Shelf/Journal category chips and footer's repeated contact link; top Contact remains.
- Only homepage presentation copy changed; source notes, updates, About and novel content untouched. Removed obsolete CSS for deleted elements.
- Desktop and 390px phone visual review completed; no phone overflow, all four heading links retain 44px targets. Screenshot: homepage-reduced-copy.png. Local only; push pending request.

## Navigation clarity pass

- Request: review the homepage and improve design/layout/positioning so visitors can navigate it cleanly. Reviewed the running page at 1440, 1280, 768, 390 and 320px before changing anything.
- Diagnosis. (1) Half the cards were whole-card links (Now, Shelf, Japanese journal) and half were `<section>`s where only the heading was clickable (Writing, Videos, Projects, Remember Rain) — but every card carried the same hover lift and gold border, so the page promised a click target it did not always honour. (2) Each heading link used `justify-content: space-between`, pushing its arrow up to 440px away from its own title, so the two read as unrelated elements. (3) The three card rows split 5/7, 6/6 and 8/4, putting the vertical seam at a different x on every row. (4) Off-site destinations (Videos, Twitch, MyAnimeList, Spotify) were indistinguishable from on-site ones. (5) The page ended in two outbound links and no way back into the site.
- Changes, all in `src/pages/index.astro`. Every card now has exactly one destination and the whole card goes there, via a stretched `.tile-link::after` overlay; inner links (writing posts, project rows, video actions) are raised above it and keep their own destinations. Heading arrows sit beside their titles. All three rows share one 5/7 seam (Japanese journal moved to the left column, Shelf to the right). Off-site links carry a `↗` glyph plus a visually hidden "external link". The footer is now a full site map plus a separate Elsewhere row. Card padding unified at 24px (20px on phones); writing/project rows fill the height the grid gives the card instead of leaving dead colour under the last row.
- Removed the duplicate YouTube anchor on the video artwork (the card's own link now covers it), and dropped two `z-index`/`position` rules on `.projects .tile-intro` and the novel's children that were trapping or covering the stretched overlay.
- Verified on the running app: hit-tested the card bodies with `elementFromPoint` — writing body → /notes, its rows → their own notes; projects body → /showcase, rows → their projects; novel body → /novel; video body → YouTube, actions → their own links. No horizontal overflow at 320, 390, 768, 1440. Every homepage link measures at least 44px tall at 390px. All 226 tests and the production build pass.
- Local only; nothing committed or pushed. Unrelated .DS_Store, package.json and private-life-archive spec left untouched.
