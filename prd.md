# Tictic Tokn: Product Requirements Document

Working name · Draft v2 · 10 Nov 2026 · Owner: Suyeesh

**What changed in v2:** four core capabilities defined with honest feasibility; estimated pricing replaces any notion of exact billed cost; MVP re-scoped to a browser extension with an in-page floating widget; model detection and thinking-token estimates added; open-source and zero-paid-services constraints made explicit; UI requirements aligned with the latest design (see `design.md`).

## 1. Overview

Tictic Tokn is a small floating meter that shows, live, how many tokens (and roughly what cost) the prompt you are typing will use, then updates once the reply arrives and keeps a running estimate for the whole conversation. It starts as a browser extension for AI chat sites and grows into a standalone app that also covers terminal CLI tools and desktop apps.

**One-line pitch:** a live token meter that floats over whatever AI tool you are using.

**Why it exists:** built for fun and to learn Claude Code. It is an open-source project that uses no paid services. It is not planned as a business.

## 2. Problem

- People write long prompts without knowing their size, then hit context limits or unexpected API bills.
- Existing token counters are websites or single-browser extensions: you must paste text into them, and most do not cover terminals (Claude Code, Aider, etc.) or desktop apps.
- Different models tokenize differently, so one count is rarely enough.
- A model re-reads the whole conversation each turn, so the prompt alone understates what is really in use.

## 3. Target users

1. **Developers using AI APIs and CLIs** (primary): care about cost and context limits.
2. **Prompt engineers and power users:** trimming prompts, comparing models.
3. **Everyday chat users** (secondary): mostly want to know "will this fit?"

## 4. Goals and non-goals

**Goals**

- Live token count while typing, with under 100 ms update latency for typical prompts.
- Update the count when the reply finishes; keep a running estimate for the conversation.
- Estimated cost from published per-token prices, always labelled as an estimate.
- Detect which model the user is using and adapt tokenizer, price and context window.
- Fully local: typed text never leaves the machine by default.
- Free and open source, with no paid backend, paid API or subscription.
- Minimal UI: a floating window and nothing else by default.

**Non-goals**

- No exact billed usage or exact billed cost. Chat apps (ChatGPT, Claude.ai) do not expose it, and the product does not pretend to.
- Not a prompt editor, chat client or prompt library.
- No cloud accounts or sync.
- No guarantee of exact counts for models whose tokenizer is not public.
- No keystroke logging.
- Not a commercial product (no pricing tiers, no growth targets).

## 5. Core capabilities and feasibility

| # | Capability | What v1 does | Accuracy |
| --- | --- | --- | --- |
| 1 | Live count while typing | Reads the main prompt box and tokenizes it locally | Exact for OpenAI-style models (open tokenizer); exact for open models with a public tokenizer; **estimated** for Claude and Gemini unless the user adds their own API key |
| 2 | Update after the response | When the reply finishes streaming, counts the visible reply text and updates the meter | Same accuracy rules as #1. Hidden thinking is not visible, so it is not included (see section 9) |
| 3 | End-to-end estimate with pricing | Prompt + visible conversation + visible reply, multiplied by per-token prices | **Always an estimate.** Excludes hidden system prompts and hidden thinking |
| 4 | Model detection | Reads the model name from the page's model selector through a per-site adapter; falls back to a manual picker remembered per site | Reliable on supported sites until a site changes its layout |

**Not possible, so out of scope:** exact billed usage from chat web apps; exact hidden-thinking token counts while the model is thinking; model detection in arbitrary desktop apps.

## 6. Core user flow

1. User installs the extension; on an allow-listed AI site a floating card appears (draggable, collapsible to a pill).
2. The card shows the detected model (for example "GPT-4o · exact"). If detection fails, the user picks a model once and it is remembered for that site.
3. As the user types in the prompt box, the token count, estimated cost and % of context window update live.
4. When the reply finishes, the count updates to include it, and the conversation total is re-estimated.
5. The card changes colour (green, amber, red) as the conversation nears the model's context limit.
6. A status line always shows what is being counted, or why nothing is (see section 12).

## 7. Features and phases

### MVP (Phase 1): browser extension

- In-page floating widget on allow-listed sites (ChatGPT, Claude.ai and Gemini first), built with React + TypeScript; draggable; collapse to a pill; opacity control.
- Live prompt count from the main prompt box, through per-site adapters (not any focused input).
- Model detection from the page, with a manual model picker as fallback.
- Tokenizers: exact for OpenAI-style models, estimate heuristics for Claude and Gemini, every number labelled exact or est.
- After-response update: count the visible reply when streaming ends.
- Conversation total: estimate from the visible conversation plus the current prompt, labelled "visible conversation only".
- Estimated cost: bundled snapshot of the open price and context-window table, user-editable.
- Context-window bar with colour states (thresholds in section 12).
- Status line with four states (Tracking, Paused, Not tracking, Ignoring); visible pause toggle; count dims when not live.
- Secure fields (password, payment) are never read.
- Open-source repo with a clear README and a contribution guide for adding site adapters.

### Phase 2: standalone app and more surfaces

- Tauri desktop app with the same floating card, plus a local WebSocket bridge (127.0.0.1, random port, auth token).
- Clipboard watcher and global hotkey (count whatever was just copied or selected): the route for desktop apps.
- **Terminal feeder:** shell plugin (zsh and bash first) that sends the current input buffer live, only under the capture rule decided in section 18. Never captures password or secret prompts.
- Optional exact counts for Claude and Gemini through their token-count APIs, with the user's own key (bring your own key; nothing paid on our side).
- **Thinking-token estimate:** while a model is thinking, show "thinking: at least ~N tokens (est.)" from any visible reasoning text, plus elapsed time; replace with the exact figure only where the surface reports it.
- Side-by-side comparison across 2 to 3 models.
- Price refresh from the open price table on a schedule, with the bundled snapshot as fallback.
- Tray icon, launch at login, light and dark theme.

### Later

- Accessibility-API feeder for desktop apps (macOS AX, Windows UI Automation), best effort.
- Read Claude Code's local session logs for exact usage after each reply (format must be verified first; see section 18).
- Firefox support and a sideload build.
- "Prompt is bloated" hints with a suggested trimmed version.
- Per-app profiles (for example always use a given model in a given tab).

## 8. Technical architecture

| Component | Choice | Notes |
| --- | --- | --- |
| MVP shell | Browser extension (Manifest V3) | Content script injects a shadow-DOM widget; no backend |
| UI | React + TypeScript | Matches existing stack |
| Token engine | Open-source tokenizer libraries (for example js-tiktoken or gpt-tokenizer for OpenAI-style models; Hugging Face tokenizers for open models) | Runs locally and offline |
| Estimates (Claude, Gemini) | Per-model characters-to-tokens ratio kept in a config file | Ratios drift between model versions, so they are updatable data, not hard-coded |
| Optional exact counts | Anthropic and Gemini token-count APIs, user's own key | Optional; terms and limits to be re-verified before building |
| Price and context data | Open community-maintained model price table (LiteLLM's `model_prices_and_context_window.json`), bundled snapshot plus refresh | User can override any value |
| Settings and state | `chrome.storage.local` (extension), local JSON (app) | No cloud |
| Phase 2 shell | Tauri (Rust) | Small footprint, always-on-top window |
| Local bridge | WebSocket on 127.0.0.1 | Feeders push text plus a source label; random port plus auth token |
| Terminal feeder | zsh/bash plugin | Reads line-editor buffer, sends to bridge |
| Desktop feeder | OS accessibility APIs | Best effort, later |

**Data flow:** feeder captures text (excluding secure fields) with a source label, the token engine counts it, pricing and context data turn the count into cost and percentage, and the widget updates.

## 9. Token accuracy and what is counted

- **Exact** means the count comes from the model's own public tokenizer. **Est.** means it does not. Every number in the UI says which.
- **Three buckets per turn:** your prompt (countable), the model's reply (countable only after it is written) and hidden thinking (billed but often not visible).
- **Conversation re-read:** models re-read earlier turns, so the meter's context percentage is based on the estimated conversation total, not just the new prompt.
- **Visible conversation only:** the extension can count only what is rendered on the page. Long chats that load lazily or hide older messages can make the total a floor.
- **Hidden thinking:** never counted as exact. Where visible reasoning text exists, it is shown as a floor ("at least ~N, est."). Where nothing is visible, only elapsed time is shown.
- **Hidden system prompts and tool definitions:** not counted; stated in the cost label.

## 10. Model detection

- Each site adapter reads the model name shown in the page (selector or header) and maps it to a model entry through an alias table.
- If the name is unknown or cannot be read, the card shows "Model not detected" and asks the user to pick one; the choice is remembered per site.
- Unknown models use a generic estimate and are marked est.
- Detection runs only on allow-listed sites and reads only the model label, never message content.
- Adapters are small, separate files so the community can fix them when a site changes its layout.

## 11. Pricing estimate

- **Formula:** estimated cost = (input tokens × input price) + (output tokens × output price).
- Input tokens are the prompt plus the visible conversation so far; output tokens are the visible reply.
- Prices come from the open price table, can be edited by the user and are shown with the date of the snapshot.
- Label: "API-equivalent estimate, excludes hidden thinking and system prompt." People on subscription plans are not billed per token, so the figure is a comparison, not an invoice.
- Cached-input discounts, batch pricing and tiered long-context rates are ignored in v1 and noted in the label where relevant.

## 12. UX and UI requirements

The visual source of truth is `design.md`, derived from the latest design file.

- **Card size:** about 320 px wide (the earlier 220 × 90 px target is replaced); collapsible to a 44 px pill showing only the number and a colour dot.
- Primary number is the token count, large and readable; cost and % of context sit below it; model chip at the top, pause toggle at the top right.
- Never steals focus from the app or page the user is typing in.
- **Colour states by context use (defaults, adjustable):** green below 70%, amber from 70%, red from 90%. Colour is never the only signal; the pill and bar also change fill.
- **Status line** shows the source (for example "Tracking: Claude.ai prompt box") and one of four states, each with a distinct icon and label:
  - **Tracking:** green dot.
  - **Paused:** pause icon; capture is off.
  - **Not tracking:** hollow ring; focus is outside the prompt box or allowed sites.
  - **Ignoring:** lock icon; a password or payment field has focus.
- When Paused, Not tracking or Ignoring, the count and meter dim and are labelled "last count, not live". Nothing typed in an ignored field is read or stored.
- In clipboard or hotkey mode (Phase 2) the status line shows a clipboard source (for example "Clipboard · 2s ago") instead of a tracking state.
- Dimming applies to the number and meter. Footer text (cost, percentage) must keep at least 4.5:1 contrast.
- Optional click-through mode so the card never blocks what is underneath.
- Keyboard: hotkey to show/hide and to pause; Phase 2 adds a clipboard-count hotkey.
- Respects system light/dark in Phase 2 (the first design is dark-only).

## 13. Privacy and security

- All processing is local; no text is sent to any server by default.
- The extension requests only the permissions it needs, and runs only on the allow-listed sites, which the user can edit.
- No global keystroke logging. Feeders read only the prompt box (and the visible reply and model label for the counters) of an allow-listed site, only while it is relevant.
- Password, payment and other secure fields are excluded inside the feeder, so that text never reaches storage or the bridge.
- Optional API keys are stored locally (extension storage; OS keychain in the app) and used only for count requests the user turns on.
- A visible pause toggle stops all capture instantly.
- Code is open source so the privacy claims can be checked.

## 14. Platform support

| Surface | Mode | Accuracy of capture | Phase |
| --- | --- | --- | --- |
| Browser AI chats | Extension feeder with in-page widget | High, live | MVP |
| Terminal CLIs | Shell plugin | High, live (supported shells) | 2 |
| Desktop apps | Clipboard/hotkey, then accessibility API | Medium | 2 / Later |
| Anything else | Clipboard/hotkey | Manual | 2 |

OS priority for the standalone app is still to be confirmed (Windows, macOS, Linux); accessibility work differs per OS.

## 15. Milestones (rough, built for learning, not a deadline)

1. **Step 1:** extension skeleton, floating widget, one site adapter (prompt box), OpenAI-style tokenizer, live count.
2. **Step 2:** model detection and manual picker, price and context table, cost estimate, context bar, status line and pause.
3. **Step 3:** after-response update and conversation total; add the next two site adapters.
4. **Step 4:** polish, README, contribution guide, public repo and a store or sideload build.
5. **Phase 2:** Tauri app and bridge, clipboard and hotkey, terminal plugin, optional exact counts, thinking-token estimate.
6. **Later:** accessibility feeder, Claude Code log reader, Firefox.

## 16. Success metrics

Because this is a learning project, the measures are about quality, not growth.

- Count updates within 100 ms of typing for prompts up to 10k tokens, including status updates.
- OpenAI-style counts match the reference tokenizer exactly on a fixed test set.
- Estimates for Claude and Gemini land within a stated tolerance of the vendor count on a test set (target to be set once measured).
- Works on the three day-one sites; a broken adapter can be fixed in a small, isolated change.
- Idle CPU under 1% and low memory use.
- Qualitative: the author actually uses it, and it teaches the Claude Code workflow end to end.

## 17. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Chat sites change their layout and break adapters or model detection | Per-site adapters in separate files, manual model picker fallback, open-source contributions |
| No public tokenizer for some models | Label estimates; optional exact counts through the user's own key |
| Visible conversation is incomplete (lazy-loaded or hidden messages) | Label as "visible conversation only"; treat the total as a floor |
| Hidden thinking and system prompts are not countable | State exclusions in the cost label; show thinking only as a floor |
| Price table is out of date or wrong for a user's plan | Show snapshot date; let the user edit prices |
| Feeder reads the wrong field (for example a search box on an AI site) | Adapters target only the prompt box; status line shows what is tracked |
| Shell plugin reads sensitive command lines (sudo prompts, pasted keys) | Capture rule in section 18; never capture password or secret prompts |
| Privacy concerns about reading input | Local-only, allow-list, pause toggle, open source |
| Store fees or review delays for publishing | Sideload and Firefox builds; check current store terms before publishing |
| Name clash with an existing brand | Run trademark, domain and package checks before launch |

## 18. Open questions

- Which OS comes first for the standalone app: Windows, macOS or Linux?
- Which open-source license?
- Final product name and domain ("Tictic Tokn" is the working name).
- Which AI sites are on the day-one allow-list beyond ChatGPT, Claude.ai and Gemini?
- How does each site expose the conversation (virtualized lists, lazy loading), and is the visible-only total good enough?
- Claude Code's local session logs: do they contain per-response token usage, and in what format? (Must be checked before relying on them.)
- Terms, limits and key requirements of the Claude and Gemini token-count APIs, to re-verify before building the optional exact-count feature.
- Terminal capture rule (open): capture only while a known AI CLI is running, opt-in per terminal session, or only after a prefix or hotkey?
- Publishing route: store listing (with its fee) or sideload only, at least at first.
