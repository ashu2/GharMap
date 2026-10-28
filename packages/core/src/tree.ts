import type { Item, Space } from './types';

/** Id of the root space (the home itself). */
export const ROOT_ID = 'home';

export interface HomeTree {
  root: Space | undefined;
  get(id: string): Space | undefined;
  /** Top-level rooms, in data order. */
  rooms: Space[];
  kids(id: string): Space[];
  /** Items sitting directly in this space. */
  direct(id: string): Item[];
  /** Items in this space and everything below it. */
  deep(id: string): number;
  /** Room → … → this space; excludes the root. */
  pathOf(id: string): Space[];
  pathText(id: string): string;
  /** Colour of the room this space belongs to. */
  roomColor(id: string, fallback: string): string;
  /** Spaces with no children under this one. */
  leavesUnder(id: string): Space[];
  /**
   * Places an item can go, depth-first: leaves, plus any space already holding items
   * (a shelf stays pickable after someone adds a box inside it).
   */
  placesUnder(id: string): Space[];
}

export function buildTree(spaces: Space[], items: Item[]): HomeTree {
  const byId = new Map(spaces.map(s => [s.id, s]));
  const children = new Map<string, Space[]>();
  for (const s of spaces) {
    if (s.parent === null) continue;
    const list = children.get(s.parent);
    if (list) list.push(s);
    else children.set(s.parent, [s]);
  }
  const bySpace = new Map<string, Item[]>();
  for (const i of items) {
    const list = bySpace.get(i.space);
    if (list) list.push(i);
    else bySpace.set(i.space, [i]);
  }

  const kids = (id: string) => children.get(id) ?? [];
  const direct = (id: string) => bySpace.get(id) ?? [];

  const deepCache = new Map<string, number>();
  const deep = (id: string): number => {
    const hit = deepCache.get(id);
    if (hit !== undefined) return hit;
    deepCache.set(id, 0); // guards against cycles in imported data
    const n = direct(id).length + kids(id).reduce((sum, k) => sum + deep(k.id), 0);
    deepCache.set(id, n);
    return n;
  };

  const pathOf = (id: string): Space[] => {
    const out: Space[] = [];
    const seen = new Set<string>();
    let c = byId.get(id);
    while (c && c.id !== ROOT_ID && !seen.has(c.id)) {
      seen.add(c.id);
      out.unshift(c);
      c = c.parent === null ? undefined : byId.get(c.parent);
    }
    return out;
  };

  const leavesUnder = (id: string): Space[] => {
    const k = kids(id);
    if (!k.length) {
      const self = byId.get(id);
      return self ? [self] : [];
    }
    return k.flatMap(c => leavesUnder(c.id));
  };

  const placesUnder = (id: string): Space[] => {
    const self = byId.get(id);
    if (!self) return [];
    const k = kids(id);
    const here = !k.length || direct(id).length > 0 ? [self] : [];
    return here.concat(k.flatMap(c => placesUnder(c.id)));
  };

  return {
    root: byId.get(ROOT_ID),
    get: id => byId.get(id),
    rooms: kids(ROOT_ID),
    kids,
    direct,
    deep,
    pathOf,
    pathText: id => pathOf(id).map(s => s.name).join(' › '),
    roomColor: (id, fallback) => pathOf(id)[0]?.color ?? fallback,
    leavesUnder,
    placesUnder,
  };
}
