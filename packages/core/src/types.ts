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
  /** Newest first. */
  history: string[];
}

export interface HomeData {
  spaces: Space[];
  items: Item[];
  /** Seconds each quick-add took, oldest first: the Gate 0 entry-speed log. */
  times: number[];
}
