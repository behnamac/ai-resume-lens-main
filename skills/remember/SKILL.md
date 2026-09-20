---
name: remember
description: Save ResumeLens session state to memory.md so the next session picks up exactly where you left off — or restore it at the start of a new session so nothing is lost between them.
---

AI has no memory between sessions. Every new session starts blank. This skill fixes that.

Run it at the end of a session to save. Run it at the start of a new session to restore. Done consistently, nothing gets lost.

---

## Security Boundary

Never persist secrets to `memory.md`. This project has no `.env` and no server keys — auth is handled entirely by Puter.js in the browser — but session state still can surface sensitive values.

Never write:

- Puter session tokens, auth tokens, cookies, or anything from `puter.auth`
- The signed-in user's email, username, or account identifiers
- Resume contents, candidate names, or anything personal pulled out of a scanned PDF
- API keys, passwords, connection strings, webhook secrets, private keys

If a detail is useful but sensitive, store a redacted placeholder: `[REDACTED_TOKEN]`, `[a test resume]`. If unsure whether something is sensitive, treat it as sensitive and omit it.

`memory.md` sits in the project root and is not currently gitignored. Write it as if it will be committed.

---

## How to Invoke

**Save at end of session:**

```
/remember save
```

**Restore at start of new session:**

```
/remember restore
```

If the developer runs `/remember` with no mode — ask which one they need.

---

## Save Mode

### What to capture

Review the conversation and extract only what someone equally skilled would need to continue this work in a fresh context. Not a transcript. The essential state.

**What was built** — specific files and routes. Be precise. Not "improved the dashboard" — "added a status filter to `app/routes/home.tsx` with the pill row above the table; `stateWord` drives the options, no new tokens."

**Decisions made** — the choices future work depends on. Weight these toward the ones this stack makes expensive to reverse:

- Where a Puter call landed (store method in `app/lib/puter.ts` vs route)
- Any new kv key pattern beyond `resume:<uuid>` — and whether `/wipe` and the delete flow know about it
- Any change to the score thresholds or tone language in `app/lib/signal.ts`
- Any new `@theme` token added to `app/app.css`
- A change to the model id (`FEEDBACK_MODEL`) or to `prepareInstructions` / `AIResponseFormat` in `constants/index.ts`
- A change to the `Resume` or `Feedback` shape in `types/index.d.ts` — records already written to kv will not have the new field

**Problems solved** — anything that took time, so the next session does not solve it twice. In this project that usually means: pdfjs worker paths, SSR/hydration errors from client-only APIs, the Puter SDK not being ready on first render, GSAP `SplitText` behaviour, Tailwind v4 token resolution, or a model response that would not parse.

**Current state** — exactly where things stand. What works, what is partial, what is known broken. Note whether `npm run typecheck` passes.

**What comes next** — the very next action, specific enough to start immediately.

**Open questions** — anything unresolved the next session must address.

### What not to capture

- Implementation details visible in the code
- Anything inferable by reading the codebase or `git log`
- The process of how something was built — only what was built and what was decided
- Design patterns that belong in `ui-registry.md` — imprint owns those
- Any secret or personal value

### Safety check before writing

Run a final pass over the content. If a token, an account identifier, or resume content is present, redact or remove it. Keep only the minimal non-sensitive context needed to continue.

### Where to save

`memory.md` in the project root. It holds only the most recent session state.

If `memory.md` already exists, read it, summarise it, and stop for confirmation:

```
memory.md already exists from a previous session.
Current memory covers: [one-line summary].

Overwrite with this session's memory? (yes / no)
```

On **yes**, write it. On **no**:

```
No changes made. memory.md is unchanged.
```

### Format

```markdown
# Memory — ResumeLens · [Feature or Session Name]

Last updated: [date and time]

## What was built

[Specific files, routes, components completed this session]

## Decisions made

[Architectural decisions future work depends on —
 Puter boundary, kv keys, tokens, types, prompt, model]

## Problems solved

[Issues resolved — so they are not solved again]

## Current state

[What works, what is partial, what is broken.
 Does `npm run typecheck` pass?]

## Next session starts with

[The very first action — specific and actionable]

## Open questions

[Anything unresolved]
```

Then confirm:

```
Memory saved to memory.md.

Next session: run /remember restore to pick up from here.
```

---

## Restore Mode

### Step 1 — Find the memory

Look for `memory.md` in the project root. If it is not there:

```
No memory.md found in this project.

Either this is the first session, or it was never saved.
To save at the end of a session, run /remember save.
```

### Step 2 — Read everything available

Read `memory.md` first. Then read these, if they exist — and only these:

- `ui-registry.md` — the UI baseline from `/imprint`
- `CLAUDE.md`, `.claude/context.md` — Claude Code
- `AGENTS.md` — Codex
- `.cursorrules`, `.cursor/rules/` — Cursor
- `.github/copilot-instructions.md` — GitHub Copilot
- `.windsurfrules` — Windsurf
- `.clinerules` — Cline
- `context.md` — generic fallback

Then orient in the code itself, cheaply: `git log --oneline -10` and `git status`. Do not read the whole codebase on restore — read what `memory.md` points at.

Never repeat a raw secret or personal value from any restored source. Summarise in redacted form only.

### Step 3 — Confirm what was restored

Do not start building. Summarise so the developer can verify you understood correctly.

```
Memory restored. Here is where we are:

**Last session:** [what was built]
**Current state:** [what works right now]
**Decisions in place:** [key decisions that are locked]
**Next up:** [what this session should start with]

Is this correct? Say yes to continue, or correct anything
that does not look right before we proceed.
```

Only after confirmation does the session continue.

### If memory is incomplete or unclear

```
I found memory.md but some context seems missing —
[what is unclear or absent].

Continue with what we have, or fill in the gaps first?
```

Do not guess. Surface the gap and let the developer decide.

---

## The Rule

Every session ends with `/remember save`.
Every session starts with `/remember restore`.

That is the whole system. A skill used sometimes is a skill that cannot be relied on.
