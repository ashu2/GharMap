import { removeItem, updateItem } from '@gharmap/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PathSteps } from '../components/Chrome';
import { BackIcon, MinusIcon, PinIcon, PlusIcon } from '../components/Icons';
import { useStore } from '../store';
import { NotFound } from './NotFound';

export function ItemScreen() {
  const { id = '' } = useParams();
  const { items, tree, update, setQuery, setPick, clearFind, openPicker, showToast } = useStore();
  const navigate = useNavigate();
  const it = items.find(i => i.id === id);
  if (!it) return <NotFound what="item" />;

  const path = tree.pathOf(it.space);
  const room = path[0];
  const setQty = (qty: number) => update(d => updateItem(d, it.id, { qty: Math.max(0, qty) }));
  const remove = () => {
    if (!window.confirm(`Remove ${it.name} from this home? You can bring it back from Settings.`)) return;
    clearFind();
    update(d => removeItem(d, it.id));
    showToast(`Removed ${it.name}`);
    navigate(room ? `/space/${room.id}` : '/');
  };

  return (
    <>
      <header className="header header-row">
        <Link to={room ? `/space/${room.id}` : '/'} aria-label="Back" className="icon-btn boxed">
          <BackIcon />
        </Link>
        <div className="title-block">
          <span className="sub ellipsis">{path.slice(0, -1).map(s => s.name).join(' › ') || tree.root?.name}</span>
          <h1 className="h1 h1-sm ellipsis">{it.name}</h1>
        </div>
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          {it.photo && <img src={it.photo} alt={`Photo of ${it.name}`} className="item-photo" />}
          <section className="card stack-12">
            <span className="label">Where it is</span>
            <PathSteps path={path} />
            <div className="row-8">
              <button
                type="button"
                className="btn btn-primary btn-44 grow"
                onClick={() => {
                  setQuery('');
                  setPick(it.id);
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
          <button type="button" className="btn btn-danger btn-46" onClick={remove}>
            Remove from this home
          </button>
        </div>
      </main>
    </>
  );
}
