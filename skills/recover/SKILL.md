---
name: recover
description: When something goes wrong in ResumeLens, diagnose what type of failure it is before deciding how to respond. Targeted fix, hard reset, or full rethink — and a field guide to the failures this stack actually produces.
---

Not every problem is a bug. Not every bug needs debugging.

When something goes wrong with AI-assisted development, the instinct is to keep prompting — describe the problem, ask for a fix, get another broken version, describe that, ask again. The session gets longer. The context gets polluted. The code gets worse.

The problem is not the code. The problem is not knowing what type of failure you are dealing with.

Diagnose first. Then respond. Those are two separate steps and they cannot be swapped.

---

## Step 1 — Describe What Went Wrong

```
Describe what is wrong. Be specific:
- What did you expect to happen?
- What happened instead?
- Which screen — home, auth, upload, report, wipe?
- Is the error in the browser console, the terminal, or both?
- How many times have you tried to fix it already?
```

Read the answer carefully. The number of fix attempts tells you whether this is a fresh problem or a session that has already gone wrong.

---

## Step 2 — Check the Field Guide First

Most ResumeLens breakages are one of a handful of known shapes. Check these before diagnosing from scratch — if the symptom matches, you already have the root cause.

**"Text did not match server-rendered HTML" / hydration mismatch**
`ssr: true`. Something client-only ran during render: `window.puter`, `crypto.randomUUID()`, `URL.createObjectURL`, `document`, `new Date()` formatting, or a pdfjs import. It belongs in a `useEffect` or an event handler. Typecheck will not catch this.

**`puter is not defined` / `Cannot read properties of undefined`**
The SDK loads from a CDN `<script>` in `app/root.tsx` and is not available on the server or on the first client tick. `getPuter()` in `app/lib/puter.ts` guards this, and `init()` runs from `Layout`. Something is reaching the SDK outside the store, or before `puterReady`.

**The scan stops at a specific pass**
`upload.tsx` runs six passes and reports which one stopped. Map it: pass 01 `fs.upload`, 02 `convertPdfToImage`, 03 image upload, 04 `kv.set`, 05 `ai.feedback`, 06 parse. The pass number is the diagnosis — do not go hunting elsewhere.

**Pass 02 fails / the page image is blank**
pdfjs. The worker is served from `/pdf.worker.min.mjs` in `public/` and is set in `loadPdfJs()`. A version mismatch between `pdfjs-dist` and that worker file, a missing worker file, or an encrypted/imageless PDF all land here.

**Pass 06 fails — "came back in a shape Signal could not read"**
The model returned something `JSON.parse` could not take: prose around the JSON, fenced backticks, or a truncated response. Look at `prepareInstructions` and `AIResponseFormat` in `constants/index.ts`, and at `FEEDBACK_MODEL` in `app/lib/puter.ts`.

**A report renders but a section is empty**
The stored `feedback` does not match the `Feedback` interface in `types/index.d.ts`. Records already in kv do not migrate when the type changes. Check the actual record before touching component code.

**Text is invisible, or a counter is stuck at zero**
The reduced-motion contract. GSAP runs only under `prefers-reduced-motion: no-preference` via `withMotion()`. If the markup is not already the finished state, anyone with reduce set sees nothing. Test by turning reduce on.

**A Tailwind class does nothing**
Tailwind v4 with tokens in `app/app.css` `@theme` and no `tailwind.config.js`. A class built from a token that does not exist silently produces nothing. Check the token is declared.

**An import cannot be resolved**
`~/*` maps to `./app/*` via `tsconfig.json` and `vite-tsconfig-paths`. `constants/` sits outside `app/`, so it is imported by relative path (`../../constants`), not by alias.

**Route types missing after a routing change**
`npm run typecheck` runs `react-router typegen` first. Run it after editing `app/routes.ts`.

---

## Step 3 — Identify the Failure Mode

### Failure Mode 1 — A specific thing is broken

**Signs:** the problem is isolated to one component, route, or pass; the rest works; this is the first or second fix attempt; the error or wrong behaviour is clear.

**Means:** a normal bug with a findable root cause.

**Response:** targeted fix — Step 4A.

---

### Failure Mode 2 — The session has gone wrong

**Signs:** multiple fix attempts have made things worse or created new problems; fixes are patching fixes; the context is full of failed attempts; it is no longer clear what the original problem was.

**Means:** the session is polluted. More prompting compounds the damage. The feature needs rebuilding in a clean context, not patching.

**Response:** hard reset — Step 4B.

---

### Failure Mode 3 — The foundation is wrong

**Signs:** the code runs but the behaviour is fundamentally wrong; the implementation misunderstands a core requirement, the Puter SDK, or an architectural boundary; fixing pieces will not help because the approach is incorrect.

In this project that usually looks like: a component doing its own Puter calls, feature state pushed into the Zustand store, a second kv key pattern invented without the delete and wipe flows knowing about it, a parallel color system built alongside the `@theme` tokens, or a scan flow restructured to fight the six-pass model instead of using it.

**Means:** not a debugging problem. The approach needs reconsidering before any more code is written.

**Response:** rethink — Step 4C.

---

Tell the developer which mode this is before proceeding:

```
This looks like Failure Mode [1/2/3] — [name].

[One sentence explaining why you identified it this way.]

Here is how we handle this:
```

---

## Step 4A — Targeted Fix

### Diagnose before touching code

Ask for the exact error message, the file or pass where it happens, and what the code is supposed to do versus what it does. Read only the relevant code — not the whole codebase.

For a scan failure, the pass number from the UI narrows it immediately. For a render failure, check the browser console first; for a build or type failure, the terminal.

### Find the root cause

State it clearly, separated from the symptom:

```
Root cause: [why this is actually happening]

This is different from the symptom because: [explanation]
```

### Suggest a precise fix

Address the root cause. Not a workaround, not a patch on broken code.

```
Fix: [what changes and why]

This resolves the root cause because: [explanation]

Verify with: [`npm run typecheck`, and the specific screen
and state to exercise at http://localhost:5173]
```

Wait for confirmation before changing anything.

### If the fix does not work

Stop. Do not immediately suggest another. If the fix did not work, the root cause diagnosis was probably wrong — diagnose again from the beginning.

If two root-cause diagnoses have both been wrong, this is likely Failure Mode 2 or 3. Re-evaluate.

---

## Step 4B — Hard Reset

```
This session has gone too far in the wrong direction
to recover by patching. The right move is a clean start.

This is not a failure — it is the correct response
to a polluted context. A fresh session with clear intent
will be faster than continuing here.
```

### Save what is worth keeping

Before ending, extract what is valuable:

```
## Reset Note — [Feature Name]

### What we were building
[Original feature description]

### What went wrong
[Honest summary of how the session went off track]

### What to avoid next time
[Specific approaches or patterns that did not work]

### Code state right now
[What is committed, what is uncommitted, whether
 `npm run typecheck` passes, and whether anything
 half-finished needs reverting with `git checkout`]

### Starting point for next session
[Where to begin fresh — what to keep, what to discard]
```

### Instruct the developer

```
Next steps:

1. Save this reset note — run /remember save to put it in memory.md
2. Decide what to do with the uncommitted work:
   keep it, stash it, or `git checkout` it
3. End this session completely
4. Start a fresh session
5. Run /remember restore
6. Approach [feature name] again — consider /architect first

Do not continue in this session.
```

---

## Step 4C — Rethink

### Name the wrong assumption

```
The core issue is not a bug — it is a wrong assumption:

Assumed: [what was assumed]
Reality: [what is actually true]

This means the current implementation cannot be fixed
by patching. The approach needs to change.
```

Check it against what this project actually is: there is no backend; every Puter call goes through `app/lib/puter.ts`; components are presentational; score language lives in `app/lib/signal.ts`; colors live in `app/app.css` `@theme`; one record per scan at `resume:<uuid>`.

### Propose the correct approach

```
Correct approach: [description]

Key difference from the current approach: [explanation]

What needs to be discarded: [what cannot be salvaged]
What can be kept: [what is still valid]
```

### Do not start rebuilding immediately

```
Does this diagnosis match your understanding?

If yes — we can start fresh with the correct approach.
If no — tell me what I am getting wrong.
```

Only after confirmation does rebuilding begin. If the rethink is substantial, run `/architect` before writing code.

---

## The Principle

The worst thing you can do when something is broken is keep doing the same thing faster.

Diagnose first. Respond correctly. Different failures need different responses — and knowing which one you have is more than half the solution.
