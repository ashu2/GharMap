import { FREQUENT_SEARCHES, searchItems } from '@gharmap/core';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseIcon, PinIcon, SearchIcon } from '../components/Icons';
import { ACCENT, useStore } from '../store';

export function SearchScreen() {
  const { data, tree, query, setQuery, setHl, openAdd } = useStore();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const q = query.trim();
  const results = searchItems(data.items, q);

  return (
    <>
      <header className="header">
        <h1 className="h1">Search</h1>
        <div className="search-box narrow">
          <SearchIcon stroke="#586272" />
          <label htmlFor="q" className="sr-only">
            Search items
          </label>
          <input
            ref={input}
            id="q"
            type="search"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Try passport, charger, medicines"
            className="search-input"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="icon-btn icon-btn-40"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          {!q && (
            <section className="stack-10">
              <h2 className="label">Often searched</h2>
              <div className="chips">
                {FREQUENT_SEARCHES.map(w => (
                  <button key={w} type="button" className="chip" onClick={() => setQuery(w)}>
                    {w}
                  </button>
                ))}
              </div>
              <p className="hint hint-left">
                Search looks at item names and notes. Tap a result and the map lights up the exact shelf.
              </p>
            </section>
          )}
          {results.length > 0 && (
            <>
              <span className="result-count">
                {results.length} {results.length === 1 ? 'match' : 'matches'}
              </span>
              <ul className="list">
                {results.map(i => (
                  <li key={i.id}>
                    <button
                      type="button"
                      className="result"
                      onClick={() => {
                        setHl(i.id);
                        navigate('/');
                      }}
                    >
                      <span aria-hidden="true" className="swatch" style={{ background: tree.roomColor(i.space, ACCENT) }} />
                      <span className="result-text">
                        <span className="result-name">{i.name}</span>
                        <span className="result-path">{tree.pathText(i.space)}</span>
                      </span>
                      <span className="result-map">
                        <PinIcon />
                        <span>Map</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {q && results.length === 0 && (
            <div className="empty empty-card">
              <span className="strong-15">Nothing called “{q}” yet</span>
              <button type="button" className="btn btn-primary btn-44 btn-pad" onClick={() => openAdd({ name: q })}>
                Add “{q}”
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
