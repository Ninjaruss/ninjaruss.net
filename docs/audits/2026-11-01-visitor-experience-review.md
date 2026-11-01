# Visitor experience and redundancy review

Reviewed November 1, 2026. Assessment only; no application code or author content changed.

## Judgment

Keep the site's gold/black, illustrated, angular personality and the established comparable prominence of Writing, Videos, Projects, and Remember Rain. The strongest improvements concern the purpose of destinations, empty choices, and the cost of moving between browsing and reading. Fewer interests is not necessarily a better personal website.

Repeated links are useful when they offer another entrance or an exit. Repeated content is costly when visitors must interpret the same material twice, or choose between destinations whose differences are unclear.

## Evidence and limits

- Inspected the published homepage, About response, Life and all five Life panels, Now, Now archive, Showcase list and Utasync selection, Shelf and Persona 4 Golden panel, Remember Rain index, Japanese journal, Traces, and missing-page recovery.
- Browser screenshots and interactions were at the supplied narrow viewport, approximately 474 × 594 pixels. Desktop layout was inspected in source, not verified visually in this pass. No traffic analytics or visitor testing were used; statements about confusion are reasoned hypotheses, not measured abandonment.
- Read the current route/layout/component source and the October 7 personal-hub design and accessibility review. Historical findings were not automatically treated as still present.
- Some first browser responses showed older About navigation and October Now content. Reloading the homepage and Now showed Life and the November 1 update. Do not treat the initial outdated biography as a confirmed current content defect. The reason for those older responses was not established.
- Fresh HTTP checks independently confirmed `/about` returns 404 and `/status` returns 301 to `/about`. This differs from the local redirects in `astro.config.mjs`.
- Local development starts, but a missing database connection string causes the Traces request to raise Astro's error overlay. Used the published site for the visitor review instead; did not configure credentials or submit a guestbook message.
- Existing working-tree changes were preserved. Tests/build were not run because this review changes documentation only. This is not a performance, security, accessibility-conformance, or full broken-link audit.

## 1. Homepage: preserve the hub, reconsider what precedes it

**Keep:** four distinct main pursuits, original artwork, direct links to individual posts and projects, a dated Now entrance, Shelf's posters, and the short novel premise. The homepage is an overview; it need not reproduce destination pages.

**Observed:** on the narrow viewport, the framed introduction, Now tile, and guestbook bar occupy nearly the first screen before the Writing tile begins. This puts two supporting activities ahead of most of the creative work. That is a hierarchy choice rather than inherently bad design.

**Proposed:** if the first visit should primarily introduce what you make, place the main pursuits directly after the introduction and group Now, Shelf, Japanese practice, and the guestbook afterward. If updates/community are the intended front door, retain the order. The original full-width Traces treatment was deliberately chosen; moving it is a new proposal, not an already authorized correction.

The Twitch link appears both in the video tile and the footer. Removing the footer copy is a small simplification; keeping an image link and a descriptive YouTube link within the same tile is useful, familiar redundancy. Contact at the top and bottom also serves different points in the journey and is worth keeping.

The introduction currently communicates a name and motto. One short author-written orientation sentence could help unfamiliar visitors understand the person behind the choices. This is optional; avoid adding another biography above the grid.

## 2. Global navigation: simplify the presentation before deleting destinations

**Observed:** eight section links are fixed at the bottom of internal pages. The supplied viewport showed both two-row and three-row versions across responses, taking a substantial portion of a short screen. The homepage has no matching global menu. Videos is a main homepage pursuit but has no persistent navigation link; Japanese journal is also absent.

The naming shifts between Things I build / Showcase, Remember Rain / Visual Novel, and Traces / guestbook. These labels can coexist, but newcomers should not have to infer the mappings.

**Proposed:** retain descriptive names alongside personal names where needed, and use Projects consistently for the project destination. Keep Remember Rain as the work's identity, with Visual novel as its descriptor. Make Guestbook visibly explain Traces. This is a terminology proposal, not a requirement to erase the site's names.

For mobile, prototype a compact current-section bar with a clearly labelled Menu control and a complete, keyboard-accessible section list. It adds a tap to section switching but returns reading space. On desktop, the existing expanded navigation may remain appropriate. Test the tradeoff before adopting it; a hidden menu is not automatically superior.

If simplifying the hierarchy, keep Now, Shelf, and the guestbook discoverable through secondary navigation rather than dropping them entirely. Resolve whether Videos should have a persistent direct channel link. Do not solve an eight-item menu by adding another always-visible item.

**Sources:** `src/components/NavPill.astro`, `src/pages/index.astro`.

## 3. Life / About: highest concentration of unnecessary choices

**Observed:** Life contains an introduction, a Making panel with the same four principal destinations as Home, Memories, Calendar, Map, People, and contact/social links. Memories and People have no shared entries. Calendar is another empty representation of the same memory collection; the Map's Fukuoka view also reports no linked entries.

**Proposed now:** present a useful introduction and contact section; omit navigation to empty Memories, Calendar, and People sections until there is something to browse. Making can remain as a compact contextual link row, but does not need to become a second homepage. Repeated YouTube/Substack links in both Making and the contact block add little when the page has little intervening content. Put social destinations under an Elsewhere label and reserve Say hello for actual contact.

**Proposed later:** if shared memories become substantive, lead with their feed and make Calendar and Map alternate views of that same material. They need not look like separate content promises. The map has intentional aesthetic value, so retaining it as an openly exploratory feature is viable; it should earn its prominence through exploration or linked material.

Two viable roles remain: (A) Life as an introduction/contact page, with the archive appearing when populated; or (B) Life as an experiential archive, with a compact introduction above it. A needs fewer choices today. B gives the map and future memories a stronger reason to exist. The site's private archive capabilities need not dictate the public navigation.

**Verified routing issue:** `/about` currently returns 404. `/status` redirects there. Local source already intends `/about`, `/status`, and `/stream` to reach Life, so first investigate why the deployed behavior differs; rewriting the local redirect rules without that check could miss the actual cause.

**Sources:** `src/pages/life/index.astro`, `src/scripts/life.ts`, `src/pages/life/[id].astro`, `astro.config.mjs`.

## 4. Now and its archive: give the current state a clear entrance

**Keep:** the dated update and browsable monthly history. The refreshed current page correctly shows November 1, 2026, “Coincidences.” The archive identifies it as Current and links back to `/now`; this is useful repeated access.

**Observed:** the page calls itself a snapshot but starts with an extended personal reflection. A Current arc / Active decision card follows, restating the current Japan/social focus in another format.

**Proposed:** place the existing concise arc information near the top, then let the dated reflection follow. This improves scanning without rewriting the reflection or forcing it into bullets. If the card and reflection serve the same purpose for you, dropping the card is also reasonable. Do not create a second short summary that requires separate upkeep.

Keep Now separate from Life if it answers “what matters currently?” while Life answers “who is this person / what have they shared?” If Life becomes a chronological update feed with the same job, Now can become its highlighted latest update while retaining old URLs. There is not yet enough shared Life content to justify a migration solely to reduce page count.

**Sources:** `src/pages/now.astro`, `src/pages/now/archive.astro`, `src/pages/now/[...slug].astro`.

## 5. Writing: separate the medium from the update format

**Keep:** the latest three Substack links and clear off-site destination. These are shortcuts into actual writing, not unnecessary duplication of the archive.

**Observed:** Writing promises notes on life, Japanese, and making things; Now contains personal essays and Japanese journal contains practice entries. The September “Time Flows Quickly, Yet I Slowly Become” title also appears in Now's archive and the homepage's Substack links. A repeated title is confirmed; full body duplication was not compared.

**Proposed:** establish a simple editorial distinction: Substack for public essays, Now for the current personal update, Japanese journal for language practice. These can cross-link. If a Now update also becomes a Substack essay, reuse an excerpt/link where practical instead of maintaining two independently edited copies. Do not migrate or delete prose merely because subject matter overlaps.

The Writing navigation opens a new tab, while homepage Substack links use ordinary navigation. Choose consistent off-site behavior and make the destination visible. Default same-tab navigation is simpler; either can work if predictable.

## 6. Videos: make the destination promise precise

**Keep:** the strong artwork and direct YouTube/Twitch actions. A separate on-site video catalogue would add maintenance without an established visitor need.

**Observed:** the artwork carries much of the tile's communication, while the text identifies a channel more than its contents. KAIMA in Showcase is a historical video/channel project, which can look like another current video destination without its update context.

**Proposed:** clarify what a visitor can watch in one brief author-chosen description, and keep historical channel projects clearly labelled as historical. Keep the distinction between the current channel and completed or past projects. Do not assume all channels or formats should merge.

## 7. Projects / Showcase: improve scanning and the route back

**Observed:** six entries span apps, a roleplay group, a video essay, the website, and an earlier stream project. Every list entry repeats a Showcase badge under SHOWCASES / SHOWCASE headings. Automatically extracted descriptions include raw Markdown/link syntax or truncated status updates. The list order uses update dates, while visible metadata uses publication dates, making the ordering hard to infer.

**Proposed:** remove per-entry Showcase badges from this single-category list. Use short, intentional descriptions and a consistent visible status for active, offline, or historical work. Preserve longer development reflections in the details. Align the displayed date with the ordering, or sort deliberately by featured relevance. Only six entries exist; search and additional filters would create more controls than value.

**Interaction verified:** selecting Utasync from the mobile list replaces the list with a detail view. No dedicated Back to projects link appeared after this client selection. Browser Back and the global Showcase link remain available, so it is not a dead end. Add an in-content contextual return for every entry state. Source creates the back item only when an initial server slug exists, so direct entry and list selection differ.

The floating emblem takes space beside the prose and competes with the already substantial fixed navigation. On mobile, put it in the entry header or omit the floating version; keep the emblem artwork itself.

**Sources:** `src/pages/showcase/index.astro`, `src/layouts/SplitViewLayout.astro`, `src/utils/splitView/contentLoader.ts`.

## 8. Shelf: choose one reading surface per context

**Keep:** the visual wall, varied card sizes, favorite emphasis, and type filtering. This section expresses taste in a way a generic list would not.

**Observed:** opening Persona 4 Golden displays the article body in a slide-in panel and also offers Open full entry at the same URL. Visitors get two presentations of the reading material. The fixed global menu remains visible over the panel at the narrow viewport. On refresh/direct entry, the detail route uses the broader split-view system, so the same URL can imply different presentation states.

**Recommended experiment:** direct article navigation on mobile, with Back to Shelf restoring the previous filter and scroll position. Keep desktop quick view if rapid sampling is valuable. Alternatively, retain the full-text panel as the complete reader and avoid an unexplained second full-entry action. Both are preferable to a preview that already contains the whole text and then asks visitors to open it again.

The filters extend horizontally off the narrow screen. Give a clear scroll affordance or wrapping layout; do not add another categorization system. No search is necessary merely because the collection has 29 entries.

**Sources:** `src/pages/shelf/index.astro`, `src/pages/shelf/[...slug].astro`, `src/layouts/SplitViewLayout.astro`.

## 9. Remember Rain: distinguish reading from inspecting the workbench

This is an interface assessment only. No manuscript, character interpretation, or story decision was reviewed or changed.

**Observed:** the homepage offers a premise and work-in-progress status; the destination begins with Characters, Story Plan, and World before Script on mobile. It exposes scene names from later arcs and includes arcs marked 0 words. Three visible “A life” links point to the same `/novel/manuscript/arc-3-prisoner/the-lives/a-life` URL.

**Proposed:** add a small orientation using existing approved material, with explicit routes to Read the draft and Browse planning. Bring the first available reading entry forward if reader discovery matters. Label unwritten scenes as planned rather than making every card appear equally ready to read. Keep planning available for visitors who enjoy the open process, with a clear indication that it contains spoilers.

Do not simply delete repeated “A life” items: determine whether distinct source documents collide during URL generation. This is a verified duplicate destination and a potential routing defect, not evidence that the scenes themselves are redundant.

The creative choice is whether this page primarily welcomes prospective readers or invites people to inspect the live workshop. Reader-first and workshop-first arrangements are both coherent; they imply different ordering. Neither requires changing the story.

**Sources:** `src/pages/novel/[...slug].astro`, `src/utils/novel.ts`.

## 10. Japanese journal: preserve the reason it is separate

**Keep:** the distinction between language practice and polished essays. Learner writing and mistakes are part of its purpose, not clutter to edit out in a UX pass.

**Observed:** four date-headed entries run oldest first. It has a homepage tile but no item in the internal global navigation, and little explanation beyond its title once opened.

**Proposed:** add a short author-approved explanation of its practice purpose. Add a latest-entry jump or newest-first presentation if following progress is the main use. Oldest-first remains defensible if seeing development is the point; no need for a new journal CMS for four entries. Provide a contextual route from Life or the broader Writing area so discovery does not depend solely on Home. Do not add a ninth persistent navigation item by default.

**Source:** `src/pages/japanese-journal.astro`.

## 11. Traces / guestbook: retain the invitation, reduce the ambiguity

**Keep:** the simple name/message form, public message list, and personal name Traces. This is a distinctive visitor activity rather than redundant personal content.

**Observed:** Traces has both a homepage bar and global navigation access. Those entrances are useful. The bar displayed an invitation fallback during inspection even though the full page had messages; the fallback itself is not proof that the guestbook is empty. The full page's heading says Leave a trace without plainly saying Guestbook.

**Proposed:** visibly pair Traces with Guestbook and make the form's action label equally clear. Reconsider its early homepage placement in the overall hierarchy, rather than removing its repeated access links. Keep it as a modest invitation rather than building additional social features.

**Sources:** `src/components/TracesBar.astro`, `src/pages/traces.astro`.

## 12. Recovery pages and old links: fix real failures before fine pruning

**Observed:** the 404 page already supplies a home route, section choices, recent entries, and the fixed global menu. This is useful recovery, although the two complete menus are repetitive. It also explains old naming changes to every visitor, even when their typo has nothing to do with those migrations.

**Proposed:** prioritize Home and a compact selection of real destinations; shorten legacy-migration explanation unless the requested path warrants it. Keep the global menu if it remains the common site navigation. Fix the confirmed `/about` and `/status` chain first. Do not remove old URL redirects as “redundant”: they preserve bookmarks and incoming links.

**Sources:** `src/pages/404.astro`, `astro.config.mjs`.

## Suggested order, pending author decisions

1. **Repair verified routing:** production About/status behavior; investigate the three novel entries sharing a URL. These do not require rethinking the site's identity.
2. **Remove empty public choices:** hide empty Life sections; retain the archive structure for later use.
3. **Make reading/navigation predictable:** project return link, mobile menu footprint, Shelf panel/full-entry behavior, floating emblem placement.
4. **Clarify information roles:** Life vs Now vs Writing vs Japanese practice; novel reader/workshop entry; consistent destination labels and project descriptions.
5. **Revisit homepage ordering only after deciding its first-visit priority.** Moving Traces/Now is a deliberate hierarchy change, not a cleanup with no tradeoff.

Avoid a broad visual redesign, merging all personal writing into one stream, or introducing more search/filter systems. None follows from the evidence here.

## Implementation checkpoint — November 1, 2026

- Authorization: “Implement suggestions.” Preserve the P4G visual system and existing article/story prose. Homepage ordering and the novel's existing binder/script order remain unchanged; the novel gains explicit entry links instead.
- Implemented: compact native mobile section menu with Escape dismissal, consistent Projects/Guestbook labels, persistent Videos access and contextual Japanese practice access; empty Life sections omitted; social/contact links separated; existing current-focus card moved above Now prose; project summaries/status metadata and consistent dates; contextual project return links; floating mobile emblem removed; mobile Shelf article navigation with filter/scroll/focus restoration; desktop reader background isolation and focus return; latest-journal jump; planned-scene labels and distinct duplicate-title document URLs; simpler 404 recovery; explicit host redirects; graceful guestbook read failures.
- Source content: six project descriptions and two status fields added to frontmatter. All six article bodies checked byte-for-text unchanged. No story export or Scrivener content modified. Existing unrelated working-tree edits preserved.
- Automated checks: 244 tests pass, including collision/body-preservation and exported-document URL regression checks. Final production build and `git diff --check` pass. Generated Vercel output has direct About/Status/Stream → Life redirects. Follow-up error review resolved all 20 Astro diagnostics through explicit renderer/recursion types, a single optional lightbox declaration, browser module isolation, and a typed test mock. Astro check now reports 0 errors and 0 warnings (7 informational hints). Tests and the production build pass again.
- Browser checks: desktop 1280px and mobile 390px/320px; no horizontal overflow in the inspected sections after correcting Projects. Mobile menu is 54px tall; open/close, Enter, Escape and section navigation verified. Client-selected project has a working return link. Mobile Shelf restores the anime filter, scroll position and selected-card focus; desktop reader contains keyboard focus, hides background navigation, and restores card focus on Escape. Draft entry, unique “A life” URLs, mobile planned labels, journal latest-entry anchor, current-focus order and guestbook unavailable state verified.
- Follow-up browser verification: map area selection and Escape-to-parent, lightbox opening/closing and focus return verified; browser error log empty. No content or visual changes were needed for the type fixes. Shared map changes are JSDoc only; no private archive files were synchronized.
- Preview image: `/Users/ninjaruss/.codex/visualizations/2026/10/31/01a192ba-67ae-7cb3-9679-98f5d192bd5b/visitor-experience-mobile.png`.
- Publishing: the user requested a push of the cleanup and type-error fixes. The change includes the direct legacy redirects required for Life. Guestbook submission remains untested because local database credentials are absent; a successful Git push does not independently verify production behavior.
- Next action: verify production after its automatic deployment if requested. Preserve the unrelated local package scripts, private-archive design document, and .DS_Store changes.
