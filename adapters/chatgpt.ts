import { isSecureField } from '../core/secure-field';
import type { ConversationMessage, SiteAdapter } from './types';

// Stable attributes only. ChatGPT's hashed class names change between deploys.
const PROMPT_SELECTORS = [
  '[data-composer-input] [contenteditable="true"][role="textbox"]',
  '#prompt-textarea',
];

// Conversation structure (chatgpt.com, Nov 2026): one [data-turn-key] per exchange, holding
// both the user's message and the reply. Turns also contain hidden headings and action
// buttons, so only the two message elements below are ever read. In very long chats ChatGPT
// keeps a tall empty spacer for off-screen messages, so a message's text can be empty.
const CONVERSATION_ROOT = '[data-thread-find-target="conversation"]';
const TURN = '[data-turn-key]';
const USER_MESSAGE = '[data-user-message-bubble="true"]';
// Muted (tertiary-tone) blocks share the reply's attribute but are not the reply.
const ASSISTANT_MESSAGE = '[data-markdown-text-style="assistant-message"]:not([data-markdown-text-tone="tertiary"])';

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'PRE', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'TR', 'TD', 'TH',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
]);

function textOf(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof HTMLElement)) return '';
  if (node.tagName === 'BUTTON') return ''; // for example "Copy code" inside a code block
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

/**
 * ChatGPT keeps the previous chat's conversation in the page, hidden, after you
 * switch chats. Only a visible conversation is ever read (the newest if several
 * are visible). On a new chat nothing is visible, so there is no conversation.
 */
function pickConversationRoot(doc: Document): HTMLElement | null {
  const roots = Array.from(doc.querySelectorAll<HTMLElement>(CONVERSATION_ROOT)).reverse();
  return roots.find((el) => el.getClientRects().length > 0) ?? null;
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

  getConversationRoot(doc) {
    return pickConversationRoot(doc);
  },

  getMessages(doc) {
    const root = pickConversationRoot(doc);
    if (!root) return [];
    const messages: ConversationMessage[] = [];
    for (const turn of root.querySelectorAll<HTMLElement>(TURN)) {
      const key = turn.dataset.turnKey ?? '';
      const seen = { user: 0, assistant: 0 };
      for (const el of turn.querySelectorAll<HTMLElement>(`${USER_MESSAGE}, ${ASSISTANT_MESSAGE}`)) {
        const role = el.matches(USER_MESSAGE) ? 'user' : 'assistant';
        messages.push({ id: `${key}:${role}:${seen[role]++}`, role, text: textOf(el) });
      }
    }
    return messages;
  },

  // ChatGPT's free plan shows no model name anywhere on the page, so there is
  // nothing to read and the user picks a model. A selector for paid plans that
  // show a model switcher can be added here.
  getModelLabel() {
    return null;
  },
};
