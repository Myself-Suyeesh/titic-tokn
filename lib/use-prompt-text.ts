import { useEffect, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { watchPrompt } from './watch-prompt';

/**
 * The text of the adapter's prompt box. While `live` is false nothing is
 * read from the page and the last text is kept.
 */
export function usePromptText(adapter: SiteAdapter, live: boolean): string {
  const [text, setText] = useState('');

  useEffect(() => (live ? watchPrompt(adapter, document, setText) : undefined), [adapter, live]);

  return text;
}
