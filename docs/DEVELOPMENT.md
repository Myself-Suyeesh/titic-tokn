# Tictic Tokn: Development Document

> Living document. It is updated at the end of every milestone and always describes the **current** state of the repo. Anything not yet built is marked *planned*.

**Last updated:** 10 Nov 2026 · **Current milestone:** 1 (skeleton and live count), built on branch `feat/skeleton-live-count` and verified in Chrome

## 1. What this project is

A small floating meter that shows, live, how many tokens (and roughly what cost) the prompt you are typing will use, updates when the reply finishes, and keeps a running estimate for the conversation. The MVP is a Manifest V3 Chrome extension for ChatGPT, Claude.ai and Gemini. It is free, open source, fully local and not a business.

Source documents: [`prd.md`](../prd.md) (requirements), [`design.md`](../design.md) (visual spec), `Tictic_Tokn_UI.html` (reference render of the design; open in a browser).

## 2. Status

| Milestone | Scope | Status |
| --- | --- | --- |
| 0. Planning | PRD, design spec, plan, project docs | Done |
| 1. Skeleton and live count | WXT scaffold, floating card, ChatGPT adapter, exact tokenizer, live count | Done: `npm run check` passes and the manual Chrome checklist passed (10 Nov 2026) |
| 2. Model, cost, status | Model detection and picker, price table, cost, context bar, status line, pause, pill | Not started |
| 3. After-response and total | Reply-finished update, conversation total, Claude.ai and Gemini adapters | Not started |
| 4. Polish and release prep | Accessibility pass, options page, README and CONTRIBUTING, sideload build | Not started |
| Phase 2 | Tauri app, bridge, terminal plugin, clipboard/hotkey, API-key counts, thinking estimate, compare | Out of scope for MVP |

## 3. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Build tooling | WXT 0.21 (Vite) | Generates the MV3 manifest, HMR, shadow-DOM content-script UI helper, easy Firefox build later |
| UI | React 19 + TypeScript 6 (strict) | Per PRD |
| Site order | ChatGPT, then Claude.ai, then Gemini | ChatGPT has an exact open tokenizer, so the first build is verifiable |
| Licence | MIT | Simple, permissive, compatible with OFL fonts and tokenizer libraries |
| Delivery | PRD milestones 1-4, one branch each, stop after each for approval; the maintainer pushes and merges | Small reviewable steps |
| Counting | Exact for OpenAI-style models; ratio-based estimate for Claude and Gemini | No public tokenizer for those; ratios live in a data file |
| Tokenizer library | `gpt-tokenizer` 4 with the `o200k_base` encoding (GPT-4o family) | Pure JS, runs offline, import only the one encoding |
| Fonts | `@fontsource` packages (Inter 400/500, Space Grotesk 600, latin subset) | OFL licence notices ship with the packages; no manual downloads |
| Prompt selector (ChatGPT) | `[data-composer-input] [contenteditable="true"][role="textbox"]`, fallback `#prompt-textarea` | ChatGPT's composer is a ProseMirror editor without that id; class names are hashed and unstable |
| Network | None for user content | Local-only privacy promise |

Open questions still in the PRD (§18): standalone-app OS, final name and domain, extra day-one sites, how sites expose long conversations, Claude Code log format, token-count API terms, terminal capture rule, publishing route.

## 4. Architecture

```
Page (chatgpt.com)
  └─ content script (entrypoints/content.tsx, WXT)
       ├─ chatgptAdapter   → finds the prompt box, reads its text
       ├─ watchPrompt      → MutationObserver + input events on that box only, 30 ms debounce,
       │                     re-binds every 500 ms if the site replaces the element
       ├─ core/            → isSecureField, countPromptTokens (o200k_base)
       └─ shadow-DOM React card (components/Card.tsx), draggable, never takes focus
```

**Data flow:** adapter finds the prompt box → `watchPrompt` reports its text → `countPromptTokens` counts it → `Card` renders the number.

**Layout (built)**

| Path | Purpose |
| --- | --- |
| `entrypoints/content.tsx` | Content script: picks the adapter, mounts the card in a shadow root |
| `components/Card.tsx`, `Card.css` | The floating card (chip, count, unit line); header is the drag handle |
| `adapters/types.ts`, `adapters/chatgpt.ts` | `SiteAdapter` interface and the ChatGPT adapter |
| `core/tokenizer.ts`, `core/secure-field.ts` | Pure logic, with `*.test.ts` |
| `lib/watch-prompt.ts`, `lib/use-prompt-tokens.ts` | Prompt watcher and the React hook that drives the count |
| `styles/tokens.css` | Design tokens (Milestone 1 subset of `design.md`) |
| `wxt.config.ts`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts` | Tooling config |

**Planned:** `entrypoints/options/`, more components (Pill, Meter, StatusLine, ModelChip, PauseButton, icons), `data/ratios.json`, `data/model-prices.json`, Claude.ai and Gemini adapters.

### SiteAdapter contract
Built: `id`, `matches(url)`, `getPromptElement(doc)`, `readPromptText(el)`. Planned: `getModelLabel()`, `getMessages()`, `onReplyDone(cb)`. Adapters read only the prompt box (later also the visible reply text and model label).

## 5. Behaviour rules

- Numbers are labelled **exact** or **est.**; costs are labelled as API-equivalent estimates excluding hidden thinking and system prompt.
- Context colour: green below 70%, amber from 70%, red from 90% (adjustable). Colour is never the only signal. *(planned, Milestone 2)*
- Four status states only: Tracking, Paused, Not tracking, Ignoring. Non-live states dim the number and meter (not the footer) and show "last count · not live". *(planned, Milestone 2)*
- Performance target: count updates within 100 ms for prompts up to 10k tokens. Measured tokenizing time in Node: about 0.6 ms for 10k simple tokens, about 6 ms for 16k mixed-unicode tokens, so no worker is needed.
- Idle CPU under 1%. The watcher observes only the prompt box and polls with one cheap `querySelector` every 500 ms. *(not measured yet)*

## 6. Design notes and gaps

Values come from `design.md`, verified against `Tictic_Tokn_UI.html`. Known fixes to apply while building: SVG icons instead of ❚❚ / ▶ glyphs, do not dim the footer, trim-hint copy from the real target (for example "trim ~12k to get under 65%"). Undesigned items (collapse control, model picker, "Model not detected", settings, first-run, full red card) must be added to `design.md` before they are built.

Milestone 1 card shows only the chip, count and unit line. The chip text "GPT-4o · exact" is a **fixed placeholder**: the `o200k_base` tokenizer is exact for GPT-4o, but which tokenizer ChatGPT's current free-plan model uses is not verified yet. This is resolved by the model alias table in Milestone 2.

**Finding (free plan):** chatgpt.com on a free account shows no model name anywhere, so there is nothing to detect. On ChatGPT the manual model picker will be the normal path in Milestone 2, not just a fallback.

## 7. Known limits (Milestone 1)

- Only chatgpt.com is supported. The selector was taken from the home-screen composer and confirmed to work in an open conversation too (free plan). Other plans or future layouts may differ.
- The extension bundle is about 2.5 MB (`content.js` 2.3 MB, mostly the `o200k_base` vocabulary; `content.css` 188 kB, mostly embedded fonts). Fine for a sideloaded build.
- Fonts are embedded as data URIs and render correctly on chatgpt.com. If another site's content security policy blocks them, the card falls back to the system font and still works.
- 9 moderate `npm audit` findings exist in dev-time build tooling (a `minimatch` range). Production dependencies report 0.
- The reference count for `gpt-tokenizer` is checked against one known value ("Hello world" = 2 tokens). A larger fixed test set against the official tokenizer is planned for Milestone 4.

## 8. How to build and verify

```bash
npm install
npm run check          # typecheck, lint, tests, build (22 tests)
```

Then in Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked** → select `.output/chrome-mv3`.

**Milestone 1 manual checklist (chatgpt.com)**

| # | Check | Pass if |
| --- | --- | --- |
| 1 | `npm run check` | all four steps pass |
| 2 | Load unpacked build | loads with no errors |
| 3 | Open chatgpt.com | dark card appears bottom right, about 320 px wide, chip "GPT-4o · exact" |
| 4 | Type "Hello world" | count shows 2 |
| 5 | Paste long text, then delete it | count rises and falls without lag and returns to 0 |
| 6 | Type in another input on the page | count does not change |
| 7 | Click into the prompt box, then drag the card by its header | typing and focus are not disturbed; card moves and stays in view |
| 8 | Open a non-allow-listed site (for example google.com) | no card |
| 9 | Compare with `Tictic_Tokn_UI.html` | colours, spacing and fonts (Space Grotesk number, Inter text) match |
| 10 | DevTools console | no errors from the extension |

## 9. Milestone log

### Milestone 0: Planning (10 Nov 2026)
- PRD v2 and design spec reviewed; reference HTML checked against `design.md`.
- Decisions agreed. `CLAUDE.md` project section, this document and `README.md` created.

### Milestone 1: Skeleton and live count (10 Nov 2026)
- Scaffolded WXT + React + TypeScript (strict, `any` is a lint error), ESLint, Vitest (jsdom) and `npm run check`.
- Added `core/tokenizer.ts` (o200k_base), `core/secure-field.ts`, `adapters/chatgpt.ts` (reads ProseMirror paragraphs and soft breaks as newlines), `lib/watch-prompt.ts` and the draggable shadow-DOM card.
- 22 unit tests cover the tokenizer (reference value, unicode, 10k-token timing), secure fields, the ChatGPT adapter (using the real composer HTML) and the watcher (changes, ignored areas, re-binding, cleanup).
- Fix during build: `tsconfig` must include `.wxt/wxt.d.ts` explicitly because `**` globs skip dot-directories.
- Verified manually in Chrome on chatgpt.com (free plan): all 10 checklist items passed, including an open conversation and the Space Grotesk / Inter fonts.
- Not in this milestone: model detection, cost, meter, status line, pause, pill (Milestone 2).
