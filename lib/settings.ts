/** The part of chrome.storage.local this module uses. */
export interface Area {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const KEY = 'modelBySite';

async function readMap(area: Area): Promise<Record<string, string>> {
  const result = await area.get(KEY);
  const stored: unknown = result[KEY];
  if (typeof stored !== 'object' || stored === null) return {};
  return Object.fromEntries(
    Object.entries(stored).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

/** The model the user picked for a site, or null. Stored locally only. */
export async function loadModelId(siteId: string, area: Area = chrome.storage.local): Promise<string | null> {
  return (await readMap(area))[siteId] ?? null;
}

export async function saveModelId(siteId: string, modelId: string, area: Area = chrome.storage.local): Promise<void> {
  const map = await readMap(area);
  await area.set({ [KEY]: { ...map, [siteId]: modelId } });
}
