import { beforeEach, describe, expect, it } from 'vitest';
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
