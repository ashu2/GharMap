import type { Item } from './types';

/** Matches item names and notes, case-insensitive; names that start with the query come first. */
export function searchItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = (i: Item) => (i.name.toLowerCase().startsWith(q) ? 1 : 0);
  return items
    .filter(i => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q))
    .sort((a, b) => starts(b) - starts(a));
}

/** Things people often add, offered before the home has many items of its own. */
export const COMMON_ITEM_NAMES = [
  'Passport', 'Phone charger', 'Spare keys', 'Torch', 'Umbrella', 'Scissors', 'Tape', 'Power bank', 'Earphones',
];

/** Autocomplete for the quick-add name field: distinct prefix matches, excluding an exact match. */
export function nameSuggestions(pool: string[], typed: string, limit = 3): string[] {
  const t = typed.trim().toLowerCase();
  if (!t) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of pool) {
    const k = name.toLowerCase();
    if (seen.has(k) || k === t || !k.startsWith(t)) continue;
    seen.add(k);
    out.push(name);
    if (out.length === limit) break;
  }
  return out;
}

/** Shown on the empty search screen. */
export const FREQUENT_SEARCHES = ['passport', 'charger', 'medicines', 'remote', 'thermometer'];
