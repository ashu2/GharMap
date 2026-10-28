import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { BackIcon, MapIcon, PlusIcon, SearchIcon, SlidersIcon } from './Icons';

export interface Crumb {
  name: string;
  to: string;
}

/** Back button + breadcrumb row used by the space and item screens. */
export function CrumbBar({ back, crumbs }: { back: string; crumbs: Crumb[] }) {
  return (
    <div className="crumbbar">
      <Link to={back} aria-label="Back" className="icon-btn back-btn">
        <BackIcon />
      </Link>
      <nav aria-label="Breadcrumb" className="crumbs">
        {crumbs.map((c, n) => (
          <span key={c.to} className="crumb">
            {n > 0 && (
              <span aria-hidden="true" className="crumb-sep">
                ›
              </span>
            )}
            <Link to={c.to}>{c.name}</Link>
          </span>
        ))}
      </nav>
    </div>
  );
}

/** Bottom tab bar on phones; left sidebar on desktop (see styles.css). */
export function MainNav({ onAdd }: { onAdd: () => void }) {
  const { pathname } = useLocation();
  const onMap = pathname === '/' || pathname.startsWith('/space/') || pathname.startsWith('/item/');
  const tab = (to: string, label: string, icon: JSX.Element, current: boolean) => (
    <Link to={to} className={'nav-btn' + (current ? ' current' : '')} aria-current={current ? 'page' : undefined}>
      {icon}
      <span>{label}</span>
    </Link>
  );
  return (
    <nav aria-label="Main" className="main-nav">
      <span className="nav-brand" aria-hidden="true">
        <img src="/icon.svg" alt="" width={28} height={28} />
        GharMap
      </span>
      {tab('/', 'Map', <MapIcon />, onMap)}
      {tab('/search', 'Search', <SearchIcon size={22} />, pathname === '/search')}
      <button type="button" className="nav-btn nav-add" onClick={onAdd}>
        <span className="nav-add-pill">
          <PlusIcon size={22} />
        </span>
        <span>
          Add<span className="wide-only"> item</span>
        </span>
      </button>
      {tab('/settings', 'Settings', <SlidersIcon />, pathname === '/settings')}
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

/** "1", "2 L", or "" for a single unitless thing. */
export function qtyText(qty: number, unit: string): string {
  return qty === 1 && !unit ? '' : qty + (unit ? ' ' + unit : '');
}
