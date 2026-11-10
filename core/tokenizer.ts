import { countTokens } from 'gpt-tokenizer/encoding/o200k_base';

/**
 * Exact token count for models that use the o200k_base encoding (GPT-4o family).
 * Runs locally; the text never leaves the page.
 */
export function countPromptTokens(text: string): number {
  return text === '' ? 0 : countTokens(text);
}
