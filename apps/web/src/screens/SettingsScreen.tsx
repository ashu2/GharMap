import { ROOT_ID, TARGET_SECS, liveItems, median, parseBackup, removedItems, restoreItem, seedData, toBackup } from '@gharmap/core';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { NameField } from '../components/Chrome';
import { useStore } from '../store';

const BAR_MAX_SECS = 20;
const BAR_HEIGHT = 72;

export function SettingsScreen() {
  const { data, items, tree, update, replace, showToast, clearFind } = useStore();
  const removed = removedItems(data.items);
  const fileInput = useRef<HTMLInputElement>(null);

  const med = median(data.times);
  const ok = med <= TARGET_SECS;
  const recent = data.times.slice(-14);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(toBackup(data), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gharmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    // Revoking synchronously can cancel the download in Safari, including on iPhone.
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    showToast('Backup downloaded');
  };

  const importFile = async (file: File) => {
    try {
      const next = parseBackup(await file.text());
      if (!window.confirm(`Replace everything with this backup (${liveItems(next.items).length} items)?`)) return;
      clearFind();
      replace(next);
      showToast('Backup restored');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not read that file');
    }
  };

  const reset = () => {
    if (!window.confirm('Replace everything with the demo home? Export a backup first if you want to keep your items.')) return;
    clearFind();
    replace(seedData());
    showToast('Demo data restored');
  };

  return (
    <>
      <header className="header header-gap-2">
        <h1 className="h1">Settings</h1>
        <span className="sub">Phase 0 prototype · everything stays in this browser</span>
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          <section className="card card-16 stack-12">
            <div className="row-between">
              <h2 className="h2">Entry speed</h2>
              <span className={'pill ' + (ok ? 'pill-ok' : 'pill-warn')}>{ok ? 'On target' : 'Too slow'}</span>
            </div>
            <div className="row-baseline">
              <span className="big-num">{med.toFixed(1)} s</span>
              <span className="sub">median per item · target under {TARGET_SECS} s</span>
            </div>
            <div
              role="img"
              aria-label={`Seconds per item for the last ${recent.length} items: ${recent.join(', ')}`}
              className="bars"
            >
              <span aria-hidden="true" className="bars-target" style={{ bottom: (TARGET_SECS / BAR_MAX_SECS) * BAR_HEIGHT }} />
              {recent.map((t, n) => (
                <span
                  key={n}
                  className="bar"
                  data-slow={t > TARGET_SECS || undefined}
                  style={{ height: Math.max(4, Math.round((Math.min(t, BAR_MAX_SECS) / BAR_MAX_SECS) * BAR_HEIGHT)) }}
                />
              ))}
            </div>
            <span className="fine">
              Last {recent.length} things added, oldest first. Dashed line is {TARGET_SECS} s; outlined bars took longer.
            </span>
          </section>
          <section className="card card-16 stack-10">
            <h2 className="h2">Your home</h2>
            <NameField id={ROOT_ID} label="Home name" />
            <p className="para">
              {items.length} items in {data.spaces.length - 1} places. Stored only in this browser; nothing is sent
              anywhere.
            </p>
            <button type="button" className="btn btn-primary btn-46" onClick={exportData}>
              Export backup (JSON)
            </button>
            <button type="button" className="btn btn-outline btn-46" onClick={() => fileInput.current?.click()}>
              Import backup
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={e => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void importFile(f);
              }}
            />
            <Link to="/welcome" className="btn btn-outline btn-46">
              Start a new, empty home
            </Link>
            <button type="button" className="btn btn-danger btn-46" onClick={reset}>
              Reset to demo data
            </button>
          </section>
          {removed.length > 0 && (
            <section className="card card-16 stack-10" aria-label="Recently removed">
              <h2 className="h2">Recently removed</h2>
              <ul className="list">
                {removed.map(i => (
                  <li key={i.id} className="starter-row removed-row">
                    <span className="result-text">
                      <span className="result-name">{i.name}</span>
                      <span className="result-path">Was in {tree.pathText(i.space) || 'a place that no longer exists'}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Restore ${i.name}`}
                      className="btn btn-outline btn-44 btn-pad"
                      onClick={() => {
                        update(d => restoreItem(d, i.id));
                        showToast(`Restored ${i.name}`);
                      }}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="card card-16 stack-6">
            <h2 className="h2">About this build</h2>
            <p className="para">
              GharMap Phase 0 web prototype. One home, no login, no sync. Gold, pantry, documents and AI come in later
              phases.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
