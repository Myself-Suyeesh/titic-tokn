import type { SiteAdapter } from '../adapters/types';

const DEBOUNCE_MS = 30;
const REBIND_MS = 500;

/**
 * Watches the adapter's prompt box and calls `onText` with its text when it
 * changes. Re-binds if the site replaces the element. Only the prompt box is
 * observed; nothing else on the page is read. Returns a cleanup function.
 */
export function watchPrompt(
  adapter: SiteAdapter,
  doc: Document,
  onText: (text: string) => void,
): () => void {
  let current: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const emit = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (current) onText(adapter.readPromptText(current));
    }, DEBOUNCE_MS);
  };

  const observer = new MutationObserver(emit);

  const bind = () => {
    const el = adapter.getPromptElement(doc);
    if (el === current) return;
    observer.disconnect();
    current = el;
    if (el) {
      observer.observe(el, { subtree: true, childList: true, characterData: true });
      emit();
    }
  };

  const onInput = (event: Event) => {
    if (current && event.target instanceof Node && current.contains(event.target)) emit();
  };

  doc.addEventListener('input', onInput, true);
  const poll = setInterval(bind, REBIND_MS);
  bind();

  return () => {
    clearTimeout(timer);
    clearInterval(poll);
    observer.disconnect();
    doc.removeEventListener('input', onInput, true);
  };
}
