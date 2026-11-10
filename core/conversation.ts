import type { ConversationMessage } from '../adapters/types';
import type { ModelInfo } from './models';
import { countFor } from './tokenizer';

export interface ConversationCount {
  /** Tokens in all messages whose text is known (a floor: per-message overhead is not counted). */
  tokens: number;
  /** Tokens in the latest reply, 0 if there is none. */
  replyTokens: number;
  exact: boolean;
  messageCount: number;
  /** Messages whose text is not in the page and was never seen, so they are not counted. */
  notLoaded: number;
}

/**
 * Remembered token counts, by model and message id. Lives in memory only, for as
 * long as the page does; the text itself is never kept.
 */
export type TokenCache = Map<string, number>;

/**
 * Counts the conversation with the model's tokenizer (or the generic estimate).
 * A message the site has unloaded (empty text) uses the count remembered from
 * when it was loaded; if it was never seen it counts as not loaded.
 */
export function countConversation(
  model: ModelInfo | null,
  messages: ConversationMessage[],
  cache: TokenCache = new Map(),
): ConversationCount {
  let tokens = 0;
  let replyTokens = 0;
  let notLoaded = 0;
  for (const message of messages) {
    const key = `${model?.id ?? 'none'}:${message.id}`;
    let n: number;
    if (message.text !== '') {
      n = countFor(model, message.text).tokens;
      cache.set(key, n);
    } else {
      const remembered = cache.get(key);
      if (remembered === undefined) notLoaded += 1;
      n = remembered ?? 0;
    }
    tokens += n;
    if (message.role === 'assistant') replyTokens = n;
  }
  return { tokens, replyTokens, exact: countFor(model, '').exact, messageCount: messages.length, notLoaded };
}
