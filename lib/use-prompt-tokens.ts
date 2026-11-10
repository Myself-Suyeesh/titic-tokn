import { useEffect, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { countPromptTokens } from '../core/tokenizer';
import { watchPrompt } from './watch-prompt';

/** Live token count of the adapter's prompt box. */
export function usePromptTokens(adapter: SiteAdapter): number {
  const [tokens, setTokens] = useState(0);

  useEffect(
    () => watchPrompt(adapter, document, (text) => setTokens(countPromptTokens(text))),
    [adapter],
  );

  return tokens;
}
