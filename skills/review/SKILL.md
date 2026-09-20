---
name: review
description: After building a ResumeLens feature, verify it matches the plan, respects the architecture boundaries and the Signal design system in app/app.css, and is ready to ship. Reports issues with severity so the developer decides what to fix.
---

Building is not done when the code runs. It is done when the code is correct.

AI moves fast. Fast means things get built that work on the surface but drift from the architecture, bypass the design tokens, or break the reduced-motion and SSR contracts this project depends on. This skill catches those before they compound.

Run it after every feature. Before you move on.

## What This Skill Does Not Do

It does not fix anything. It reports what it finds and lets the developer decide. Fixing without understanding is how problems get buried, not solved.

---

## Step 1 — Understand What Should Have Been Built

Establish the benchmark first. Read in this order:

1. The implementation plan from `/architect`, if one exists
2. `memory.md`, if it exists — it may carry decisions this feature depends on
3. The feature description the developer gave
4. `ui-registry.md`, if the feature has a UI surface
5. `app/app.css` — the design system in full
6. `app/lib/signal.ts` — the score language and thresholds

If no plan exists, ask the developer to describe what the feature was supposed to do. You cannot verify correctness without knowing what correct looks like.

Then look at what actually changed: `git status` and `git diff` scope the review to the work in front of you.

---

## Step 2 — Review in Four Layers

### Layer 1 — Does it match the plan?

- Every part of the feature description — is it all there?
- The decisions made during planning — are they reflected in the code?
- Scope — did it stay within bounds, or add things nobody asked for?

Flag anything planned but missing. Flag anything built but not planned.

---

### Layer 2 — Does it respect the system?

This is where drift happens. The feature works, but it breaks a rule the project depends on.

**Architecture boundaries**

- `usePuterStore` is called **only** in `app/routes/*` and `app/root.tsx`. A component importing it is a boundary violation — check with `grep -rn "usePuterStore" app/components`.
- `window.puter` is touched **only** inside `app/lib/puter.ts`. Nothing else reaches the SDK directly.
- Components in `app/components/` are presentational: props in, markup out. No fetching, no kv, no fs, no navigation decisions.
- The model id lives in `app/lib/puter.ts` (`FEEDBACK_MODEL`). It does not get duplicated into a route.
- Prompt text lives in `constants/index.ts` (`prepareInstructions`, `AIResponseFormat`). It does not get inlined into a route.
- Score thresholds live in `app/lib/signal.ts`. A route or component re-deriving `> 70` / `> 49` for itself is a violation — even when the number is right.

**Design system**

Everything visual comes from `app/app.css`. Check:

- **No raw hex** in `app/` or `constants/` outside `app/lib/signal.ts`. That file holds `ACCENT`/`MID`/`FLAG` deliberately, because they feed inline SVG `stroke` and `style` color. Everything else uses a token. Check with:
  `grep -rn "#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]" app constants | grep -v app.css | grep -v app/lib/signal.ts`
  *Known existing offender: `app/components/ResumeRow.tsx` hardcodes `#5a6478`, which is `--color-faint`. Do not add a second one.*
- **No default Tailwind palette.** No `text-gray-500`, `bg-slate-900`, `border-zinc-700`. The tokens are `void / ground / panel`, `ink / muted / dim / faint`, `accent / accent-lit / mid / flag / exit`, `hairline / hairline-soft / edge`.
- **Existing component classes are used, not re-created.** Buttons are `.btn-signal`, `.btn-outline`, `.btn-exit`, `.btn-quiet`. Labels are `.mono-eyebrow`, `.mono-label`, `.mono-meta`, `.mono-faint`. Headlines are `.display`. Inputs are `.field`. Surfaces are `.panel`. Top bar is `.screen-bar`. Bottom band is `.strip` + `.strip-cell`. Backgrounds are `.ground-center` or `.ground-left`. A hand-rolled button with the same utilities spelled out is drift.
- **The voice holds.** The machine speaks in uppercase mono (labels, meta, buttons, status). The product speaks in sentences (headlines, body copy). A sentence-case button or an uppercase paragraph is a violation.
- **Rounding.** This UI is square. No `rounded-*` on panels, buttons, inputs, or rows. The only `rounded-full` in the codebase is on decorative rings — `ScanVisual.tsx` and the home empty state. The score ring is an SVG `<circle>`, not a rounded box.

**Code standards**

- Imports use the `~/` alias for `app/*`.
- `cn()` from `~/lib/utils` for conditional classes; template literals are used in places, but do not introduce a third pattern.
- TypeScript is `strict`. No new `any` — `app/lib/pdf2img.ts` uses it for the pdfjs dynamic import only.
- `Resume` and `Feedback` are global ambient types from `types/index.d.ts`. Do not re-declare them locally.
- Comments in this codebase explain *why*, in full sentences, sparingly. Match that density — do not narrate the code.

**Existing patterns**

- Did this introduce a new pattern where one already exists? Dialogs use `Modal`. Reveal animations use `Reveal` / `RevealText`. Animated numbers use `Counter`. Score rings use `ScoreRing`. Dates use `scanDate` / `scanStamp`.

---

### Layer 3 — Does it hold up in this runtime?

This project has three contracts that a compiler will not check for you.

**SSR safety** — `ssr: true` in `react-router.config.ts`. `window.puter`, `crypto.randomUUID()`, `URL.createObjectURL`, `document`, `localStorage`, and pdfjs are client-only. Any of them in a render body instead of a `useEffect` or an event handler is a hydration bug. It will not fail typecheck.

**Reduced motion** — every GSAP animation goes through `withMotion()` from `~/lib/motion`. Under `prefers-reduced-motion: reduce` nothing runs, so the markup must already be the finished state: text visible, `Counter` showing its real value, nothing stuck at `opacity: 0`. Check any new animation against that.

**Object URL lifetime** — `URL.createObjectURL` is called in `app/routes/resume.tsx` (twice) and `app/lib/pdf2img.ts`. None of them is currently revoked. A new one without a matching `revokeObjectURL` on unmount is a leak worth flagging — and worth noting that the existing ones leak too.

Also check:

- **Auth guard** — every authenticated route redirects with `navigate('/auth?next=<path>')` when `!auth.isAuthenticated`. A new protected route needs the same guard, and it must wait on `isLoading` where the existing ones do.
- **Model output** — anything that `JSON.parse`s a model response has a failure path. `upload.tsx` stops the scan and shows a message. Silent `catch {}` is a bug.
- **Deletes** — `fs.delete` on a missing path must not block the kv delete. `home.tsx` handles that deliberately; a new delete path should too.

---

### Layer 4 — Is it production ready?

- **Typecheck passes** — run `npm run typecheck`.
- **Error handling** — what happens when the drive call fails, the PDF has no readable first page, the listing is empty, `kv.get` returns null? `resume.tsx` has a `missing` state; new screens need their equivalent.
- **Edge cases** — empty state, loading state, a record with no `feedback` yet (`ResumeRow` renders `—` / `PENDING` for exactly this), a single item vs many (the `numberWord` / pluralisation path in `home.tsx`).
- **Responsive** — this layout is built mobile-first with `md:` and `lg:` breakpoints and an explicit mobile column collapse in `ResumeRow` and the home table header. If a column was added to one, it was added to both.
- **Accessibility** — interactive elements have `aria-label` where the label is an icon, dialogs carry `role="dialog"` + `aria-modal` (that is what `Modal` provides), and `Escape` closes overlays where the pattern already exists.
- **Console** — any new errors or warnings in the browser or terminal.

---

## Step 3 — Report What You Found

Do not bury issues. Do not soften them.

```
## Review — [Feature Name]

### Layer 1 — Plan alignment
[PASS / ISSUES FOUND]
[Gaps between what was planned and what was built]

### Layer 2 — System integrity
[PASS / ISSUES FOUND]
[Architecture boundary, design token, or code standard violations —
 with file:line]

### Layer 3 — Runtime contracts
[PASS / ISSUES FOUND]
[SSR, reduced motion, object URLs, auth guards, model output handling]

### Layer 4 — Production readiness
[PASS / ISSUES FOUND]
[Typecheck result, error handling, edge cases, responsive, a11y, console]

### Summary
[X] issues found across [Y] layers.

[If none: "No issues found. This feature is ready to ship."]
[If issues: "Resolve the above before moving to the next feature."]
```

---

## Step 4 — Let the Developer Decide

Stop after the report. Do not start fixing. Do not suggest fixes unless asked.

Wait for the developer to ask for a specific fix, tell you something is intentional, or confirm they are moving on. The developer owns the quality decision. You inform it.

---

## Severity Guide

Label every issue so the developer can triage fast.

**Critical — fix before moving on**

- A component calling `usePuterStore`, or anything outside `app/lib/puter.ts` touching `window.puter`
- Client-only API in a render body (SSR/hydration break)
- An animation that leaves content invisible under reduced motion
- A `JSON.parse` of model output with no failure path
- A protected route with no auth guard
- Something planned but completely missing

**Important — fix soon**

- A raw hex or default Tailwind color instead of a token
- A hand-rolled control where `.btn-*` / `.mono-*` / `Modal` / `Counter` already exists
- Score thresholds re-derived outside `app/lib/signal.ts`
- A missing empty, loading, or unscored state
- A leaked object URL
- A desktop-only column added without its mobile counterpart

**Minor — fix when convenient**

- Naming inconsistencies that do not affect behaviour
- Comment density that does not match the codebase
- Missing optimisations

---

## The Standard

The question is not "does it work?"

The question is "is it correct?" A feature can work today and break the project tomorrow. Review exists to catch the difference.
