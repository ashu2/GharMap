import { ROOT_ID } from '@gharmap/core';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CrumbBar, qtyText } from '../components/Chrome';
import { ChevronIcon, PlusIcon } from '../components/Icons';
import { ACCENT, useStore } from '../store';
import { NotFound } from './NotFound';

export function SpaceScreen() {
  const { id = '' } = useParams();
  const { data, tree, hl, openAdd, openSpaceForm } = useStore();
  const cur = tree.get(id);
  if (id === ROOT_ID) return <Navigate to="/" replace />;
  if (!cur) return <NotFound what="place" />;

  const hlItem = hl ? data.items.find(i => i.id === hl) : undefined;
  const lit = new Set(hlItem ? tree.pathOf(hlItem.space).map(s => s.id) : []);
  const path = tree.pathOf(cur.id);
  const crumbs = [{ name: tree.root?.name ?? 'Home', to: '/' }].concat(
    path.slice(0, -1).map(s => ({ name: s.name, to: `/space/${s.id}` })),
  );
  const back = cur.parent && cur.parent !== ROOT_ID ? `/space/${cur.parent}` : '/';
  const children = tree.kids(cur.id);
  const here = tree.direct(cur.id);

  return (
    <>
      <header className="header header-tight">
        <CrumbBar back={back} crumbs={crumbs} />
        <div className="row-10">
          <span aria-hidden="true" className="swatch swatch-lg" style={{ background: tree.roomColor(cur.id, ACCENT) }} />
          <h1 className="h1 h1-sm">{cur.name}</h1>
        </div>
        <span className="sub">{tree.deep(cur.id)} items inside</span>
      </header>
      <main className="main">
        <div className="stack-18">
          {children.length > 0 && (
            <section className="stack-8">
              <h2 className="label">Inside</h2>
              <div className="grid-2">
                {children.map(k => {
                  const inner = tree.kids(k.id);
                  const its = tree.direct(k.id);
                  const sub = inner.length
                    ? inner.map(c => c.name).join(' · ')
                    : its.length
                      ? its.slice(0, 3).map(i => i.name).join(', ') + (its.length > 3 ? '…' : '')
                      : 'Empty';
                  return (
                    <Link key={k.id} to={`/space/${k.id}`} className="tile" data-lit={lit.has(k.id) || undefined}>
                      <span className="tile-head">
                        <span className="tile-name">{k.name}</span>
                        <span className="muted-count">{tree.deep(k.id)}</span>
                      </span>
                      <span className="tile-sub">{sub}</span>
                      {lit.has(k.id) && hlItem && <span className="tile-found">Has {hlItem.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
          {here.length > 0 && (
            <section className="stack-8">
              <h2 className="label">Items here</h2>
              <ul className="list">
                {here.map(i => (
                  <li key={i.id}>
                    <Link to={`/item/${i.id}`} className="item-row" data-lit={hl === i.id || undefined}>
                      <span className="item-row-name">{i.name}</span>
                      <span className="item-row-qty">{qtyText(i.qty, i.unit)}</span>
                      <ChevronIcon stroke="#8A93A0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {children.length === 0 && here.length === 0 && (
            <div className="empty">Nothing here yet. Add the first item.</div>
          )}
          <div className="row-8 actions">
            <button type="button" className="btn btn-primary btn-48 grow" onClick={() => openAdd({ space: cur.id })}>
              <PlusIcon />
              <span>Add item here</span>
            </button>
            <button type="button" className="btn btn-outline btn-48" onClick={() => openSpaceForm(cur.id)}>
              Add section
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
