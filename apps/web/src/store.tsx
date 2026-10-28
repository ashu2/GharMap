import {
  DEFAULT_ADD_SPACE,
  buildTree,
  parseBackup,
  seedData,
  toBackup,
  type HomeData,
  type HomeTree,
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

type Sheet = { kind: 'add' } | { kind: 'space'; parent: string } | null;
type Picker = { mode: 'add' } | { mode: 'move'; itemId: string } | null;

export interface Store {
  data: HomeData;
  tree: HomeTree;
  update(fn: (d: HomeData) => HomeData): void;
  replace(d: HomeData): void;

  /** Item whose path is lit up on the map. */
  hl: string | null;
  setHl(id: string | null): void;
  query: string;
  setQuery(q: string): void;
  toast: string;
  showToast(msg: string): void;

  sheet: Sheet;
  picker: Picker;
  openAdd(opts?: { name?: string; space?: string }): void;
  openSpaceForm(parent: string): void;
  openPicker(p: NonNullable<Picker>): void;
  closePicker(): void;
  closeSheet(): void;

  /** Quick-add form state lives here so it survives opening the place picker. */
  add: { name: string; qty: number; space: string; start: number };
  setAdd(patch: Partial<Store['add']>): void;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeData>(load);
  const tree = useMemo(() => buildTree(data.spaces, data.items), [data.spaces, data.items]);
  useEffect(() => save(data), [data]);

  const [hl, setHl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
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
  const [add, setAddState] = useState({ name: '', qty: 1, space: DEFAULT_ADD_SPACE, start: 0 });
  const setAdd = useCallback((patch: Partial<Store['add']>) => setAddState(a => ({ ...a, ...patch })), []);

  const store: Store = {
    data,
    tree,
    update: fn => setData(fn),
    replace: setData,
    hl,
    setHl,
    query,
    setQuery,
    toast,
    showToast,
    sheet,
    picker,
    openAdd: opts => {
      // Prefer the place the user is looking at, then the last place used.
      let space = opts?.space ?? add.space;
      if (!tree.get(space)) space = tree.leavesUnder('home')[0]?.id ?? 'home';
      setAddState({ name: opts?.name ?? '', qty: 1, space, start: Date.now() });
      setPicker(null);
      setSheet({ kind: 'add' });
    },
    openSpaceForm: parent => {
      setPicker(null);
      setSheet({ kind: 'space', parent });
    },
    openPicker: setPicker,
    closePicker: () => setPicker(null),
    closeSheet: () => (picker ? setPicker(null) : setSheet(null)),
    add,
    setAdd,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
