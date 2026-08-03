# /status Protagonist Redesign + Markdown-Only Logging — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the mirror loop so sessions are hand-written markdown, and rebuild /status as a P4G pause-menu hub (Status / Log / Quests / Bonds) whose Status screen is a protagonist character sheet.

**Architecture:** Sessions stay a normal content collection fed by hand-written `.md` files. Two new pure utilities (`computeLevel`, `parseProtagonist`) feed a rebuilt `src/pages/status/index.astro` that renders four server-side sections; a small client script upgrades them to one-screen-at-a-time with URL-hash routing (no-JS = all sections stacked, anchors still work). `stream.css` is renamed `status.css` and its frame styles replaced; radar/bonds/log styles are preserved.

**Tech Stack:** Astro 5, vanilla TS/CSS, vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-03-status-protagonist-redesign-design.md`

**Line-number caveat:** all line references to `src/pages/status/index.astro` are pre-Task-1 numbers. After Task 1 they shift by a few lines — locate blocks by the quoted element ids/classes, not raw numbers.

---

### Task 1: Delete the mirror loop

**Files:**
- Modify: `src/pages/status/index.astro` (remove import line 7 and `<MirrorStrip />` at line 191)
- Modify: `package.json` (remove 3 scripts)
- Modify: `.gitignore` (remove lines 36–40)
- Delete: `src/components/MirrorStrip.astro`, `src/pages/api/mirror/` (export.ts, import.ts, log.ts), `src/utils/mirror/` (fsOps.ts, github.ts, log.ts, prompt.ts, schema.ts), `scripts/mirror/` (cli.ts, export.ts, import.ts, Mirror.command), `src/tests/mirror.test.ts`, `docs/mirror-setup.md`

- [ ] **Step 1: Remove MirrorStrip from the status page**

In `src/pages/status/index.astro` delete these two lines:

```astro
import MirrorStrip from '../../components/MirrorStrip.astro';
```

```astro
            <MirrorStrip />
```

- [ ] **Step 2: Delete mirror files**

```bash
git rm -r src/components/MirrorStrip.astro src/pages/api/mirror src/utils/mirror scripts/mirror src/tests/mirror.test.ts docs/mirror-setup.md
```

- [ ] **Step 3: Remove npm scripts**

In `package.json`, delete these three lines from `"scripts"`:

```json
    "mirror": "tsx scripts/mirror/cli.ts",
    "mirror:export": "tsx scripts/mirror/export.ts",
    "mirror:import": "tsx scripts/mirror/import.ts"
```

(Leave `codex*` scripts untouched. Ensure no trailing-comma syntax error on the now-last script.)

- [ ] **Step 4: Remove mirror lines from .gitignore**

Delete lines 36–40:

```
# mirror loop scratch files (like codex-prompt.txt / codex-response.json)
mirror-log.md
mirror-prompt.txt
mirror-response.json
mirror-exported.txt
```

- [ ] **Step 5: Verify nothing dangles**

```bash
grep -rn "mirror\|Mirror" src scripts package.json --include="*.ts" --include="*.astro" --include="*.json" | grep -v "content/config.ts" | grep -v "node_modules"
```

Expected: no output (the one allowed hit, `src/content/config.ts`, is a schema comment "bounded mirror synthesis" on the `reflection` field — the schema is unchanged by design).

- [ ] **Step 6: Run tests and build**

```bash
npm test && npm run build
```

Expected: all tests pass (mirror.test.ts is gone), build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: delete mirror loop — sessions are hand-written markdown now"
```

Note for Russ (put in the final summary, not code): the Desktop copy of `Mirror.command` and the Vercel env vars `MIRROR_TOKEN` / `MIRROR_GITHUB_TOKEN` can be removed at leisure; nothing reads them anymore.

---

### Task 2: `computeLevel` (TDD)

**Files:**
- Modify: `src/utils/sessions.ts` (append)
- Test: `src/tests/sessions.test.ts` (append)

The RPG curve: `level = max(1, floor(sqrt(4 · totalSessions)))`. Early levels come fast (1 session → LV 2, 4 → LV 4), later slow (30 → LV 10, 100 → LV 20). Monotonic, never decays. The session count needed to *reach* level L is `ceil(L² / 4)`.

- [ ] **Step 1: Write the failing tests**

Append to `src/tests/sessions.test.ts`:

```ts
import { computeLevel } from '../utils/sessions';

describe('computeLevel', () => {
  it('starts at level 1 with zero sessions', () => {
    expect(computeLevel(0)).toEqual({ level: 1, intoLevel: 0, needed: 1 });
  });

  it('gives early levels fast', () => {
    expect(computeLevel(1).level).toBe(2);
    expect(computeLevel(4).level).toBe(4);
  });

  it('slows later — ~30 sessions is around level 10', () => {
    expect(computeLevel(30).level).toBe(10);
    expect(computeLevel(100).level).toBe(20);
  });

  it('is monotonic and never decays', () => {
    let prev = 0;
    for (let n = 0; n <= 500; n++) {
      const { level } = computeLevel(n);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it('needed is always at least 1 and reaching it levels up', () => {
    for (const n of [0, 1, 5, 29, 30, 99, 250]) {
      const { level, needed } = computeLevel(n);
      expect(needed).toBeGreaterThanOrEqual(1);
      expect(computeLevel(n + needed).level).toBe(level + 1);
    }
  });

  it('intoLevel counts sessions since the current level threshold', () => {
    const { level, intoLevel } = computeLevel(30);
    expect(intoLevel).toBe(30 - Math.ceil((level * level) / 4));
    expect(intoLevel).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/tests/sessions.test.ts
```

Expected: FAIL — `computeLevel` is not exported.

- [ ] **Step 3: Implement**

Append to `src/utils/sessions.ts`:

```ts
export interface LevelInfo {
  level: number;     // current protagonist level (min 1, never decays)
  intoLevel: number; // sessions logged since reaching this level
  needed: number;    // sessions until the next level ("next: N sessions")
}

// RPG curve: level = floor(sqrt(4n)), min 1. Threshold to reach level L is ceil(L²/4).
export function computeLevel(totalSessions: number): LevelInfo {
  const n = Math.max(0, Math.floor(totalSessions));
  const level = Math.max(1, Math.floor(Math.sqrt(4 * n)));
  const thresholdCurrent = Math.ceil((level * level) / 4);
  const thresholdNext = Math.ceil(((level + 1) * (level + 1)) / 4);
  return {
    level,
    intoLevel: Math.max(0, n - thresholdCurrent),
    needed: Math.max(1, thresholdNext - n),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/tests/sessions.test.ts
```

Expected: PASS. (If the level-1 threshold edge fails on n=0: threshold for level 1 is `ceil(1/4)` = 1, but n=0 still maps to level 1 via the `max(1, …)` floor — `intoLevel` is clamped to 0 by the `Math.max`, which the test accepts.)

- [ ] **Step 5: Commit**

```bash
git add src/utils/sessions.ts src/tests/sessions.test.ts
git commit -m "feat: computeLevel — RPG session-count level curve"
```

---

### Task 3: `parseProtagonist` (TDD)

**Files:**
- Create: `src/utils/protagonist.ts`
- Test: `src/tests/protagonist.test.ts`

A tiny hand-rolled frontmatter reader for the three string fields — no gray-matter dependency, fully unit-testable, degrades to defaults on any malformed input (an empty or missing file must never break the build).

- [ ] **Step 1: Write the failing tests**

Create `src/tests/protagonist.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseProtagonist, DEFAULT_PROTAGONIST } from '../utils/protagonist';

describe('parseProtagonist', () => {
  it('parses all three fields', () => {
    const md = `---\nname: NINJARUSS\nepithet: the fool who left for Japan\nportrait: /images/stream/portrait.png\n---\n`;
    expect(parseProtagonist(md)).toEqual({
      name: 'NINJARUSS',
      epithet: 'the fool who left for Japan',
      portrait: '/images/stream/portrait.png',
    });
  });

  it('strips surrounding quotes', () => {
    const md = `---\nname: "RUSS"\nepithet: 'wanderer'\n---\n`;
    const p = parseProtagonist(md);
    expect(p.name).toBe('RUSS');
    expect(p.epithet).toBe('wanderer');
  });

  it('falls back to defaults for missing fields', () => {
    expect(parseProtagonist(`---\nname: RUSS\n---\n`)).toEqual({
      name: 'RUSS', epithet: null, portrait: null,
    });
  });

  it('returns defaults for empty or frontmatter-less input', () => {
    expect(parseProtagonist('')).toEqual(DEFAULT_PROTAGONIST);
    expect(parseProtagonist('just some text')).toEqual(DEFAULT_PROTAGONIST);
  });

  it('ignores unknown keys and blank values', () => {
    const md = `---\nname: RUSS\nfavoriteFood: ramen\nepithet:\n---\n`;
    expect(parseProtagonist(md)).toEqual({ name: 'RUSS', epithet: null, portrait: null });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/tests/protagonist.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/utils/protagonist.ts`:

```ts
export interface Protagonist {
  name: string;
  epithet: string | null;
  portrait: string | null;
}

export const DEFAULT_PROTAGONIST: Protagonist = {
  name: 'NINJARUSS',
  epithet: null,
  portrait: null,
};

// Minimal frontmatter reader for _protagonist.md — three known string keys,
// everything else ignored. Malformed/missing input degrades to defaults.
export function parseProtagonist(markdown: string): Protagonist {
  const result: Protagonist = { ...DEFAULT_PROTAGONIST };
  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return result;
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^(name|epithet|portrait):\s*(.*?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^['"]|['"]$/g, '').trim();
    if (!value) continue;
    if (m[1] === 'name') result.name = value;
    else if (m[1] === 'epithet') result.epithet = value;
    else result.portrait = value;
  }
  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/tests/protagonist.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/protagonist.ts src/tests/protagonist.test.ts
git commit -m "feat: parseProtagonist — character-sheet frontmatter reader"
```

---

### Task 4: Content file + VS Code snippets

**Files:**
- Create: `src/content/sessions/_protagonist.md`
- Create: `.vscode/ninjaruss.code-snippets`

Underscore-prefixed files are excluded from Astro content collections (same convention `_quests.md` already relies on), so `_protagonist.md` is safe inside the sessions folder.

- [ ] **Step 1: Create `src/content/sessions/_protagonist.md`**

```markdown
---
name: NINJARUSS
epithet: the fool who left for Japan
portrait: /images/stream/portrait.png
---

Character-sheet data for /status. Edit `name`, `epithet`, or `portrait`
any time — this file is read at build time by parseProtagonist and is
not a content-collection entry (underscore prefix).
```

- [ ] **Step 2: Create `.vscode/ninjaruss.code-snippets`**

```json
{
  "Session entry": {
    "scope": "markdown",
    "prefix": "session",
    "body": [
      "---",
      "title: \"${1:What happened}\"",
      "publishedAt: ${2:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}",
      "stats: [\"${3|Determination,Insight,Expression,Sincerity,Chaos|}\"]",
      "summary: \"${4:One or two sentences on what this session was.}\"",
      "memorable: \"${5:The line worth keeping.}\"",
      "streamed: ${6|false,true|}",
      "draft: false",
      "---",
      "$0"
    ],
    "description": "Frontmatter for a /status session entry"
  },
  "Note entry": {
    "scope": "markdown",
    "prefix": "note",
    "body": [
      "---",
      "title: \"${1:Title}\"",
      "publishedAt: ${2:$CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE}",
      "emblem: '/images/emblems/${3|scroll,torii,flame,shuriken,default|}.svg'",
      "draft: ${4|true,false|}",
      "---",
      "",
      "$0"
    ],
    "description": "Frontmatter for a journal note"
  }
}
```

- [ ] **Step 3: Verify the build ignores the new file**

```bash
npm run build 2>&1 | grep -i "protagonist\|error" ; echo "exit: $?"
```

Expected: no protagonist-related warnings/errors (grep finds nothing, build exits 0).

- [ ] **Step 4: Commit**

```bash
git add src/content/sessions/_protagonist.md .vscode/ninjaruss.code-snippets
git commit -m "feat: _protagonist.md + VS Code session/note snippets"
```

---

### Task 5: Pause-menu frame + Status screen (character sheet)

**Files:**
- Modify: `src/pages/status/index.astro` (restructure body + script; frontmatter additions)
- Rename: `src/styles/stream.css` → `src/styles/status.css` (`git mv`), then edit

This task builds the hub skeleton with hash routing and rebuilds the Status screen. The Log/Quests/Bonds screens are moved into the new skeleton **unchanged** in this task (markup transplanted as-is) and restyled in Tasks 6–8.

- [ ] **Step 1: Rename the stylesheet**

```bash
git mv src/styles/stream.css src/styles/status.css
```

In `src/pages/status/index.astro` change the import:

```astro
import '../../styles/status.css';
```

- [ ] **Step 2: Add frontmatter data for the sheet**

In the frontmatter of `src/pages/status/index.astro`, add imports:

```ts
import { computeLevel } from '../../utils/sessions';
import { parseProtagonist } from '../../utils/protagonist';
```

and after the `questRaw` block (which already reads `_quests.md` with `readFileSync`), add:

```ts
let protagonistRaw = '';
try {
  protagonistRaw = readFileSync(join(process.cwd(), 'src/content/sessions/_protagonist.md'), 'utf-8');
} catch { /* missing file → defaults */ }
const protagonist = parseProtagonist(protagonistRaw);
const levelInfo   = computeLevel(streamEntries.length);
const xpPercent   = Math.round(
  (levelInfo.intoLevel / (levelInfo.intoLevel + levelInfo.needed)) * 100
);
```

Also change the page title while here: `<BaseLayout title="Status" description="Protagonist status — sessions, quests, and bonds for ninjaruss.">`.

- [ ] **Step 3: Replace the page body with the hub skeleton**

Replace everything between `<BaseLayout …>` and `</BaseLayout>` (keeping `<NavPill />` and the `#slash` blade div) with the structure below. **Transplant the existing inner blocks wholesale where marked** — the radar container (`.s-radar-container` div incl. the `#stream-tally-data` div and full `<svg id="radar-svg">`), the mail strip (`.s-mail-strip`), the journal panel contents (`.j-streams` + `.j-log`), and the bonds panel contents (`.bonds-list-col` + `.bond-detail-panel` + `#bonds-data`).

```astro
<NavPill />
<div id="slash"><div class="slash-blade" id="blade"></div></div>

<div class="status-page">
  <header class="st-topbar">
    <h1 class="st-title p4g-heading">Status</h1>
    <div class="st-date" aria-label="Today's date">
      <span class="st-date-dow">{dateDow}</span>
      <span class="st-date-num">{dateDay}</span>
      <span class="st-date-month">{dateMonth}</span>
    </div>
    <a class="s-live" href="https://www.twitch.tv/ninjaruss_" target="_blank" rel="noopener">
      <div class="s-live-dot"></div>Live
    </a>
  </header>

  <div class="st-hub">
    <nav class="st-menu" aria-label="Status screens">
      <a href="#status" class="st-menu-item is-active" data-screen="status" aria-current="true">Status</a>
      <a href="#log"    class="st-menu-item" data-screen="log">Log</a>
      <a href="#quests" class="st-menu-item" data-screen="quests">Quests</a>
      <a href="#bonds"  class="st-menu-item" data-screen="bonds">Bonds</a>
    </nav>

    <main class="st-stage">
      <section class="st-screen is-active" id="status" data-screen="status">
        <div class="sheet">
          <div class="sheet-portrait">
            {protagonist.portrait
              ? <img src={protagonist.portrait} alt="" />
              : <div class="sheet-portrait-empty" aria-hidden="true"></div>}
          </div>
          <div class="sheet-id">
            <p class="sheet-name p4g-heading">{protagonist.name}</p>
            {protagonist.epithet && <p class="sheet-epithet">{protagonist.epithet}</p>}
            <div class="sheet-level-row">
              <span class="sheet-level p4g-cut">LV {levelInfo.level}</span>
              <div class="sheet-xp" role="img" aria-label={`${xpPercent}% to next level`}>
                <div class="sheet-xp-fill" style={`width:${xpPercent}%`}></div>
              </div>
              <span class="sheet-xp-label">next: {levelInfo.needed} {levelInfo.needed === 1 ? 'session' : 'sessions'}</span>
            </div>
            {currentObjective && (
              <div class="sheet-objective">
                <span class="sheet-obj-label">Current objective</span>
                <span class="sheet-obj-text">{currentObjective}</span>
              </div>
            )}
          </div>
        </div>

        <!-- TRANSPLANT: existing .s-radar-container block, verbatim -->

        <!-- TRANSPLANT: existing .s-mail-strip block, verbatim -->
      </section>

      <section class="st-screen" id="log" data-screen="log">
        <!-- TRANSPLANT: existing .j-log block ONLY (the .j-streams strips move to Quests in Task 7;
             for THIS task transplant .j-streams here too so nothing is lost, Task 7 relocates it) -->
      </section>

      <section class="st-screen" id="quests" data-screen="quests">
        <!-- Built in Task 7; leave the section empty for now -->
      </section>

      <section class="st-screen" id="bonds" data-screen="bonds">
        <!-- TRANSPLANT: existing .bonds-list-col + .bond-detail-panel + #bonds-data, verbatim -->
      </section>
    </main>
  </div>
</div>
```

Delete the old wrappers entirely: `.stream-page`, `.s-sidebar`/`.s-tabs` buttons, `.s-header`, `.s-shell`, `.s-sprite` (the VN sprite is replaced by the sheet portrait), `.s-main`, `.s-panel` divs, and the old `.s-date-strip` (its content now lives in `.st-topbar` and `.sheet-objective`).

- [ ] **Step 4: Replace the tab JS with hash routing**

In the `<script>` at the bottom, **keep**: `checkLiveStatus` (unchanged), `initMailAddress` (unchanged), the stat mode toggle block, the journal log filter block (`setLogFilter` + strip clicks), the radar-vertex click block, and the entire bond-detail block. **Delete**: `moveIndicator`, `switchTab`, `exitItems`, `enterItems`, `fireSlash`, `reactPortrait`, the sidebar/content entrance animations, and the tab-click wiring. **Add** this routing (inside the `astro:page-load` listener, replacing the deleted parts):

```ts
document.documentElement.classList.add('js');

const SCREENS = ['status', 'log', 'quests', 'bonds'] as const;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function screenFromHash(): string {
  const h = location.hash.replace('#', '');
  return (SCREENS as readonly string[]).includes(h) ? h : 'status';
}

function showScreen(name: string): void {
  document.querySelectorAll<HTMLElement>('.st-screen').forEach(s => {
    s.classList.toggle('is-active', s.dataset.screen === name);
  });
  document.querySelectorAll<HTMLAnchorElement>('.st-menu-item').forEach(a => {
    const active = a.dataset.screen === name;
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  if (!reduceMotion.matches) {
    const blade = document.getElementById('blade');
    if (blade) {
      blade.classList.remove('slash-go');
      void blade.offsetWidth;
      blade.classList.add('slash-go');
      blade.addEventListener('animationend', () => blade.classList.remove('slash-go'), { once: true });
    }
    const stage = document.querySelector<HTMLElement>(`.st-screen[data-screen="${name}"]`);
    if (stage) {
      stage.style.animation = 'none';
      void stage.offsetWidth;
      stage.style.animation = 'panelWipe 0.4s cubic-bezier(0.16,1,0.3,1) both';
      stage.addEventListener('animationend', () => { stage.style.animation = ''; }, { once: true });
    }
  }
}

showScreen(screenFromHash());
window.addEventListener('hashchange', () => showScreen(screenFromHash()));
```

Also update the radar-vertex click handler: replace its `switchTab('journal', stat)` call with:

```ts
location.hash = 'log';
setLogFilter(stat);
```

and its `current === 'journal'` check with a check on `screenFromHash() === 'log'`.

- [ ] **Step 5: Frame + sheet CSS**

In `src/styles/status.css`: delete the rules for removed selectors (`.stream-page`, `.s-sidebar`, `.s-tabs`, `.s-tab`, `.s-tab-indicator`, `.s-header`, `.s-header-title`, `.s-shell`, `.s-sprite`, `.s-main`, `.s-panel`, `.s-date-strip`, `.s-date-block`, `.s-objective`, `.s-obj-label`, `.s-obj-text`, `sidebarIn`/`contentIn`/`portraitReact`/`itemExit`/`itemEnter` keyframes). **Keep** `panelWipe`, the slash blade styles, `.s-live*`, all `.s-radar-*`/`.radar-vertex`/`.v-*`, `.s-mode-toggle`/`.s-toggle-btn`, `.s-mail-*`/`.mail-address`, all `.j-*`, all `.bond*`/`.bd-*`. Add:

```css
/* ── Pause-menu frame ─────────────────────────────────── */
.status-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) calc(var(--nav-clearance, 96px) + var(--space-lg));
}
.st-topbar {
  display: flex;
  align-items: baseline;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}
.st-title { font-size: clamp(2rem, 5vw, 3rem); color: var(--color-text); margin: 0; }
.st-date {
  margin-left: auto;
  display: flex;
  align-items: baseline;
  gap: 0.4em;
  font-family: var(--font-mono, monospace);
  color: var(--color-text);
}
.st-date-num { color: var(--color-gold); font-size: 1.5em; font-weight: 700; }
.st-date-dow, .st-date-month { font-size: 0.85em; opacity: 0.8; }

.st-hub { display: flex; gap: var(--space-xl); align-items: flex-start; }
.st-menu { display: flex; flex-direction: column; gap: 10px; min-width: 148px; position: sticky; top: var(--space-lg); }
.st-menu-item {
  display: block;
  padding: 10px 18px;
  transform: skewX(var(--skew-accent));
  border: 1px solid rgba(255, 229, 44, 0.25);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.9rem;
  transition: background var(--animation-base) var(--animation-easing), color var(--animation-base) var(--animation-easing);
}
.st-menu-item:hover,
.st-menu-item:focus-visible { background: rgba(255, 229, 44, 0.12); }
.st-menu-item.is-active { background: var(--color-gold); color: #131313; border-color: var(--color-gold); box-shadow: var(--shadow-hard); }
.st-stage { flex: 1; min-width: 0; }

/* JS upgrades sections to one-at-a-time; no-JS shows all, stacked */
html.js .st-screen { display: none; }
html.js .st-screen.is-active { display: block; }
.st-screen { margin-bottom: var(--space-xl); }

/* ── Character sheet ──────────────────────────────────── */
.sheet {
  display: flex;
  gap: var(--space-lg);
  border: 1px solid rgba(255, 229, 44, 0.2);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  background: rgba(255, 255, 255, 0.02);
}
.sheet-portrait { flex: 0 0 120px; }
.sheet-portrait img,
.sheet-portrait-empty {
  width: 120px;
  height: 150px;
  object-fit: cover;
  border: 1.5px solid var(--color-gold);
  background: #1a1a1a;
  display: block;
}
.sheet-id { flex: 1; min-width: 0; }
.sheet-name { font-size: 1.6rem; margin: 0; color: var(--color-text); }
.sheet-epithet { margin: 2px 0 0; font-style: italic; color: var(--color-text-subtle, #999); font-size: 0.9rem; }
.sheet-level-row { display: flex; align-items: center; gap: 12px; margin-top: var(--space-md); }
.sheet-level {
  background: var(--color-gold);
  color: #131313;
  font-weight: 900;
  padding: 2px 14px;
  transform: skewX(var(--skew-accent));
  font-size: 0.95rem;
  white-space: nowrap;
}
.sheet-xp { flex: 1; height: 6px; background: #2a2a2a; transform: skewX(var(--skew-accent)); overflow: hidden; }
.sheet-xp-fill { height: 100%; background: var(--color-gold); }
.sheet-xp-label { font-family: var(--font-mono, monospace); font-size: 0.75rem; color: var(--color-text-subtle, #999); white-space: nowrap; }
.sheet-objective {
  margin-top: var(--space-md);
  border-left: 3px solid var(--color-gold);
  background: rgba(255, 229, 44, 0.06);
  padding: 8px 12px;
}
.sheet-obj-label { display: block; color: var(--color-gold); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.sheet-obj-text { color: var(--color-text); font-size: 0.9rem; }

@media (max-width: 900px) {
  .st-hub { flex-direction: column; }
  .st-menu { flex-direction: row; flex-wrap: wrap; position: static; min-width: 0; width: 100%; }
  .st-menu-item { flex: 1 1 auto; text-align: center; min-height: 44px; display: flex; align-items: center; justify-content: center; }
  .sheet { flex-direction: column; }
  .sheet-portrait { flex-basis: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .st-menu-item { transition: none; }
}
```

- [ ] **Step 6: Verify in the browser**

```bash
npm test && npm run build
```

Expected: pass. Then start the dev server via the preview tool (launch.json `dev` config; create it if absent with `runtimeExecutable: "npm"`, `runtimeArgs: ["run", "dev"]`, `port: 4321`), open `/status`, and check with read_page + screenshot:

1. Menu shows Status/Log/Quests/Bonds; Status active by default with sheet (portrait, name, epithet, `LV`, `next: N sessions`, objective, radar, mail strip).
2. Clicking Log switches screens and sets `#log`; browser back returns to Status.
3. Direct load of `/status#bonds` opens Bonds.
4. Disable JS (or evaluate with `document.documentElement.classList.remove('js')`) → all sections visible stacked.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: /status pause-menu hub + protagonist character sheet"
```

---

### Task 6: Log screen — diary entries

**Files:**
- Modify: `src/pages/status/index.astro` (the `#log` section markup)
- Modify: `src/styles/status.css`

- [ ] **Step 1: Extend the entry markup**

Inside the `#log` section's `.j-entry` loop, after the `.j-entry-chips` div, extend the existing markup so all optional fields render (keep date block, title, summary, chips, memo as they are):

```astro
{entry.data.streamed && <span class="j-entry-live" title="streamed live">LIVE</span>}
```

(placed inside `.j-entry-title`'s line, after the title text), and after the `.j-entry-memo` block:

```astro
{entry.data.reflection && <div class="j-entry-reflection">{entry.data.reflection}</div>}
{entry.data.nextStep && (
  <div class="j-entry-next">
    <span class="j-next-label">Next</span> {entry.data.nextStep}
  </div>
)}
{entry.data.quest && <div class="j-entry-quest">⚑ {entry.data.quest}</div>}
```

Also rename the section label from "Session Log" to "Log" if desired by the executor for menu consistency — optional, cosmetic.

- [ ] **Step 2: Styles**

Append to `src/styles/status.css`:

```css
.j-entry-live {
  color: var(--color-live);
  border: 1px solid rgba(var(--color-live-rgb), 0.4);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 1px 6px;
  margin-left: 8px;
  vertical-align: middle;
}
.j-entry-reflection { margin-top: 6px; color: var(--color-text-subtle, #999); font-size: 0.85rem; line-height: 1.5; }
.j-entry-next { margin-top: 6px; font-size: 0.85rem; color: var(--color-text); }
.j-next-label { color: var(--color-gold); font-weight: 700; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; margin-right: 6px; }
.j-entry-quest { margin-top: 4px; font-size: 0.8rem; color: var(--color-gold); opacity: 0.85; }
```

Restyle `.j-entry-memo` (existing selector) into a pull-quote if it isn't already — it should read as a quote: gold left border, italic. If the existing rule already has that treatment, leave it.

- [ ] **Step 3: Verify + commit**

Dev server: open `/status#log`; entries show date, title, stat chips, summary, memorable pull-quote; the 2026-06-30 entry ("Booked my one-way ticket") shows a LIVE marker (`streamed: true`).

```bash
npm run build && git add -A && git commit -m "feat: status log screen — diary entries with all session fields"
```

---

### Task 7: Quests screen — the quest board

**Files:**
- Modify: `src/pages/status/index.astro` (build `#quests` section; move `.j-streams` out of `#log`)
- Modify: `src/styles/status.css`

- [ ] **Step 1: Frontmatter data**

`questFile` (from `parseQuestFile`) is already computed. Nothing new needed — the board renders `questFile.question`, `questFile.active`, `questFile.ideas`, `questFile.completed`, plus the existing `streamIdeas` strips.

- [ ] **Step 2: Build the section**

Replace the empty `#quests` section body with:

```astro
<section class="st-screen" id="quests" data-screen="quests">
  {questFile.question && (
    <blockquote class="q-question">
      <span class="q-question-label">The question</span>
      <p>{questFile.question}</p>
    </blockquote>
  )}

  <div class="q-section-label">Active</div>
  {questFile.active.length > 0 ? (
    <div class="q-active-list">
      {questFile.active.map(q => {
        const color = q.stat ? STAT_META[q.stat]?.color : null;
        return (
          <div class="q-card" style={color ? `--q-color:${color}` : ''}>
            {q.stat && <span class="q-card-stat">{q.stat}</span>}
            <p class="q-card-text">{q.text}</p>
          </div>
        );
      })}
    </div>
  ) : (
    <p class="q-empty">No active quests.</p>
  )}

  <div class="q-section-label">Ideas</div>
  <!-- TRANSPLANT: the existing .j-streams block (stat strips with idea pills) moves here
       from the #log section, verbatim. It doubles as the log's stat filter — the strip
       click handler still works because setLogFilter targets .j-entry globally; clicking
       a strip should ALSO jump to the log: add `location.hash = 'log'` in the existing
       strip click listener after setLogFilter. -->

  {questFile.completed.length > 0 && (
    <>
      <div class="q-section-label">Completed</div>
      <ul class="q-completed">
        {questFile.completed.map(q => (
          <li>
            {q.date && <span class="q-completed-date">{q.date}</span>}
            {q.stat && <span class="q-completed-stat">[{q.stat}]</span>}
            {q.text}
          </li>
        ))}
      </ul>
    </>
  )}
</section>
```

- [ ] **Step 3: Styles**

Append to `src/styles/status.css`:

```css
.q-question { margin: 0 0 var(--space-xl); border-left: 3px solid var(--color-gold); padding: 8px 16px; }
.q-question-label { color: var(--color-gold); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.q-question p { margin: 4px 0 0; font-style: italic; color: var(--color-text); font-size: 1.05rem; }
.q-section-label {
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin: var(--space-xl) 0 var(--space-md);
  transform: skewX(var(--skew-display));
}
.q-active-list { display: flex; flex-direction: column; gap: 10px; }
.q-card {
  border: 1px solid rgba(255, 229, 44, 0.35);
  border-left: 4px solid var(--q-color, var(--color-gold));
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
}
.q-card-stat { color: var(--q-color, var(--color-gold)); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.q-card-text { margin: 2px 0 0; color: var(--color-text); }
.q-empty { color: var(--color-text-subtle, #999); font-size: 0.9rem; }
.q-completed { list-style: none; padding: 0; margin: 0; opacity: 0.55; }
.q-completed li { padding: 4px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 0.85rem; }
.q-completed-date { font-family: var(--font-mono, monospace); margin-right: 8px; color: var(--color-text-subtle, #999); }
.q-completed-stat { margin-right: 6px; color: var(--color-gold); }
```

- [ ] **Step 4: Verify + commit**

Dev server: `/status#quests` shows the epigraph ("Truly identify the overarching singular goal…"), the one Active card ([Expression] tagged), Ideas strips per stat, and no Completed section (file has none yet). Clicking an idea strip jumps to Log filtered by that stat. `/status#log` no longer shows the strips.

```bash
npm run build && git add -A && git commit -m "feat: status quests screen — quest board from _quests.md"
```

---

### Task 8: Bonds screen restyle

**Files:**
- Modify: `src/styles/status.css` (bond layout within the new stage)

The bonds markup and detail-panel JS were transplanted unchanged in Task 5 and already work. This task is layout adaptation only.

- [ ] **Step 1: Adapt bond layout to the stage**

The old `.s-panel` gave bonds a fixed-height flex context for the slide-in `.bond-detail-panel`. In `status.css`, ensure the bonds section provides it:

```css
#bonds { position: relative; overflow: hidden; }
```

Check the existing `.bond-detail-panel` rule: if it used `position: absolute` against `.s-panel`, it now anchors to `#bonds` — verify the slide-in still covers the list on open (`.detail-open` class). Adjust `top/right/height` values only if visibly broken in the browser check.

- [ ] **Step 2: Verify + commit**

Dev server: `/status#bonds` — rows render with arcana/name/affinity/rank pips; clicking a row opens the detail panel (lore, rank date, last session); ✕, Escape, and re-click close it.

```bash
npm run build && git add -A && git commit -m "feat: status bonds screen adapted to pause-menu stage"
```

---

### Task 9: Full-page verification pass

**Files:** none (fixes only if defects found; any fix follows the relevant task's pattern)

- [ ] **Step 1: Automated checks**

```bash
npm test && npm run build
```

Expected: all green.

- [ ] **Step 2: Browser matrix**

With the dev server running, verify each and screenshot for the final report:

1. `/status` → Status sheet: portrait, NINJARUSS + epithet, LV/XP with "next: N sessions", objective banner, radar with working Recent/All toggle, mail strip populating on load.
2. Hash deep links: `/status#log`, `/status#quests`, `/status#bonds` each open the right screen on hard load; back/forward walks screen history.
3. No-JS: run `document.documentElement.classList.remove('js')` via javascript_tool → all four sections stack; menu anchors scroll-jump.
4. Reduced motion: resize_window/emulate `prefers-reduced-motion` (or set the media query in devtools via javascript_tool check) → screen switches happen with no slash/wipe animation.
5. Mobile 375px width: menu becomes a horizontal row above the stage, sheet stacks vertically, 44px touch targets, no content under the NavPill.
6. Empty states: temporarily blank `_protagonist.md`'s `epithet` and `portrait` locally → sheet renders with silhouette box and no epithet line, no errors; restore file.
7. Radar vertex click from Status → jumps to Log filtered by that stat.
8. No absence language anywhere: grep the rendered page text for "ago", "days since", "streak" — expected: none (the log date blocks show absolute dates only).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix: status redesign verification fixes"
```

(Skip the commit if nothing changed.)

---

### Task 10: Documentation update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

1. In **Build & Development Commands**: delete the four `npm run mirror*` lines.
2. Replace the entire **“Mirror Loop (sessions + /status)”** section (including “Button mode” and “Live mode” subsections) with:

```markdown
## Sessions & /status (protagonist pause menu)

The `sessions` collection logs work sessions (Japanese, writing, streams) as
hand-written markdown — create a `.md` in `src/content/sessions/` (VS Code
snippet: type `session` + Tab for the frontmatter skeleton in
`.vscode/ninjaruss.code-snippets`), commit, done. No capture loop, no AI step
(the former mirror loop was deleted 2026-08; spec:
docs/superpowers/specs/2026-08-03-status-protagonist-redesign-design.md).

`/status` is a P4G pause-menu hub — skewed menu (Status / Log / Quests / Bonds),
one screen at a time via URL hash (`/status#quests`); no-JS falls back to all
sections stacked (the page script adds the `js` class on `<html>`, which hides
inactive screens). Styles in `src/styles/status.css` (renamed from stream.css).

- **Status**: character sheet — portrait/name/epithet from
  `src/content/sessions/_protagonist.md` (underscore = not a collection entry;
  parsed by `src/utils/protagonist.ts`, missing file/fields degrade to
  defaults), level + XP bar from `computeLevel(totalSessions)` in
  `src/utils/sessions.ts` (`level = max(1, floor(sqrt(4n)))` — monotonic, never
  decays; label is always forward-looking "next: N sessions"), current
  objective = first Active quest in `_quests.md`, stat radar
  (recent/all-time), date strip (today only — deliberately NO day counter),
  mail strip.
- **Log**: sessions newest-first with stat chips, summary, `memorable`
  pull-quote, optional `reflection`/`nextStep`/`quest`, and a red LIVE marker
  for `streamed: true`.
- **Quests**: rendered from `src/content/sessions/_quests.md` via
  `parseQuestFile` (sections: The Question / Active / Ideas — <Stat> /
  Completed). Quests only ever come from this file. The Ideas stat strips
  double as log filters (click → `#log` filtered).
- **Bonds**: `social-links` collection as an S.Link screen with slide-in
  detail panel.

Design invariants (unchanged): stats never decay, no streaks/shame states, no
absence counters anywhere on the page.
```

3. In the **Directory Structure** tests line, drop `mirror` from the example list.
4. Search CLAUDE.md for remaining `mirror` / `MirrorStrip` / `stream.css` mentions and update each (the `/status` route description under Pages & Routes, the stream-tile note stays — the homepage tile is untouched).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md && git commit -m "docs: CLAUDE.md — markdown-only sessions + status pause-menu hub"
```

---

## Out of scope (explicitly)

- Part 3 of the spec (sitewide polish pass) — separate plan after /status ships.
- Sessions schema changes, homepage stream tile, `/api/live-status`.
- Deleting `/images/stream/portrait.png` — it is now referenced by `_protagonist.md`.
