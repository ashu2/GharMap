import {
  ASSET_KINDS,
  ROOT_ID,
  addAsset,
  addItems,
  addSpace,
  ageText,
  assetAge,
  isoDate,
  moveItem,
  removeAsset,
  updateAsset,
  type AssetKind,
} from '@gharmap/core';
import { useEffect, useState, type ReactNode } from 'react';
import { ACCENT, useStore } from '../store';
import { CameraIcon, CheckIcon, CloseIcon } from './Icons';
import { shrinkPhoto } from '../photo';

/** Whichever sheet is open; the place picker sits on top of anything else. */
export function Sheets() {
  const { sheet, picker, closeSheet } = useStore();

  useEffect(() => {
    if (!sheet && !picker) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, picker, closeSheet]);

  if (picker) return <Frame title="Choose a place"><PlacePicker /></Frame>;
  if (sheet?.kind === 'article') return <Frame title="Add an article"><AddArticle /></Frame>;
  if (sheet?.kind === 'space') return <Frame title="Add a place"><AddSpace parent={sheet.parent} /></Frame>;
  if (sheet?.kind === 'asset') {
    return (
      <Frame title={sheet.id ? 'Edit asset' : 'Add asset'}>
        <AssetForm id={sheet.id} />
      </Frame>
    );
  }
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

/** The + button: name a new article, optionally photograph it, then choose where it goes. */
function AddArticle() {
  const { openPicker, closeSheet } = useStore();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [start] = useState(() => Date.now());
  const next = () => {
    const n = name.trim();
    if (!n || busy) return;
    openPicker({ mode: 'place', name: n, show: true, start, photo });
  };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    try {
      setPhoto(await shrinkPhoto(f));
    } catch {
      setPhoto(undefined);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="stack-14">
      <h2 className="sheet-title">Add an article</h2>
      <div className="stack-6">
        <label htmlFor="new-article" className="field-label">
          What is it?
        </label>
        <input
          id="new-article"
          type="text"
          autoComplete="off"
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              next();
            }
          }}
          placeholder="e.g. Passport folder, drill machine"
          className="text-input"
        />
      </div>
      <div className="row-8 photo-row">
        {photo && <img src={photo} alt="Photo of the article" className="photo-thumb" />}
        <label className="btn btn-outline btn-48 grow photo-pick">
          <CameraIcon />
          <span>{busy ? 'Working…' : photo ? 'Retake photo' : 'Take a photo'}</span>
          <input type="file" accept="image/*" capture="environment" aria-label="Take a photo" onChange={onFile} hidden />
        </label>
        {photo && (
          <button type="button" className="btn btn-outline btn-48 btn-pad" onClick={() => setPhoto(undefined)}>
            Remove
          </button>
        )}
      </div>
      <span className="fine">Photos are saved small, to keep your phone’s storage light.</span>
      <div className="row-8">
        <button type="button" className="btn btn-outline btn-52 btn-pad" onClick={closeSheet}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary btn-52 grow" disabled={!name.trim() || busy} onClick={next}>
          Next: where is it?
        </button>
      </div>
    </div>
  );
}

/** Names a new room (under the home) or a new cupboard, shelf or box (under anything else). */
function AddSpace({ parent }: { parent: string }) {
  const { tree, update, closeSheet, showToast } = useStore();
  const [name, setName] = useState('');
  const room = parent === ROOT_ID;
  const save = () => {
    const n = name.trim();
    if (!n) return;
    update(d => addSpace(d, parent, n));
    closeSheet();
    showToast(`Added ${n}`);
  };
  return (
    <div className="stack-14">
      <div className="stack-2">
        <h2 className="sheet-title">{room ? 'Add a room' : 'Add a place'}</h2>
        {!room && <span className="sub">Inside {tree.get(parent)?.name}</span>}
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
          placeholder={room ? 'e.g. Balcony, Guest Room' : 'e.g. Top Shelf, Locker, Blue Box'}
          className="text-input"
        />
      </div>
      <div className="row-8">
        <button type="button" className="btn btn-outline btn-52 btn-pad" onClick={closeSheet}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary btn-52 grow" disabled={!name.trim()} onClick={save}>
          Add
        </button>
      </div>
    </div>
  );
}

function AssetForm({ id }: { id?: string }) {
  const { data, update, closeSheet, showToast } = useStore();
  const editing = id ? data.assets.find(a => a.id === id && !a.deletedAt) : undefined;
  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<AssetKind>(editing?.kind ?? 'car');
  const [bought, setBought] = useState(editing?.bought ?? '');
  const [insuranceDue, setInsuranceDue] = useState(editing?.insuranceDue ?? '');
  const [serviceDue, setServiceDue] = useState(editing?.serviceDue ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');

  const age = assetAge(bought);
  const save = () => {
    const n = name.trim();
    if (!n) return;
    const input = { name: n, kind, bought, insuranceDue, serviceDue, notes };
    if (editing) update(d => updateAsset(d, editing.id, input));
    else update(d => addAsset(d, input).data);
    closeSheet();
    showToast(editing ? `Saved ${n}` : `Added ${n}`);
  };
  const remove = () => {
    if (!editing || !window.confirm(`Remove ${editing.name} from your assets?`)) return;
    update(d => removeAsset(d, editing.id));
    closeSheet();
    showToast(`Removed ${editing.name}`);
  };
  const saveOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
  };

  return (
    <div className="stack-14">
      <h2 className="sheet-title">{editing ? 'Edit asset' : 'Add asset'}</h2>
      <div className="stack-6">
        <label htmlFor="asset-name" className="field-label">
          What is it?
        </label>
        <input
          id="asset-name"
          type="text"
          autoComplete="off"
          autoFocus={!editing}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={saveOnEnter}
          placeholder="e.g. Swift Dzire, Activa, fridge"
          className="text-input"
        />
      </div>
      <div className="stack-6">
        <span id="asset-kind-label" className="field-label">
          Type
        </span>
        <div role="group" aria-labelledby="asset-kind-label" className="chips chips-6">
          {ASSET_KINDS.map(k => (
            <button key={k.id} type="button" aria-pressed={k.id === kind} className="chip" onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="stack-6">
        <label htmlFor="asset-bought" className="field-label">
          Bought on
        </label>
        <input
          id="asset-bought"
          type="date"
          max={isoDate(new Date())}
          value={bought}
          onChange={e => setBought(e.target.value)}
          className="text-input"
        />
        <span className="fine asset-age-hint">
          {age ? `Age: ${ageText(age)}` : 'Optional. Age is worked out from this date.'}
        </span>
      </div>
      <div className="stack-6">
        <label htmlFor="asset-insurance" className="field-label">
          Insurance valid till
        </label>
        <input
          id="asset-insurance"
          type="date"
          value={insuranceDue}
          onChange={e => setInsuranceDue(e.target.value)}
          className="text-input"
        />
      </div>
      <div className="stack-6">
        <label htmlFor="asset-service" className="field-label">
          Next service due
        </label>
        <input
          id="asset-service"
          type="date"
          value={serviceDue}
          onChange={e => setServiceDue(e.target.value)}
          className="text-input"
        />
        <span className="fine">Both optional. You get a heads-up on the Assets list 30 days before.</span>
      </div>
      <div className="stack-6">
        <label htmlFor="asset-notes" className="field-label">
          Notes
        </label>
        <input
          id="asset-notes"
          type="text"
          autoComplete="off"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onKeyDown={saveOnEnter}
          placeholder="Anything worth remembering"
          className="text-input"
        />
      </div>
      <div className="row-8">
        {editing ? (
          <button type="button" className="btn btn-danger btn-52 btn-pad" onClick={remove}>
            Remove
          </button>
        ) : (
          <button type="button" className="btn btn-outline btn-52 btn-pad" onClick={closeSheet}>
            Cancel
          </button>
        )}
        <button type="button" className="btn btn-primary btn-52 grow" disabled={!name.trim()} onClick={save}>
          {editing ? 'Save changes' : 'Add asset'}
        </button>
      </div>
    </div>
  );
}

/** Every place in the home, grouped by room. Moves an existing thing, or places a new one. */
function PlacePicker() {
  const { data, items, tree, picker, update, replace, closeAll, closePicker, showToast, setQuery, setPick } = useStore();
  if (!picker) return null;
  const moving = picker.mode === 'move' ? items.find(i => i.id === picker.itemId) : undefined;
  const selected = moving?.space;

  const pick = (id: string) => {
    closeAll();
    if (picker.mode === 'place') {
      const name = picker.name.trim();
      const secs = Math.round((Date.now() - picker.start) / 100) / 10;
      const added = addItems(data, id, [{ name, qty: 1, photo: picker.photo }], secs);
      replace(added.data);
      showToast(`Added ${name} to ${tree.pathText(id)}`);
      if (picker.show && added.items[0]) {
        setQuery('');
        setPick(added.items[0].id);
      }
    } else if (moving && moving.space !== id) {
      update(d => moveItem(d, moving.id, id));
      showToast(`Moved to ${tree.pathText(id)}`);
    }
  };

  return (
    <div className="stack-14">
      <div className="row-between">
        <h2 className="sheet-title">{picker.mode === 'move' ? `Move ${moving?.name ?? ''}` : `Where is ${picker.name}?`}</h2>
        <button type="button" aria-label="Close place picker" className="icon-btn picker-close" onClick={closePicker}>
          <CloseIcon size={20} />
        </button>
      </div>
      {tree.rooms.length === 0 && <p className="para">Add a room first, then come back.</p>}
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
