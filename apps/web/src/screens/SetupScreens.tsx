import { COMMON_ITEM_NAMES, newHome } from '@gharmap/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon } from '../components/Icons';
import { useStore } from '../store';

const SUGGESTED_ROOMS = [
  'Kitchen', 'Drawing Room', 'Master Bedroom', 'Kids Room', 'Store Room', 'Bathrooms', 'Balcony', 'Puja Room', 'Guest Room', 'Study',
];

/** First run, step 1: name the home and pick its rooms. */
export function WelcomeScreen() {
  const { data, replace, clearFind } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [rooms, setRooms] = useState(SUGGESTED_ROOMS);
  const [picked, setPicked] = useState(() => new Set(SUGGESTED_ROOMS.slice(0, 4)));
  const [other, setOther] = useState('');

  const toggle = (r: string) =>
    setPicked(p => {
      const next = new Set(p);
      if (!next.delete(r)) next.add(r);
      return next;
    });
  const addOther = () => {
    const r = other.trim();
    if (!r) return;
    if (!rooms.some(x => x.toLowerCase() === r.toLowerCase())) setRooms(list => [...list, r]);
    setPicked(p => new Set(p).add(rooms.find(x => x.toLowerCase() === r.toLowerCase()) ?? r));
    setOther('');
  };
  const create = () => {
    const has = data.items.length + data.spaces.length - 1;
    if (has > 0 && !window.confirm('Start a new, empty home? This replaces the current one. Export a backup first if you want to keep it.')) return;
    clearFind();
    // Assets belong to the family, not to one home's map, so they carry over.
    replace({ ...newHome(name, rooms.filter(r => picked.has(r))), assets: data.assets });
    navigate('/start');
  };

  return (
    <>
      <header className="header header-gap-2">
        <span className="eyebrow">GharMap</span>
        <h1 className="h1">One map of your home, shared by the family.</h1>
        <span className="para">Pick your rooms to start. It takes about a minute, and you can change everything later.</span>
      </header>
      <main className="main">
        <div className="stack-18 narrow">
          <div className="stack-6">
            <label htmlFor="home-name" className="label">
              Home name
            </label>
            <input
              id="home-name"
              type="text"
              autoComplete="off"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Gurgaon Flat"
              className="text-input"
            />
          </div>
          <div className="stack-8">
            <div className="row-between">
              <span id="rooms-label" className="label">
                Rooms
              </span>
              <span className="sub">{picked.size} picked</span>
            </div>
            <div role="group" aria-labelledby="rooms-label" className="chips">
              {rooms.map(r => (
                <button key={r} type="button" aria-pressed={picked.has(r)} className="chip chip-check" onClick={() => toggle(r)}>
                  {picked.has(r) && <CheckIcon size={16} />}
                  <span>{r}</span>
                </button>
              ))}
            </div>
            <div className="row-8">
              <input
                type="text"
                autoComplete="off"
                aria-label="Another room"
                value={other}
                onChange={e => setOther(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOther();
                  }
                }}
                placeholder="Another room"
                className="text-input grow"
              />
              <button type="button" className="btn btn-outline btn-50 btn-pad" disabled={!other.trim()} onClick={addOther}>
                Add room
              </button>
            </div>
          </div>
          <p className="fine">Everything stays in this browser. Nothing is sent anywhere.</p>
        </div>
      </main>
      <footer className="footer-bar">
        <Link to="/settings" className="btn btn-outline btn-48 btn-pad">
          Cancel
        </Link>
        <button type="button" className="btn btn-primary btn-48 grow" disabled={picked.size === 0} onClick={create}>
          Create my map
        </button>
      </footer>
    </>
  );
}

/** First run, step 2: place the few things everyone hunts for, instead of cataloguing the whole home. */
export function StarterScreen() {
  const { items, tree, openPicker } = useStore();
  const rows = COMMON_ITEM_NAMES.map(name => ({
    name,
    item: items.find(i => i.name.toLowerCase() === name.toLowerCase()),
  }));
  const placed = rows.filter(r => r.item).length;

  return (
    <>
      <header className="header header-gap-2">
        <h1 className="h1">Start with the things your family hunts for</h1>
        <span className="para">Skip the full inventory. Place these first, and add the rest whenever you open a shelf.</span>
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          <div className="stack-6">
            <span className="strong-15 starter-count">
              {placed} of {rows.length} placed
            </span>
            <div
              role="progressbar"
              aria-label="Things placed"
              aria-valuemin={0}
              aria-valuemax={rows.length}
              aria-valuenow={placed}
              className="progress"
            >
              <span style={{ width: `${(placed / rows.length) * 100}%` }} />
            </div>
          </div>
          <ul className="list">
            {rows.map(r => (
              <li key={r.name} className="starter-row">
                <span className="result-text">
                  <span className="result-name">{r.name}</span>
                  {r.item && <span className="result-path">{tree.pathText(r.item.space)}</span>}
                </span>
                {r.item ? (
                  <span className="placed">
                    <CheckIcon size={16} />
                    <span>Placed</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Set place for ${r.name}`}
                    className="btn btn-primary btn-44 btn-pad"
                    onClick={() => openPicker({ mode: 'place', name: r.name, show: false, start: Date.now() })}
                  >
                    Set place
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="footer-bar">
        <Link to="/" className="btn btn-primary btn-48 grow">
          Go to my map
        </Link>
      </footer>
    </>
  );
}
