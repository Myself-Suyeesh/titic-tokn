import { isSecureField } from '../core/secure-field';
import type { SiteAdapter } from './types';

// Stable attributes only. ChatGPT's hashed class names change between deploys.
const PROMPT_SELECTORS = [
  '[data-composer-input] [contenteditable="true"][role="textbox"]',
  '#prompt-textarea',
];

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'PRE', 'LI', 'UL', 'OL', 'BLOCKQUOTE',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
]);

function textOf(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof HTMLElement)) return '';
  if (node.tagName === 'BR') {
    return node.classList.contains('ProseMirror-trailingBreak') ? '' : '\n';
  }
  let out = '';
  node.childNodes.forEach((child, index) => {
    const isBlock = child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName);
    if (isBlock && index > 0) out += '\n';
    out += textOf(child);
  });
  return out;
}

export const chatgptAdapter: SiteAdapter = {
  id: 'chatgpt',
  name: 'ChatGPT',
  modelFamily: 'openai',

  matches(url) {
    return url.hostname === 'chatgpt.com';
  },

  getPromptElement(doc) {
    for (const selector of PROMPT_SELECTORS) {
      const candidates = Array.from(doc.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !isSecureField(el),
      );
      if (candidates.length === 0) continue;
      // ChatGPT keeps old composers in the page, hidden, after you switch chats.
      // Prefer the one with focus, then a visible one, then the first.
      const active = doc.activeElement;
      return (
        candidates.find((el) => active !== null && el.contains(active)) ??
        candidates.find((el) => el.getClientRects().length > 0) ??
        candidates[0] ??
        null
      );
    }
    return null;
  },

  readPromptText(el) {
    if (el instanceof HTMLTextAreaElement) return el.value;
    return textOf(el);
  },

  // ChatGPT's free plan shows no model name anywhere on the page, so there is
  // nothing to read and the user picks a model. A selector for paid plans that
  // show a model switcher can be added here.
  getModelLabel() {
    return null;
  },
};
