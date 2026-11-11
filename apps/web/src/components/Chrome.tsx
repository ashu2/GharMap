import { renameSpace, type Space } from '@gharmap/core';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { CarIcon, MapIcon, SlidersIcon } from './Icons';

/** Map, Assets and Settings: icons at the top right on phones, a labelled list in the desktop rail (see styles.css). */
export function MainNav() {
  const first = useLocation().pathname.split('/')[1] ?? '';
  const section = first === 'assets' ? 'assets' : ['settings', 'welcome', 'start'].includes(first) ? 'settings' : 'map';
  const tab = (to: string, label: string, icon: JSX.Element, current: boolean) => (
    <Link
      to={to}
      aria-label={label}
      className={'nav-btn' + (current ? ' current' : '')}
      aria-current={current ? 'page' : undefined}
    >
      {icon}
      <span className="wide-only">{label}</span>
    </Link>
  );
  return (
    <nav aria-label="Main" className="main-nav">
      {tab('/', 'Map', <MapIcon />, section === 'map')}
      {tab('/assets', 'Assets', <CarIcon />, section === 'assets')}
      {tab('/settings', 'Settings', <SlidersIcon />, section === 'settings')}
    </nav>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div role="status" className="toast">
      {toast}
    </div>
  );
}

/** "2 L", "× 3", or "" for a single unitless thing. */
export function qtyLabel(qty: number, unit: string): string {
  return unit ? `${qty} ${unit}` : qty === 1 ? '' : `× ${qty}`;
}

/** Room → cupboard → shelf as numbered steps, the last one highlighted: directions inside the home. */
export function PathSteps({ path }: { path: Space[] }) {
  return (
    <ol aria-label="Path" className="steps">
      {path.map((s, n) => (
        <li key={s.id} className="step" data-last={n === path.length - 1 || undefined}>
          <span aria-hidden="true" className="step-num">
            {n + 1}
          </span>
          <span>{s.name}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A place's name, edited in place. Every non-blank keystroke is saved; a blank field
 * snaps back to the saved name when focus leaves, so a place can never end up nameless.
 */
export function NameField({ id, label, className }: { id: string; label: string; className?: string }) {
  const { tree, update } = useStore();
  const saved = tree.get(id)?.name ?? '';
  const [text, setText] = useState(saved);
  useEffect(() => setText(t => (t.trim() === saved ? t : saved)), [saved]);
  return (
    <input
      type="text"
      autoComplete="off"
      aria-label={label}
      value={text}
      onChange={e => {
        setText(e.target.value);
        update(d => renameSpace(d, id, e.target.value));
      }}
      onBlur={() => setText(saved)}
      className={'text-input ' + (className ?? '')}
    />
  );
}
