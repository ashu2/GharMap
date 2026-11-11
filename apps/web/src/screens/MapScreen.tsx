import { ROOT_ID, type HomeTree, type Space } from '@gharmap/core';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useFind, useStore } from '../store';
import { useWide } from '../useWide';

/** Splits rooms into n columns, each room going to the currently shortest one. */
function columns(tree: HomeTree, n: number): Space[][] {
  const cols: Space[][] = Array.from({ length: n }, () => []);
  const height: number[] = Array(n).fill(0);
  for (const room of tree.rooms) {
    const c = height.indexOf(Math.min(...height));
    cols[c]!.push(room);
    height[c]! += 1 + tree.kids(room.id).length;
  }
  return cols;
}

function RoomCard({ room, lit, found }: { room: Space; lit: Set<string>; found: boolean }) {
  const { tree } = useStore();
  const here = lit.has(room.id);
  return (
    <Link
      to={`/space/${room.id}`}
      aria-label={room.name}
      className="room-card"
      style={{ '--room': room.color ?? '#94A3B8' } as CSSProperties}
      data-lit={here || undefined}
      data-dim={(found && !here) || undefined}
    >
      <span className="room-head">
        <span className="room-title">
          <span aria-hidden="true" className="swatch swatch-room" />
          <span className="ellipsis">{room.name}</span>
        </span>
        <span className="room-count">{here ? 'Here' : tree.deep(room.id)}</span>
      </span>
      {tree.kids(room.id).length > 0 && (
        <span className="room-units">
          {tree.kids(room.id).map(u => (
            <span key={u.id} className="unit" data-lit={lit.has(u.id) || undefined}>
              <span className="unit-head">
                <span className="ellipsis">{u.name}</span>
                <span className="muted-count">{tree.deep(u.id)}</span>
              </span>
              {tree.kids(u.id).length > 0 && (
                <span className="unit-sub ellipsis">
                  {tree.kids(u.id).map(c => c.name).join(' · ')}
                </span>
              )}
            </span>
          ))}
        </span>
      )}
    </Link>
  );
}

/** Home: the whole flat as a map. Finding something lights its room up in place; the map never navigates away. */
export function MapScreen() {
  const { items, tree, openSpaceForm } = useStore();
  const { ans, lit } = useFind();
  const cols = columns(tree, useWide() ? 3 : 2);

  return (
    <>
      <header className="header header-gap-2">
        <span className="eyebrow">GharMap</span>
        <h1 className="h1 ellipsis">{tree.root?.name ?? 'My home'}</h1>
        <span className="sub">
          {items.length} {items.length === 1 ? 'thing' : 'things'} · {tree.rooms.length}{' '}
          {tree.rooms.length === 1 ? 'room' : 'rooms'}
        </span>
      </header>
      <main className="main">
        <div className="stack-12">
          {tree.rooms.length > 0 ? (
            <div className="map-cols" data-found={ans ? '' : undefined}>
              {cols.map((col, n) => (
                <div key={n} className="map-col">
                  {col.map(r => (
                    <RoomCard key={r.id} room={r} lit={lit} found={!!ans} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">This home has no rooms yet. Add the first one to start the map.</div>
          )}
          {!ans && (
            <p className="hint">
              {tree.rooms.length > 0 && 'Tap a room to step inside · '}
              <button type="button" className="link-btn" onClick={() => openSpaceForm(ROOT_ID)}>
                Add a room
              </button>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
