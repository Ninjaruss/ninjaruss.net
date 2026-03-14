# Emblem Polish & Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish EmblemCard with P4G-quality visual treatment and unify emblem display across all site surfaces.

**Architecture:** EmblemCard gains a `size` prop, new CSS face treatment (inset frame, radial glow, shimmer, glow pulse), and refined animations (spring flip easing, synced float shadow). The split-view flip utility is updated to support a cinematic first-load reveal. RelatedContent gets a CSS-only card face thumbnail. Favorites detail page gets an auto-flip on page enter.

**Tech Stack:** Astro 5, Vanilla CSS custom properties, TypeScript, requestAnimationFrame

**Spec:** `docs/superpowers/specs/2026-03-13-emblem-polish-design.md`

---

## Chunk 1: EmblemCard visual and animation polish

### Task 1: EmblemCard — `size` prop and HTML structure

**Files:**
- Modify: `src/components/EmblemCard.astro:1-32`

- [ ] **Step 1: Add `size` prop to frontmatter and HTML**

Replace the entire frontmatter and HTML section (lines 1–32):

```astro
---
interface Props {
  emblemSrc?: string;
  isInitiallyFlipped?: boolean;
  disableLightbox?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

const {
  emblemSrc,
  isInitiallyFlipped = false,
  disableLightbox = false,
  size = 'md',
} = Astro.props;
const defaultEmblem = '/images/emblems/default.svg';
const cardBack = '/images/ygo-card-backing.png';
---

<div
  class:list={['emblem-card', { 'is-flipped': isInitiallyFlipped }]}
  data-emblem-card
  data-size={size}
  data-emblem-src={emblemSrc || defaultEmblem}
  data-disable-lightbox={disableLightbox ? 'true' : 'false'}
>
  <div class="emblem-card__flipper">
    <div class="emblem-card__face emblem-card__back">
      <img src={cardBack} alt="" class="emblem-card__img" />
    </div>
    <div class="emblem-card__face emblem-card__front">
      <div class="emblem-bg"></div>
      <div class="emblem-glow"></div>
      <div class="emblem-shimmer"></div>
      <img
        src={emblemSrc || defaultEmblem}
        alt="Page emblem"
        class="emblem-card__img emblem-card__emblem"
        data-emblem-front
      />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors on `size` prop.

---

### Task 2: EmblemCard — CSS face treatment

**Files:**
- Modify: `src/components/EmblemCard.astro:34-121` (style block)

- [ ] **Step 1: Replace the full `<style>` block**

Replace everything between `<style>` and `</style>` with:

```css
/* ── Size tokens ───────────────────────────────────────────────── */
.emblem-card {
  perspective: 1000px;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 63 / 88;
  cursor: pointer;
}

.emblem-card[data-size='xs'] { max-width: 60px; }
.emblem-card[data-size='sm'] { max-width: 120px; }
.emblem-card[data-size='md'] { max-width: 240px; }

/* ── Flipper ───────────────────────────────────────────────────── */
.emblem-card__flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.emblem-card.is-flipped .emblem-card__flipper {
  transform: rotateY(180deg);
}

/* ── Faces ─────────────────────────────────────────────────────── */
.emblem-card__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: var(--border-medium) solid var(--color-border-strong);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-hard-sm);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}

.emblem-card__back {
  transform: rotateY(0deg);
}

.emblem-card__front {
  transform: rotateY(180deg);
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Note: position: absolute comes from .emblem-card__face — do NOT add position: relative here */
  overflow: hidden;
}

/* ── Inset geometric frame ─────────────────────────────────────── */
.emblem-card__front::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 229, 44, 0.25);
  border-radius: calc(var(--radius-md) - 4px);
  pointer-events: none;
  z-index: 2;
}

/* ── Corner gradient overlay ───────────────────────────────────── */
.emblem-card__front::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: calc(var(--radius-md) - 4px);
  background:
    radial-gradient(ellipse at top left, rgba(255, 229, 44, 0.12) 0%, transparent 45%),
    radial-gradient(ellipse at bottom right, rgba(255, 229, 44, 0.07) 0%, transparent 45%);
  pointer-events: none;
  z-index: 0;
}

/* ── Breathing glow pulse (on isolated element — avoids box-shadow conflict with hover rules) */
/* Intentionally kept active under prefers-reduced-motion (shadow-only, no transform) */
/* z-index: 4 — above all decorative layers so inset shadow is visible */
.emblem-glow {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--radius-md) - 2px);
  pointer-events: none;
  z-index: 4;
  animation: emblem-pulse 3s ease-in-out infinite;
}

/* ── Radial glow backdrop ──────────────────────────────────────── */
.emblem-bg {
  position: absolute;
  width: 65%;
  height: 65%;
  background: radial-gradient(circle, rgba(255, 229, 44, 0.12) 0%, rgba(255, 229, 44, 0.04) 45%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* ── Shimmer sweep ─────────────────────────────────────────────── */
.emblem-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 229, 44, 0.06) 50%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 3;
  animation: emblem-shimmer-periodic 4s ease-in-out infinite 1.5s;
}

.emblem-card__front:hover .emblem-shimmer {
  animation: emblem-shimmer-once 0.6s ease forwards;
}

/* ── Emblem image ──────────────────────────────────────────────── */
.emblem-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emblem-card__emblem {
  width: 60%;
  height: 60%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 8px rgba(255, 229, 44, 0.5)) drop-shadow(0 0 3px rgba(255, 229, 44, 0.8));
}

/* ── Hover effects ─────────────────────────────────────────────── */
.emblem-card:hover .emblem-card__face {
  border-color: var(--color-gold-dim);
}

.emblem-card:hover .emblem-card__front {
  box-shadow:
    0 0 40px rgba(255, 229, 44, 0.3),
    6px 6px 0 rgba(255, 229, 44, 0.2);
}

.emblem-card:hover .emblem-card__back {
  box-shadow: var(--shadow-hard);
}

/* ── Flipped glow + float-glow sync (single rule — no duplicate selectors) */
.emblem-card.is-flipped .emblem-card__front {
  box-shadow:
    var(--shadow-glow),
    var(--shadow-hard),
    0 0 calc(15px * var(--float-glow, 0)) rgba(255, 229, 44, calc(0.1 * var(--float-glow, 0)));
}

/* ── Floating animation ────────────────────────────────────────── */
.emblem-card {
  transform: translateY(var(--float-y, 0));
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  /* float glow synced with float position via --float-glow JS property */
  --float-glow: 0;
}

.emblem-card[style*='--float-y'] {
  transition: none;
}

/* ── CSS hover tilt fallback (overridden by JS tilt on hover:hover) */
.emblem-card:hover .emblem-card__flipper {
  transform: rotateY(180deg) scale(1.02);
}

.emblem-card:not(.is-flipped):hover .emblem-card__flipper {
  transform: rotateY(0deg) scale(1.02);
}

/* ── Keyframes ─────────────────────────────────────────────────── */
@keyframes emblem-pulse {
  /* inset glow on .emblem-glow div — no conflict with outer box-shadow on .emblem-card__front */
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(255, 229, 44, 0.06);
  }
  50% {
    box-shadow: inset 0 0 40px rgba(255, 229, 44, 0.14);
  }
}

@keyframes emblem-shimmer-periodic {
  0% { left: -100%; opacity: 0; }
  5% { opacity: 1; }
  55% { left: 140%; opacity: 1; }
  56% { opacity: 0; left: 140%; }
  100% { left: 140%; opacity: 0; }
}

@keyframes emblem-shimmer-once {
  0% { left: -100%; }
  100% { left: 140%; }
}

/* ── Reduced motion ────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .emblem-card__flipper {
    transition: none;
    transform: rotateY(0deg) !important;
  }

  .emblem-shimmer {
    animation: none;
  }

  .emblem-card__front:hover .emblem-shimmer {
    animation: none;
  }

  /* emblem-pulse intentionally kept (shadow-only, no transform) */
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```
Expected: clean build.

- [ ] **Step 3: Visual check — card face**

```bash
npm run dev
```
Open `http://localhost:4321/media` and select any entry. Confirm:
- Emblem face shows inset gold frame inside card border
- Radial glow halo behind emblem image
- Emblem image has gold drop-shadow
- Card pulses faintly (glow breathes every 3s)
- Shimmer sweeps across every ~4s
- Hovering triggers shimmer-once sweep + stronger glow

---

### Task 3: EmblemCard — JS animation polish

**Files:**
- Modify: `src/components/EmblemCard.astro:123-273` (script block)

- [ ] **Step 1: Update `handleMouseLeave` easing (line 170)**

In the `handleMouseLeave` function, change the transition reset:
```ts
// Before:
(flipper as HTMLElement).style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';

// After:
(flipper as HTMLElement).style.transition = 'transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)';
```

- [ ] **Step 2: Add `xs` suppression to `initEmblemTilt`**

At the top of the `emblemCards.forEach` callback inside `initEmblemTilt`, after the `if (!flipper) return;` guard, add:
```ts
// Suppress tilt on xs cards (too small to be meaningful)
if ((card as HTMLElement).dataset.size === 'xs') return;
```

- [ ] **Step 3: Add `xs` suppression to `initEmblemFloat`**

At the top of the `emblemCards.forEach` callback inside `initEmblemFloat`, add:
```ts
// Suppress float on xs cards
if ((card as HTMLElement).dataset.size === 'xs') return;
```

- [ ] **Step 4: Add `--float-glow` to the RAF float loop**

Inside the `animate` function in `initEmblemFloat`, find the existing line:
```ts
(card as HTMLElement).style.setProperty('--float-y', `${translateY}px`);
```
Add these two NEW lines immediately after it (do not duplicate the `--float-y` setter):
```ts
// Sync glow intensity with float position (0 at bottom, 1 at peak)
const glowIntensity = (sineValue + 1) / 2; // normalize sine -1..1 → 0..1
(card as HTMLElement).style.setProperty('--float-glow', `${glowIntensity}`);
```

In the transition-out branch (the `if (!isFloating)` path), replace:
```ts
if (Math.abs(currentY) > 0.1) {
  const targetY = currentY * 0.9;
  (card as HTMLElement).style.setProperty('--float-y', `${targetY}px`);
  floatRafId = requestAnimationFrame(animate);
} else {
  (card as HTMLElement).style.removeProperty('--float-y');
  floatRafId = null;
}
```
With:
```ts
if (Math.abs(currentY) > 0.1) {
  const targetY = currentY * 0.9;
  (card as HTMLElement).style.setProperty('--float-y', `${targetY}px`);
  (card as HTMLElement).style.setProperty('--float-glow', `${Math.abs(targetY) / FLOAT_AMPLITUDE}`);
  floatRafId = requestAnimationFrame(animate);
} else {
  (card as HTMLElement).style.removeProperty('--float-y');
  (card as HTMLElement).style.removeProperty('--float-glow');
  floatRafId = null;
}
```

- [ ] **Step 5: Apply `size="xs"` to SplitView mobile badge**

In `src/layouts/SplitViewLayout.astro` line 116, change:
```astro
<!-- Before: -->
<EmblemCard emblemSrc={initialEmblem} isInitiallyFlipped={hasInitialContent} />

<!-- After: -->
<EmblemCard emblemSrc={initialEmblem} isInitiallyFlipped={hasInitialContent} size="xs" />
```
(The desktop right-panel `EmblemCard` on line 111 uses the default `md` — no change needed there.)

- [ ] **Step 6: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

- [ ] **Step 7: Visual check — animations**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run dev
```
- Select an entry in `/media` and leave idle for 3s — confirm emblem floats and outer glow brightens at float peak
- Hover the card — tilt fires, glow intensifies, shimmer sweeps once; move away — spring snap easing
- Resize to ≤1200px — mobile badge appears at 60px; confirm no tilt/float on badge (xs suppression active)
- Note: shimmer restarts from `left: -100%` after hover (not resume) — expected CSS behavior

- [ ] **Step 8: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add src/components/EmblemCard.astro src/layouts/SplitViewLayout.astro
git commit -m "feat: polish EmblemCard — inset frame, radial glow, shimmer, spring flip, float glow"
```

---

## Chunk 2: Animation logic, RelatedContent, Favorites detail

### Task 4: `emblemAnimation.ts` — spring easing + cinematic first-load flip

**Files:**
- Modify: `src/utils/splitView/emblemAnimation.ts`

- [ ] **Step 1: Replace the full file**

```ts
/**
 * Trigger emblem card flip animation.
 *
 * instant=false (first load): 300ms delayed simple flip (back → front, spring easing).
 * instant=true  (subsequent): immediate full 360° spin revealing the new emblem.
 *
 * Returns a promise that resolves when animation completes.
 */
export function triggerEmblemFlip(doc?: Document, instant = true): Promise<void> {
  return new Promise((resolve) => {
    const emblemCards = document.querySelectorAll('[data-emblem-card]');
    if (emblemCards.length === 0) {
      resolve();
      return;
    }

    const pageEmblem = doc?.querySelector('[data-page-emblem]');
    const emblemSrc = pageEmblem?.getAttribute('data-src') || '/images/emblems/default.svg';

    // Cinematic first-load reveal: update src then flip after 300ms entrance delay
    if (!instant) {
      emblemCards.forEach((card) => {
        const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
        if (frontImg && emblemSrc) frontImg.src = emblemSrc;
      });
      setTimeout(() => {
        emblemCards.forEach((card) => {
          card.classList.add('is-flipped');
        });
        resolve();
      }, 300);
      return;
    }

    // Subsequent content change: full 360° spin (back → new emblem)
    const totalDuration = 800;

    emblemCards.forEach((card) => {
      const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
      const flipper = card.querySelector('.emblem-card__flipper') as HTMLElement;
      if (!flipper) return;

      // Disable transitions, force to 180deg (showing front), then animate to 540deg
      flipper.style.transition = 'none';
      card.classList.remove('is-flipped');
      flipper.style.transform = 'rotateY(180deg)';

      // Force reflow
      void flipper.offsetWidth;

      flipper.style.transition = `transform ${totalDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
      flipper.style.transform = 'rotateY(540deg)';

      // Update image near midpoint (card backing visible, new emblem not yet)
      setTimeout(() => {
        if (frontImg && emblemSrc) frontImg.src = emblemSrc;
      }, totalDuration * 0.5);

      // Normalize to 180deg after spin completes
      setTimeout(() => {
        flipper.style.transition = 'none';
        flipper.style.transform = 'rotateY(180deg)';
        card.classList.add('is-flipped');

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            flipper.style.transition = '';
            resolve();
          });
        });
      }, totalDuration);
    });
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```
Expected: clean build, no errors in `emblemAnimation.ts`.

---

### Task 5: `contentLoader.ts` — pass `!isFirstLoad` to `triggerEmblemFlip`

**Files:**
- Modify: `src/utils/splitView/contentLoader.ts:95`

- [ ] **Step 1: Update the `triggerEmblemFlip` call**

On line 95, change:
```ts
// Before:
await triggerEmblemFlip(doc, isFirstLoad);

// After:
await triggerEmblemFlip(doc, !isFirstLoad);
```

This passes `instant=false` on first load (cinematic delayed flip) and `instant=true` on subsequent selections (immediate 360° spin).

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Visual check — auto-flip on first load**

```bash
npm run dev
```
- Open `http://localhost:4321/media` — without clicking any entry, hard reload the page with an entry pre-selected (navigate directly to e.g. `http://localhost:4321/media/some-slug/`)
- Actually, open `/media` fresh and click the **first** list item — confirm emblem starts on back, then flips to reveal emblem ~300ms later with the spring snap
- Click a **second** entry — confirm emblem does the full 360° spin (not a delayed flip)

- [ ] **Step 4: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add src/utils/splitView/emblemAnimation.ts src/utils/splitView/contentLoader.ts
git commit -m "feat: cinematic auto-flip on first load, spring easing on full spin"
```

---

### Task 6: `RelatedContent.astro` — styled emblem thumbnail

**Files:**
- Modify: `src/components/RelatedContent.astro:71-74` (emblem block) and `src/components/RelatedContent.astro:130-150` (emblem CSS)

- [ ] **Step 1: Replace the conditional emblem block (lines 71–75)**

Replace:
```astro
{entry.data.emblem && (
  <div class="related-card__emblem">
    <img src={entry.data.emblem} alt="" loading="lazy" />
  </div>
)}
```

With (always render, fall back to default.svg):
```astro
<div class="related-card__emblem">
  <div class="related-emblem-bg"></div>
  <img
    src={entry.data.emblem || '/images/emblems/default.svg'}
    alt=""
    loading="lazy"
    class="related-emblem-img"
  />
</div>
```

- [ ] **Step 2: Replace the `.related-card__emblem` CSS (lines 130–150)**

Replace:
```css
.related-card__emblem {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: var(--color-bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-card__emblem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity var(--transition-base);
}

.related-card:hover .related-card__emblem img {
  opacity: 1;
}
```

With:
Also, in the same CSS block, find `.related-card__content` and change `flex: 1` to `flex: 0 0 auto` so the emblem area fills the remaining space and the content footer stays compact:
```css
.related-card__content {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 0 0 auto; /* was flex: 1 — emblem area now fills remaining height */
}
```

Full `.related-card__emblem` replacement:
```css
.related-card__emblem {
  width: 100%;
  /* Fill remaining card height above the compact content footer */
  flex: 1;
  overflow: hidden;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Inset frame */
.related-card__emblem::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(255, 229, 44, 0.18);
  border-radius: calc(var(--radius-md) - 4px);
  pointer-events: none;
  z-index: 2;
}

/* Radial glow backdrop */
.related-emblem-bg {
  position: absolute;
  width: 55%;
  height: 55%;
  background: radial-gradient(circle, rgba(255, 229, 44, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* Emblem image */
.related-emblem-img {
  width: 50%;
  height: 50%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 5px rgba(255, 229, 44, 0.45));
  transition: filter var(--transition-base);
}

.related-card:hover .related-emblem-img {
  filter: drop-shadow(0 0 8px rgba(255, 229, 44, 0.7));
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Visual check — related content thumbnails**

Open any content detail page that has related entries (e.g. a media entry with `collections` set).
- Confirm each related card thumbnail shows inset frame + glow backdrop + emblem with drop-shadow
- Confirm cards without a custom emblem show `default.svg` (not an empty box)
- Hover a card — emblem glow intensifies

- [ ] **Step 5: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add src/components/RelatedContent.astro
git commit -m "feat: styled emblem thumbnails in RelatedContent (inset frame, radial glow)"
```

---

### Task 7: `favorites/[...slug].astro` — auto-flip on page enter

**Files:**
- Modify: `src/pages/favorites/[...slug].astro:48`

- [ ] **Step 1: Remove `isInitiallyFlipped={true}` from EmblemCard**

On line 48, change:
```astro
<!-- Before: -->
<EmblemCard emblemSrc={entry.data.emblem} isInitiallyFlipped={true} />

<!-- After: -->
<EmblemCard emblemSrc={entry.data.emblem} />
```

- [ ] **Step 2: Add auto-flip script before `</BaseLayout>`**

Add the following `<script>` tag just before the closing `</BaseLayout>` tag (after the `</style>` block):

```astro
<script>
  // Auto-flip emblem on page enter (~300ms after astro:page-load,
  // after the .p3r-animate stagger entrance settles)
  document.addEventListener('astro:page-load', () => {
    setTimeout(() => {
      const card = document.querySelector('[data-emblem-card]');
      if (card && !card.classList.contains('is-flipped')) {
        card.classList.add('is-flipped');
      }
    }, 300);
  });
</script>
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Visual check — favorites detail auto-flip**

```bash
npm run dev
```
- Navigate to any `/favorites/[slug]` page
- Confirm emblem starts on card back, then flips to reveal emblem ~300ms after page load
- Navigate back and forward using browser history — confirm flip fires each time (View Transitions re-fires `astro:page-load`)

- [ ] **Step 5: Verify favorites grid unaffected**

Navigate to `/favorites` — confirm all emblems show immediately (no flip animation), since those EmblemCards use `isInitiallyFlipped={true}` directly and have `disableLightbox={true}`.

- [ ] **Step 6: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add src/pages/favorites/[...slug].astro
git commit -m "feat: cinematic auto-flip on favorites detail page enter"
```

---

## Final verification checklist

- [ ] `npm run build` — clean build, no TypeScript errors
- [ ] `/media` — select first entry: emblem auto-flips ~300ms after SplitView content appears
- [ ] `/media` — select second entry: full 360° spring-easing spin
- [ ] `/notes`, `/showcase` — same first-load auto-flip behavior
- [ ] `/favorites` — emblems show immediately, hover shows shimmer + glow
- [ ] `/favorites/[slug]` — emblem auto-flips ~300ms after page load
- [ ] Any detail page with related content — thumbnails show card face treatment (inset frame, radial glow)
- [ ] Viewport ≤1200px — mobile badge auto-flips, no tilt/float (xs suppression)
- [ ] OS `prefers-reduced-motion` enabled — no transforms anywhere; glow pulse still animates
