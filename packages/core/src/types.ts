/** A place in the home: the home itself, a room, a unit (almirah, fridge) or a compartment (shelf, drawer). */
export interface Space {
  id: string;
  /** null only for the root home space. */
  parent: string | null;
  name: string;
  /** Rooms carry a colour; deeper spaces inherit their room's. */
  color?: string;
}

export interface Item {
  id: string;
  /** Id of the space the item sits in. */
  space: string;
  name: string;
  qty: number;
  unit: string;
  notes: string;
  /** Small JPEG data URL (low resolution on purpose); absent when there is no photo. */
  photo?: string;
  /** Newest first. */
  history: string[];
  /** Set when removed. Things are soft-deleted so a removal can sync later and can be undone. */
  deletedAt?: string;
}

export type AssetKind = 'car' | 'bike' | 'appliance' | 'electronics' | 'furniture' | 'other';

/** Something the family owns and tracks by age: a car, a bike, the fridge. Not tied to a space. */
export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  /** Purchase date as YYYY-MM-DD; '' when not known. */
  bought: string;
  /** Date the insurance runs out, as YYYY-MM-DD; '' when not tracked. */
  insuranceDue: string;
  /** Date the next service is due, as YYYY-MM-DD; '' when not tracked. */
  serviceDue: string;
  notes: string;
  /** Set when removed. Assets are soft-deleted so a removal can sync later. */
  deletedAt?: string;
}

export interface HomeData {
  spaces: Space[];
  items: Item[];
  assets: Asset[];
  /** Seconds each quick-add took, oldest first: the Gate 0 entry-speed log. */
  times: number[];
}
