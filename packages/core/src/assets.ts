import type { Asset, AssetKind } from './types';

/** Kinds offered in the asset form, in display order. */
export const ASSET_KINDS: { id: AssetKind; label: string }[] = [
  { id: 'car', label: 'Car' },
  { id: 'bike', label: 'Bike' },
  { id: 'appliance', label: 'Appliance' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'other', label: 'Other' },
];

export const isAssetKind = (v: unknown): v is AssetKind => ASSET_KINDS.some(k => k.id === v);

export const assetKindLabel = (kind: AssetKind): string => ASSET_KINDS.find(k => k.id === kind)?.label ?? 'Other';

/** Local calendar date as YYYY-MM-DD, the format assets store their purchase date in. */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Parses YYYY-MM-DD into its parts; null for anything that is not a real calendar date. */
export function parseIsoDate(text: string): { y: number; m: number; d: number } | null {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!hit) return null;
  const [y, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])];
  const real = new Date(y, m - 1, d);
  return real.getFullYear() === y && real.getMonth() === m - 1 && real.getDate() === d ? { y, m, d } : null;
}

export interface Age {
  years: number;
  months: number;
}

/** Whole years and months since the purchase date. Null when the date is unknown, invalid or in the future. */
export function assetAge(bought: string, now = new Date()): Age | null {
  const b = parseIsoDate(bought);
  if (!b) return null;
  const total =
    (now.getFullYear() - b.y) * 12 + (now.getMonth() + 1 - b.m) - (now.getDate() < b.d ? 1 : 0);
  if (total < 0) return null;
  return { years: Math.floor(total / 12), months: total % 12 };
}

/** "6 yr 3 mo", "6 yr", "3 mo" or "Under a month". */
export function ageText(age: Age): string {
  const parts = [age.years ? `${age.years} yr` : '', age.months ? `${age.months} mo` : ''].filter(Boolean);
  return parts.join(' ') || 'Under a month';
}

/** Assets that have not been removed, oldest first; ones with no purchase date go last. */
export function liveAssets(assets: Asset[]): Asset[] {
  const key = (a: Asset) => (parseIsoDate(a.bought) ? a.bought : '9999');
  return assets.filter(a => !a.deletedAt).sort((a, b) => key(a).localeCompare(key(b)));
}

/** A due date this many days away or fewer counts as "soon". */
export const DUE_SOON_DAYS = 30;

export interface DueStatus {
  /** Calendar days from today; negative when the date has passed. */
  days: number;
  level: 'overdue' | 'soon' | 'later';
}

/** How far off an insurance or service date is. Null when the date is unset or invalid. */
export function dueStatus(due: string, now = new Date()): DueStatus | null {
  const p = parseIsoDate(due);
  if (!p) return null;
  const days = Math.round(
    (Date.UTC(p.y, p.m - 1, p.d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000,
  );
  return { days, level: days < 0 ? 'overdue' : days <= DUE_SOON_DAYS ? 'soon' : 'later' };
}

/** True when the insurance or the service is overdue or coming up soon. */
export function needsAttention(asset: Asset, now = new Date()): boolean {
  return [asset.insuranceDue, asset.serviceDue].some(d => {
    const s = dueStatus(d, now);
    return s !== null && s.level !== 'later';
  });
}
