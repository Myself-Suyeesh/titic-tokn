# Tictic Tokn: Development Document

> Living document. It is updated at the end of every milestone and always describes the **current** state of the repo. Anything not yet built is marked *planned*.

**Last updated:** 10 Nov 2026 · **Current milestone:** none started (planning complete, waiting for "go")

## 1. What this project is

A small floating meter that shows, live, how many tokens (and roughly what cost) the prompt you are typing will use, updates when the reply finishes, and keeps a running estimate for the conversation. The MVP is a Manifest V3 Chrome extension for ChatGPT, Claude.ai and Gemini. It is free, open source, fully local and not a business.

Source documents: [`prd.md`](../prd.md) (requirements), [`design.md`](../design.md) (visual spec), `Tictic_Tokn_UI.html` (reference render of the design; open in a browser).

## 2. Status

| Milestone | Scope | Status |
| --- | --- | --- |
| 0. Planning | PRD, design spec, plan, project docs | Done |
| 1. Skeleton and live count | WXT scaffold, floating card, ChatGPT adapter, exact tokenizer, live count | Not started |
| 2. Model, cost, status | Model detection and picker, price table, cost, context bar, status line, pause, pill | Not started |
| 3. After-response and total | Reply-finished update, conversation total, Claude.ai and Gemini adapters | Not started |
| 4. Polish and release prep | Accessibility pass, options page, README and CONTRIBUTING, sideload build | Not started |
| Phase 2 | Tauri app, bridge, terminal plugin, clipboard/hotkey, API-key counts, thinking estimate, compare | Out of scope for MVP |

## 3. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Build tooling | WXT (Vite) | Generates the MV3 manifest, HMR, shadow-DOM content-script UI helper, easy Firefox build later |
| UI | React + TypeScript (strict) | Per PRD |
| Site order | ChatGPT, then Claude.ai, then Gemini | ChatGPT has an exact open tokenizer, so the first build is verifiable |
| Licence | MIT | Simple, permissive, compatible with OFL fonts and tokenizer libraries |
| Delivery | PRD milestones 1-4, stop after each for approval | Small reviewable steps |
| Counting | Exact for OpenAI-style models; ratio-based estimate for Claude and Gemini | No public tokenizer for those; ratios live in a data file |
| Network | None for user content | Local-only privacy promise |

Open questions still in the PRD (§18): standalone-app OS, final name and domain, extra day-one sites, how sites expose long conversations, Claude Code log format, token-count API terms, terminal capture rule, publishing route.

## 4. Architecture (planned)

```
Page (allow-listed site)
  └─ content script (WXT)
       ├─ SiteAdapter  → prompt text, model label, visible messages, "reply finished"
       ├─ secure-field check (never read password/payment fields)
       ├─ core/        → tokenizer → cost → meter state → status state machine
       └─ shadow-DOM React widget (Card / Pill), never steals focus
Settings: chrome.storage.local (model per site, prices, allow-list, opacity, position)
```

**Data flow:** adapter captures text with a source label → tokenizer counts (exact or est.) → price and context data give cost and % → widget renders.

**Planned layout**

| Path | Purpose |
| --- | --- |
| `entrypoints/content/` | Content script, widget mount |
| `entrypoints/options/` | Minimal settings page (allow-list, prices) |
| `components/` | Card, Pill, Meter, StatusLine, ModelChip, PauseButton, icons |
| `adapters/` | One file per site implementing `SiteAdapter` |
| `core/` | Tokenizer, model aliases, cost, thresholds, status machine, secure-field check (+ tests) |
| `data/` | `ratios.json`, `model-prices.json` (snapshot date included) |
| `styles/tokens.css` | Mirrors `design.md` tokens |

### SiteAdapter contract (planned)
`matches(url)`, `getPromptElement()`, `getModelLabel()`, `getMessages()`, `onReplyDone(cb)`. Adapters read only the prompt box, visible reply text and model label.

## 5. Behaviour rules

- Numbers are labelled **exact** or **est.**; costs are labelled as API-equivalent estimates excluding hidden thinking and system prompt.
- Context colour: green below 70%, amber from 70%, red from 90% (adjustable). Colour is never the only signal.
- Four status states only: Tracking, Paused, Not tracking, Ignoring. Non-live states dim the number and meter (not the footer) and show "last count · not live".
- Performance target: count updates within 100 ms for prompts up to 10k tokens (debounce; worker if needed). Idle CPU under 1%.

## 6. Design notes and gaps

Values come from `design.md`, verified against `Tictic_Tokn_UI.html`. Known fixes to apply while building: SVG icons instead of ❚❚ / ▶ glyphs, do not dim the footer, trim-hint copy from the real target (for example "trim ~12k to get under 65%"). Undesigned items (collapse control, model picker, "Model not detected", settings, first-run, full red card) must be added to `design.md` before they are built.

## 7. How to verify (per milestone)

Filled in as milestones land. Baseline for every milestone: `npm run check` passes, then load the unpacked build from `.output/chrome-mv3` in `chrome://extensions` (Developer mode) and run the milestone's manual checklist.

## 8. Milestone log

### Milestone 0: Planning (10 Nov 2026)
- PRD v2 and design spec reviewed; reference HTML checked against `design.md`.
- Decisions in §3 agreed.
- `CLAUDE.md` project section, this document and `README.md` created. No code yet.
