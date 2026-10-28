import type { HomeTree, Space } from '@gharmap/core';
import { Link, useNavigate } from 'react-router-dom';
import { CloseIcon, SearchIcon } from '../components/Icons';
import { useStore } from '../store';
import { useWide } from '../useWide';

/** Splits rooms into n columns, each room going to the currently shortest one. */
function columns(tree: HomeTree, n: number): Space[][] {
  const cols: Space[][] = Array.from({ length: n }, () => []);
  const height: number[] = Array(n).fill(0);
  for (const room of tree.rooms) {
    const units = tree.kids(room.id);
    const weight = 1 + units.length + units.reduce((sum, u) => sum + tree.kids(u.id).length * 0.6, 0);
    const c = height.indexOf(Math.min(...height));
    cols[c]!.push(room);
    height[c]! += weight;
  }
  return cols;
}

function RoomCard({ room, lit, hlName }: { room: Space; lit: Set<string>; hlName: string }) {
  const { tree } = useStore();
  const color = room.color ?? '#94A3B8';
  return (
    <section
      aria-label={room.name}
      className="room-card"
      style={{ background: color + '24', border: lit.has(room.id) ? undefined : `1px solid ${color}73` }}
      data-lit={lit.has(room.id) || undefined}
    >
      <Link to={`/space/${room.id}`} className="room-head">
        <span className="room-title">
          <span aria-hidden="true" className="swatch" style={{ background: color }} />
          <span className="ellipsis">{room.name}</span>
        </span>
        <span className="room-count">{tree.deep(room.id)}</span>
      </Link>
      {tree.kids(room.id).map(u => (
        <Link key={u.id} to={`/space/${u.id}`} className="unit" data-lit={lit.has(u.id) || undefined}>
          <span className="unit-head">
            <span className="ellipsis">{u.name}</span>
            <span className="muted-count">{tree.deep(u.id)}</span>
          </span>
          {tree.kids(u.id).map(c => (
            <span key={c.id} className="comp ellipsis" data-lit={lit.has(c.id) || undefined}>
              {lit.has(c.id) ? `${c.name} · ${hlName}` : c.name}
            </span>
          ))}
        </Link>
      ))}
    </section>
  );
}

export function MapScreen() {
  const { data, tree, hl, setHl } = useStore();
  const navigate = useNavigate();
  const hlItem = hl ? data.items.find(i => i.id === hl) : undefined;
  const lit = new Set(hlItem ? tree.pathOf(hlItem.space).map(s => s.id) : []);
  const cols = columns(tree, useWide() ? 3 : 2);

  return (
    <>
      <header className="header">
        <div className="title-block">
          <span className="eyebrow">GharMap</span>
          <h1 className="h1">{tree.root?.name ?? 'My home'}</h1>
          <span className="sub">
            {data.items.length} items in {tree.rooms.length} rooms
          </span>
        </div>
        <Link to="/search" className="search-launch">
          <SearchIcon />
          <span>Find anything in your home…</span>
        </Link>
      </header>
      <main className="main">
        <div className="stack-12">
          {hlItem && (
            <div role="status" className="found-card">
              <div className="found-top">
                <div className="found-text">
                  <span className="found-eyebrow">Found</span>
                  <span className="found-name">{hlItem.name}</span>
                  <span className="found-path">{tree.pathText(hlItem.space)}</span>
                </div>
                <button type="button" aria-label="Clear highlight" className="icon-btn found-close" onClick={() => setHl(null)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="row-8">
                <button type="button" className="btn found-primary" onClick={() => navigate(`/space/${hlItem.space}`)}>
                  Open that shelf
                </button>
                <button type="button" className="btn found-secondary" onClick={() => navigate(`/item/${hlItem.id}`)}>
                  Item details
                </button>
              </div>
            </div>
          )}
          <div className="map-cols">
            {cols.map((col, n) => (
              <div key={n} className="map-col">
                {col.map(r => (
                  <RoomCard key={r.id} room={r} lit={lit} hlName={hlItem?.name ?? ''} />
                ))}
              </div>
            ))}
          </div>
          <p className="hint">Tap a room or a cupboard to zoom in</p>
        </div>
      </main>
    </>
  );
}
