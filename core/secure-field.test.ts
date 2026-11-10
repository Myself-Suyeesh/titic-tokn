import { describe, expect, it } from 'vitest';
import { isSecureField } from './secure-field';

function el(html: string): Element {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host.firstElementChild as Element;
}

describe('isSecureField', () => {
  it('flags password inputs', () => {
    expect(isSecureField(el('<input type="password">'))).toBe(true);
  });

  it('flags payment and one-time-code autocomplete values', () => {
    expect(isSecureField(el('<input autocomplete="cc-number">'))).toBe(true);
    expect(isSecureField(el('<input autocomplete="one-time-code">'))).toBe(true);
    expect(isSecureField(el('<input autocomplete="new-password">'))).toBe(true);
  });

  it('allows ordinary text fields and editable boxes', () => {
    expect(isSecureField(el('<input type="text">'))).toBe(false);
    expect(isSecureField(el('<textarea></textarea>'))).toBe(false);
    expect(isSecureField(el('<div contenteditable="true"></div>'))).toBe(false);
  });
});
