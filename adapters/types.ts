import type { ModelFamily } from '../core/models';

export interface ConversationMessage {
  /** Stable for the life of the message, so its token count can be remembered. */
  id: string;
  role: 'user' | 'assistant';
  /** Empty when the site has not loaded this message into the page (long chats unload off-screen messages). */
  text: string;
}

/**
 * One adapter per supported site. Adapters read only the main prompt box
 * (never any focused input) and live in their own file so a layout change on a
 * site is a small, isolated fix. The interface grows in later milestones
 * (reply-finished signal, if ever needed).
 */
export interface SiteAdapter {
  /** Stable id, used for per-site settings. */
  id: string;
  /** Name shown in the status line, for example "ChatGPT". */
  name: string;
  /** Which models the picker offers on this site. */
  modelFamily: ModelFamily;
  /** True if this adapter handles the given page URL. */
  matches(url: URL): boolean;
  /** The main prompt box, or null if it is not on the page. */
  getPromptElement(doc: Document): HTMLElement | null;
  /** The text currently typed in the prompt box. */
  readPromptText(el: HTMLElement): string;
  /** The model name shown on the page, or null if the page shows none. */
  getModelLabel(doc: Document): string | null;
  /** The element that holds the visible conversation, or null (for example on a new chat). */
  getConversationRoot(doc: Document): HTMLElement | null;
  /** The messages present in the page, in order, including ones whose text is not loaded. Reads only message text, never headings or buttons. */
  getMessages(doc: Document): ConversationMessage[];
}
