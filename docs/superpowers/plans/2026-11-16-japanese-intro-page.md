# Japanese Intro Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one Japanese page at `/ja` that tells a Japanese reader who Ninjaruss is and what he makes, and make it discoverable from the homepage.

**Architecture:** One new static page through the existing `BaseLayout`, which gains an optional `lang` prop so this page can declare `lang="ja"` instead of the hardcoded `lang="en"`. No locale routing, no content-collection changes, no client JS. Discovery is two plain links on the homepage.

**Tech Stack:** Astro 5, vanilla scoped CSS, existing P4G design tokens.

**Spec:** `docs/superpowers/specs/2026-11-16-japanese-intro-page-design.md`

## Global Constraints

- No new dependencies. No CJK webfont — Japanese falls through to the system stack.
- No third-party translation script or widget.
- `NavPill` stays a four-item menu (Home / About / Now / Shelf). No fifth item.
- No changes to `src/content/**`, `src/content/config.ts`, or any collection schema.
- Every Japanese string ships exactly as written in the spec's "Draft Japanese copy" section, with the name rendered `ニンジャラス`.
- `npm run build` and `npm run test` pass at the end of every task.

## Review Focus

No new logic ships here, so these are verified by build output and DOM assertions rather than unit tests. Each is pinned to the task that owns it.

1. **Every existing page must still emit `lang="en"`.** The prop default is the only thing standing between this change and 40-odd pages silently losing their language declaration. (Task 1)
2. **`/ja` must emit `lang="ja"`.** Browsers key their translation offer off this attribute; a wrong value makes Chrome offer to translate Japanese into Japanese. (Task 2)
3. **`hreflang` hrefs must be absolute.** Relative values are ignored by some consumers; resolve through `Astro.site` the way the existing `canonical` link does. (Task 1)
4. **Japanese glyphs must survive the P4G heading treatment.** `p4g-heading` applies `--skew-display` and letter-spacing tuned for latin caps; CJK can smear. (Task 2)
5. **The 日本語 link must be reachable at 375px.** `.about-links` is a wrapping flexbox and the homepage collapses to one column at ≤700px. (Task 3)

---

### Task 1: `lang` prop and `hreflang` pair on BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (Props interface ~lines 9-17, destructure ~lines 19-26, `<html>` line 40, head near the `canonical` link line 46)

**Interfaces:**
- Produces: `BaseLayout` accepts `lang?: string`, defaulting to `'en'`. Task 2 passes `lang="ja"`.

- [ ] **Step 1: Add `lang?: string` to the `Props` interface and destructure it with a default of `'en'`**

Document it with a one-line comment in the style of the existing `displayTitle` comment: pages are English unless they say otherwise.

- [ ] **Step 2: Change `<html lang="en">` to `<html lang={lang}>`**

- [ ] **Step 3: Emit the `hreflang` pair for the two pages that have a translated counterpart**

In the frontmatter, add a module-level constant mapping each path to its counterpart and language:

```ts
/* The only translated pair on the site: the English homepage and the
   Japanese introduction. Deliberately a literal, not a convention — there
   is no /ja/** mirror and no locale routing to derive this from. */
const TRANSLATED_PAIRS: Record<string, { en: string; ja: string }> = {
  '/': { en: '/', ja: '/ja' },
  '/ja': { en: '/', ja: '/ja' },
};
```

Resolve the current pathname against it (tolerating a trailing slash, since Astro's build emits `/ja/`), and when it matches, emit `<link rel="alternate" hreflang="en" ...>` and `<link rel="alternate" hreflang="ja" ...>` with hrefs built by `new URL(path, Astro.site || 'https://ninjaruss.net')` — the same resolution the `canonical` link already uses. Place them next to the `canonical` link.

- [ ] **Step 4: Verify existing pages are unchanged**

Run: `npm run build && grep -L 'lang="en"' dist/index.html dist/life/index.html dist/now/index.html dist/shelf/index.html`
Expected: no output — every one of those files still declares `lang="en"`.

- [ ] **Step 5: Run the test suite**

Run: `npm run test`
Expected: PASS, 195 tests.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Let a page declare its own language"
```

---

### Task 2: The `/ja` page

**Files:**
- Create: `src/pages/ja.astro`
- Reference for styling conventions: `src/styles/life.css`, `src/pages/now.astro` (scoped style block)

**Interfaces:**
- Consumes: `BaseLayout` with `lang="ja"` from Task 1.
- Produces: the route `/ja`, linked by Task 3.

- [ ] **Step 1: Build the page**

`BaseLayout` props, all in Japanese: `title="自己紹介"`, `displayTitle="ニンジャラス — 自己紹介"`, `description` a one-sentence Japanese summary, and `lang="ja"`.

Sections, in this order, with the copy taken verbatim from the spec's "Draft Japanese copy":

1. `<h1>` ニンジャラス, then the はじめまして / オタクです / 福岡 / アニメや漫画 paragraphs.
2. `つくっているもの` — a list linking Remember Rain (`/novel`), YouTube (`https://www.youtube.com/@Ninjaruss_`), 書きもの (`/notes`), プロジェクト (`/showcase`). Mark the YouTube link off-site with the site's existing `↗` + visually-hidden `.offsite` span pattern (see `src/pages/index.astro:142`).
3. `日本語の練習` — link to `/japanese-journal`.
4. `連絡` — link to `/life#contact`.
5. The closing `※ このページ以外は英語で書かれています。ブラウザの翻訳機能をご利用ください。` note.
6. A link back to the homepage (`/`), labelled in Japanese.

**Decisions this locks in, so the implementer does not have to guess:**
- **No `NavPill`.** Its labels are English and its menu is fixed at four items; an English chrome bar on the one Japanese page undercuts the point. The page's own Japanese links are its navigation, which is why step 6 above exists.
- **Own scoped `<style>` block**, not `life.css`. One page, one small block; do not import or extend the `.life__*` family.
- Use the existing design tokens (`--color-gold`, `--color-text`, `--color-bg-base`, `--text-page-title`, `--text-panel-title`) rather than new values.

- [ ] **Step 2: Verify the language declaration**

Run: `npm run build && grep -o 'lang="[a-z]*"' dist/ja/index.html`
Expected: `lang="ja"`

- [ ] **Step 3: Verify the hreflang pair from Task 1 fired**

Run: `grep -c 'rel="alternate" hreflang' dist/ja/index.html dist/index.html`
Expected: `2` for each file.

- [ ] **Step 4: Check the Japanese renders cleanly**

Serve the build and load `/ja` in the browser pane. Assert via DOM, not screenshots: confirm `document.documentElement.lang === 'ja'` and that every link resolves. Then look at the headings: if `p4g-heading`'s skew or letter-spacing smears the CJK glyphs, drop those two properties on this page's headings and say so in the commit message.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ja.astro
git commit -m "Add a Japanese introduction page"
```

---

### Task 3: Discovery links on the homepage

**Files:**
- Modify: `src/pages/index.astro:31-34` (`.about-links` nav), `src/pages/index.astro:130-140` (`.footer-site` nav)

**Interfaces:**
- Consumes: the `/ja` route from Task 2.

- [ ] **Step 1: Add the links**

A `<a href="/ja">日本語</a>` as the third item in the `.about-links` nav (after About and Contact), and the same link in the `.footer-site` site map. No new CSS — both navs already style their children generically (`index.astro:239`, `index.astro:608`).

Leave `aria-label="About and contact"` on `.about-links` as it is; a third item does not make the label wrong.

- [ ] **Step 2: Verify both links are in the built homepage**

Run: `npm run build && grep -c 'href="/ja"' dist/index.html`
Expected: `2`

- [ ] **Step 3: Verify the link is reachable at phone width**

In the browser pane at 375px, confirm the `.about-links` 日本語 link is present, visible, and has a tap target of at least 44px (`.about-links a` already sets `min-height: 44px`). Assert via DOM — `getBoundingClientRect()` — not by eye.

- [ ] **Step 4: Full verification**

Run: `npm run build && npm run test`
Expected: build succeeds, 195 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "Point Japanese readers at the introduction"
```
