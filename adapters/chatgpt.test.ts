import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatgptAdapter } from './chatgpt';

// Trimmed from the real chatgpt.com home composer (free plan, Nov 2026).
const HOME_COMPOSER = `
<div data-composer-input="">
  <div data-rich-text-layout="single-line" role="presentation">
    <div contenteditable="true" aria-multiline="true" role="textbox" class="ProseMirror" aria-label="Ask ChatGPT"><p data-empty-paragraph="true" data-placeholder="Ask ChatGPT" class="placeholder"><br class="ProseMirror-trailingBreak"></p></div>
  </div>
</div>
<input id="search" type="text" value="not the prompt">`;

function prompt(): HTMLElement {
  const el = chatgptAdapter.getPromptElement(document);
  if (!el) throw new Error('prompt box not found');
  return el;
}

describe('chatgptAdapter', () => {
  beforeEach(() => {
    document.body.innerHTML = HOME_COMPOSER;
  });

  it('matches chatgpt.com only', () => {
    expect(chatgptAdapter.matches(new URL('https://chatgpt.com/c/123'))).toBe(true);
    expect(chatgptAdapter.matches(new URL('https://example.com/'))).toBe(false);
  });

  it('finds the ProseMirror prompt box, not other inputs', () => {
    expect(prompt().classList.contains('ProseMirror')).toBe(true);
  });

  it('reads an empty box as an empty string (placeholder is not text)', () => {
    expect(chatgptAdapter.readPromptText(prompt())).toBe('');
  });

  it('reads typed text', () => {
    prompt().innerHTML = '<p>Hello world</p>';
    expect(chatgptAdapter.readPromptText(prompt())).toBe('Hello world');
  });

  it('joins paragraphs with newlines and keeps blank lines', () => {
    prompt().innerHTML = '<p>a</p><p></p><p>b</p>';
    expect(chatgptAdapter.readPromptText(prompt())).toBe('a\n\nb');
  });

  it('turns soft line breaks into newlines', () => {
    prompt().innerHTML = '<p>a<br>b</p>';
    expect(chatgptAdapter.readPromptText(prompt())).toBe('a\nb');
  });

  it('reports no model label (the free plan shows none)', () => {
    expect(chatgptAdapter.getModelLabel(document)).toBeNull();
  });

  describe('with an old hidden composer left in the page after switching chats', () => {
    const composer = (id: string) =>
      `<div data-composer-input=""><div id="${id}" contenteditable="true" role="textbox" class="ProseMirror" tabindex="0"><p><br class="ProseMirror-trailingBreak"></p></div></div>`;

    function show(el: HTMLElement) {
      vi.spyOn(el, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    }

    beforeEach(() => {
      document.body.innerHTML = composer('old') + composer('current');
    });

    it('prefers the focused composer even when it comes second', () => {
      document.getElementById('current')!.focus();
      expect(prompt().id).toBe('current');
    });

    it('prefers the visible composer when nothing has focus', () => {
      show(document.getElementById('current')!);
      expect(prompt().id).toBe('current');
    });

    it('falls back to the first composer when none can be told apart', () => {
      expect(prompt().id).toBe('old');
    });
  });

  describe('conversation', () => {
    // Shape taken from a real chatgpt.com conversation (Nov 2026): one turn per exchange, with
    // hidden role headings and action buttons that must never be counted.
    const turn = (id: string, user: string, assistant: string) => `
      <div data-turn-key="${id}"><div data-content-search-turn-key="x"><div data-talvt-turn-state="complete">
        <h4 data-conversation-role="user">You said:</h4>
        <div data-user-message-bubble="true"><div data-search-result-target=""><p>${user}</p></div></div>
        <button aria-label="Copy message">Copy message</button>
        <h4 data-conversation-role="assistant">ChatGPT said:</h4>
        <div data-markdown-text-style="assistant-message"><div>${assistant}</div></div>
        <button aria-label="Copy">Copy</button><button aria-label="Share">Share</button>
      </div></div></div>`;

    const conversation = (...turns: string[]) =>
      `<div role="region" aria-label="Conversation"><div data-thread-find-target="conversation">${turns.join('')}</div></div>`;

    // jsdom has no layout, so say that elements are visible unless a test says otherwise.
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('finds the conversation root, and null on a new chat', () => {
      document.body.innerHTML = conversation(turn('t1', 'say hi', '<p>Hi!</p>'));
      expect(chatgptAdapter.getConversationRoot(document)?.hasAttribute('data-thread-find-target')).toBe(true);
      document.body.innerHTML = HOME_COMPOSER;
      expect(chatgptAdapter.getConversationRoot(document)).toBeNull();
      expect(chatgptAdapter.getMessages(document)).toEqual([]);
    });

    it('reads user and assistant messages in order, without headings or buttons', () => {
      document.body.innerHTML = conversation(
        turn('t1', 'say hi', '<p>Hi! How can I help?</p>'),
        turn('t2', 'thanks', '<p>You are welcome.</p>'),
      );
      expect(chatgptAdapter.getMessages(document)).toEqual([
        { id: 't1:user:0', role: 'user', text: 'say hi' },
        { id: 't1:assistant:0', role: 'assistant', text: 'Hi! How can I help?' },
        { id: 't2:user:0', role: 'user', text: 'thanks' },
        { id: 't2:assistant:0', role: 'assistant', text: 'You are welcome.' },
      ]);
    });

    it('keeps paragraphs and list items on separate lines and skips code-block buttons', () => {
      document.body.innerHTML = conversation(
        turn('t1', 'list', '<p>Steps:</p><ul><li>one</li><li>two</li></ul><pre><button>Copy code</button><code>npm test</code></pre>'),
      );
      const reply = chatgptAdapter.getMessages(document)[1];
      expect(reply?.text).toBe('Steps:\none\ntwo\nnpm test');
    });

    it('reads a turn that has no reply yet', () => {
      document.body.innerHTML = `<div data-thread-find-target="conversation"><div data-turn-key="t1"><h4 data-conversation-role="user">You said:</h4><div data-user-message-bubble="true"><p>pending</p></div></div></div>`;
      expect(chatgptAdapter.getMessages(document)).toEqual([{ id: 't1:user:0', role: 'user', text: 'pending' }]);
    });

    it('reports an unloaded reply as empty text, and ignores muted reasoning blocks', () => {
      // Long chats: the reply container keeps its height but ChatGPT has not mounted the text.
      // Muted (tertiary) blocks carry the reply attribute but are not the reply.
      document.body.innerHTML = `<div data-thread-find-target="conversation">
        <div data-turn-key="long1">
          <h4 data-conversation-role="user">You said:</h4>
          <div data-user-message-bubble="true"><p>a long question</p></div>
          <div data-markdown-text-style="assistant-message" data-markdown-text-tone="tertiary"></div>
          <div data-markdown-text-style="assistant-message" data-markdown-text-tone="tertiary"></div>
          <div data-content-search-unit-key="fallback-turn-0:2:assistant"></div>
          <div data-markdown-text-style="assistant-message"></div>
        </div>
        <div data-turn-key="long2">
          <div data-user-message-bubble="true"><p>another</p></div>
          <div data-markdown-text-style="assistant-message"><p>a loaded reply</p></div>
        </div></div>`;
      expect(chatgptAdapter.getMessages(document)).toEqual([
        { id: 'long1:user:0', role: 'user', text: 'a long question' },
        { id: 'long1:assistant:0', role: 'assistant', text: '' },
        { id: 'long2:user:0', role: 'user', text: 'another' },
        { id: 'long2:assistant:0', role: 'assistant', text: 'a loaded reply' },
      ]);
    });

    describe('with an old hidden conversation left in the page after switching chats', () => {
      const root = (turnKey: string, text: string) =>
        `<div data-thread-find-target="conversation"><div data-turn-key="${turnKey}"><div data-user-message-bubble="true"><p>${text}</p></div></div></div>`;

      const roots = () => Array.from(document.querySelectorAll<HTMLElement>('[data-thread-find-target="conversation"]'));
      // Defined on the element itself so it overrides the "everything is visible" mock on the prototype.
      const hide = (el: HTMLElement) =>
        Object.defineProperty(el, 'getClientRects', { value: () => [], configurable: true });

      beforeEach(() => {
        document.body.innerHTML = root('old', 'old chat') + root('current', 'current chat');
      });

      it('reads the visible conversation even though the hidden one comes first', () => {
        hide(roots()[0]!);
        expect(chatgptAdapter.getConversationRoot(document)).toBe(roots()[1]);
        expect(chatgptAdapter.getMessages(document).map((m) => m.text)).toEqual(['current chat']);
      });

      it('prefers the newest visible one if both are visible', () => {
        expect(chatgptAdapter.getMessages(document).map((m) => m.text)).toEqual(['current chat']);
      });

      it('never reads a hidden conversation: on a new chat there are no messages', () => {
        roots().forEach(hide);
        expect(chatgptAdapter.getConversationRoot(document)).toBeNull();
        expect(chatgptAdapter.getMessages(document)).toEqual([]);
      });
    });

    it('gives a message the same id whether or not its text is loaded', () => {
      const loaded = `<div data-thread-find-target="conversation"><div data-turn-key="k"><div data-markdown-text-style="assistant-message"><p>text</p></div></div></div>`;
      const unloaded = `<div data-thread-find-target="conversation"><div data-turn-key="k"><div data-markdown-text-style="assistant-message"></div></div></div>`;
      document.body.innerHTML = loaded;
      const before = chatgptAdapter.getMessages(document)[0]?.id;
      document.body.innerHTML = unloaded;
      expect(chatgptAdapter.getMessages(document)[0]?.id).toBe(before);
    });
  });

  it('returns null when there is no prompt box', () => {
    document.body.innerHTML = '<input id="search" type="text">';
    expect(chatgptAdapter.getPromptElement(document)).toBeNull();
  });

  it('falls back to #prompt-textarea and reads a textarea value', () => {
    document.body.innerHTML = '<textarea id="prompt-textarea"></textarea>';
    const el = prompt() as HTMLTextAreaElement;
    el.value = 'typed here';
    expect(chatgptAdapter.readPromptText(el)).toBe('typed here');
  });

  it('never returns a secure field', () => {
    document.body.innerHTML = '<input id="prompt-textarea" type="password">';
    expect(chatgptAdapter.getPromptElement(document)).toBeNull();
  });
});
