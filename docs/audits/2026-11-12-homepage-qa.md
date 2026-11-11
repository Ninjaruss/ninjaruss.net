# Homepage QA — November 12, 2026

## Scope and established choices

Checked the published homepage and then the local fixes. Preserve the P4G visual system, approved introduction and descriptions, equal prominence of the four creative pursuits, Now at the top, and Traces below the work. No story/article text changed.

## Findings and local corrections

- At 768px, Coincidences broke mid-word because the Now column was too narrow. Increased its minimum width to 260px; verified the title fits on one line at 701, 768, 1023 and 1024px.
- The wide 1440×480 artwork was cropped into 16:9 on desktop, stretching the shared Writing/Video row to about 602px. Use its native 3:1 framing on wide screens, 16:9 on tablets, and the existing separate portrait/4:3 framing on phones. The desktop row is now about 446px.
- About/Contact previously floated beside the intro in its middle. Place them consistently below the introduction.
- At tablet widths, 5/7-column creative cards made Writing and the novel unnecessarily narrow. Use equal six-column cards from 701–1023px, retaining asymmetric desktop columns. Stack Shelf's interior at these widths so all three posters fit.
- Conflicting synopsis width limits created avoidable wrapping and empty space beside Projects. Let the existing premise use its card width; no wording changed.
- Reduce the vertical gap between wrapped video links while retaining 44px targets.
- Keep the plain Guestbook descriptor visible on phones; it was previously hidden there.
- The empty-Now fallback now says Personal updates rather than repeating Where I’m at.

## Description review

Descriptions match the current destinations: local dated essays, videos about Japan/Japanese/anime, two interest-driven tools with L-file's offline status, work-in-progress novel with planning, taste/commentary on Shelf, and learner practice in the Japanese journal. Kept the approved wording. Marie remains a neutral optional link, not a recommended first video. Do not reintroduce Substack links or collapse Now into the essay archive.

## Verification and handoff

- Inspected the full published composition at 1280, 768 and 390px; locally checked 320, 390, 701, 768, 1023, 1024 and 1280px. No horizontal overflow; checked link targets remain at least 44px high.
- Keyboard focus reaches Contact with a visible 3px gold outline. Local images all load. Now remains above Writing; guestbook remains after the work.
- Tests: 226 pass. Production build and diff whitespace check pass. Internal homepage destination responses checked separately; no forms submitted, no third-party video playback tested.
- Changes are local and unpushed. Preserve unrelated .DS_Store, package.json and private-life-archive design edits. Next action: review/push if requested.
