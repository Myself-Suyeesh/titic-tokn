# Tictic Tokn

**A live token meter that floats over whatever AI tool you are using.**

Tictic Tokn shows how many tokens your prompt will use while you type, updates when the reply finishes, and keeps a running estimate of the whole conversation, with an approximate cost and how full the context window is. Everything runs locally in your browser.

> **Status: pre-alpha.** Milestones 1 and 2 are done: on chatgpt.com a floating card shows a live token count, an estimated cost, a context-window bar and a status line, with a model picker, pause and a collapsed pill. Reply tracking, the conversation total, Claude.ai and Gemini are still to come. The feature list below describes the finished MVP; see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for exactly what works today.

## Why

- Long prompts hit context limits or surprise API bills without warning.
- Existing counters need you to paste text into a website.
- Models re-read the whole conversation each turn, so the prompt alone understates what is in use.

## Features (MVP, planned)

- Floating, draggable card on ChatGPT, Claude.ai and Gemini; collapses to a small pill; adjustable opacity.
- Live token count for the prompt box as you type.
- Model detection from the page, with a manual picker as a fallback.
- Cost estimate and context-window bar (green below 70%, amber from 70%, red from 90%).
- Update after the reply finishes, plus a conversation total ("visible conversation only").
- Status line with four states: **Tracking**, **Paused**, **Not tracking**, **Ignoring**.
- Password and payment fields are never read. A pause button stops all capture.

## Accuracy, honestly

| Model family | Count | Label |
| --- | --- | --- |
| OpenAI models the tokenizer library lists (GPT-4o, GPT-5 up to 5.6 Sol/Terra/Luna, o-series) | Exact | `exact` |
| Newer OpenAI models it does not list yet (GPT-6 family) | Counted with the closest known tokenizer | `est.` |
| Claude, Gemini | Heuristic estimate | `est.` |

- Costs are **API-equivalent estimates** from a bundled public price table (with its snapshot date). They exclude hidden thinking and system prompts, and are not an invoice.
- The conversation total counts only what is visible on the page, so in long chats it can be a floor.
- Exact billed usage is not available from chat web apps, so this project does not pretend to show it.

## Privacy

- All processing is local. No text is sent to any server.
- Runs only on allow-listed sites, which you can edit.
- Reads only the prompt box, visible reply and model label. No keystroke logging.
- Open source, so you can check.

## Install and use

The extension is not on any store yet. For now you can build it and load it unpacked in Chrome (Node 22 or newer):

```bash
git clone https://github.com/Myself-Suyeesh/titic-tokn.git
cd titic-tokn
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked** and select `.output/chrome-mv3`. Open chatgpt.com and start typing: pick your model once from the chip on the card (ChatGPT's free plan shows no model name to detect), and the card shows the token count, estimated cost and how full the context window is. (Claude.ai and Gemini arrive in a later milestone.)

For development: `npm run dev` (live reload), `npm run check` (typecheck, lint, tests, build).

## Tech

WXT (Vite) · React · TypeScript (strict) · Manifest V3 · Vitest. Inter and Space Grotesk fonts (SIL Open Font License) are bundled.

## Roadmap

1. Skeleton and live count (ChatGPT)
2. Model detection, cost, context bar, status line, pause
3. After-response update, conversation total, Claude.ai and Gemini
4. Polish, docs, sideload build
5. Later: Tauri desktop app, terminal plugin, clipboard/hotkey counting, optional exact counts with your own API key, thinking-token estimate

Details are in [prd.md](prd.md); visual spec in [design.md](design.md).

## Contributing

Site adapters are small, isolated files so that fixing a site after a layout change is a small change. A contribution guide (`CONTRIBUTING.md`) will arrive with milestone 4.

## Licence

MIT, see [LICENSE](LICENSE). Bundled fonts keep their own OFL licence notices.
