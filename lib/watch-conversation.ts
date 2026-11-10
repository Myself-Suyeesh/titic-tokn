import type { ConversationMessage, SiteAdapter } from '../adapters/types';

const FIRST_READ_MS = 30;
const REBIND_MS = 500;
/** A reply is treated as finished once the conversation has been still this long. */
export const QUIET_MS = 1000;

function sameMessages(a: ConversationMessage[], b: ConversationMessage[]): boolean {
  return a.length === b.length && a.every((m, i) => m.id === b[i]?.id && m.text === b[i]?.text);
}

/**
 * Watches the adapter's conversation and calls `onMessages` with the visible
 * messages when they change. Changes are read once the page has been quiet for
 * `quietMs`, so a streaming reply is read after it finishes, not on every token.
 * Re-binds when the site replaces the conversation element (switching chats).
 * The first read always reports, even when the conversation is empty, so it
 * replaces whatever an earlier watcher left behind. Returns a cleanup function.
 */
export function watchConversation(
  adapter: SiteAdapter,
  doc: Document,
  onMessages: (messages: ConversationMessage[]) => void,
  quietMs: number = QUIET_MS,
): () => void {
  let current: HTMLElement | null = null;
  let last: ConversationMessage[] | null = null; // null: nothing reported yet
  let timer: ReturnType<typeof setTimeout> | undefined;

  const read = () => {
    const messages = adapter.getMessages(doc);
    if (last !== null && sameMessages(messages, last)) return;
    last = messages;
    onMessages(messages);
  };

  const schedule = (delay: number) => {
    clearTimeout(timer);
    timer = setTimeout(read, delay);
  };

  const observer = new MutationObserver(() => schedule(quietMs));

  const bind = () => {
    const root = adapter.getConversationRoot(doc);
    if (root === current) return;
    observer.disconnect();
    current = root;
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true });
    schedule(FIRST_READ_MS);
  };

  const poll = setInterval(bind, REBIND_MS);
  bind();
  schedule(FIRST_READ_MS); // also covers a page with no conversation yet, where bind() has nothing to do

  return () => {
    clearTimeout(timer);
    clearInterval(poll);
    observer.disconnect();
  };
}
