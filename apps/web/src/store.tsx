import {
  buildTree,
  liveItems,
  parseBackup,
  searchItems,
  seedData,
  toBackup,
  type HomeData,
  type HomeTree,
  type Item,
} from '@gharmap/core';
import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StoreContext as Ctx } from './storeContext';

export const ACCENT = '#0F6E66';

// Phase 0 keeps data in localStorage. The plan moves this to SQLite (OPFS) in a worker;
// load/save are the only two places that change when it does.
const STORAGE_KEY = 'gharmap.data.v1';

function load(): HomeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseBackup(raw);
  } catch {
    // Storage blocked or data unreadable: start from the demo home.
  }
  return seedData();
}

function save(data: HomeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toBackup(data)));
  } catch {
    // Private mode or quota: the session still works, it just won't persist.
  }
}

type Sheet = { kind: 'space'; parent: string } | { kind: 'article' } | { kind: 'asset'; id?: string } | null;
type Picker =
  | { mode: 'move'; itemId: string }
  /** Adds a new thing called `name` at the place picked; `show` then opens its answer card. */
  | { mode: 'place'; name: string; show: boolean; start: number; photo?: string }
  | null;

export interface Store {
  /** Everything stored, including removed rows. Screens read `items` instead. */
  data: HomeData;
  /** The things that have not been removed. */
  items: Item[];
  tree: HomeTree;
  update(fn: (d: HomeData) => HomeData): void;
  replace(d: HomeData): void;

  /** What is typed in the find bar. */
  query: string;
  setQuery(q: string): void;
  /** A thing chosen directly (another match, or "Show on map"); wins over the first match. */
  pick: string | null;
  setPick(id: string | null): void;
  /** Clears the query and the pick, which closes the answer card. */
  clearFind(): void;
  toast: string;
  showToast(msg: string): void;

  sheet: Sheet;
  picker: Picker;
  openSpaceForm(parent: string): void;
  /** With an id, edits that asset; without, adds a new one. */
  openAssetForm(id?: string): void;
  /** The + button: name (and optionally photograph) a new thing, then pick where it goes. */
  openArticleForm(): void;
  /** Closes the picker and any sheet under it. */
  closeAll(): void;
  openPicker(p: NonNullable<Picker>): void;
  closePicker(): void;
  closeSheet(): void;

  /** Shelf last filled, so the + button on the home screen goes back to it. */
  lastFill: string | null;
  setLastFill(id: string): void;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

/** The find bar's result: every match, the one being shown, and the path that lights up on the map. */
export function useFind() {
  const { items, tree, query, pick } = useStore();
  return useMemo(() => {
    const q = query.trim();
    const matches = searchItems(items, q);
    const ans = (pick ? items.find(i => i.id === pick) : undefined) ?? matches[0];
    const path = ans ? tree.pathOf(ans.space) : [];
    return { q, matches, ans, path, lit: new Set(path.map(s => s.id)) };
  }, [items, tree, query, pick]);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeData>(load);
  const items = useMemo(() => liveItems(data.items), [data.items]);
  const tree = useMemo(() => buildTree(data.spaces, items), [data.spaces, items]);
  useEffect(() => save(data), [data]);

  const [query, setQuery] = useState('');
  const [pick, setPick] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>();
  const showToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [picker, setPicker] = useState<Picker>(null);
  const [lastFill, setLastFill] = useState<string | null>(null);

  const store: Store = {
    data,
    items,
    tree,
    update: fn => setData(fn),
    replace: setData,
    query,
    setQuery,
    pick,
    setPick,
    clearFind: () => {
      setQuery('');
      setPick(null);
    },
    toast,
    showToast,
    sheet,
    picker,
    openSpaceForm: parent => {
      setPicker(null);
      setSheet({ kind: 'space', parent });
    },
    openAssetForm: id => {
      setPicker(null);
      setSheet({ kind: 'asset', id });
    },
    openArticleForm: () => {
      setPicker(null);
      setSheet({ kind: 'article' });
    },
    closeAll: () => {
      setPicker(null);
      setSheet(null);
    },
    openPicker: setPicker,
    closePicker: () => setPicker(null),
    closeSheet: () => (picker ? setPicker(null) : setSheet(null)),
    lastFill,
    setLastFill,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
