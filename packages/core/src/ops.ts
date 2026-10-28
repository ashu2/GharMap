import { buildTree } from './tree';
import type { HomeData, Item } from './types';

/**
 * Client-generated UUIDs, so rows can be created offline without clashes.
 * crypto.randomUUID only exists in secure contexts; a phone opening the dev
 * server over plain http on the LAN is not one, hence the fallback.
 */
export function newId(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export interface NewItem {
  space: string;
  name: string;
  qty: number;
  /** How long the quick add took, for the Gate 0 log. */
  secs: number;
}

export function addItem(data: HomeData, input: NewItem): { data: HomeData; item: Item } {
  const item: Item = {
    id: newId(),
    space: input.space,
    name: input.name.trim(),
    qty: input.qty,
    unit: '',
    notes: '',
    history: [`Added in ${input.secs} s`],
  };
  return {
    data: { ...data, items: [...data.items, item], times: [...data.times, input.secs] },
    item,
  };
}

export function addSpace(data: HomeData, parent: string, name: string): HomeData {
  return { ...data, spaces: [...data.spaces, { id: newId(), parent, name: name.trim() }] };
}

export function updateItem(data: HomeData, id: string, patch: Partial<Pick<Item, 'qty' | 'notes'>>): HomeData {
  return { ...data, items: data.items.map(i => (i.id === id ? { ...i, ...patch } : i)) };
}

/** Moves an item and records where it came from. No-op when it is already there. */
export function moveItem(data: HomeData, id: string, to: string): HomeData {
  const item = data.items.find(i => i.id === id);
  if (!item || item.space === to) return data;
  const from = buildTree(data.spaces, data.items).pathText(item.space);
  return {
    ...data,
    items: data.items.map(i =>
      i.id === id ? { ...i, space: to, history: [`Moved from ${from}`, ...i.history] } : i,
    ),
  };
}
