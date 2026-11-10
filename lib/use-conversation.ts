import { useEffect, useState } from 'react';
import type { ConversationMessage, SiteAdapter } from '../adapters/types';
import { watchConversation } from './watch-conversation';

/**
 * The visible conversation, refreshed after each reply. While `live` is false
 * nothing is read from the page and the last messages are kept. Held in memory
 * only, never stored or sent.
 */
export function useConversation(adapter: SiteAdapter, live: boolean): ConversationMessage[] {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  useEffect(() => (live ? watchConversation(adapter, document, setMessages) : undefined), [adapter, live]);

  return messages;
}
