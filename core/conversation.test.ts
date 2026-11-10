import { describe, expect, it } from 'vitest';
import type { ConversationMessage } from '../adapters/types';
import { countConversation } from './conversation';
import { getModelById } from './models';

const gpt4o = getModelById('gpt-4o');

const chat: ConversationMessage[] = [
  { id: 'u1', role: 'user', text: 'Hello world' },
  { id: 'a1', role: 'assistant', text: 'Hello world' },
  { id: 'u2', role: 'user', text: 'Hello world' },
  { id: 'a2', role: 'assistant', text: 'Hello world Hello world' },
];

describe('countConversation', () => {
  it('is empty for no messages', () => {
    expect(countConversation(gpt4o, [])).toEqual({ tokens: 0, replyTokens: 0, exact: true, messageCount: 0, notLoaded: 0 });
  });

  it('sums every message and reports the latest reply separately', () => {
    // "Hello world" is 2 tokens (o200k_base reference value)
    const result = countConversation(gpt4o, chat);
    expect(result.tokens).toBe(2 + 2 + 2 + 4);
    expect(result.replyTokens).toBe(4);
    expect(result.messageCount).toBe(4);
    expect(result.exact).toBe(true);
  });

  it('has no reply tokens when only the user has spoken', () => {
    const result = countConversation(gpt4o, [{ id: 'u1', role: 'user', text: 'Hello world' }]);
    expect(result.replyTokens).toBe(0);
    expect(result.tokens).toBe(2);
  });

  it('uses the generic estimate, and says so, with no model', () => {
    const result = countConversation(null, [{ id: 'u1', role: 'user', text: 'abcdefgh' }]);
    expect(result.tokens).toBe(2);
    expect(result.exact).toBe(false);
  });

  it('is not exact for a model whose tokenizer is unverified', () => {
    const gpt6 = getModelById('gpt-6-sol');
    expect(countConversation(gpt6, chat).exact).toBe(false);
  });
});

describe('countConversation with messages the site has unloaded', () => {
  const unloaded = (id: string, role: 'user' | 'assistant'): ConversationMessage => ({ id, role, text: '' });

  it('flags messages that were never seen and counts them as zero', () => {
    const result = countConversation(gpt4o, [chat[0]!, unloaded('a1', 'assistant'), unloaded('a9', 'assistant')]);
    expect(result.tokens).toBe(2);
    expect(result.notLoaded).toBe(2);
    expect(result.messageCount).toBe(3);
  });

  it('keeps using the remembered count after a message is unloaded', () => {
    const cache = new Map<string, number>();
    countConversation(gpt4o, chat, cache); // everything loaded: 2 + 2 + 2 + 4
    const later = countConversation(gpt4o, [unloaded('u1', 'user'), unloaded('a1', 'assistant'), chat[2]!, chat[3]!], cache);
    expect(later.tokens).toBe(10);
    expect(later.notLoaded).toBe(0);
    expect(later.replyTokens).toBe(4);
  });

  it('takes the fresh count when a loaded message changes (a reply still streaming)', () => {
    const cache = new Map<string, number>();
    countConversation(gpt4o, [{ id: 'a1', role: 'assistant', text: 'Hello' }], cache);
    const result = countConversation(gpt4o, [{ id: 'a1', role: 'assistant', text: 'Hello world Hello world' }], cache);
    expect(result.tokens).toBe(4);
  });

  it('does not reuse a count remembered for a different model', () => {
    const cache = new Map<string, number>();
    countConversation(gpt4o, chat, cache);
    const other = countConversation(getModelById('gpt-5'), [unloaded('u1', 'user')], cache);
    expect(other.notLoaded).toBe(1);
  });
});
