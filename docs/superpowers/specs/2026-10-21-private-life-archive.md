# Private life archive and public /life

Date: October 21, 2026 (Asia/Tokyo)
Status: public data boundary and initial /life frontend implemented locally.
The separate private archive now has local capture, review, export, and reader
tooling, plus a protected EMPTY hosted reader. The signed private source is pushed
and private push-to-deploy plus signed-in owner browsing are verified.
Public photo derivatives remain unbuilt.
No public site deployment or real-data publication has been performed.

## Established choices

Recovered from “Personal Journal Wiki Advice” and “Branch · Personal Journal Wiki
Advice” in the app. The branch stopped before local repository inspection.

- Separate private GitHub project with Markdown as the source of truth.
- One experience per memorable encounter; people, places, recurring event series,
  and regions connect experiences. Laptop capture, including transferred photos.
- Push commits to update a hosted private archive; phone browsing must work while
  the laptop sleeps. Private synchronization must never trigger public publication.
- /life is a distinct game-like section in ninjaruss.net, with recent memories,
  calendar browsing, a stylized Fukuoka map, and people/encounter histories.
- October 21 follow-up: /life replaces About as the personal introduction, on
  condition that visitors get immediate context before interacting or navigating.
  It is not an additional archive destination alongside an unchanged About page.
- Manually positioned destinations and selectable regions; future regions can
  extend the structure. Maps also have an accessible destination list.
- Selected pseudonymous public people cards, each individually reviewed.
- AI processing is opt-in per record. Linked people, photos, and other context
  require their own permission. AI suggestions do not become confirmed links.
- Public documents are separate from raw records. The author approves their exact
  version. A changed draft requires renewed approval; changed raw notes do not
  silently replace published text.
- DeepSeek Harness, Codex, Claude Code, and manual drafting use a shared workflow.
  No provider owns the archive format or publication commands.

The previous assistant proposed three experiences sharing a person, place, and
event series as the first end-to-end fixture. This is a useful acceptance case,
not an instruction to fabricate the author's actual experiences.

## Verified repository fit

- Astro 5 with Vercel adapter; mostly static pages, with existing server routes.
  See astro.config.mjs and src/pages/api. This confirms configuration, not live
  deployment access or a private hosting entitlement.
- src/content/config.ts: notes backs writing redirects; profile backs the current
  About page; social-links is a separate existing collection. These collections
  are not the private archive or the source for public life people.
- src/styles/global.css supplies gold, dark surfaces, P4G slants/cuts, motion,
  spacing, and hard-shadow tokens. Typography uses Archivo Black, Syne, and
  JetBrains Mono. BaseLayout, NavPill, and existing page components are reusable.
- Relevant design history: 2026-07-07-p4g-cohesion-design.md and
  2026-10-07-personal-hub-design.md. The old /mind specification is a different
  aggregation proposal, not approval to send this archive to an AI provider.
- dsh is installed at /Users/ninjaruss/Library/pnpm/dsh. With the supplied Node 24
  PATH, dsh --help succeeds and advertises web/headless/tui profiles. No harness
  server, API request, or authentication was tested or started.

## Proposed implementation boundaries

Use a sibling private project (working name life-archive; repository name and
hosting address still undecided). Do not nest it in this public checkout.

Private project directories:

```text
records/{experiences,people,places,events,regions}/  raw Markdown
attachments/                                    original private images
public-drafts/                                  separately authored public records
reviews/                                        source/draft diffs, flags, approvals
tooling/                                        validate, prepare, review, export
app/                                            authenticated private browser
```

Choose IDs independent of names and filenames. Public IDs and public display names
are explicit fields; private record IDs and source-path mappings stay private.
Relationships use typed IDs. The private graph may include people who have no
public profile; those relationships must be omitted from the public graph rather
than automatically creating profiles or placeholders.

Public project additions are limited to:

```text
src/utils/lifeExport.ts          strict public snapshot contract
scripts/life-import.ts          validate, hash, and replace public snapshot
src/data/life.json              imported reviewed content; absent until first import
src/pages/life/                 public introduction and record routes
src/styles/life.css             P4G presentation using existing tokens
src/scripts/life.ts             progressively enhanced menu selection
```

Private text, original photos, context preparation, AI responses, approval
receipts, and source mappings must never be written into the website checkout,
its Git history, build logs, browser bundles, or preview deployments. Gitignore
alone is not the isolation boundary.

## Publication and AI workflow

1. Write Markdown locally. Validate references before pushing private commits.
2. Private push updates the authenticated hosted reader only.
3. Prepare an explicit AI context package outside both repositories. Include only
   records and fields allowed for the chosen processing purpose. Photos default
   to excluded. Prefer local matching for candidate connections.
4. Open that limited context workspace with the chosen tool, or draft manually.
   A prompt or working directory alone does not restrict an agent's file access.
   A real sandbox/filesystem boundary must be verified for the selected tool
   before claiming denied records are inaccessible. Do not automate unrestricted
   agents against the raw archive under the label of enforced per-record opt-in.
5. Review raw source against the public draft, people/profile approvals, public
   links, privacy flags, image pixels/captions, and changes since last publication.
   Semantic privacy review is a human responsibility; schemas cannot detect a
   real name embedded in otherwise valid prose.
6. Approve a digest of the complete public snapshot, including every referenced
   profile, date, title, relationship, and eventual image byte. Keep the approval
   receipt and source provenance private. New public draft bytes invalidate it.
7. Export only approved documents. Import the complete public snapshot here,
   review the public diff, then use the site's normal commit/deployment workflow.
   Importing does not commit, push, or deploy.
8. Unpublish by removing records from the next complete snapshot. Remove inbound
   links too. Future image cleanup must remove orphaned copies. Git history,
   prior deployments, caches, and third-party copies require separate treatment;
   removing the current page cannot promise erasure everywhere.

## Implemented public contract (text-only v1)

The root is exactly `{ schemaVersion: 1, records: [...] }`. Every record has
`kind`, a globally unique public `id`, `title`, and `body`. Bodies are plain text
for initial rendering: future Astro components must escape them, never execute
MDX or render them with set:html. Markdown formatting can be added later with a
deliberate sanitization policy. Raw source capture remains Markdown.

- experience: date (real YYYY-MM-DD), people[], places[], events[].
- person: only the common fields; title is the reviewed public pseudonym.
- place: region, optional position {x,y}, each between 0 and 100.
- event: places[]. This means an event series, not an individual visit.
- region: optional parent. Parent links must be acyclic.

All object levels are strict. Unknown fields, duplicate IDs, missing/mistyped
references, unsafe ID characters, invalid dates, and cyclic regions are rejected.
Photos/paths/URLs and private provenance fields are not supported in v1. Do not
put image links in body text as a workaround. No actual memories or profiles are
included in this implementation; tests use synthetic material.

The importer validates first, checks an explicitly supplied SHA-256 approval
digest, then atomically replaces the single managed snapshot. It leaves the prior
snapshot intact on validation/approval failure. A full empty snapshot is valid
for removal. The digest uses canonical object-key order; array order and every
string character matter. Hash equality detects changed content, not the identity
of the reviewer or proof that review actually occurred. No persistent private
approval system has been implemented yet.

```sh
# These paths refer to an already prepared PUBLIC export outside this checkout.
npm run life:check -- /absolute/path/to/public-export.json
# Read the complete file and review every record and link first.
npm run life:import -- /absolute/path/to/public-export.json --approve <reviewed-sha256>
git diff -- src/data/life.json
```

The CLI does not print schema-rejected values or malformed JSON contents.
Validation cannot certify semantic privacy, photo consent, or approval provenance.

## Next milestones and acceptance

1. Private capture and review tooling: scaffold the separate project and validate
   Markdown records, typed references, per-purpose AI permissions, and separate
   public drafts. Implement approval receipts/digest invalidation and export
   against this public contract. Use synthetic fixtures until the workflow is
   verified. Shared task instructions serve every AI tool; do not add provider SDKs
   as a prerequisite for manual capture or export.
2. Private hosting: choose provider/sign-in method and private repository name.
   Keep access separate from the public Vercel project. All pages, JSON, search,
   images, and previews must require authentication. Test unauthorized direct
   requests, authorized phone browsing, cache behavior, logout, and a private
   push updating the hosted archive with the laptop offline. Fail closed if
   authentication is missing. Robots/noindex is optional hygiene, not protection.
3. Text-only /life: add a LifeLayout using BaseLayout/tokens, explicit local menu
   (Memories / Calendar / Places / People), date-sorted memory and detail routes,
   public person histories, place/event encounter views. Replace About as the
   site's personal destination: update its navigation and homepage links to
   /life, label the destination Life, and redirect /about to /life. Existing
   /status and /stream redirects should target /life directly, avoiding chains.
   Reuse NavPill for return navigation. Native links, keyboard selection,
   reduced motion, mobile reflow, and no-JS reading are acceptance requirements.
   All data comes from the imported snapshot; no private API or archive token.
4. Calendar and stylized Fukuoka map: date-based browsing and a manually drawn
   map with normalized destination positions, region selection, and accessible
   equivalent list. Add future region maps through data rather than hardcoding
   a single city. Detailed map composition remains a design task, not settled art.
5. Images: reviewed derivative pipeline, metadata removal, neutral hashed public
   filenames, byte digests bound to approval, no original file copying, image
   reference validation, and orphan cleanup before extending the public contract.

First full workflow acceptance: three synthetic experiences share one person,
place, and event; private commit updates the protected phone reader; only chosen
records enter prepared AI context; manually authored drafts work without AI;
changing a draft invalidates approval; public export/import renders linked
memories; removing a profile also removes its public relationships. Replace
synthetic content with real reviewed entries only after those checks pass.

For site implementation, run npm test, npm run build, and git diff --check.
UI completion additionally requires running-browser checks at 320/768/1280px,
keyboard focus, reduced motion, back navigation, and actual imported fixture
routes. A successful build alone does not establish private access or UI behavior.

## Life replaces About: entry experience

The author's condition is immediate context followed by interaction/navigation.
Treat that as an acceptance requirement: a first-time visitor must understand
whose life this is, what they are currently doing, and what they can explore
without opening a menu, selecting a map marker, or reading a memory first.

Implemented initial composition: existing name/portrait, the author-approved short
introduction, then Making / Memories / Calendar / Places / People navigation.
Making starts with existing work links while there are no shared memories.
Contact and external links stay
easy to find. The interface can become richer after that orientation; the first
screen must be useful with no interaction and no JavaScript. Do not require the
old About page's entire biography, credentials, and subject lists above the
archive, which would bury the interaction on mobile.

Reuse suitable profile/protagonist data rather than creating a duplicate identity
source. The current profile contains explicitly expiring October 2026 copy
(grocery-floor work and “moving to Japan soon”). Those lines need author review
before reuse; do not silently rewrite them or present them as current context.
The author clarified that the old About page was AI-written and dated; its
framing is not their established voice. Their aspiration to be present, connected,
and retain agency guides the design, but they rejected making that an explanatory
statement of purpose on the page. They approved the following direct introduction
and authorized implementation:

> I make YouTube videos, sing, and I’m working toward telling a story of my own.
> I love Japanese stories—anime and manga especially. This is where I share some
> of what I’m making and living.

Only name/portrait and external links are reused from existing identity/profile
data. The old hook, epithet, credentials, biography, and subject lists are not
rendered on Life. No old content was silently rewritten as new author wording.

Replacement is ready only when /life provides that introduction, working public
navigation, and access to contact links. Until then, preserve the functioning
/about route. Verify direct /about, /status, and /stream redirects, canonical
URLs, site navigation, homepage entry links, and visible context at mobile widths
when making the switch. Never redirect About to an empty archive shell.

## Checkpoint / automatic handoff

Inputs: the two recovered chats, current local checkout, the existing P4G docs,
and dsh launcher/help. Initial unrelated change: .DS_Store; preserve it.

Chosen: separate private archive, private push synchronization, independent hosted
reader, reviewed /life exports, provider-independent workflow, and /life replacing
About with immediate context followed by exploration. Proposed: private
folder layout, text-only first slice, milestone ordering, future route components.

Implemented: public schema/import foundation plus /life introduction, native-link
menu with hash/history selection, existing work links, contact links, public
record routes and connections/encounter histories. Calendar links to dated
memories; published places have an accessible list and optional position map.
No memories, people, places, or events are fabricated for the actual page.
The map is a position-based foundation; Fukuoka artwork remains unbuilt.
About, Status, and Stream redirect directly to Life. Homepage, site navigation,
and transition styling point to Life. Narrow-phone site navigation uses three
columns so full destination labels fit. Old profile files remain as legacy data.

Verification before final follow-up: 233 tests and production build passed.
Browser checks: 320/768/1280px without horizontal overflow, loaded portrait,
menu/history, keyboard selection, skip-link focus, reduced motion, no-JS reading,
and direct 301 legacy redirects. Synthetic imported records verified calendar to
memory navigation, escaped body text, person/place encounter histories,
map/list/region links, and back navigation. Synthetic snapshot removed afterward.
CLI smoke checks passed for digests and redacted rejection diagnostics. Final
233 tests, production build, and whitespace check pass after the layout changes.
Production output has direct 301 redirects and the approved introduction/portrait;
it contains no stale Japan wording or synthetic records. Removed synthetic detail
routes return 404 locally. Existing implicit novel-collection deprecation is
unrelated. Local preview: http://127.0.0.1:4321/life.
No commit, push, publication, or real-data import.

Private archive follow-up: sibling /Users/ninjaruss/Documents/GitHub/life-archive
implements capture/attachments, typed references, local suggestions, opt-in text
context, separate public drafts, private HTML review pages, individual approvals,
and canonical export. Its 17 tests, local reader browser checks, and real-site
contract interoperability pass. No real records were added. The private GitHub
repository now contains the signed initial commit, pushed after the author
unlocked 1Password. Vercel built that exact GitHub commit successfully, including
all 17 tests. No signing bypass was used. This was a manual Git-source deployment;
after owner sign-in, the existing project was connected to that repository.
The next signed push (1f7e9a3) automatically produced a READY production deployment
of the exact commit with all 17 tests passing. Private push synchronization is
verified without a second project or bypass links.

Private reader hosting uses a separate Vercel project with Vercel Authentication
for All Deployments, verified before deploying an empty reader. Anonymous checks
on deployment/production/branch URLs and direct file paths redirect to sign-in.
Owner access and filter interaction were verified in the signed-in app browser.
Actual phone-device sign-in remains untested. Exact private-project
state and handoff are in the sibling docs/CHECKPOINT.md. No raw notes or review
receipts were copied here.

Unresolved: actual phone-device sign-in;
public photo pipeline; actual isolated execution for AI tools; real content;
real geographic coordinates or street navigation. Life remains local in this website checkout.

Next action: the author can write one real experience in the private archive.
Consume the sibling checkpoint before further implementation. Do not restart
requirements or create a second private project. Keep public publication separate
from the now-verified private push synchronization.


Map implementation: `packages/life-ui/` now contains the content-free renderer,
controller, CSS, and original Fukuoka schematic shared verbatim with the private
reader. Region map keys, nested region navigation, optional place positions,
linked entries/people, native fragments, keyboard navigation, and responsive
layouts are implemented. Public data still comes exclusively from the reviewed
snapshot. No raw archive access or private dependency is introduced.
Verified 241 website tests and production build; private 26 tests, build, shared
UI equality, and public-contract integration passed. Both interfaces were checked
at 320/768/1280px with synthetic records, which were subsequently removed. The
private checkpoint tracks protected deployment. This public integration remains
local, uncommitted, and unpublished.


Author's visual correction: replace the detached ward diagram with a recognizable
Persona 4-inspired city map. Implemented an original overhead Fukuoka illustration
with coast, bay, city blocks, rivers, park, railway, and landmark silhouettes;
black/gold destination tabs carry the interaction over muted geographic colors.
The exact UI is reused in the private archive. Both browser views and narrow
navigation were verified; 241 website and 26 archive tests pass. No private data,
game images, or synthetic records were added to the public site. Publishing
remains pending the previously reported private Git-signing blocker.
