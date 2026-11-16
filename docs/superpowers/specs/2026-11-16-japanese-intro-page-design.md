# Japanese intro page (`/ja`) — design

**Date:** 2026-11-16
**Size:** small change

## Intent and why

Russ is living in Fukuoka and meeting Japanese people. When one of them
looks him up, the site is a wall of English and they learn nothing about
what he does. This adds one page, in Japanese, that answers "who is this
and what does he make" — the thing you hand to someone you just met.

It is hospitality for people he has actually connected with, not a play
for anonymous Japanese search traffic.

## Goals

- A Japanese reader can learn who Russ is and what he makes without
  reading any English.
- It points them onward: Remember Rain, YouTube, the writing, the
  projects, and `/japanese-journal` (already in Japanese — the most
  immediately readable page on the site for this audience).
- It says plainly that the rest of the site is English and their browser
  can translate it, so nobody is left guessing.
- Every Japanese sentence on the site is one Russ has read.

## Non-goals

- Not a translated site. No locale routing, no `/ja/**` mirror.
- No translation of notes, the novel, the shelf, or Now.
- No translation widget, no third-party translate script. Browsers
  already offer full-page translation and do it better.
- Not an SEO project.

## Anti-goals

Things that would make this a failure even if it shipped:

- **Machine-translated prose under his byline.** Notes and Remember Rain
  are his voice; MT Japanese versions of them read as him writing badly,
  and a disclaimer sits beside text rather than inside it.
- **A per-post maintenance tax.** If translation attaches to the notes
  collection, every future note carries a translation decision forever —
  upkeep competing with the writing it exists to reflect. Same trade that
  killed the session log.
- **Two copies of hand-written prose.** Mirroring `/life` means its
  Japanese drifts every time the English is edited.

## Constraints

- Static Astro 5 build; no server, no runtime translation.
- `BaseLayout.astro:40` hardcodes `<html lang="en">`.
- Self-hosted fonts are latin + latin-ext only. Archivo Black, Syne and
  JetBrains Mono cover no CJK, so Japanese falls through to the system
  stack. Page weight is a standing concern (33MB → 12MB pass this month),
  so no CJK webfont.
- Four-item nav rule (Home / About / Now / Shelf) is deliberate and stays.

## Approaches considered

1. **One Japanese page (`/ja`). ← chosen.** One new file plus a `lang`
   prop on BaseLayout. Nothing to keep in sync, nothing owed by future
   posts. Answers the actual situation completely.
2. **Core surface in Japanese** (nav, homepage, `/life`, latest Now).
   Needs locale routing and two copies of hand-written prose that drift
   on every edit. The complexity is in the permanent sync tax, not the
   word count. Rejected as more machinery than the need.
3. **Core surface plus chosen notes, per-note opt-in.** Everything in 2,
   again per note, and it reintroduces the byline problem on exactly the
   writing where voice is the product. Rejected.

Russ picked 1 and asked explicitly not to complicate things.

## What gets built

**New page:** `src/pages/ja.astro`, rendering at `/ja` through
`BaseLayout` with `lang="ja"`, `title`/`description` in Japanese.

**BaseLayout:** optional `lang?: string` prop, defaulting to `'en'`.
Only change to an existing shared file.

**Content** (draft below; Russ reviews before it ships):

- `自己紹介` — who he is, why Fukuoka. From his own
  `life__introduction` and `life__perspective` prose, not invented.
- `つくっているもの` — Remember Rain, YouTube, 書きもの (`/notes`),
  プロジェクト (`/showcase`).
- `日本語の練習` — link to `/japanese-journal`, noting mistakes are left
  in. (Consistent with the no-shame rule: the record accumulates, it
  does not grade.)
- `連絡` — to `/life#contact`.
- A closing note that the rest of the site is English and the browser
  can translate it.

**Discovery:** a `日本語` link in the homepage `.about-links` nav beside
About and Contact, and in the `.footer-site` site map. *My call, with
reason:* not in `NavPill` — the four-item menu is a documented design
decision, and a Japanese visitor arriving from a shared link or a search
of his name lands on the homepage, where `.about-links` is above the
fold.

**`hreflang`:** `<link rel="alternate" hreflang="ja" href="/ja">` on the
homepage and the `en` counterpart on `/ja`. *My call* — two lines, and
cheap to drop if it feels like creep.

## Draft Japanese copy

> はじめまして。ニンジャラスです。
>
> オタクです。自分の物語を作りたいと思っています。動画を作ったり、文章を書いたり、好きなものに関わるツールを作ったりしています。
>
> 今は福岡に住んでいて、日本語を勉強しています。
>
> 全力でやりきるアニメや漫画が好きです。心に残る物語は、自分の生活をもう少し頑張ろうという気持ちにさせてくれます。誰かにとって、そういうものを作りたいと思っています。
>
> **つくっているもの**
> ・Remember Rain — 制作中のビジュアルノベル
> ・YouTube — 動画とエッセイ
> ・書きもの — エッセイや短い文章
> ・プロジェクト — 作ったツールや実験
>
> **日本語の練習**
> 日本語の勉強の記録を公開しています。間違いもそのまま残しています。
>
> **連絡**
> 気軽に声をかけてください。
>
> ※ このページ以外は英語で書かれています。ブラウザの翻訳機能をご利用ください。

**Open for Russ:** how his name should read. The journal has both
`ラスセル` and `忍者ラス`; the draft uses `ニンジャラス` to match the
site. His call, not mine.

## Left to the builder

- Whether the page reuses `.life__*` styles or carries its own small
  scoped block. Lean scoped and small — it is one page.
- Headings may use `p4g-heading`, accepting system-font CJK. Check the
  skew and letter-spacing do not mangle Japanese glyphs; drop the skew on
  this page if they do.
- No new unit tests — no new logic. `npm run build` and `npm run test`
  must pass.
