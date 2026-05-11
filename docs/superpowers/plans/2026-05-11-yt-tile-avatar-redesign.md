# YouTube Tile Avatar Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the YouTube tile's icon-based default state with a full-bleed channel avatar and add a consistent slide-up strip hover reveal for both the default and live states.

**Architecture:** Single-file change to `src/pages/index.astro` — update the HTML markup inside `#yt-tile` and the scoped CSS block that styles `.image-tile--youtube`. No new files are needed beyond the avatar image asset.

**Tech Stack:** Astro 5, vanilla CSS (scoped in `.astro` file), static HTML

---

## File Map

| File | Change |
|------|--------|
| `public/images/logos/yt-avatar.jpg` | **Required asset** — user must place their YouTube channel avatar here before running |
| `src/pages/index.astro` | Replace tile HTML markup; replace/add scoped CSS rules |

---

### Task 1: Verify avatar asset is present

**Files:**
- Read: `public/images/logos/`

- [ ] **Step 1: Check the asset exists**

```bash
ls public/images/logos/yt-avatar.jpg
```

Expected: file listed. If missing, stop and ask the user to save their YouTube channel profile picture to `public/images/logos/yt-avatar.jpg` before continuing.

---

### Task 2: Replace tile HTML markup

**Files:**
- Modify: `src/pages/index.astro:141-167`

Replace the entire `<a id="yt-tile" ...>` block (lines 141–167). The new markup:
- Removes `.yt-tile__content` (icon + label + sub) entirely
- Adds a full-bleed `<img>` avatar
- Adds a `.yt-tile__tint` div for the red hover tint
- Adds a `.yt-tile__strip` inside the tile (always present, slides up on hover) with YouTube branding
- Keeps `.yt-tile__live-overlay` and `.yt-tile__live-badge` unchanged
- Adds a second `.yt-tile__strip` inside `.yt-tile__live-overlay` for the live hover state

- [ ] **Step 1: Replace the tile markup**

Find this block in `src/pages/index.astro`:
```html
      <a
        id="yt-tile"
        href="https://www.youtube.com/@Ninjaruss"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ninjaruss on YouTube"
        class="image-tile image-tile--youtube p3r-animate"
        style="--stagger-delay: 100ms;"
      >
        <!-- Default: YouTube channel -->
        <div class="yt-tile__content">
          <svg class="yt-tile__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
          <div class="yt-tile__label">Ninjaruss</div>
          <div class="yt-tile__sub">YouTube</div>
        </div>
        <!-- Live overlay: shown via .is-twitch-live class -->
        <div class="yt-tile__live-overlay" aria-hidden="true">
          <img
            class="yt-tile__preview"
            src="https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg"
            alt="Live stream preview"
          />
          <div class="yt-tile__live-badge">LIVE</div>
        </div>
      </a>
```

Replace with:
```html
      <a
        id="yt-tile"
        href="https://www.youtube.com/@Ninjaruss"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ninjaruss on YouTube"
        class="image-tile image-tile--youtube p3r-animate"
        style="--stagger-delay: 100ms;"
      >
        <!-- Full-bleed channel avatar -->
        <img class="yt-tile__avatar" src="/images/logos/yt-avatar.jpg" alt="Ninjaruss YouTube channel" />

        <!-- Red tint on hover -->
        <div class="yt-tile__tint" aria-hidden="true"></div>

        <!-- Slide-up strip: YouTube branding -->
        <div class="yt-tile__strip" aria-hidden="true">
          <svg class="yt-tile__strip-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
          <div class="yt-tile__strip-text">
            <div class="yt-tile__strip-name">Ninjaruss</div>
            <div class="yt-tile__strip-sub">YouTube</div>
          </div>
        </div>

        <!-- Live overlay: shown via .is-twitch-live class -->
        <div class="yt-tile__live-overlay" aria-hidden="true">
          <img
            class="yt-tile__preview"
            src="https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg"
            alt="Live stream preview"
          />
          <div class="yt-tile__live-badge">LIVE</div>

          <!-- Slide-up strip: Twitch/live branding -->
          <div class="yt-tile__strip yt-tile__strip--live" aria-hidden="true">
            <svg class="yt-tile__strip-icon yt-tile__strip-icon--twitch" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
            <div class="yt-tile__strip-text">
              <div class="yt-tile__strip-name">Ninjaruss</div>
              <div class="yt-tile__strip-sub">Watching live →</div>
            </div>
          </div>
        </div>
      </a>
```

- [ ] **Step 2: Verify markup renders without errors**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser. The tile should show the avatar image (or a broken image if the asset isn't placed yet — that's fine). No console errors.

---

### Task 3: Replace scoped CSS for the tile

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>` block, `/* ─── YouTube / Live Tile ───` section)

- [ ] **Step 1: Remove old CSS rules no longer needed**

Find and delete these rule blocks entirely (they styled the now-removed `.yt-tile__content` / icon / label / sub elements):

```css
  /* Default: YouTube channel content */
  .yt-tile__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    z-index: 1;
    transition: opacity var(--transition-base);
  }

  .image-tile--youtube.is-twitch-live .yt-tile__content {
    opacity: 0;
    pointer-events: none;
  }

  .yt-tile__icon {
    width: 36px;
    height: 36px;
    color: #ff0000;
    filter: drop-shadow(0 0 8px rgba(255,0,0,.4));
    transition: transform var(--transition-base), filter var(--transition-base);
  }

  .image-tile--youtube:hover .yt-tile__icon {
    transform: scale(1.15);
    filter: drop-shadow(0 0 14px rgba(255,0,0,.65));
  }

  .yt-tile__label {
    font-family: var(--font-display);
    font-size: .6rem;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .yt-tile__sub {
    font-family: var(--font-mono);
    font-size: .5rem;
    color: #777;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
```

- [ ] **Step 2: Add new CSS rules after the `.image-tile--youtube:active` block**

After this existing block:
```css
  .image-tile--youtube:active {
    transform: translate(0, 0);
    box-shadow: var(--shadow-hard-sm);
  }
```

Insert:
```css
  /* Full-bleed avatar */
  .yt-tile__avatar {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Red tint overlay on hover */
  .yt-tile__tint {
    position: absolute;
    inset: 0;
    background: rgba(255, 0, 0, 0.1);
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 1;
  }
  .image-tile--youtube:hover .yt-tile__tint {
    opacity: 1;
  }

  /* Slide-up strip */
  .yt-tile__strip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 12px 11px;
    background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%);
    display: flex;
    align-items: center;
    gap: 8px;
    transform: translateY(100%);
    transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 2;
  }
  .image-tile--youtube:hover .yt-tile__strip {
    transform: translateY(0);
  }

  .yt-tile__strip-icon {
    width: 16px;
    height: 16px;
    color: #ff2020;
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px rgba(255, 32, 32, 0.6));
  }
  .yt-tile__strip-icon--twitch {
    color: #9146ff;
    filter: drop-shadow(0 0 4px rgba(145, 70, 255, 0.6));
  }

  .yt-tile__strip-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .yt-tile__strip-name {
    font-family: var(--font-mono);
    font-size: .5rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: .1em;
    text-transform: uppercase;
    line-height: 1.2;
  }
  .yt-tile__strip-sub {
    font-family: var(--font-mono);
    font-size: .45rem;
    color: #aaa;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .yt-tile__strip--live .yt-tile__strip-sub {
    color: #ff9090;
  }
```

- [ ] **Step 3: Add z-index to the live overlay**

The default strip has `z-index: 2`. Without an explicit z-index on `.yt-tile__live-overlay`, the strip would bleed through the live thumbnail. Find the existing rule in the scoped CSS:

```css
  /* Live overlay — hidden until .is-twitch-live */
  .yt-tile__live-overlay {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-base);
  }
```

Add `z-index: 3;` to it:

```css
  /* Live overlay — hidden until .is-twitch-live */
  .yt-tile__live-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-base);
  }
```

- [ ] **Step 5: Check reduced-motion rules**

Search the scoped style block for `prefers-reduced-motion`. There is an existing block near the bottom. Add the new strip transition to it:

Find the existing reduced-motion block that contains `.image-tile--youtube`:
```css
    .image-tile--youtube { transition: none; }
```

Add inside the same `@media (prefers-reduced-motion: reduce)` block:
```css
    .yt-tile__strip { transition: none; }
    .yt-tile__tint  { transition: none; }
```

- [ ] **Step 6: Verify visually in dev server**

With `npm run dev` running, open `http://localhost:4321`:

1. **Avatar fills tile** — channel image covers the full 1×1 square, no padding
2. **Default hover** — hover the tile: red tint appears + strip slides up from bottom showing YouTube icon + "NINJARUSS / YOUTUBE"
3. **Tile lift** — the existing `translate(-4px, -4px)` + red border still activates on hover
4. **Live state** — to test manually, open browser console and run:
   ```js
   document.getElementById('yt-tile').classList.add('is-twitch-live')
   ```
   Tile should show the Twitch thumbnail. Hovering should slide up the Twitch strip ("NINJARUSS / WATCHING LIVE →") with purple Twitch icon.
5. **Remove live class** to restore:
   ```js
   document.getElementById('yt-tile').classList.remove('is-twitch-live')
   ```

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): youtube tile full-bleed avatar with slide-up strip hover"
```
