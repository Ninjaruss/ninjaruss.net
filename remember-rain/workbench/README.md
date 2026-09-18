# Remember Rain — workbench

A self-contained, read-only screen for working on *Remember Rain*: a tabbed
living story bible that reads the real story files and the `remember-rain/`
register live, and runs a cheap drift scan on every load.

It is **not** part of the ninjaruss.net site build and **not** inside the DeepSeek
Harness chrome. It is a standalone local page.

## Run

```bash
cd remember-rain/workbench
node serve.mjs        # → http://127.0.0.1:4242
```

Then open http://127.0.0.1:4242. Override the port with `PORT=8080 node serve.mjs`.

Refresh the page to re-read the files — the server reads the repo on each request.

## Tabs

| Tab | Reads |
|---|---|
| Outline | `remember-rain/outline.md` (refined) + the Spine / Arc Structure / Choice Points (source) |
| Characters | `src/content/novel/Characters/**/*.md` |
| Setting | `World/History.md`, `World/Locations.md` |
| Magic System | `World/Magic System.md` |
| Philosophy | `0 What is…`, `2 Pessimism of Strength`, `Themes and Motifs`, `What does it mean to fall` |
| Findings | `remember-rain/findings.md` + the live drift scan |
| Decisions | `remember-rain/decisions.md` |

## Design

- **Read-only.** All edits flow through the agent into the repo files; this screen never writes.
- **Zero dependencies.** One Node file (`serve.mjs`) plus static `index.html` / `app.js` / `styles.css`.
- **Drift scan** is driven by `drift-terms.json` — add a term group there and it's checked on next refresh.
- **Rendering** unescapes Scrivener's `\#` / `\*` escapes (same regex as `src/utils/novel.ts`) and renders markdown with a small built-in renderer.

See `SPEC.md` for the full design spec.
