# Novel Shard: Sizing Bump + Sub-folder Micro-label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make scatter canvas shards larger (200×128px) and show a sub-folder micro-label inside shards that belong to a sub-folder.

**Architecture:** Two independent edits — a CSS/JS size constant bump, and a rendering addition that uses the already-computed `group.label` from `getGroupedFiles()` to inject a `.shard-subfolder` span above `.shard-title` when non-null.

**Tech Stack:** Astro 5, Vanilla CSS, TypeScript (client-side inline script), Vitest (existing tests — unaffected)

---

### Task 1: Bump shard dimensions in CSS

**Files:**
- Modify: `src/styles/novel.css:166-168` (`.scatter-canvas .memory-shard` width)
- Modify: `src/styles/novel.css:193` (`.memory-shard` min-height)

- [ ] **Step 1: Update `.scatter-canvas .memory-shard` width**

In `src/styles/novel.css`, find the rule at ~line 164:
```css
/* Shards are absolutely positioned within the scatter canvas */
.scatter-canvas .memory-shard {
  position: absolute;
  width: 110px;
}
```

Change to:
```css
/* Shards are absolutely positioned within the scatter canvas */
.scatter-canvas .memory-shard {
  position: absolute;
  width: 200px;
}
```

- [ ] **Step 2: Update `.memory-shard` min-height**

In `src/styles/novel.css`, find the `.memory-shard` rule. It currently has `min-height: 78px` (~line 193). Change it:
```css
  min-height: 128px;
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
npm run test
```
Expected: all tests pass (novel.test.ts covers buildNovelTree/slugify/parseMetaData — no CSS or rendering tests).

- [ ] **Step 4: Commit**

```bash
git add src/styles/novel.css
git commit --no-gpg-sign -m "feat(novel): bump shard size to 200×128px"
```

---

### Task 2: Bump shard dimension constants in JS

**Files:**
- Modify: `src/pages/novel/[...slug].astro` — `renderScatter()` function (~line 248)

- [ ] **Step 1: Update shardW and shardH constants in renderScatter()**

In `src/pages/novel/[...slug].astro`, find these two lines inside `renderScatter()`:
```ts
    const shardW = 110;
    const shardH = 56;
```

Change to:
```ts
    const shardW = 200;
    const shardH = 128;
```

These constants feed into `shardPosition()` for scatter layout margin/range math. No other changes needed — the clip-path shapes use `calc(100% - Npx)` and scale automatically.

- [ ] **Step 2: Run existing tests**

```bash
npm run test
```
Expected: all tests pass.

- [ ] **Step 3: Smoke-test in dev server**

```bash
npm run dev
```

Open `http://localhost:4321/novel`. Select a folder tab. Shards should appear visibly larger (~200px wide, ~128px tall). Confirm tilt/glare effect still works on hover. Confirm clicking a shard still opens the reading overlay.

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/\[...slug\].astro
git commit --no-gpg-sign -m "feat(novel): update renderScatter constants to match 200×128px shard size"
```

---

### Task 3: Add .shard-subfolder CSS rule

**Files:**
- Modify: `src/styles/novel.css` — add rule after `.shard-title`

- [ ] **Step 1: Add the .shard-subfolder rule**

In `src/styles/novel.css`, find the `.shard-title` rule block (~line 299). After its closing `}`, add:

```css
.shard-subfolder {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(var(--panel-accent-rgb, 180,210,255), 0.65);
  border-bottom: 1px solid rgba(var(--panel-accent-rgb, 180,210,255), 0.2);
  padding-bottom: 4px;
  width: 100%;
  text-align: center;
  pointer-events: none;
  position: relative;
  z-index: 1;
}
```

`--panel-accent-rgb` is set per-shard in `renderScatter()` and matches the folder's color (e.g. orange for `lore`). The label inherits folder color automatically.

- [ ] **Step 2: Run existing tests**

```bash
npm run test
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/styles/novel.css
git commit --no-gpg-sign -m "feat(novel): add .shard-subfolder CSS rule for sub-folder micro-label"
```

---

### Task 4: Render sub-folder micro-label in scatter shards

**Files:**
- Modify: `src/pages/novel/[...slug].astro` — `renderScatter()`, shard `innerHTML` assignment (~line 271)

- [ ] **Step 1: Update shard innerHTML to conditionally render sub-folder label**

In `src/pages/novel/[...slug].astro`, find this line inside the `renderScatter()` for-loop:
```ts
        el.innerHTML = `<span class="shard-title">${esc(file.title)}</span>`;
```

The loop variable `group` is already in scope (it comes from `for (const group of groups)`). Replace the line with:
```ts
        el.innerHTML = group.label
          ? `<span class="shard-subfolder">${esc(group.label)}</span><span class="shard-title">${esc(file.title)}</span>`
          : `<span class="shard-title">${esc(file.title)}</span>`;
```

`esc()` is already defined in the file (HTML-escapes `&`, `<`, `>`, `"`). `group.label` is `string | null` — when null (root-level files), the label span is omitted and the shard renders identically to before.

- [ ] **Step 2: Run existing tests**

```bash
npm run test
```
Expected: all tests pass.

- [ ] **Step 3: Smoke-test sub-folder shards in dev server**

```bash
npm run dev
```

Open `http://localhost:4321/novel`. Click the **Lore** tab. The `Magic System` sub-folder shards (e.g. "Magic Overview", "Character Ability Table") should show a small "MAGIC SYSTEM" label in orange above the title, with a faint orange divider line between them. Root-level shards in other folders (Characters, Locations, etc.) should show no label.

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/\[...slug\].astro
git commit --no-gpg-sign -m "feat(novel): render sub-folder micro-label on scatter shards"
```

---

### Task 5: Build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: no errors or type errors. Astro static generation should enumerate all novel paths including sub-folder paths.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4321/novel`. Repeat the smoke-test: select Lore, confirm sub-folder shards show the micro-label. Select Characters — no labels. Click a shard — reading overlay opens correctly.

- [ ] **Step 3: Run tests one final time**

```bash
npm run test
```
Expected: all tests pass.
