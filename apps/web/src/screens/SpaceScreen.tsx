import { ROOT_ID, moveItems, type Space } from '@gharmap/core';
import { createContext, useContext, useState, type CSSProperties } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { qtyLabel } from '../components/Chrome';
import { BackIcon, ChevronIcon, PlusIcon } from '../components/Icons';
import { ACCENT, useFind, useStore } from '../store';
import { NotFound } from './NotFound';

const DRAG_TYPE = 'application/x-gharmap-items';

/** Tap-to-sort state, for phones where dragging is awkward: pick things, then tap a shelf to put them there. */
interface Sort {
  on: boolean;
  picked: Set<string>;
  toggle(id: string): void;
  drop(to: string, ids: string[]): void;
}
const SortCtx = createContext<Sort | null>(null);

/** One shelf or drawer: its name, an Add link, and everything on it as chips. Things can be dragged onto it. */
function Shelf({ space, label, nested }: { space: Space; label: string; nested: boolean }) {
  const { tree } = useStore();
  const { ans, lit } = useFind();
  const sort = useContext(SortCtx)!;
  const [over, setOver] = useState(false);
  const things = tree.direct(space.id);
  // Places inside this shelf (a box on a shelf) show as chips that open them.
  const inner = nested ? tree.kids(space.id) : [];
  return (
    <div
      className="shelf"
      data-lit={ans?.space === space.id || undefined}
      data-drop={over || undefined}
      onDragOver={e => {
        if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={e => {
        setOver(false);
        const raw = e.dataTransfer.getData(DRAG_TYPE);
        if (!raw) return;
        e.preventDefault();
        sort.drop(space.id, JSON.parse(raw) as string[]);
      }}
    >
      <div className="shelf-head">
        <span className="shelf-name">{label}</span>
        {sort.on && sort.picked.size > 0 && (
          <button
            type="button"
            className="shelf-add"
            aria-label={`Put ${sort.picked.size} selected in ${space.name}`}
            onClick={() => sort.drop(space.id, [...sort.picked])}
          >
            Put {sort.picked.size} here
          </button>
        )}
        <Link to={`/fill/${space.id}`} aria-label={`Add things to ${space.name}`} className="shelf-add">
          <PlusIcon size={14} strokeWidth={3} />
          <span>Add</span>
        </Link>
      </div>
      <div className="things">
        {things.map(i => {
          const qty = qtyLabel(i.qty, i.unit);
          if (sort.on) {
            return (
              <button
                key={i.id}
                type="button"
                className="thing"
                aria-pressed={sort.picked.has(i.id)}
                data-picked={sort.picked.has(i.id) || undefined}
                onClick={() => sort.toggle(i.id)}
              >
                <span>{i.name}</span>
                {qty && <span className="thing-qty">{qty}</span>}
              </button>
            );
          }
          return (
            <Link
              draggable
              onDragStart={e => {
                e.dataTransfer.setData(DRAG_TYPE, JSON.stringify([i.id]));
                e.dataTransfer.effectAllowed = 'move';
              }}
              key={i.id} to={`/item/${i.id}`} className="thing" data-lit={ans?.id === i.id || undefined}>
              <span>{i.name}</span>
              {qty && <span className="thing-qty">{qty}</span>}
            </Link>
          );
        })}
        {inner.map(k => (
          <Link key={k.id} to={`/space/${k.id}`} className="thing thing-place" data-lit={lit.has(k.id) || undefined}>
            <span>{k.name}</span>
            <span className="thing-qty">{tree.deep(k.id)}</span>
            <ChevronIcon size={14} />
          </Link>
        ))}
        {things.length === 0 && inner.length === 0 && <span className="shelf-empty">Empty. Tap Add to fill it.</span>}
      </div>
    </div>
  );
}

/** A cupboard, fridge or rack drawn as furniture: a frame with one row per shelf. */
function Cupboard({ space, title, selfOnly }: { space: Space; title?: string; selfOnly?: boolean }) {
  const { tree, openSpaceForm } = useStore();
  const kids = selfOnly ? [] : tree.kids(space.id);
  // Things lying loose in a cupboard that also has shelves get a row of their own.
  const self = kids.length === 0 || tree.direct(space.id).length > 0;
  return (
    <section className="cupboard" aria-label={title ?? space.name}>
      {title !== '' && (
        <div className="cupboard-head">
          <h2 className="h2">
            {selfOnly ? title : <Link to={`/space/${space.id}`}>{title ?? space.name}</Link>}
          </h2>
          <span className="muted-count grow">{selfOnly ? tree.direct(space.id).length : tree.deep(space.id)} things</span>
          {!selfOnly && (
            <button
              type="button"
              aria-label={`Add a shelf or drawer to ${space.name}`}
              className="shelf-add"
              onClick={() => openSpaceForm(space.id)}
            >
              <PlusIcon size={14} strokeWidth={3} />
              <span>Shelf</span>
            </button>
          )}
        </div>
      )}
      <div className="frame">
        {self && <Shelf space={space} label={kids.length ? 'Loose' : 'Inside'} nested={false} />}
        {kids.map(k => (
          <Shelf key={k.id} space={k} label={k.name} nested />
        ))}
      </div>
    </section>
  );
}

/** A room (or any place): every cupboard and shelf in it, with its things visible at once. */
export function SpaceScreen() {
  const { id = '' } = useParams();
  const { tree, update, showToast, openSpaceForm } = useStore();
  const [sorting, setSorting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const cur = tree.get(id);
  if (id === ROOT_ID) return <Navigate to="/" replace />;
  if (!cur) return <NotFound what="place" />;

  const path = tree.pathOf(cur.id);
  const back = cur.parent && cur.parent !== ROOT_ID ? `/space/${cur.parent}` : '/';
  const above = path.slice(0, -1).map(s => s.name).join(' › ') || (tree.root?.name ?? 'Home');
  const kids = tree.kids(cur.id);
  // A room holds furniture; anything deeper holds shelves, drawers and boxes.
  const sort: Sort = {
    on: sorting,
    picked,
    toggle: itemId =>
      setPicked(p => {
        const n = new Set(p);
        if (!n.delete(itemId)) n.add(itemId);
        return n;
      }),
    drop: (to, ids) => {
      update(d => moveItems(d, ids, to));
      setPicked(new Set());
      const where = tree.get(to)?.name ?? 'there';
      showToast(`Moved ${ids.length === 1 ? '1 thing' : `${ids.length} things`} to ${where}`);
    },
  };
  const loose = tree.direct(cur.id).length;
  const addPlace = cur.parent === ROOT_ID ? 'Add an almirah, cupboard or rack' : 'Add a shelf, drawer or box';

  return (
    <>
      <header className="header header-row">
        <Link to={back} aria-label="Back" className="icon-btn boxed">
          <BackIcon />
        </Link>
        <div className="title-block">
          <span className="sub ellipsis">
            {above} · {tree.deep(cur.id)} things
          </span>
          <div className="row-8 center-y">
            <span
              aria-hidden="true"
              className="swatch swatch-lg"
              style={{ background: tree.roomColor(cur.id, ACCENT) } as CSSProperties}
            />
            <h1 className="h1 h1-sm ellipsis">{cur.name}</h1>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-44 btn-pad link-accent"
          aria-pressed={sorting}
          onClick={() => {
            setSorting(on => !on);
            setPicked(new Set());
          }}
        >
          {sorting ? 'Done' : 'Sort'}
        </button>
        <Link to={`/edit/${cur.id}`} className="btn btn-outline btn-44 btn-pad link-accent">
          Edit
        </Link>
      </header>
      <main className="main">
        <SortCtx.Provider value={sort}>
        <div className="stack-14">
        {(sorting || loose > 0) && kids.length > 0 && (
          <p className="fine" role="status">
            {sorting
              ? 'Tap things, then tap “Put here” on a shelf. Or just drag a thing onto a shelf.'
              : `${loose} loose in ${cur.name}. Drag them onto a shelf, or tap Sort.`}
          </p>
        )}
        <div className="cupboards">
          {kids.length === 0 ? (
            <Cupboard space={cur} title="" selfOnly />
          ) : (
            <>
              {tree.direct(cur.id).length > 0 && <Cupboard space={cur} title={`Loose in ${cur.name}`} selfOnly />}
              {kids.map(k => (
                <Cupboard key={k.id} space={k} />
              ))}
            </>
          )}
        </div>
        <button type="button" className="add-dashed add-place" onClick={() => openSpaceForm(cur.id)}>
          + {addPlace}
        </button>
        </div>
        </SortCtx.Provider>
      </main>
    </>
  );
}
