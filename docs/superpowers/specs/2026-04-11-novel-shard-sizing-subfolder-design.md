# Novel Shard: Sizing Bump + Sub-folder Indicator

**Date:** 2026-04-11  
**Status:** Approved

## Summary

Two focused visual improvements to the novel scatter canvas:

1. **Larger shards** — increase shard dimensions from 110×78px to 200×128px
2. **Sub-folder micro-label** — shards belonging to a sub-folder show the sub-folder name above the title inside the shard, separated by a faint divider

## Shard Sizing

### Changes

**`src/pages/novel/[...slug].astro`** — `renderScatter()` function (~line 248):
- `shardW = 110` → `shardW = 200`
- `shardH = 56` → `shardH = 128`

**`src/styles/novel.css`**:
- `.scatter-canvas .memory-shard { width: 110px }` → `width: 200px`
- `.memory-shard { min-height: 78px }` → `min-height: 128px`

### Notes

- `SHARD_SHAPES` clip-path polygons use `calc(100% - Npx)` — they scale with card dimensions automatically, no shape changes needed.
- Mobile layout (`@media (max-width: 768px)`) sets shards to `position: static; width: auto` inside a 2-column grid — unaffected by this change.
- `shardPosition()` uses `shardW`/`shardH` for margin/range calculations — updating the constants is sufficient.

## Sub-folder Micro-label

### Data flow

`getGroupedFiles()` already returns `ShardGroup[]` where each group has `label: string | null`. Root-level files have `label: null`; files inside a sub-folder have `label: sub.title` (e.g. `"Magic System"`). This label is currently unused in rendering.

### Changes

**`src/pages/novel/[...slug].astro`** — `renderScatter()`, inside the shard creation block:

Pass `group.label` through to `el.innerHTML`. When `group.label` is non-null, render a micro-label span before the title:

```html
<!-- sub-folder shard -->
<span class="shard-subfolder">Magic System</span>
<span class="shard-title">Magic Overview</span>

<!-- root shard (unchanged) -->
<span class="shard-title">Rain</span>
```

**`src/styles/novel.css`** — add `.shard-subfolder` rule:

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

The accent color is already set per-shard via `--panel-accent-rgb` (from `ACCENT_MAP`), so the label automatically inherits the folder's color identity.

### Notes

- The label height is absorbed by the new `min-height: 128px` — no position math changes needed.
- No change to `getGroupedFiles()`, `ShardGroup`, or any data structures — purely a rendering addition.
- `esc()` is already used for `file.title`; apply it to `group.label` as well for safety.

## Out of Scope

- No changes to mobile grid layout
- No changes to reading overlay
- No changes to animation timing or VanillaTilt configuration
- No CSS custom properties / configurable size tokens
