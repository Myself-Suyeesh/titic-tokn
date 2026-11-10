import { useEffect, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { isSecureField } from '../core/secure-field';

export interface FocusState {
  secureFocused: boolean;
  promptFocused: boolean;
}

/** Where focus is right now: in the prompt box, in a secure field, or elsewhere. */
export function useFocusState(adapter: SiteAdapter): FocusState {
  const [state, setState] = useState<FocusState>({ secureFocused: false, promptFocused: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const active = document.activeElement;
      const prompt = adapter.getPromptElement(document);
      const next: FocusState = {
        secureFocused: active !== null && isSecureField(active),
        promptFocused: active !== null && prompt !== null && prompt.contains(active),
      };
      setState((prev) =>
        prev.secureFocused === next.secureFocused && prev.promptFocused === next.promptFocused ? prev : next,
      );
    };

    // Focus is settled one tick after focusin/focusout.
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 0);
    };

    update();
    document.addEventListener('focusin', schedule, true);
    document.addEventListener('focusout', schedule, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('focusin', schedule, true);
      document.removeEventListener('focusout', schedule, true);
    };
  }, [adapter]);

  return state;
}
