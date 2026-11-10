import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SiteAdapter } from '../adapters/types';
import { watchPrompt } from './watch-prompt';

const adapter: SiteAdapter = {
  id: 'test',
  name: 'Test',
  modelFamily: 'openai',
  matches: () => true,
  getPromptElement: (doc) => doc.querySelector<HTMLElement>('#box'),
  readPromptText: (el) => el.textContent ?? '',
  getModelLabel: () => null,
};

describe('watchPrompt', () => {
  let stop: () => void = () => {};

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="box" contenteditable="true"></div><div id="other"></div>';
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
  });

  it('reports the initial text', () => {
    const seen: string[] = [];
    document.getElementById('box')!.textContent = 'hi';
    stop = watchPrompt(adapter, document, (t) => seen.push(t));
    vi.advanceTimersByTime(50);
    expect(seen).toEqual(['hi']);
  });

  it('reports changes made inside the prompt box', async () => {
    const seen: string[] = [];
    stop = watchPrompt(adapter, document, (t) => seen.push(t));
    vi.advanceTimersByTime(50);
    document.getElementById('box')!.textContent = 'typed';
    await Promise.resolve(); // let MutationObserver run
    vi.advanceTimersByTime(50);
    expect(seen.at(-1)).toBe('typed');
  });

  it('ignores changes elsewhere on the page', async () => {
    const seen: string[] = [];
    stop = watchPrompt(adapter, document, (t) => seen.push(t));
    vi.advanceTimersByTime(50);
    const before = seen.length;
    document.getElementById('other')!.textContent = 'not the prompt';
    await Promise.resolve();
    vi.advanceTimersByTime(50);
    expect(seen.length).toBe(before);
  });

  it('re-binds when the site replaces the prompt box', () => {
    const seen: string[] = [];
    stop = watchPrompt(adapter, document, (t) => seen.push(t));
    vi.advanceTimersByTime(50);
    document.body.innerHTML = '<div id="box">fresh</div>';
    vi.advanceTimersByTime(600);
    expect(seen.at(-1)).toBe('fresh');
  });

  it('stops reporting after cleanup', async () => {
    const seen: string[] = [];
    stop = watchPrompt(adapter, document, (t) => seen.push(t));
    vi.advanceTimersByTime(50);
    stop();
    const before = seen.length;
    document.getElementById('box')!.textContent = 'late';
    await Promise.resolve();
    vi.advanceTimersByTime(600);
    expect(seen.length).toBe(before);
  });
});
