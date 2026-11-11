import { isAssetKind, parseIsoDate } from './assets';
import { ROOT_ID } from './tree';
import type { Asset, HomeData, Item, Space } from './types';

export const BACKUP_VERSION = 1;

export interface Backup {
  app: 'gharmap';
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: HomeData;
}

export function toBackup(data: HomeData, now = new Date()): Backup {
  return { app: 'gharmap', version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isStr = (v: unknown): v is string => typeof v === 'string';

function readSpace(v: unknown, n: number): Space {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name) || !(v.parent === null || isStr(v.parent))) {
    throw new Error(`Space #${n + 1} is malformed`);
  }
  return { id: v.id, parent: v.parent, name: v.name, ...(isStr(v.color) ? { color: v.color } : {}) };
}

function readItem(v: unknown, n: number): Item {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.space) || !isStr(v.name) || typeof v.qty !== 'number') {
    throw new Error(`Item #${n + 1} is malformed`);
  }
  return {
    id: v.id,
    space: v.space,
    name: v.name,
    qty: v.qty,
    unit: isStr(v.unit) ? v.unit : '',
    notes: isStr(v.notes) ? v.notes : '',
    ...(isStr(v.photo) && v.photo.startsWith('data:image/') ? { photo: v.photo } : {}),
    history: Array.isArray(v.history) ? v.history.filter(isStr) : [],
    ...(isStr(v.deletedAt) ? { deletedAt: v.deletedAt } : {}),
  };
}

const readDate = (v: unknown): string => (isStr(v) && parseIsoDate(v) ? v : '');

function readAsset(v: unknown, n: number): Asset {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.name)) throw new Error(`Asset #${n + 1} is malformed`);
  return {
    id: v.id,
    name: v.name,
    kind: isAssetKind(v.kind) ? v.kind : 'other',
    bought: readDate(v.bought),
    insuranceDue: readDate(v.insuranceDue),
    serviceDue: readDate(v.serviceDue),
    notes: isStr(v.notes) ? v.notes : '',
    ...(isStr(v.deletedAt) ? { deletedAt: v.deletedAt } : {}),
  };
}

/** Parses and validates a backup file. Throws an Error with a user-readable message. */
export function parseBackup(text: string): HomeData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON');
  }
  if (!isObj(raw) || raw.app !== 'gharmap' || !isObj(raw.data)) {
    throw new Error('This is not a GharMap backup');
  }
  if (raw.version !== BACKUP_VERSION) {
    throw new Error(`Backup version ${String(raw.version)} is not supported`);
  }
  const d = raw.data;
  if (!Array.isArray(d.spaces) || !Array.isArray(d.items)) throw new Error('Backup is missing spaces or items');

  const spaces = d.spaces.map(readSpace);
  const items = d.items.map(readItem);
  // Backups made before assets existed have no such list.
  const assets = Array.isArray(d.assets) ? d.assets.map(readAsset) : [];
  const times = Array.isArray(d.times) ? d.times.filter((t): t is number => typeof t === 'number') : [];

  const ids = new Set(spaces.map(s => s.id));
  if (!ids.has(ROOT_ID)) throw new Error('Backup has no home space');
  const orphan = items.find(i => !ids.has(i.space));
  if (orphan) throw new Error(`"${orphan.name}" points to a place that does not exist`);

  return { spaces, items, assets, times };
}
