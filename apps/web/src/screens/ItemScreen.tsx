import { updateItem } from '@gharmap/core';
import { useNavigate, useParams } from 'react-router-dom';
import { CrumbBar } from '../components/Chrome';
import { MinusIcon, PinIcon, PlusIcon } from '../components/Icons';
import { useStore } from '../store';
import { NotFound } from './NotFound';

export function ItemScreen() {
  const { id = '' } = useParams();
  const { data, tree, update, setHl, openPicker } = useStore();
  const navigate = useNavigate();
  const it = data.items.find(i => i.id === id);
  if (!it) return <NotFound what="item" />;

  const crumbs = [{ name: tree.root?.name ?? 'Home', to: '/' }].concat(
    tree.pathOf(it.space).map(s => ({ name: s.name, to: `/space/${s.id}` })),
  );
  const setQty = (qty: number) => update(d => updateItem(d, it.id, { qty: Math.max(0, qty) }));

  return (
    <>
      <header className="header header-tight">
        <CrumbBar back={`/space/${it.space}`} crumbs={crumbs} />
        <h1 className="h1 h1-sm">{it.name}</h1>
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          <section className="card stack-12">
            <div className="stack-4">
              <span className="label">Location</span>
              <span className="location">{tree.pathText(it.space)}</span>
            </div>
            <div className="row-8">
              <button
                type="button"
                className="btn btn-primary btn-44 grow"
                onClick={() => {
                  setHl(it.id);
                  navigate('/');
                }}
              >
                <PinIcon />
                <span>Show on map</span>
              </button>
              <button type="button" className="btn btn-outline btn-44 grow" onClick={() => openPicker({ mode: 'move', itemId: it.id })}>
                Move
              </button>
            </div>
          </section>
          <section className="card card-row">
            <span id="item-qty-label" className="strong-15">
              Quantity
            </span>
            <div role="group" aria-labelledby="item-qty-label" className="stepper">
              <button type="button" aria-label="Decrease quantity" className="step-btn" onClick={() => setQty(it.qty - 1)}>
                <MinusIcon />
              </button>
              <span className="step-val step-val-wide">
                {it.qty} <span className="step-unit">{it.unit || 'pcs'}</span>
              </span>
              <button type="button" aria-label="Increase quantity" className="step-btn" onClick={() => setQty(it.qty + 1)}>
                <PlusIcon />
              </button>
            </div>
          </section>
          <section className="card stack-8">
            <label htmlFor="item-notes" className="label">
              Notes
            </label>
            <textarea
              id="item-notes"
              rows={3}
              value={it.notes}
              onChange={e => {
                const notes = e.target.value;
                update(d => updateItem(d, it.id, { notes }));
              }}
              placeholder="Anything that helps you find it"
              className="textarea"
            />
          </section>
          <section className="card stack-8">
            <h2 className="label">History</h2>
            <ul className="list history">
              {it.history.map((h, n) => (
                <li key={n}>
                  <span aria-hidden="true" className="dot" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
