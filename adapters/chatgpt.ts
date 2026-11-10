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

  matches(url) {
    return url.hostname === 'chatgpt.com';
  },

  getPromptElement(doc) {
    for (const selector of PROMPT_SELECTORS) {
      const el = doc.querySelector<HTMLElement>(selector);
      if (el && !isSecureField(el)) return el;
    }
    return null;
  },

  readPromptText(el) {
    if (el instanceof HTMLTextAreaElement) return el.value;
    return textOf(el);
  },
};
