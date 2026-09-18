# Character-sheet trimming — Scrivener-ready proposals

Dated 2026-09-17. Follows the character direction-lock pass. **Proposals only** —
paste into Scrivener after you rule. Plain Markdown, no backslash escaping (the
`\#` / `\*` in this export are Scrivener's compile step, not content).

One correction to the direction-lock pass first: on reading `World/Magic System.md`
I found the **cost layer is already there** (`Magic System.md:55–67` — all five
costs plus Claire's escalation ladder). So the symptom ladders are a *duplication*
to trim, not a move. The only mechanics genuinely absent from the system doc are
the Pursuer's combat effects — and their real issue is a system ambiguity.

---

## Part A — Remove the exact heights (all six main sheets)

Heights are decorative precision; none define anything a scene would contradict.
The two that carry function are already stated in each sheet's Visual Anchors
(Vesper "slight… physically non-threatening" `1 Vesper.md:105`; Pursuer "largest
and heaviest-feeling silhouette" `The Pursuer.md:97`).

Delete one line from each Quick Read:

| File | Delete this exact line |
|---|---|
| `0 Rain.md` | `- **Height:** 5'7"` |
| `1 Vesper.md` | `- **Height:** 5'6"` |
| `Claire.md` | `- **Height:** 5'10", slender` |
| `Roxana.md` | `- **Height:** 5'5"` |
| `Shiori.md` | `- **Height:** 5'8"` |
| `The Pursuer.md` | `- **Height:** 6'2"` |

**Cost:** none. No other document references these numbers (verified against the
terminology index — ages are load-bearing and stay; heights are not).

---

## Part B — Trait pairs (optional)

The `- **Traits:** X / Y` line in each Quick Read is a real at-a-glance compression,
and it is already uniform across sheets. I do **not** recommend removing it — it is
the cheapest thing to cut *if* you want to lean the sheets further toward the
Contradiction + Question alone, but it is not overcomplication. This one is a
taste call, and both are coherent:

- **Keep** (my lean) — the sheet opens with Contradiction → Question → Traits, a
  clean three-line handshake.
- **Remove** — the Contradiction and the "On the Page" tells already carry the same
  information; the sheet gets leaner.

No downstream cost either way; the trait pairs are referenced nowhere else.

---

## Part C — The Pursuer's combat kit (the real finding)

`The Pursuer.md:79–85` names four vapor effects — **Sheath**, **Vent**,
**Shape / redirect**, **Projectile defense** — and `:91` says "The greatcoat has
no advanced expression." The register's terminology index already flags these as
"undefined as naming" (`audits/2026-09-16-terminology-index.md:144`): the system
rule says a bonded Imprint sustains **one deliberate expression at a time**
(`Magic System.md:47`), and no document says whether these four are one expression
applied four ways or four separate expressions.

That is the genuine gap. Two edits close it.

### C1 — Resolve the ambiguity in `World/Magic System.md`

After `Magic System.md:47` ("…cannot sustain base and advanced expressions
simultaneously as independent effects."), insert:

> Practical applications of a single expression — the specific ways its effect is
> applied in the moment — are facets of that expression, not separate powers. The
> Pursuer's Sheath, Vent, vapor-shaping, and projectile defense are one
> vapor-control expression applied four ways, never four simultaneous abilities.

This states the "one expression, four facets" reading (already implied by `:89`,
"uses vapor to control contact and defense"). **Alternative if you disagree:**
decide the kit is four distinct expressions and add the cost that he may run only
one at a time — but that contradicts `:91`'s "no advanced expression" and makes
the fight scenes harder to stage, so I do not recommend it.

### C2 — Compress the four bullets in `The Pursuer.md`

Replace `The Pursuer.md:79–85` (the four named-effect bullets) with one line:

> - **Vapor control** — the greatcoat's single expression, applied as close
>   obscuring and redirection (Sheath), short-to-mid release (Vent), concealment and
>   approach control (Shape), and projectile deflection (Projectile defense). It
>   creates no water and is not artillery, plate armor, propulsion, or an advanced
>   form.

**Cost:** the four facet-names (Sheath/Vent/Shape/Projectile defense) are kept as
labels inside the paragraph, so any scene referencing them still works. The detail
lost is only the per-effect elaboration, which is combat-system altitude, not
character direction.

---

## Part D — Trim the duplicated symptom ladders (optional)

`Magic System.md:55–67` already owns the cost layer. Three sheets re-list the full
escalation ladder at higher granularity. Replace each ladder with a pointer.

- `0 Rain.md:99` — the Clone bullet's last sentence ("Longer or more complex use
  disrupts his anchoring… through disorientation, proprioceptive instability,
  severe sensory degradation, and collapse") → replace with: **"Cost: disrupts
  sensory anchoring; repeated or complex use compounds it (see
  `World/Magic System.md`)."**

- `Claire.md:85` — the escalation ladder ("fatigue, headache, visual or motor
  disturbance, tremor… increasingly long comas") → replace with: **"Cost:
  neurological and computational overload; scales with complexity, hold time, and
  repeated use (see `World/Magic System.md`)."** (The full ladder already lives at
  `Magic System.md:67`.)

- `Roxana.md:87` — the Starborne cost ladder ("Ungated pain can trigger withdrawal…
  and collapse") → replace with: **"Cost: normal pain gating is suppressed; ungated
  pain can trigger withdrawal, tension, and collapse (see `World/Magic System.md`)."**

**Cost:** none — `Magic System.md` already holds the full ladders; these pointers
only stop the sheets from drifting out of sync with the system doc.

---

## Order of application

A (heights) and C (Pursuer) are independent and can go in immediately. B is a
taste call. D is optional cleanup that matters only if you want the sheets and the
system doc to stop duplicating each other. None of these touch prose, spine, or the
manuscript; they are plan-layer altitude only.
