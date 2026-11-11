import {
  ageText,
  assetAge,
  assetKindLabel,
  dueStatus,
  liveAssets,
  needsAttention,
  parseIsoDate,
  type AssetKind,
} from '@gharmap/core';
import { BikeIcon, BoxIcon, CarIcon, ChevronIcon, PlusIcon, TvIcon } from '../components/Icons';
import { useStore } from '../store';

export function KindIcon({ kind }: { kind: AssetKind }) {
  if (kind === 'car') return <CarIcon />;
  if (kind === 'bike') return <BikeIcon />;
  if (kind === 'appliance' || kind === 'electronics') return <TvIcon />;
  return <BoxIcon />;
}

/** "Mar 2019" */
function boughtText(bought: string): string {
  const p = parseIsoDate(bought);
  if (!p) return '';
  return new Date(p.y, p.m - 1, p.d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/** One line for an insurance or service date, coloured by how close it is. Nothing when the date is unset. */
function DueLine({ what, due, now }: { what: 'insurance' | 'service'; due: string; now: Date }) {
  const s = dueStatus(due, now);
  const p = parseIsoDate(due);
  if (!s || !p) return null;
  const date = new Date(p.y, p.m - 1, p.d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const ins = what === 'insurance';
  const text =
    s.level === 'overdue'
      ? ins ? `Insurance expired ${days(-s.days)} ago` : `Service overdue by ${days(-s.days)}`
      : s.days === 0
        ? ins ? 'Insurance expires today' : 'Service due today'
        : s.level === 'soon'
          ? ins ? `Insurance expires in ${days(s.days)}` : `Service due in ${days(s.days)}`
          : ins ? `Insured till ${date}` : `Service due ${date}`;
  return <span className={`asset-due asset-due-${s.level}`}>{text}</span>;
}

export function AssetsScreen() {
  const { data, openAssetForm } = useStore();
  const now = new Date();
  const assets = liveAssets(data.assets);
  const oldest = assets[0];
  const oldestAge = oldest ? assetAge(oldest.bought, now) : null;
  const attention = assets.filter(a => needsAttention(a, now)).length;

  return (
    <>
      <header className="header header-gap-2">
        <h1 className="h1">Assets</h1>
        <span className="sub asset-summary">
          {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
          {oldest && oldestAge ? ` · oldest is ${oldest.name}, ${ageText(oldestAge)}` : ''}
        </span>
        {attention > 0 && (
          <span className="asset-attention">
            {attention} {attention === 1 ? 'needs' : 'need'} attention: insurance or service due
          </span>
        )}
      </header>
      <main className="main">
        <div className="stack-12 narrow">
          {assets.length > 0 ? (
            <ul className="list">
              {assets.map(a => {
                const age = assetAge(a.bought, now);
                const when = boughtText(a.bought);
                return (
                  <li key={a.id}>
                    <button type="button" className="result asset-row" onClick={() => openAssetForm(a.id)}>
                      <span aria-hidden="true" className="asset-icon">
                        <KindIcon kind={a.kind} />
                      </span>
                      <span className="result-text">
                        <span className="result-name">{a.name}</span>
                        <span className="result-path">
                          {assetKindLabel(a.kind)}
                          {when ? ` · Bought ${when}` : ''}
                        </span>
                        <DueLine what="insurance" due={a.insuranceDue} now={now} />
                        <DueLine what="service" due={a.serviceDue} now={now} />
                      </span>
                      <span className={'asset-age' + (age ? '' : ' asset-age-none')}>
                        {age ? ageText(age) : a.bought ? 'Not bought yet' : 'Age not set'}
                      </span>
                      <ChevronIcon stroke="#8A93A0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty">No assets yet. Add your car, bike or big appliances to keep track of their age.</div>
          )}
          <div className="row-8 actions">
            <button type="button" className="btn btn-primary btn-48 grow" onClick={() => openAssetForm()}>
              <PlusIcon />
              <span>Add asset</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
