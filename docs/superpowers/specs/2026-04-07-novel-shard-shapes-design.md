# Novel Page — Irregular Glass Shard Shapes

**Date:** 2026-04-07  
**Scope:** `src/pages/novel/[...slug].astro`, `src/styles/novel.css`

---

## Goal

Make `.memory-shard` items in the right panel look like actual irregular glass fragments with varied polygon shapes. Subfolder shards get a visually subdued, "nested" treatment distinct from top-level entries.

---

## Shard Shape System

### Shape pool (8 clip-path polygons)

Each polygon represents a different fracture pattern:

```
shape-0: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)
         — top-right cut (current shape)

shape-1: polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 12px))
         — bottom-left notch

shape-2: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 10px 100%, 0 calc(100% - 10px))
         — top-right + bottom-left cuts

shape-3: polygon(0 4px, 100% 0, 100% calc(100% - 4px), 0 100%)
         — right edge angled (parallelogram feel)

shape-4: polygon(10px 0, calc(100% - 8px) 0, 100% 10px, 100% 100%, 0 100%, 0 8px)
         — multi-cut top with left nick

shape-5: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)
         — bottom-right notch

shape-6: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)
         — stepped right edge (two cuts on right)

shape-7: polygon(10px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 10px)
         — top-left + bottom-right cuts
```

### Hash function

```ts
function shapeIndex(slug: string, count: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h % count;
}
```

Applied when generating each shard's HTML — `clip-path` is injected as an inline style. The CSS class retains all other rules (border, background, hover, transitions).

### Glint line update

`::after` changes from a positioned glint (specific to top-right cut) to a full top-edge highlight gradient that works for all shapes:

```css
.memory-shard::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(to right,
    transparent,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.4) 20%,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.6) 50%,
    rgba(var(--panel-accent-rgb, 80,120,200), 0.4) 80%,
    transparent
  );
  pointer-events: none;
}
```

---

## Subfolder Shard Distinction

Shards inside a subfolder group get an additional class `memory-shard--sub` added alongside `memory-shard`.

### Visual treatment

| Property | Regular shard | Subfolder shard |
|----------|--------------|-----------------|
| `::before` icon | `◈` (filled diamond) | `◇` (hollow diamond) |
| Base opacity | 1.0 | 0.72 |
| Left padding | `1rem` | `1.4rem` (8px indent) |
| Shape | Hash-derived (any of 8) | Always shape-0 (single top-right cut, 8px) |
| Hover | Full hover styles | Same hover styles, opacity returns to 1.0 |

The smaller, simpler shape for subfolder shards makes them read as "less fractured" — visually subordinate to top-level entries without losing interactivity.

CSS:
```css
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

Note: inline `clip-path` from the hash system is NOT applied to `memory-shard--sub` items — the CSS class shape takes precedence (no inline style added for sub shards in JS).

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/novel/[...slug].astro` | Add `shapeIndex()` fn, add shape array, apply inline `clip-path` to regular shards, add `memory-shard--sub` class to subfolder shards |
| `src/styles/novel.css` | Remove `clip-path` from `.memory-shard`, update `::after` glint, add `.memory-shard--sub` rules |

---

## Out of Scope

- No changes to folder cluster shapes (left panel)
- No changes to reading overlay
- No changes to shape assignment for future shards (hash handles it automatically)
