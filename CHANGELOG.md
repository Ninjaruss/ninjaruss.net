# Changelog

## 2026-01-09

### Fixed
- Fixed search and tag filters not working in SplitViewLayout due to CSS specificity issue. Scoped styles from ListItem component were overriding the `.is-filtered` display rule. Added `!important` to ensure filtered items are properly hidden.
- Fixed tags button not working after page refresh. Added initialization guard to prevent duplicate event listeners from being attached when `initSplitView()` runs multiple times (once immediately and once on `astro:page-load`).
