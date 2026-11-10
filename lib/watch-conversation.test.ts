import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConversationMessage, SiteAdapter } from '../adapters/types';
import { watchConversation } from './watch-conversation';

const adapter: SiteAdapter = {
  id: 'test',
  name: 'Test',
  modelFamily: 'openai',
  matches: () => true,
  getPromptElement: () => null,
  readPromptText: () => '',
  getModelLabel: () => null,
  getConversationRoot: (doc) => doc.querySelector<HTMLElement>('#chat'),
  getMessages: (doc) =>
    Array.from(doc.querySelectorAll('#chat p')).map((p, i) => ({
      id: `m${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: p.textContent ?? '',
    })),
};

const flushMutations = () => Promise.resolve();

describe('watchConversation', () => {
  let stop: () => void = () => {};
  let seen: ConversationMessage[][];

  beforeEach(() => {
    vi.useFakeTimers();
    seen = [];
    document.body.innerHTML = '<div id="chat"><p>hello</p></div>';
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
  });

  const start = () => {
    stop = watchConversation(adapter, document, (m) => seen.push(m));
  };

  it('reads the conversation shortly after it appears', () => {
    start();
    vi.advanceTimersByTime(50);
    expect(seen).toEqual([[{ id: 'm0', role: 'user', text: 'hello' }]]);
  });

  it('reports an empty conversation once when it starts on a page with none (a new chat)', () => {
    document.body.innerHTML = '<div id="home"></div>';
    start();
    vi.advanceTimersByTime(50);
    expect(seen).toEqual([[]]);
  });

  it('overwrites what an earlier watcher left behind (leaving the prompt box and coming back on a new chat)', () => {
    let shownByCard: ConversationMessage[] = [];
    const first = watchConversation(adapter, document, (m) => (shownByCard = m));
    vi.advanceTimersByTime(50);
    expect(shownByCard).toHaveLength(1); // the old chat's messages
    first(); // focus left the prompt box: the watcher is switched off
    document.body.innerHTML = '<div id="home"></div>'; // the user opened a new chat
    stop = watchConversation(adapter, document, (m) => (shownByCard = m)); // focus came back
    vi.advanceTimersByTime(50);
    expect(shownByCard).toEqual([]);
  });

  it('reads a streaming reply once, after the page has been quiet for a second', async () => {
    start();
    vi.advanceTimersByTime(50);
    const reply = document.createElement('p');
    document.getElementById('chat')!.append(reply);
    for (const word of ['Hi', 'Hi there', 'Hi there!']) {
      reply.textContent = word; // simulated tokens arriving
      await flushMutations();
      vi.advanceTimersByTime(300); // still streaming: no read yet
    }
    expect(seen).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(seen).toHaveLength(2);
    expect(seen[1]?.at(-1)).toEqual({ id: 'm1', role: 'assistant', text: 'Hi there!' });
  });

  it('does not report when nothing visible changed', async () => {
    start();
    vi.advanceTimersByTime(50);
    document.getElementById('chat')!.setAttribute('data-x', '1'); // not a text change
    await flushMutations();
    vi.advanceTimersByTime(1500);
    expect(seen).toHaveLength(1);
  });

  it('re-binds and reports an empty conversation when the root goes away (new chat)', () => {
    start();
    vi.advanceTimersByTime(50);
    document.body.innerHTML = '<div id="home"></div>';
    vi.advanceTimersByTime(600);
    expect(seen.at(-1)).toEqual([]);
  });

  it('picks up a new conversation element after switching chats', () => {
    start();
    vi.advanceTimersByTime(50);
    document.body.innerHTML = '<div id="chat"><p>other chat</p></div>';
    vi.advanceTimersByTime(700);
    expect(seen.at(-1)).toEqual([{ id: 'm0', role: 'user', text: 'other chat' }]);
  });

  it('stops reading after cleanup', async () => {
    start();
    vi.advanceTimersByTime(50);
    stop();
    document.getElementById('chat')!.append(document.createElement('p'));
    await flushMutations();
    vi.advanceTimersByTime(3000);
    expect(seen).toHaveLength(1);
  });
});
