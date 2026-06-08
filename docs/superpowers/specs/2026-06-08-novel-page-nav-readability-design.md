# Novel Page — Navigation & Readability Overhaul

**Date:** 2026-06-08  
**Status:** Approved

## Problem

The novel page (`/novel`) has two UX issues:

1. **Cramped sidebar** — the 200px sidebar truncates file names. Buttons use 0.7rem all-caps mono text with tight letter-spacing, making labels hard to read at a glance.
2. **Dead content space** — the `.content-body` is capped at `max-width: 620px`. On wide screens this leaves a large blank margin on the right side of the panel.

## Solution

Design C: wider sidebar with a collapse toggle, fluid content body.

---

## Sidebar Changes

**Width:** 200px → 320px (via `grid-template-columns` in `.novel-panels`).

**File button typography:**

| Property | Before | After |
|---|---|---|
| `font-size` | `0.7rem` | `0.82rem` |
| `text-transform` | `uppercase` | `none` (mixed-case) |
| `letter-spacing` | `0.06em` | `0.03em` |
| `padding` | `5px 12px 5px 24px` | `9px 16px 9px 28px` |

**Group/subfolder headers** (`.sidebar-group-btn`): unchanged — mono uppercase stays to preserve category identity and visual hierarchy over file names.

---

## Collapse Toggle

A vertical edge tab is rendered as a **sibling element** inside `.novel-panels` (not inside `.novel-sidebar`), positioned absolutely so it is never clipped by the sidebar's `overflow: hidden`.

**Expanded state:**
- Tab sits at the right edge of the sidebar: `left: 320px`, `transform: translateY(-50%) translateX(-100%)`
- Label: `◀ hide` (vertical text via `writing-mode: vertical-lr`)
- Sidebar `width: 320px`

**Collapsed state:**
- Tab slides to `left: 0`
- Label: `▶ show`
- Sidebar `width: 0`, `overflow: hidden`, `border-right: none`
- Content panel expands to fill full panel width

**Animation:** Both `width` (sidebar) and `left` (tab) transition with `280ms cubic-bezier(0.16, 1, 0.3, 1)` for a consistent feel.

**Persistence:** Collapsed state stored in `localStorage` under key `novel-sidebar-collapsed`. Restored on `init()` before first render to prevent layout flash.

**Implementation note:** `.novel-panels` changes from `display: grid` to `display: flex`. The sidebar is `flex-shrink: 0` with explicit `width`. The content panel is `flex: 1; min-width: 0`. This is necessary for the `width` transition to animate smoothly (CSS grid column sizing does not transition reliably).

---

## Content Panel Changes

Remove `max-width: 620px` from `.content-body`. Body text fills the panel width using the panel's existing `padding: 1.75rem 2rem`. No new max-width is introduced — the page-level `max-width: 1400px` on `.novel-page` provides the natural upper bound.

---

## Files Changed

| File | Change |
|---|---|
| `src/styles/novel.css` | Sidebar width, file button styles, collapse tab styles, flex layout for panels |
| `src/pages/novel/[...slug].astro` | Add `.sidebar-tab` element to static HTML; add toggle JS to `init()`; restore localStorage state |

---

## What Does Not Change

- Mobile layout — sidebar stacks above content, `max-height: 260px`, no collapse toggle shown below 768px
- Canvas rain background
- Filter tabs row
- Group/subfolder header styling
- P4G color palette, clip-path accents, animation easing
- All other page sections (title block, NavPill)
