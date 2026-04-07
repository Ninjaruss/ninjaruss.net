# Novel Shard Shapes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each `.memory-shard` in the right panel a unique irregular glass-fragment `clip-path` derived from its slug, and visually subdue subfolder shards with a simpler shape, hollow icon, and slight indent.

**Architecture:** CSS provides all styling rules (border, background, hover, transitions) while JS applies per-shard `clip-path` as an inline style keyed by a deterministic slug hash. Subfolder shards get a CSS modifier class that overrides shape and resting opacity — no inline style is applied to them. The `::after` glint becomes a top-edge gradient that works across all shapes.

**Tech Stack:** Astro 5, Vanilla CSS (clip-path, CSS custom properties), TypeScript in `<script>` block

---

## Files

| File | Change |
|------|--------|
| `src/styles/novel.css` | Remove `clip-path` from `.memory-shard`, update `::after` glint, add `.memory-shard--sub` rules |
| `src/pages/novel/[...slug].astro` | Add `SHARD_SHAPES` array + `shapeIndex()` fn, apply inline `clip-path` to regular shards, add `memory-shard--sub` class to subfolder shards |

---

### Task 1: Update CSS — shard shapes, glint, subfolder modifier

**Files:**
- Modify: `src/styles/novel.css`

- [ ] **Step 1: Remove `clip-path` from `.memory-shard` base rule**

In `src/styles/novel.css`, find the `.memory-shard` block (around line 297). Remove the `clip-path` line from it. The rule currently reads:

```css
.memory-shard {
  position: relative;
  padding: 0.9rem 1.1rem 0.9rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  user-select: none;
  background: rgba(var(--panel-accent-rgb, 80,120,200), 0.1);
  border: 1px solid rgba(var(--panel-accent-rgb, 80,120,200), 0.45);
  /* Cut top-right corner 14px — unmistakable glass shard shape */
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  transition:
    background 200ms cubic-bezier(0.16,1,0.3,1),
    border-color 200ms cubic-bezier(0.16,1,0.3,1),
    transform 200ms cubic-bezier(0.16,1,0.3,1),
    filter 200ms ease;
  will-change: transform, filter;
}
```

Replace it with (clip-path line and comment removed):

```css
.memory-shard {
  position: relative;
  padding: 0.9rem 1.1rem 0.9rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  user-select: none;
  background: rgba(var(--panel-accent-rgb, 80,120,200), 0.1);
  border: 1px solid rgba(var(--panel-accent-rgb, 80,120,200), 0.45);
  transition:
    background 200ms cubic-bezier(0.16,1,0.3,1),
    border-color 200ms cubic-bezier(0.16,1,0.3,1),
    transform 200ms cubic-bezier(0.16,1,0.3,1),
    filter 200ms ease;
  will-change: transform, filter;
}
```

- [ ] **Step 2: Replace `::after` glint with full top-edge gradient**

Find the `.memory-shard::after` block (around line 321). Replace the entire rule:

```css
/* Old — specific to top-right cut position */
.memory-shard::after {
  content: '';
  position: absolute;
  top: 0;
  right: 14px;
  width: 20px;
  height: 1px;
  background: rgba(var(--panel-accent-rgb, 80,120,200), 0.5);
  transform: rotate(45deg) translateX(7px) translateY(-3px);
  pointer-events: none;
}
```

With:

```css
/* Top-edge glint — works across all shard polygon shapes */
.memory-shard::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.4) 20%,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.6) 50%,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.4) 80%,
    transparent
  );
  pointer-events: none;
}
```

- [ ] **Step 3: Add `.memory-shard--sub` modifier rules**

After the `.shard-title` rule block (around line 362), add:

```css
/* ══ Subfolder shards — subdued, simpler shape, hollow icon ══ */
.memory-shard--sub {
  opacity: 0.72;
  padding-left: 1.4rem;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
.memory-shard--sub::before {
  content: '◇';
}
.memory-shard--sub:hover {
  opacity: 1;
}
```

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build
```

Expected: build completes with no errors. Warnings about unused CSS are acceptable.

- [ ] **Step 5: Commit CSS changes**

```bash
git add src/styles/novel.css
git commit -m "feat(novel): shard shape glint + subfolder modifier CSS"
```

---

### Task 2: Update JS template — shape array, hash fn, inline clip-path

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (the `<script>` block)

- [ ] **Step 1: Add `SHARD_SHAPES` array and `shapeIndex` function**

In the `<script>` block of `src/pages/novel/[...slug].astro`, directly after the `// ── Accent color map` block (around line 258), add:

```ts
  // ── Shard shape pool ────────────────────────────────────────
  // 8 irregular clip-path polygons — different fracture patterns.
  // clip-path is applied inline per shard via shapeIndex().
  const SHARD_SHAPES: string[] = [
    'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
    'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 12px))',
    'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
    'polygon(0 4px, 100% 0, 100% calc(100% - 4px), 0 100%)',
    'polygon(10px 0, calc(100% - 8px) 0, 100% 10px, 100% 100%, 0 100%, 0 8px)',
    'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
    'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
    'polygon(10px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 10px)',
  ];

  /** Deterministic index into SHARD_SHAPES derived from a file slug. */
  function shapeIndex(slug: string, count: number): number {
    let h = 0;
    for (let i = 0; i < slug.length; i++) {
      h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return h % count;
  }
```

- [ ] **Step 2: Apply inline `clip-path` to regular shards and add `--sub` class to subfolder shards**

In the `toggleFolder` function, find the shard HTML template inside `panelList.innerHTML = groups.map(...)` (around line 391). The current template for each shard is:

```ts
        const shards = group.entries.map(({ file, breadcrumb, subPath }) => {
          const safeData = encodeURIComponent(
            JSON.stringify({ file, breadcrumb, folderKey, subPath })
          );
          return `<div
            class="memory-shard"
            style="color:rgba(${rgb},0.95); --panel-accent-rgb:${rgb};"
            role="button"
            tabindex="0"
            data-shard-encoded="${safeData}"
          >
            <span class="shard-title">${esc(file.title)}</span>
          </div>`;
        }).join('');
```

Replace it with:

```ts
        const isSubGroup = group.label !== null;
        const shards = group.entries.map(({ file, breadcrumb, subPath }) => {
          const safeData = encodeURIComponent(
            JSON.stringify({ file, breadcrumb, folderKey, subPath })
          );
          const shardClass = isSubGroup ? 'memory-shard memory-shard--sub' : 'memory-shard';
          const clipStyle = isSubGroup
            ? ''
            : `clip-path:${SHARD_SHAPES[shapeIndex(file.slug, SHARD_SHAPES.length)]};`;
          return `<div
            class="${shardClass}"
            style="color:rgba(${rgb},0.95); --panel-accent-rgb:${rgb}; ${clipStyle}"
            role="button"
            tabindex="0"
            data-shard-encoded="${safeData}"
          >
            <span class="shard-title">${esc(file.title)}</span>
          </div>`;
        }).join('');
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: build completes with no errors. TypeScript should not complain about `SHARD_SHAPES` or `shapeIndex` since they are defined in the same script block scope.

- [ ] **Step 4: Smoke test in dev**

```bash
npm run dev
```

Open `http://localhost:4321/novel` and:
- Click "Lore" — its shards (Magic System files) should appear in the right panel with irregular polygon shapes and visible hover effects
- Click "Characters" — Rain shard should have one of the 8 shapes; hover should show glow + translateX
- Lore → Magic System shards should be visually subdued (lower opacity, ◇ icon, slight indent, smaller cut corner) vs Characters → Rain

- [ ] **Step 5: Commit JS changes**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): irregular glass shard shapes via slug hash, subfolder --sub class"
```
