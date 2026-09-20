---
name: imprint
description: After building or changing a ResumeLens UI component, extract the visual patterns that matter and record them in ui-registry.md — so every component built after this one matches the Signal design system already in app/app.css.
---

UI consistency does not happen by accident. It happens because every component is built with awareness of what already exists.

The problem with AI-built interfaces is that each component gets built in isolation. The agent does not remember what it built three sessions ago. So spacing drifts, a raw hex sneaks in where a token belongs, a button gets hand-rolled next to four that already exist. The app starts to look like it was built by several people with different tastes.

ResumeLens has a real design system already — `app/app.css` holds the tokens and the component classes. This skill keeps components honest against it, and records the patterns the CSS cannot express.

Build a component. Run `/imprint`. Move on.

---

## The System This Guards

**Tokens** — declared in `app/app.css` under `@theme`. Tailwind v4, no `tailwind.config.js`.

| Group | Tokens |
| --- | --- |
| Ground | `void` `#04050a`, `ground` `#07090f`, `panel` `#0b0e16` |
| Text | `ink` `#e8edf7`, `muted` `#a7b2c6`, `dim` `#8b96ac`, `faint` `#5a6478` |
| Signal | `accent` `#5be9c8`, `accent-lit` `#8ff4dc`, `mid` `#ffc65b`, `flag` `#ff8a5b`, `exit` `#ff5b5b` |
| Lines | `hairline` (10%), `hairline-soft` (6%), `edge` (16%) |
| Type | `--font-sans` Space Grotesk, `--font-mono` JetBrains Mono |

**Component classes** — declared in `app/app.css` under `@layer components`. Use these before writing utilities by hand:

- Machine voice: `.mono-eyebrow` `.mono-label` `.mono-meta` `.mono-faint` `.wordmark`
- Product voice: `.display`
- Controls: `.btn-signal` `.btn-outline` `.btn-exit` `.btn-quiet` `.nav-link` `.field`
- Structure: `.screen-bar` `.strip` `.strip-cell` `.panel` `.reveal-line`
- Ground: `.ground-center` `.ground-left`

**Utilities** — `animate-scan` `animate-signal-pulse` `animate-ring` `animate-sweep`.

**Rules the CSS cannot enforce**

- The interface is **square**. The only `rounded-full` in the codebase is on decorative rings — `ScanVisual.tsx` and the home empty state. Panels, buttons, inputs and rows have hard corners. The score ring is an SVG `<circle>`.
- **Uppercase mono is the machine.** Labels, meta, status, buttons. **Sentence case is the product.** Headlines and body copy.
- **Color carries score meaning.** `accent` = READY (>70), `mid` = REVISE (50-70), `flag` = WEAK (<50), `exit` = destructive. Never decorative.
- **A raw hex is a bug** anywhere but `app/lib/signal.ts`, where `ACCENT`/`MID`/`FLAG` feed inline SVG `stroke` and `style` color.

---

## How to Invoke

After building or changing a UI component:

```
/imprint
```

Target a specific file:

```
/imprint app/components/ScoreRing.tsx
```

Audit the whole interface:

```
/imprint audit
```

If no filepath is given, work out which files under `app/components/` or `app/routes/` were most recently created or modified in this session and capture from those.

**Use audit mode when:** `ui-registry.md` does not exist yet (it does not today — audit is the right first run), several sessions have passed without imprinting, or something looks off and it is hard to say why.

---

## Step 1 — Find What Was Just Built

If a filepath was given, read it. Otherwise identify recently touched files in `app/components/` and `app/routes/` — `git status` and `git diff --name-only` are the fastest way.

If it is unclear, ask:

```
Which component should I capture patterns from?
```

---

## Step 2 — Extract What Matters for Consistency

Read the component. Pull out only what affects whether components look like they belong together.

**Extract these:**

- Which `@layer components` classes it uses (`.panel`, `.btn-quiet`, `.mono-label`, …) — reuse is the primary signal
- Background — which `bg-` token for container, card, panel
- Border — token and width; which hairline weight (`hairline` vs `hairline-soft` vs `edge`)
- Text — which `text-` tokens for primary, secondary, muted
- Type treatment — mono vs sans, size, weight, `tracking-*`
- Spacing — internal padding, `gap-*` between elements
- Interactive states — `hover:`, `focus-visible:`, `disabled:`, and any `group-hover:` reveal
- Score-tone usage — whether it goes through `toneHex` / `toneText` / `stateWord` from `~/lib/signal`
- Motion — whether it uses `Reveal` / `RevealText` / `Counter`, or its own GSAP through `withMotion()`

**Do not extract these:**

- Width and height — too context-dependent to be a rule
- Flex and grid structure — structural, not visual
- Positioning (`absolute`, `z-*`) — context-dependent
- Responsive variants — capture the base pattern only
- Animation timings, unless the component defines a pattern worth enforcing

---

## Step 3 — Write to ui-registry.md

`ui-registry.md` lives in the project root. Create it if it does not exist. Append new entries; update an existing entry for the same component rather than duplicating it.

### Entry format

```markdown
### [Component Name]

File: [filepath]
Last updated: [date]

| Property          | Value                                |
| ----------------- | ------------------------------------ |
| Design classes    | [.panel, .mono-label, …]             |
| Background        | [token class]                        |
| Border            | [token class]                        |
| Text — primary    | [token class]                        |
| Text — secondary  | [token class]                        |
| Type treatment    | [mono/sans, size, weight, tracking]  |
| Spacing           | [padding / gap]                      |
| Interactive state | [hover / focus / disabled]           |
| Score tone        | [via signal.ts, or none]             |
| Motion            | [Reveal / Counter / withMotion / none]|

**Pattern notes:**
[Why a class was chosen, what this component should always match,
 which variations are allowed.]
```

---

## Step 4 — Confirm What Was Captured

```
Imprinted [Component Name] → ui-registry.md

Captured:
- Design classes: [classes]
- Background: [token]
- Border: [token]
- Text: [tokens]
- Spacing: [values]
- State: [hover/focus]

Any future component of this type should match these patterns.
```

Flag anything that looked wrong while extracting:

```
Note: [raw hex, default Tailwind color, hand-rolled control,
       rounded corner, or sentence-case button found — with file:line]
```

---

## How ui-registry.md Gets Used

The registry is the consistency enforcer for every future session. At the start of any session with UI work, read `ui-registry.md` before writing a component. Building a new row? Check how `ResumeRow` was built. A new dialog? Check `Modal`. A new status pill? Match the exact border-and-color treatment already in use.

The registry grows with the project. Ten entries is useful. Thirty is powerful. A registry that is sometimes updated is unreliable.

---

## Audit Mode — /imprint audit

Run this when the interface already exists and consistency is uncertain. It scans the whole UI, finds conflicts, and establishes a baseline before any further capturing.

### Step 1 — Scan everything

Read every file in `app/components/` and `app/routes/`, plus `app/app.css` and `app/root.tsx`. Build a complete picture of what is actually in use.

### Step 2 — Identify conflicts

```
## UI Consistency Audit — ResumeLens

### Token discipline

**Raw hex values outside app/lib/signal.ts**
[file:line for each — with the token that should replace it]

**Default Tailwind palette classes**
[Any text-gray-*, bg-slate-*, border-zinc-* — with the token that replaces it]

### Class reuse

**Hand-rolled controls**
[Any element spelling out utilities where .btn-signal / .btn-outline /
 .btn-exit / .btn-quiet / .field already exists]

**Hand-rolled labels**
[Any uppercase mono text not using .mono-eyebrow / .mono-label /
 .mono-meta / .mono-faint]

### Visual properties

**Border weights**
[Every border-hairline / hairline-soft / edge usage — is the choice consistent
 for the same kind of division?]

**Text colors**
[Every ink / muted / dim / faint usage — is the hierarchy consistent?]

**Spacing**
[Padding and gap variations across comparable surfaces]

**Interactive states**
[hover / focus-visible / disabled variations — is there one pattern?]

**Rounding**
[Any rounded-* outside the decorative rings in ScanVisual
 and the home empty state]

### Voice

**Case violations**
[Sentence-case machine text, or uppercase product copy]

### Score language

**Threshold duplication**
[Any > 70 or > 49 comparison outside app/lib/signal.ts]

### Recommended baseline
[The correct value for each property, based on what the majority already
 does correctly and what app/app.css defines]
```

### Step 3 — Wait for confirmation

Present the audit. Do not fix anything. Do not write `ui-registry.md` yet.

```
Audit complete. [X] conflicts found across [Y] properties.

Before I establish the baseline in ui-registry.md:
1. Do the recommendations above look correct?
2. Any conflict you want resolved differently?
3. Should I list the raw hex values as issues to fix?

Confirm the baseline and I will write it to ui-registry.md.
```

### Step 4 — Write the confirmed baseline

```markdown
## Baseline — Established [date]

[Established via /imprint audit. Source of truth: app/app.css]

| Surface            | Correct treatment |
| ------------------ | ----------------- |
| Screen background  | [class]           |
| Top bar            | [class]           |
| Panel / card       | [class]           |
| Dialog             | [class]           |
| Primary button     | [class]           |
| Secondary button   | [class]           |
| Destructive button | [class]           |
| Quiet button       | [class]           |
| Input              | [class]           |
| Section label      | [class]           |
| Meta / status      | [class]           |
| Headline           | [class]           |
| Body copy          | [class]           |
| Row divider        | [class]           |
| Score color        | [source]          |
```

### Step 5 — List what needs fixing

```
## Components to fix

- [file:line] — [what is wrong] → [what it should be]
```

The developer can fix these systematically, or as they encounter each component. Either way the baseline is set and `/imprint` keeps new components consistent from here.

---

## The Rule

Build a component. Run `/imprint`. Move on. Every time.

Consistency is a habit, not a feature.
