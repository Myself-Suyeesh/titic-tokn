// Regenerates data/model-prices.json from the open LiteLLM price table.
// Run by a developer, never by the extension:
//   node scripts/update-prices.mjs [path-to-model_prices_and_context_window.json]
// Without an argument it downloads the table from GitHub.
// Source: https://github.com/BerriAI/litellm (MIT licence).
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE_URL =
  'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

// Curated list, newest first. `id` is the LiteLLM key; `name` is what the card shows.
// Every model here is counted with the o200k_base encoding. A count is only
// labelled exact when the gpt-tokenizer library lists the model itself (checked
// below); otherwise it is an estimate.
const MODELS = [
  { id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol' },
  { id: 'gpt-6.1-terra', name: 'GPT-6.1 Terra' },
  { id: 'gpt-6-astra', name: 'GPT-6 Astra' },
  { id: 'gpt-6-sol', name: 'GPT-6 Sol' },
  { id: 'gpt-6-luna', name: 'GPT-6 Luna' },
  { id: 'gpt-5.6', name: 'GPT-5.6' },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol' },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra' },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna' },
  { id: 'gpt-5.5', name: 'GPT-5.5' },
  { id: 'gpt-5.4', name: 'GPT-5.4' },
  { id: 'gpt-5.4-mini', name: 'GPT-5.4 mini' },
  { id: 'gpt-5.2', name: 'GPT-5.2' },
  { id: 'gpt-5.1', name: 'GPT-5.1' },
  { id: 'gpt-5', name: 'GPT-5' },
  { id: 'gpt-5-mini', name: 'GPT-5 mini' },
  { id: 'gpt-4.1', name: 'GPT-4.1' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini' },
  { id: 'o3', name: 'o3' },
  { id: 'o4-mini', name: 'o4-mini' },
].map((m) => ({ ...m, family: 'openai', tokenizer: 'o200k_base' }));

// The library ships one file per model it knows. If the layout ever changes,
// every model falls back to "est.", which is the safe direction.
const knownToTokenizer = (id) =>
  existsSync(new URL(`../node_modules/gpt-tokenizer/esm/model/${id}.js`, import.meta.url));

const arg = process.argv[2];
const raw = arg
  ? await readFile(arg, 'utf8')
  : await (await fetch(SOURCE_URL)).text();
const table = JSON.parse(raw);

const perMTok = (perToken) => Math.round(perToken * 1e6 * 1e6) / 1e6;

const models = MODELS.map((m) => {
  const row = table[m.id];
  if (!row) throw new Error(`Model not found in price table: ${m.id}`);
  const contextWindow = row.max_input_tokens ?? row.max_tokens;
  if (!contextWindow || row.input_cost_per_token == null || row.output_cost_per_token == null) {
    throw new Error(`Incomplete price data for ${m.id}`);
  }
  return {
    ...m,
    exact: knownToTokenizer(m.id),
    contextWindow,
    inputPerMTok: perMTok(row.input_cost_per_token),
    outputPerMTok: perMTok(row.output_cost_per_token),
  };
});

const out = {
  snapshot: new Date().toISOString().slice(0, 10),
  source: 'https://github.com/BerriAI/litellm (MIT licence)',
  note: 'Prices in USD per million tokens. Long-context tiers, caching and batch discounts are ignored.',
  models,
};

await writeFile(new URL('../data/model-prices.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${models.length} models, snapshot ${out.snapshot}`);
