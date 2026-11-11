import type { QuickEntry } from './quickadd';
import { ROOT_ID, buildTree } from './tree';
import type { Asset, HomeData, Item, Space } from './types';

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

/** Colours offered for rooms; new rooms take the next one in turn. */
export const ROOM_COLORS = ['#FF6B35', '#4ECDC4', '#A78BFA', '#FCD34D', '#60A5FA', '#94A3B8'];

/** Adds several things to one place in one go (the fill-a-shelf flow). Each is logged at `secsEach`. */
export function addItems(
  data: HomeData,
  space: string,
  entries: QuickEntry[],
  secsEach: number,
): { data: HomeData; items: Item[] } {
  const items: Item[] = entries
    .filter(e => e.name.trim())
    .map(e => ({
      id: newId(),
      space,
      name: e.name.trim(),
      qty: e.qty,
      unit: '',
      notes: '',
      ...(e.photo ? { photo: e.photo } : {}),
      history: [`Added in ${secsEach} s`],
    }));
  return {
    data: { ...data, items: [...data.items, ...items], times: [...data.times, ...items.map(() => secsEach)] },
    items,
  };
}

/** Adds a place under `parent`. A new room (a child of the home) also gets the next room colour. */
export function addSpace(data: HomeData, parent: string, name: string): HomeData {
  const space: Space = { id: newId(), parent, name: name.trim() };
  if (parent === ROOT_ID) {
    const rooms = data.spaces.filter(s => s.parent === ROOT_ID).length;
    space.color = ROOM_COLORS[rooms % ROOM_COLORS.length]!;
  }
  return { ...data, spaces: [...data.spaces, space] };
}

/** Renames a place. A blank name is ignored. */
export function renameSpace(data: HomeData, id: string, name: string): HomeData {
  const n = name.trim();
  if (!n) return data;
  return { ...data, spaces: data.spaces.map(s => (s.id === id ? { ...s, name: n } : s)) };
}

export function setSpaceColor(data: HomeData, id: string, color: string): HomeData {
  return { ...data, spaces: data.spaces.map(s => (s.id === id ? { ...s, color } : s)) };
}

/** A fresh, empty home with the given rooms. */
export function newHome(name: string, rooms: string[]): HomeData {
  const spaces: Space[] = [{ id: ROOT_ID, parent: null, name: name.trim() || 'My home' }];
  rooms
    .map(r => r.trim())
    .filter(Boolean)
    .forEach((r, n) => spaces.push({ id: newId(), parent: ROOT_ID, name: r, color: ROOM_COLORS[n % ROOM_COLORS.length]! }));
  return { spaces, items: [], assets: [], times: [] };
}

export function updateItem(data: HomeData, id: string, patch: Partial<Pick<Item, 'qty' | 'notes'>>): HomeData {
  return { ...data, items: data.items.map(i => (i.id === id ? { ...i, ...patch } : i)) };
}

/** Things that have not been removed. Everything the app shows, counts or searches goes through this. */
export function liveItems(items: Item[]): Item[] {
  return items.some(i => i.deletedAt) ? items.filter(i => !i.deletedAt) : items;
}

/** Things that were removed, most recently removed first. */
export function removedItems(items: Item[]): Item[] {
  return items.filter(i => i.deletedAt).sort((a, b) => b.deletedAt!.localeCompare(a.deletedAt!));
}

/** Soft delete: the row stays, marked with when it was removed, and keeps its place for a later restore. */
export function removeItem(data: HomeData, id: string, now = new Date()): HomeData {
  return {
    ...data,
    items: data.items.map(i =>
      i.id === id && !i.deletedAt ? { ...i, deletedAt: now.toISOString(), history: ['Removed', ...i.history] } : i,
    ),
  };
}

/** Puts a removed thing back where it was. */
export function restoreItem(data: HomeData, id: string): HomeData {
  return {
    ...data,
    items: data.items.map(i => {
      if (i.id !== id || !i.deletedAt) return i;
      const { deletedAt: _gone, ...rest } = i;
      return { ...rest, history: ['Restored', ...i.history] };
    }),
  };
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

/** Moves several items to one place at once (sorting a pile into its cupboard). Items already there are left alone. */
export function moveItems(data: HomeData, ids: string[], to: string): HomeData {
  return ids.reduce((d, id) => moveItem(d, id, to), data);
}

export type AssetInput = Pick<Asset, 'name' | 'kind' | 'bought' | 'insuranceDue' | 'serviceDue' | 'notes'>;

const cleanAsset = (input: AssetInput): AssetInput => ({
  name: input.name.trim(),
  kind: input.kind,
  bought: input.bought,
  insuranceDue: input.insuranceDue,
  serviceDue: input.serviceDue,
  notes: input.notes.trim(),
});

export function addAsset(data: HomeData, input: AssetInput): { data: HomeData; asset: Asset } {
  const asset: Asset = { id: newId(), ...cleanAsset(input) };
  return { data: { ...data, assets: [...data.assets, asset] }, asset };
}

export function updateAsset(data: HomeData, id: string, input: AssetInput): HomeData {
  return { ...data, assets: data.assets.map(a => (a.id === id ? { ...a, ...cleanAsset(input) } : a)) };
}

/** Soft delete: the row stays, marked with when it was removed. */
export function removeAsset(data: HomeData, id: string, now = new Date()): HomeData {
  return {
    ...data,
    assets: data.assets.map(a => (a.id === id && !a.deletedAt ? { ...a, deletedAt: now.toISOString() } : a)),
  };
}
