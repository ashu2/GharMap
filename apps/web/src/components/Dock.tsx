import { FREQUENT_SEARCHES, ROOT_ID, moveItem, searchItems, type Item, type Space } from '@gharmap/core';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFind, useStore } from '../store';
import { PathSteps, qtyLabel } from './Chrome';
import { CheckIcon, CloseIcon, PlusIcon, SearchIcon } from './Icons';

/** Compartments named "Left …" / "Right …" are drawn side by side; everything else is stacked. */
const SIDE = /^(left|right)\b/i;

/**
 * The find bar and its answer. On phones it is docked at the bottom, by the thumb, with the
 * answer growing upward from it; on desktop it is the left rail.
 */
export function Dock() {
  const { items, tree, query, setQuery, setPick, clearFind, openPicker, openArticleForm } = useStore();
  const { q, matches, ans } = useFind();
  const input = useRef<HTMLInputElement>(null);

  // "/" jumps to the find bar from anywhere that is not already a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target.tagName : '';
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t)) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const chips = FREQUENT_SEARCHES.filter(w => searchItems(items, w).length > 0);
  const places = tree.placesUnder(ROOT_ID).filter(s => s.id !== ROOT_ID);

  return (
    <aside aria-label="Find" className="dock">
      <span className="rail-brand wide-only" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={28} height={28} />
        GharMap
      </span>

      <div className="dock-body">
        {ans ? (
          <Answer key={ans.id} ans={ans} matches={matches} />
        ) : q ? (
          <div className="stack-10">
            <span className="strong-15">Nothing called “{q}” yet</span>
            {places.length > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-44 btn-pad self-start"
                onClick={() => openPicker({ mode: 'place', name: q, show: true, start: Date.now() })}
              >
                Add “{q}”
              </button>
            )}
          </div>
        ) : chips.length > 0 ? (
          <div className="stack-8">
            <span className="label">Often looked for</span>
            <div className="chips chips-scroll">
              {chips.map(w => (
                <button
                  key={w}
                  type="button"
                  className="chip"
                  onClick={() => {
                    setQuery(w);
                    setPick(null);
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span className="fine">Type a name to find it. Open a room to add the things in it.</span>
        )}
      </div>

      <div className="dock-search">
        <div className="search-box">
          <SearchIcon size={20} stroke="#0F6E66" />
          <input
            ref={input}
            type="search"
            autoComplete="off"
            aria-label="Find anything in your home"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPick(null);
            }}
            placeholder="Where is…?"
            className="search-input"
          />
          {(query || ans) && (
            <button
              type="button"
              aria-label="Clear search"
              className="icon-btn icon-btn-40"
              onClick={() => {
                clearFind();
                input.current?.focus();
              }}
            >
              <CloseIcon />
            </button>
          )}
        </div>
        {!q && !ans && places.length > 0 && (
          <button type="button" aria-label="Add an article" className="add-btn" onClick={openArticleForm}>
            <PlusIcon size={22} />
          </button>
        )}
      </div>
    </aside>
  );
}

/** Where the thing is: numbered path, a drawing of the cupboard with its shelf lit, and a one-tap fix. */
function Answer({ ans, matches }: { ans: Item; matches: Item[] }) {
  const { tree, update, clearFind, setPick, openPicker } = useStore();
  const [fixing, setFixing] = useState(false);
  // Where it was when this card opened: any move since then, by chip or by picker, shows as "Moved just now".
  const cameFrom = useRef(ans.space);
  const moved = ans.space !== cameFrom.current;
  useEffect(() => setFixing(false), [ans.space]);

  const path = tree.pathOf(ans.space);
  const here = tree.get(ans.space);
  const unit = here?.parent && here.parent !== ROOT_ID ? tree.get(here.parent) : undefined;
  const cells = unit ? tree.kids(unit.id) : [];
  const stacked = cells.filter(c => !SIDE.test(c.name));
  const sides = cells.filter(c => SIDE.test(c.name));
  const room = path[0];
  const elsewhere = room ? tree.placesUnder(room.id).filter(p => p.id !== ans.space).slice(0, 8) : [];
  const others = matches.filter(i => i.id !== ans.id).slice(0, 3);
  const qty = qtyLabel(ans.qty, ans.unit);

  const cell = (c: Space) => (
    <div key={c.id} className="cell" data-lit={c.id === ans.space || undefined}>
      {c.id === ans.space ? `${c.name} · ${ans.name} here` : c.name}
    </div>
  );

  return (
    <section aria-label="Where it is" className="answer">
      <div className="stack-2">
        <div className="row-between">
          <span className="found-eyebrow">{moved ? 'Moved just now' : 'Found'}</span>
          {matches.length > 1 && <span className="sub">{matches.length} matches</span>}
        </div>
        <div className="row-baseline">
          <span className="answer-name">{ans.name}</span>
          {qty && <span className="sub">{qty}</span>}
        </div>
      </div>
      {ans.photo && <img src={ans.photo} alt={`Photo of ${ans.name}`} className="answer-photo" />}
      <PathSteps path={path} />

      {fixing ? (
        <div className="stack-10">
          <div className="stack-2">
            <span className="strong-15">Where did you find it?</span>
            <span className="sub">One tap moves it, so the next person is sent to the right place.</span>
          </div>
          <div className="chips chips-6">
            {elsewhere.map(p => (
              <button
                key={p.id}
                type="button"
                className="chip"
                onClick={() => {
                  update(d => moveItem(d, ans.id, p.id));
                  setPick(ans.id);
                }}
              >
                {tree.pathOf(p.id).slice(1).map(s => s.name).join(' › ') || p.name}
              </button>
            ))}
            <button type="button" className="chip chip-dashed" onClick={() => openPicker({ mode: 'move', itemId: ans.id })}>
              Another room…
            </button>
          </div>
          <button type="button" className="link-btn self-start" onClick={() => setFixing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          {unit && (
            <div className="diagram" role="img" aria-label={`${ans.name} is in ${here?.name} of ${unit.name}`}>
              <span className="diagram-title">{unit.name}</span>
              {stacked.map(cell)}
              {sides.length > 0 && <div className="cell-row">{sides.map(cell)}</div>}
            </div>
          )}
          {ans.notes && <p className="answer-note">{ans.notes}</p>}
          <div className="row-8">
            <button type="button" className="btn btn-primary btn-48 grow" onClick={clearFind}>
              <CheckIcon />
              <span>Got it</span>
            </button>
            <button type="button" className="btn btn-outline btn-48 grow" onClick={() => setFixing(true)}>
              It’s not there
            </button>
          </div>
          <Link to={`/item/${ans.id}`} className="link-btn self-start">
            Quantity, notes and history
          </Link>
          {others.length > 0 && (
            <div className="stack-6">
              <span className="label">Other matches</span>
              {others.map(i => (
                <button key={i.id} type="button" className="result other-match" onClick={() => setPick(i.id)}>
                  <span className="result-text">
                    <span className="result-name">{i.name}</span>
                    <span className="result-path">{tree.pathText(i.space)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
