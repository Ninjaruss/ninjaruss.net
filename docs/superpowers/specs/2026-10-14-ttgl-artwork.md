# TTGL artwork refresh

User request: use the TTGL profile and banner images in Documents to improve the
site, including replacing the old YouTube picture.

Implemented selection: `ttgl-b.png` for the desktop YouTube tile, with a 63%
horizontal crop to preserve the face and pointing hand; matching `ttgl-pfp.png`
for mobile with a 4:3 crop. `ttgl-pfp-2.png` replaces the shared About portrait.
These placements are implementation choices for review, not a new site-wide
visual identity. Existing gold/black tokens, typography, layout, copy, and
interaction treatments are retained.

Optimized WebP derivatives live in `public/images/identity/`. Originals in
Documents and the previous site images remain intact.

Checks: 216 tests passed, production build passed, and whitespace check passed.
The running homepage loads the appropriate desktop/mobile assets; mobile at
320 CSS pixels has no horizontal overflow. The local guestbook API lacks its
database connection setting, so guestbook functionality is outside verification.

Final checks: inspected the built homepage and About page. The new portrait
loads on desktop and at 320 CSS pixels; neither page overflows horizontally.
The homepage About link reaches the profile page. A static built-page preview
at `http://127.0.0.1:4322/` avoids the unrelated development error overlay;
it does not provide guestbook API functionality. Screenshots are saved under
`/tmp/ninjaruss-ttgl-review/`.

Complete locally. No push or deployment was performed.
