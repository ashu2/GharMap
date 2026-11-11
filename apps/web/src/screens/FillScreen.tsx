import { COMMON_ITEM_NAMES, ROOT_ID, TARGET_SECS, addItems, parseQuickAdd } from '@gharmap/core';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { qtyLabel } from '../components/Chrome';
import { CloseIcon } from '../components/Icons';
import { useStore } from '../store';
import { NotFound } from './NotFound';

/**
 * Fill a shelf: pick the place once, then type and press Enter for each thing.
 * Commas add several at once, which also makes phone-keyboard dictation work.
 */
export function FillScreen() {
  const { id = '' } = useParams();
  const { data, tree, replace, setLastFill } = useStore();
  const cur = id === ROOT_ID ? undefined : tree.get(id);
  const [text, setText] = useState('');
  // Ids added in this visit, newest first, and the seconds each one took.
  const [fresh, setFresh] = useState<string[]>([]);
  const [secs, setSecs] = useState<number[]>([]);
  const last = useRef(Date.now());

  useEffect(() => {
    if (cur) setLastFill(cur.id);
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cur) return <NotFound what="place" />;

  const add = (raw: string) => {
    const entries = parseQuickAdd(raw);
    if (!entries.length) return;
    const now = Date.now();
    // Time since the last add, shared between everything typed in one go.
    const each = Math.round(((now - last.current) / 1000 / entries.length) * 10) / 10;
    last.current = now;
    const added = addItems(data, cur.id, entries, each);
    replace(added.data);
    setFresh(f => [...added.items.map(i => i.id).reverse(), ...f]);
    setSecs(s => [...s, ...added.items.map(() => each)]);
    setText('');
  };

  const path = tree.pathOf(cur.id);
  const room = path[0] ?? cur;
  const here = tree.direct(cur.id);
  const isFresh = new Set(fresh);
  const list = [...fresh.flatMap(f => here.filter(i => i.id === f)), ...here.filter(i => !isFresh.has(i.id))];
  const taken = new Set(here.map(i => i.name.toLowerCase()));
  const quick = COMMON_ITEM_NAMES.filter(n => !taken.has(n.toLowerCase())).slice(0, 6);
  const avg = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : 0;

  return (
    <>
      <header className="header header-row">
        <Link to={`/space/${room.id}`} aria-label="Close" className="icon-btn boxed">
          <CloseIcon />
        </Link>
        <div className="title-block">
          <span className="eyebrow">Filling this place</span>
          <h1 className="h1 h1-sm ellipsis">{cur.name}</h1>
          {path.length > 1 && (
            <span className="sub ellipsis">
              {path.slice(0, -1).map(s => s.name).join(' › ')}
            </span>
          )}
        </div>
      </header>
      <main className="main">
        <div className="stack-14 narrow">
          <div className="stack-6">
            <div className="search-box fill-box">
              <input
                type="text"
                autoComplete="off"
                autoFocus
                aria-label="Name of the thing"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add(text);
                  }
                }}
                onPaste={e => {
                  // A pasted list (one thing per line) goes straight in.
                  const pasted = e.clipboardData.getData('text');
                  if (!pasted.includes('\n')) return;
                  e.preventDefault();
                  add(pasted);
                }}
                placeholder="Type a thing, press Enter"
                className="search-input"
              />
              <button type="button" className="btn btn-primary btn-44 btn-pad" disabled={!text.trim()} onClick={() => add(text)}>
                Add
              </button>
            </div>
            <span className="fine">Commas add several at once: chargers x3, watch, wallet. You can also paste a list.</span>
          </div>

          {quick.length > 0 && (
            <div className="stack-8">
              <span className="label">One-tap add</span>
              <div className="chips chips-6">
                {quick.map(n => (
                  <button key={n} type="button" className="chip" onClick={() => add(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="stack-8">
            <span className="label">Here now · {here.length}</span>
            {list.length > 0 ? (
              <ul className="list fill-list">
                {list.map(i => (
                  <li key={i.id} className="fill-row" data-new={isFresh.has(i.id) || undefined}>
                    <span className="item-row-name ellipsis">{i.name}</span>
                    <span className="item-row-qty">{qtyLabel(i.qty, i.unit)}</span>
                    {isFresh.has(i.id) && <span className="tag-new">New</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">Nothing here yet.</div>
            )}
          </div>
        </div>
      </main>
      <footer className="footer-bar">
        <div role="status" className="stack-2 fill-stats">
          <span className="strong-15">
            {secs.length ? `${secs.length} added · ${avg.toFixed(1)} s each` : 'Nothing added yet'}
          </span>
          <span className="fine">Target: under {TARGET_SECS} s each</span>
        </div>
        <Link to={`/space/${room.id}`} className="btn btn-primary btn-48 btn-pad-lg">
          Done
        </Link>
      </footer>
    </>
  );
}
