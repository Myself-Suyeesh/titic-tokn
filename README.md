# Tictic Tokn

**A live token meter that floats over whatever AI tool you are using.**

Tictic Tokn shows how many tokens your prompt will use while you type, updates when the reply finishes, and keeps a running estimate of the whole conversation, with an approximate cost and how full the context window is. Everything runs locally in your browser.

> **Status: pre-alpha, in planning.** No code has been written yet, so there is nothing to install. This README describes what the MVP will do and is updated as each milestone lands. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the current state.

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
| OpenAI-style (open tokenizer) | Exact | `exact` |
| Claude, Gemini | Heuristic estimate | `est.` |

- Costs are **API-equivalent estimates** from a bundled public price table (with its snapshot date). They exclude hidden thinking and system prompts, and are not an invoice.
- The conversation total counts only what is visible on the page, so in long chats it can be a floor.
- Exact billed usage is not available from chat web apps, so this project does not pretend to show it.

## Privacy

- All processing is local. No text is sent to any server.
- Runs only on allow-listed sites, which you can edit.
- Reads only the prompt box, visible reply and model label. No keystroke logging.
- Open source, so you can check.

## Install and use (once the MVP is built)

Not available yet. The plan is a sideloaded Chrome extension:

```bash
git clone https://github.com/Myself-Suyeesh/titic-tokn.git
cd titic-tokn
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked** and select `.output/chrome-mv3`. Open ChatGPT, Claude.ai or Gemini and start typing.

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

MIT (the `LICENSE` file will be added with the first code). Bundled fonts keep their own OFL licence notices.
