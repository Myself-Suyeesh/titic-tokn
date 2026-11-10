/**
 * One adapter per supported site. Adapters read only the main prompt box
 * (never any focused input) and live in their own file so a layout change on a
 * site is a small, isolated fix. The interface grows in later milestones
 * (model label, visible messages, reply-finished).
 */
export interface SiteAdapter {
  /** Stable id, used for per-site settings later. */
  id: string;
  /** True if this adapter handles the given page URL. */
  matches(url: URL): boolean;
  /** The main prompt box, or null if it is not on the page. */
  getPromptElement(doc: Document): HTMLElement | null;
  /** The text currently typed in the prompt box. */
  readPromptText(el: HTMLElement): string;
}
