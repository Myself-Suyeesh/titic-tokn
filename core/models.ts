import data from '../data/model-prices.json';

export type ModelFamily = 'openai';

export interface ModelInfo {
  id: string;
  name: string;
  family: ModelFamily;
  /** Encoding used to count this model's tokens. */
  tokenizer: 'o200k_base';
  /** True only if that encoding is verified to be the model's own; otherwise counts are estimates. */
  exact: boolean;
  /** Context window in tokens. */
  contextWindow: number;
  /** USD per million input / output tokens. */
  inputPerMTok: number;
  outputPerMTok: number;
}

export const MODELS: ModelInfo[] = data.models as ModelInfo[];
export const PRICE_SNAPSHOT: string = data.snapshot;

/**
 * Lower-case, "chatgpt" → "gpt", runs of spaces and punctuation → "-". Dots are
 * kept so version "5.6" can never be mistaken for "5".
 */
export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/chatgpt/g, 'gpt')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

// Longest key first so "gpt-4o-mini" is tried before "gpt-4o".
const BY_KEY_LENGTH = MODELS.map((model) => ({ model, key: normalizeLabel(model.id) })).sort(
  (a, b) => b.key.length - a.key.length,
);

/** Maps a model name read from the page (for example "GPT-4o mini") to a table entry. */
export function findModelByLabel(label: string): ModelInfo | null {
  const normalized = normalizeLabel(label);
  for (const { model, key } of BY_KEY_LENGTH) {
    if ((`-${normalized}-`).includes(`-${key}-`)) return model;
  }
  return null;
}

/** True when the model's own public tokenizer is verified, so counts are exact. */
export function isExact(model: ModelInfo): boolean {
  return model.exact;
}

export function getModelById(id: string): ModelInfo | null {
  return MODELS.find((m) => m.id === id) ?? null;
}

export function modelsForFamily(family: ModelFamily): ModelInfo[] {
  return MODELS.filter((m) => m.family === family);
}

/** A model name found on the page wins over the user's saved choice; null if neither is known. */
export function resolveModel(detectedLabel: string | null, savedId: string | null): ModelInfo | null {
  const detected = detectedLabel ? findModelByLabel(detectedLabel) : null;
  return detected ?? (savedId ? getModelById(savedId) : null);
}
