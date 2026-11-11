import { ROOM_COLORS, ROOT_ID, setSpaceColor } from '@gharmap/core';
import { Link, useParams } from 'react-router-dom';
import { NameField } from '../components/Chrome';
import { useStore } from '../store';
import { NotFound } from './NotFound';

const COLOR_NAMES = ['Orange', 'Teal', 'Violet', 'Yellow', 'Blue', 'Grey'];

/** Rename a room and what is inside it, recolour it, and add cupboards and shelves. */
export function EditScreen() {
  const { id = '' } = useParams();
  const { tree, update, openSpaceForm } = useStore();
  const cur = id === ROOT_ID ? undefined : tree.get(id);
  if (!cur) return <NotFound what="place" />;
  const isRoom = cur.parent === ROOT_ID;
  const units = tree.kids(cur.id);

  return (
    <>
      <header className="header header-row">
        <div className="title-block">
          <span className="eyebrow">Edit</span>
          <h1 className="h1 h1-sm ellipsis">{cur.name}</h1>
        </div>
        <Link to={`/space/${cur.id}`} className="btn btn-primary btn-44 btn-pad-lg">
          Done
        </Link>
      </header>
      <main className="main">
        <div className="stack-14 narrow">
          <section className="card stack-12">
            <div className="stack-6">
              <span className="label">{isRoom ? 'Room name' : 'Name'}</span>
              <NameField id={cur.id} label={isRoom ? 'Room name' : 'Name'} />
            </div>
            {isRoom && (
              <div role="radiogroup" aria-label="Room colour" className="swatches">
                {ROOM_COLORS.map((c, n) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={cur.color === c}
                    aria-label={COLOR_NAMES[n] ?? c}
                    className="swatch-btn"
                    onClick={() => update(d => setSpaceColor(d, cur.id, c))}
                  >
                    <span aria-hidden="true" style={{ background: c }} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {units.map(u => (
            <section key={u.id} className="frame edit-unit" aria-label={u.name}>
              <div className="edit-unit-head">
                <NameField id={u.id} label="Cupboard name" className="input-strong" />
              </div>
              {tree.kids(u.id).map(s => (
                <div key={s.id} className="edit-row">
                  <NameField id={s.id} label={`Shelf name in ${u.name}`} />
                  <span className="muted-count">{tree.deep(s.id)} things</span>
                </div>
              ))}
              <button type="button" className="edit-add" onClick={() => openSpaceForm(u.id)}>
                + Add a shelf or drawer
              </button>
            </section>
          ))}

          <button type="button" className="add-dashed" onClick={() => openSpaceForm(cur.id)}>
            + Add a cupboard, rack or table
          </button>
          <p className="fine">Renaming never moves anything: the things on a shelf stay with it.</p>
        </div>
      </main>
    </>
  );
}
