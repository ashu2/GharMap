import { COMMON_ITEM_NAMES, TARGET_SECS, addItem, addSpace, moveItem, nameSuggestions } from '@gharmap/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ACCENT, useStore } from '../store';
import { CheckIcon, ClockIcon, CloseIcon, MinusIcon, PlusIcon } from './Icons';

/** Whichever sheet is open: the place picker sits on top of the add sheet. */
export function Sheets() {
  const { sheet, picker, closeSheet } = useStore();

  useEffect(() => {
    if (!sheet && !picker) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, picker, closeSheet]);

  if (picker) return <Frame title="Choose a place"><PlacePicker /></Frame>;
  if (sheet?.kind === 'add') return <Frame title="Add item"><AddItem /></Frame>;
  if (sheet?.kind === 'space') return <Frame title="Add a section"><AddSection parent={sheet.parent} /></Frame>;
  return null;
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  const { closeSheet } = useStore();
  return (
    <div className="sheet-layer">
      <button type="button" aria-label="Close" className="sheet-backdrop" onClick={closeSheet} />
      <div role="dialog" aria-modal="true" aria-label={title} className="sheet">
        <span aria-hidden="true" className="sheet-grip" />
        {children}
      </div>
    </div>
  );
}

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange(n: number): void }) {
  return (
    <div role="group" aria-label={label} className="stepper">
      <button type="button" aria-label="Decrease quantity" className="step-btn" onClick={() => onChange(Math.max(min, value - 1))}>
        <MinusIcon />
      </button>
      <span className="step-val">{value}</span>
      <button type="button" aria-label="Increase quantity" className="step-btn" onClick={() => onChange(value + 1)}>
        <PlusIcon />
      </button>
    </div>
  );
}

function AddItem() {
  const { data, tree, add, setAdd, update, openPicker, closeSheet, showToast } = useStore();
  const [now, setNow] = useState(Date.now());
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(t);
  }, []);

  const elapsed = Math.max(0, (now - add.start) / 1000);
  const suggestions = nameSuggestions(COMMON_ITEM_NAMES.concat(data.items.map(i => i.name)), add.name);
  const canSave = add.name.trim().length > 0;

  const save = (another: boolean) => {
    const name = add.name.trim();
    if (!name) return;
    const secs = Math.round((Date.now() - add.start) / 100) / 10;
    update(d => addItem(d, { space: add.space, name, qty: add.qty, secs }).data);
    if (another) setAdd({ name: '', qty: 1, start: Date.now() });
    else closeSheet();
    showToast(`Added ${name} · ${secs} s`);
  };

  return (
    <div className="stack-14">
      <div className="row-between">
        <h2 className="sheet-title">Add item</h2>
        <span
          aria-label={`Time on this item: ${elapsed.toFixed(0)} seconds`}
          className={'timer ' + (elapsed <= TARGET_SECS ? 'pill-ok' : 'pill-warn')}
        >
          <ClockIcon />
          <span>{elapsed.toFixed(1)} s</span>
        </span>
      </div>
      <div className="stack-6">
        <label htmlFor="add-name" className="field-label">
          What is it?
        </label>
        <input
          ref={nameInput}
          id="add-name"
          type="text"
          autoComplete="off"
          autoFocus
          value={add.name}
          onChange={e => setAdd({ name: e.target.value })}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save(true);
            }
          }}
          placeholder="e.g. Passport, spare keys"
          className="text-input"
        />
        {suggestions.length > 0 && (
          <div className="chips chips-6">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                className="chip chip-soft"
                onClick={() => {
                  setAdd({ name: s });
                  // Keep Enter-to-save working after picking a suggestion.
                  nameInput.current?.focus();
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="stack-6">
        <span id="where-label" className="field-label">
          Where is it?
        </span>
        <button type="button" aria-describedby="where-label" className="where" onClick={() => openPicker({ mode: 'add' })}>
          <span aria-hidden="true" className="swatch" style={{ background: tree.roomColor(add.space, ACCENT) }} />
          <span className="where-path">{tree.pathText(add.space)}</span>
          <span className="where-change">Change</span>
        </button>
      </div>
      <div className="row-between">
        <span className="field-label">Quantity</span>
        <Stepper label="Quantity" value={add.qty} min={1} onChange={qty => setAdd({ qty })} />
      </div>
      <div className="row-8">
        <button type="button" className="btn btn-outline btn-52 btn-pad" disabled={!canSave} onClick={() => save(false)}>
          Save
        </button>
        <button type="button" className="btn btn-primary btn-52 grow" disabled={!canSave} onClick={() => save(true)}>
          Save and add next
        </button>
      </div>
      <span className="fine center">Press Enter to save and start the next item. Each save is timed for Gate 0.</span>
    </div>
  );
}

function AddSection({ parent }: { parent: string }) {
  const { tree, update, closeSheet, showToast } = useStore();
  const [name, setName] = useState('');
  const save = () => {
    const n = name.trim();
    if (!n) return;
    update(d => addSpace(d, parent, n));
    closeSheet();
    showToast(`Added section ${n}`);
  };
  return (
    <div className="stack-14">
      <div className="stack-2">
        <h2 className="sheet-title">Add a section</h2>
        <span className="sub">Inside {tree.get(parent)?.name}</span>
      </div>
      <div className="stack-6">
        <label htmlFor="new-space" className="field-label">
          Name
        </label>
        <input
          id="new-space"
          type="text"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save();
            }
          }}
          placeholder="e.g. Top Shelf, Locker, Blue Box"
          className="text-input"
        />
      </div>
      <div className="row-8">
        <button type="button" className="btn btn-outline btn-52 btn-pad" onClick={closeSheet}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary btn-52 grow" disabled={!name.trim()} onClick={save}>
          Add section
        </button>
      </div>
    </div>
  );
}

function PlacePicker() {
  const { data, tree, picker, add, setAdd, update, closePicker, showToast } = useStore();
  if (!picker) return null;
  const moving = picker.mode === 'move' ? data.items.find(i => i.id === picker.itemId) : undefined;
  const selected = picker.mode === 'move' ? moving?.space : add.space;

  const pick = (id: string) => {
    closePicker();
    if (picker.mode === 'add') {
      setAdd({ space: id });
    } else if (moving && moving.space !== id) {
      update(d => moveItem(d, moving.id, id));
      showToast(`Moved to ${tree.pathText(id)}`);
    }
  };

  return (
    <div className="stack-14">
      <div className="row-between">
        <h2 className="sheet-title">{picker.mode === 'move' ? 'Move to…' : 'Where is it?'}</h2>
        <button type="button" aria-label="Close place picker" className="icon-btn picker-close" onClick={closePicker}>
          <CloseIcon size={20} />
        </button>
      </div>
      {tree.rooms.map(room => (
        <section key={room.id} className="stack-6">
          <h3 className="picker-room">
            <span aria-hidden="true" className="swatch" style={{ background: room.color ?? ACCENT }} />
            <span>{room.name}</span>
          </h3>
          <div className="stack-6">
            {tree.placesUnder(room.id).map(leaf => {
              const on = leaf.id === selected;
              return (
                <button
                  key={leaf.id}
                  type="button"
                  aria-pressed={on}
                  className={'option' + (on ? ' option-on' : '')}
                  onClick={() => pick(leaf.id)}
                >
                  <span>{tree.pathOf(leaf.id).slice(1).map(s => s.name).join(' › ') || leaf.name}</span>
                  {on && <CheckIcon />}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
