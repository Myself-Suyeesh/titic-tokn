# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Tictic Tokn project

Free, open-source, fully local floating token meter. MVP is a Manifest V3 Chrome extension (ChatGPT, Claude.ai, Gemini). Learning project, not a business. No backend, no paid services, no analytics, no cloud accounts.

### Source documents
- `prd.md`: what to build and why (scope, phases, risks, open questions).
- `design.md`: visual spec. **Read before any UI work and follow it strictly; it wins over any other instruction on visuals.** Reference render: `Tictic_Tokn_UI.html` (open in a browser). Missing token → add to `design.md`, then `styles/tokens.css`, then use it.
- `docs/DEVELOPMENT.md`: living development document (architecture, decisions, milestone log). `README.md`: public-facing intro and usage.

### Rules
- **Local only.** Typed text never leaves the machine; no network calls with user content. No keystroke logging.
- **Read only what is needed**: the prompt box, visible reply and model label of allow-listed sites, through per-site adapters. Never read any focused input. Never read password, payment or other secure fields.
- **Honest numbers.** Every count is labelled exact or est.; every cost is an estimate and says so; non-live counts are dimmed and labelled "last count · not live". Use only the four status states (Tracking, Paused, Not tracking, Ignoring).
- **Never steal focus** from the page the user is typing in. Widget lives in a shadow DOM.
- TypeScript strict, no `any` (lint error). Pure logic in `core/` with Vitest tests; tokenizer, cost, threshold and status logic must be tested.
- Site adapters are small, separate files behind one interface so a broken site is a small, isolated fix.
- Accessibility per `design.md` §8: real `<button>`s, SVG icons (no text glyphs), `aria-live="polite"`, reduced motion, 4.5:1 contrast.
- Prices and Claude/Gemini char-to-token ratios are data files, not hard-coded.
- Fonts (Inter, Space Grotesk) are bundled with their OFL licence notices. Licence: MIT.
- Phase 2 items (Tauri, bridge, terminal plugin, clipboard/hotkey, API-key counts, thinking estimate, compare) are out of scope until explicitly started.

### Stack
WXT (Vite) · React · TypeScript strict · Manifest V3 · gpt-tokenizer or js-tiktoken (exact, OpenAI-style) · ratio config (est., Claude/Gemini) · LiteLLM price table snapshot · `chrome.storage.local` · Vitest.

### Structure (planned)
- `entrypoints/content/` content script and shadow-DOM widget mount; `entrypoints/options/` minimal settings page.
- `components/` Card, Pill, Meter, StatusLine, ModelChip, PauseButton, icons.
- `adapters/` one file per site (`chatgpt.ts`, `claude.ts`, `gemini.ts`) implementing `SiteAdapter`.
- `core/` tokenizer, models (alias table), cost, meter thresholds, status state machine, secure-field check, with `*.test.ts`.
- `data/` `ratios.json`, `model-prices.json` (with snapshot date).
- `styles/tokens.css` mirrors `design.md` tokens.
- `docs/DEVELOPMENT.md`, `README.md`, `CONTRIBUTING.md`, `LICENSE`.

### Commands (available once scaffolded)
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm run test` · `npm run check` (typecheck, lint, tests, build in order). Single test: `npx vitest run core/cost.test.ts`.

### Milestone workflow
Milestones follow `prd.md` §15: 1 Skeleton and live count → 2 Model, cost, status → 3 After-response and conversation total (+ Claude.ai, Gemini adapters) → 4 Polish and release prep.
- **Do not write code until the user says "go".** After each milestone, stop and wait for the next "go".
- Before a milestone: state a short plan with verify steps.
- After each milestone: run `npm run check`, fix everything, **update `docs/DEVELOPMENT.md`** (status, decisions, what changed, how to verify) and **README.md** if user-visible behaviour changed, commit with a clear message, summarize what changed and what to verify, then stop.
- Docs must always describe the current state of the repo, not the plan. Mark anything unbuilt as planned.

### Git and approval workflow
- **One branch per milestone or feature**, created by Claude from an up-to-date `main` right before work starts: `feat/skeleton-live-count` (M1), `feat/model-cost-status` (M2), `feat/reply-update-conversation-total` (M3), `chore/polish-release-prep` (M4). Split a large milestone into smaller `feat/…` branches only after telling the user.
- Check that `main` contains the previous milestone before branching; if not, tell the user.
- Doc updates go on the same branch as the code they describe.
- **The user pushes and merges.** Claude never pushes, force-pushes or merges. When a milestone is verified (`npm run check` passes, docs updated), tell the user it is time to push and give the exact commands.
- **Explain before changing.** Before editing files or running git commands, say what is being changed, how, and what issues it could cause or resolve, then ask for approval. Warn before any destructive git command (reset, `checkout -B`, force push).
