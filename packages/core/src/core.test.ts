import { describe, expect, it } from 'vitest';
import {
  addAsset,
  addItem,
  addItems,
  addSpace,
  ageText,
  assetAge,
  buildTree,
  dueStatus,
  liveAssets,
  liveItems,
  median,
  moveItem,
  moveItems,
  nameSuggestions,
  needsAttention,
  newHome,
  newId,
  parseQuickAdd,
  renameSpace,
  restoreItem,
  parseBackup,
  removeAsset,
  removeItem,
  removedItems,
  searchItems,
  seedData,
  setSpaceColor,
  toBackup,
  updateAsset,
} from './index';

describe('tree', () => {
  const d = seedData();
  const t = buildTree(d.spaces, d.items);

  it('builds the room → unit → compartment path', () => {
    expect(t.pathText('wa-right')).toBe('Master Bedroom › Wooden Almirah › Right Side');
    expect(t.pathOf('home')).toEqual([]);
  });

  it('counts items deeply', () => {
    expect(t.deep('wa-right')).toBe(3);
    expect(t.deep('wood-almirah')).toBe(9);
    expect(t.deep('home')).toBe(d.items.length);
  });

  it('inherits the room colour', () => {
    expect(t.roomColor('fridge-veg', '#000')).toBe('#FF6B35');
    expect(t.roomColor('missing', '#000')).toBe('#000');
  });

  it('lists the six rooms and their leaves', () => {
    expect(t.rooms.map(r => r.id)).toEqual(['kitchen', 'drawing', 'master', 'kids', 'store', 'bath']);
    expect(t.leavesUnder('bath').map(s => s.id)).toEqual(['cb-1']);
  });

  it('keeps a shelf pickable after a box is added inside it', () => {
    const d2 = addSpace(seedData(), 'rk-top', 'Blue Box');
    const t2 = buildTree(d2.spaces, d2.items);
    expect(t2.placesUnder('store').map(s => s.name)).toEqual(['Top Shelf', 'Blue Box', 'Bottom Shelf']);
    expect(t2.leavesUnder('store').map(s => s.name)).toEqual(['Blue Box', 'Bottom Shelf']);
  });

  it('survives a cycle in imported data', () => {
    const t2 = buildTree(
      [
        { id: 'home', parent: null, name: 'H' },
        { id: 'a', parent: 'b', name: 'A' },
        { id: 'b', parent: 'a', name: 'B' },
      ],
      [],
    );
    expect(t2.pathOf('a').length).toBeLessThanOrEqual(2);
  });
});

describe('search', () => {
  const { items } = seedData();

  it('finds by name and by notes, prefix matches first', () => {
    expect(searchItems(items, 'passport').map(i => i.name)).toEqual(['Passports']);
    expect(searchItems(items, 'blue folder').map(i => i.name)).toEqual(['Passports']);
    const r = searchItems(items, 'sh');
    expect(r[0]!.name.toLowerCase().startsWith('sh')).toBe(true);
  });

  it('returns nothing for a blank query', () => {
    expect(searchItems(items, '   ')).toEqual([]);
  });

  it('suggests distinct prefix matches, skipping an exact match', () => {
    expect(nameSuggestions(['Passport', 'passport', 'Pass', 'Pen'], 'pass')).toEqual(['Passport']);
  });
});

describe('ops', () => {
  it('adds an item and logs its time', () => {
    const { data, item } = addItem(seedData(), { space: 'bd-1', name: '  Keys ', qty: 2, secs: 4.2 });
    expect(item.name).toBe('Keys');
    expect(data.items.at(-1)).toBe(item);
    expect(data.times.at(-1)).toBe(4.2);
  });

  it('moves an item and records history', () => {
    const d = moveItem(seedData(), 'i0', 'bd-1');
    const milk = d.items.find(i => i.id === 'i0')!;
    expect(milk.space).toBe('bd-1');
    expect(milk.history[0]).toBe('Moved from Kitchen › Fridge › Top Shelf');
  });

  it('moves several items at once and skips ones already there', () => {
    const d = moveItems(seedData(), ['i0', 'i1', 'nope'], 'bd-1');
    expect(d.items.find(i => i.id === 'i0')!.space).toBe('bd-1');
    expect(d.items.find(i => i.id === 'i1')!.space).toBe('bd-1');
    expect(moveItems(d, ['i0'], 'bd-1')).toBe(d);
  });

  it('adds a section under a space', () => {
    const d = addSpace(seedData(), 'rack', 'Blue Box');
    expect(d.spaces.at(-1)).toMatchObject({ parent: 'rack', name: 'Blue Box' });
  });

  it('makes v4 UUIDs', () => {
    expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe('fill a shelf', () => {
  it('splits on commas and new lines and reads quantities', () => {
    expect(parseQuickAdd('chargers x3, watch,  wallet ×2\ntape')).toEqual([
      { name: 'Chargers', qty: 3 },
      { name: 'Watch', qty: 1 },
      { name: 'Wallet', qty: 2 },
      { name: 'Tape', qty: 1 },
    ]);
  });

  it('keeps names that only look like quantities, and odd capitals', () => {
    expect(parseQuickAdd('Xbox 360, iPhone cable, box x0')).toEqual([
      { name: 'Xbox 360', qty: 1 },
      { name: 'iPhone cable', qty: 1 },
      { name: 'Box', qty: 1 },
    ]);
    expect(parseQuickAdd(' , ,\n')).toEqual([]);
  });

  it('adds every entry to the shelf and logs a time for each', () => {
    const before = seedData();
    const { data, items } = addItems(before, 'bd-1', parseQuickAdd('torch, keys x2'), 2.5);
    expect(items.map(i => [i.name, i.qty, i.space])).toEqual([
      ['Torch', 1, 'bd-1'],
      ['Keys', 2, 'bd-1'],
    ]);
    expect(data.items).toHaveLength(before.items.length + 2);
    expect(data.times.slice(-2)).toEqual([2.5, 2.5]);
    expect(new Set(items.map(i => i.id)).size).toBe(2);
  });
});

describe('editing the map', () => {
  it('renames a place and ignores a blank name', () => {
    const d = renameSpace(seedData(), 'wa-right', '  Locker ');
    expect(buildTree(d.spaces, d.items).pathText('wa-right')).toBe('Master Bedroom › Wooden Almirah › Locker');
    expect(renameSpace(d, 'wa-right', '   ')).toBe(d);
  });

  it('recolours a room, and deeper places inherit it', () => {
    const d = setSpaceColor(seedData(), 'master', '#60A5FA');
    expect(buildTree(d.spaces, d.items).roomColor('wa-right', '#000')).toBe('#60A5FA');
  });

  it('gives a new room a colour but not a new shelf', () => {
    const d = addSpace(addSpace(seedData(), 'home', 'Balcony'), 'rack', 'Blue Box');
    expect(d.spaces.at(-2)).toMatchObject({ parent: 'home', name: 'Balcony', color: '#FF6B35' });
    expect(d.spaces.at(-1)!.color).toBeUndefined();
  });

  it('starts a new home with coloured rooms and nothing in it', () => {
    const d = newHome(' Dhanaura House ', ['Kitchen', ' ', 'Hall']);
    const t = buildTree(d.spaces, d.items);
    expect(t.root?.name).toBe('Dhanaura House');
    expect(t.rooms.map(r => [r.name, r.color])).toEqual([
      ['Kitchen', '#FF6B35'],
      ['Hall', '#4ECDC4'],
    ]);
    expect(d.items).toEqual([]);
    expect(parseBackup(JSON.stringify(toBackup(d)))).toEqual(d);
  });
});

describe('removing things', () => {
  const now = new Date(2026, 10, 11, 9);

  it('soft-deletes: the row stays but drops out of everything shown', () => {
    const before = seedData();
    const d = removeItem(before, 'i42', now);
    expect(d.items).toHaveLength(before.items.length);
    expect(d.items.find(i => i.id === 'i42')).toMatchObject({ deletedAt: now.toISOString(), space: 'wa-right' });
    expect(d.items.find(i => i.id === 'i42')!.history[0]).toBe('Removed');

    const live = liveItems(d.items);
    expect(live).toHaveLength(before.items.length - 1);
    expect(searchItems(live, 'passport')).toEqual([]);
    expect(buildTree(d.spaces, live).deep('wa-right')).toBe(2);
    expect(liveItems(before.items)).toBe(before.items);
    // Removing twice keeps the first timestamp.
    expect(removeItem(d, 'i42', new Date(2027, 0, 1))).toEqual(d);
  });

  it('lists removed things newest first and restores one to its shelf', () => {
    const d = removeItem(removeItem(seedData(), 'i0', now), 'i42', new Date(2026, 10, 12));
    expect(removedItems(d.items).map(i => i.name)).toEqual(['Passports', 'Milk']);

    const back = restoreItem(d, 'i42');
    const item = back.items.find(i => i.id === 'i42')!;
    expect(item.deletedAt).toBeUndefined();
    expect('deletedAt' in item).toBe(false);
    expect(item.space).toBe('wa-right');
    expect(item.history.slice(0, 2)).toEqual(['Restored', 'Removed']);
    expect(restoreItem(back, 'i42')).toEqual(back);
  });

  it('keeps removed things in a backup', () => {
    const d = removeItem(seedData(), 'i42', now);
    expect(parseBackup(JSON.stringify(toBackup(d)))).toEqual(d);
  });
});

describe('backup', () => {
  it('round-trips', () => {
    const d = seedData();
    expect(parseBackup(JSON.stringify(toBackup(d)))).toEqual(d);
  });

  it('rejects files that are not GharMap backups', () => {
    expect(() => parseBackup('nope')).toThrow('not valid JSON');
    expect(() => parseBackup('{"app":"other"}')).toThrow('not a GharMap backup');
  });

  it('rejects items pointing at missing places', () => {
    const b = toBackup(seedData());
    b.data.items[0]!.space = 'gone';
    expect(() => parseBackup(JSON.stringify(b))).toThrow('"Milk" points to a place');
  });
});

describe('median', () => {
  it('handles odd, even and empty', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('assets', () => {
  const now = new Date(2026, 10, 11); // 11 Nov 2026
  const blank = { name: '', kind: 'other' as const, bought: '', insuranceDue: '', serviceDue: '', notes: '' };

  it('grades insurance and service dates', () => {
    expect(dueStatus('2026-11-01', now)).toEqual({ days: -10, level: 'overdue' });
    expect(dueStatus('2026-11-11', now)).toEqual({ days: 0, level: 'soon' });
    expect(dueStatus('2026-12-11', now)).toEqual({ days: 30, level: 'soon' });
    expect(dueStatus('2026-12-12', now)).toEqual({ days: 31, level: 'later' });
    expect(dueStatus('', now)).toBeNull();
  });

  it('flags the demo assets that need attention', () => {
    const flagged = seedData(now).assets.filter(a => needsAttention(a, now));
    expect(flagged.map(a => a.name)).toEqual(['Family car', 'Scooter']);
  });

  it('works out age in whole years and months', () => {
    expect(assetAge('2019-03-15', now)).toEqual({ years: 7, months: 7 });
    expect(assetAge('2019-11-11', now)).toEqual({ years: 7, months: 0 });
    expect(assetAge('2019-11-12', now)).toEqual({ years: 6, months: 11 });
    expect(assetAge('2026-10-20', now)).toEqual({ years: 0, months: 0 });
  });

  it('has no age for unknown, invalid or future dates', () => {
    expect(assetAge('', now)).toBeNull();
    expect(assetAge('2019-02-30', now)).toBeNull();
    expect(assetAge('2027-01-01', now)).toBeNull();
  });

  it('words the age compactly', () => {
    expect(ageText({ years: 7, months: 7 })).toBe('7 yr 7 mo');
    expect(ageText({ years: 7, months: 0 })).toBe('7 yr');
    expect(ageText({ years: 0, months: 3 })).toBe('3 mo');
    expect(ageText({ years: 0, months: 0 })).toBe('Under a month');
  });

  it('adds, edits and soft-deletes', () => {
    const { data, asset } = addAsset(seedData(), { ...blank, name: ' Cycle ', kind: 'bike', bought: '2024-05-01' });
    expect(asset.name).toBe('Cycle');
    const edited = updateAsset(data, asset.id, { ...blank, name: 'Cycle', notes: 'Gifted', serviceDue: '2026-12-01' });
    expect(edited.assets.at(-1)).toMatchObject({ kind: 'other', bought: '', notes: 'Gifted', serviceDue: '2026-12-01' });

    const removed = removeAsset(edited, asset.id, now);
    expect(removed.assets).toHaveLength(edited.assets.length);
    expect(removed.assets.at(-1)!.deletedAt).toBe(now.toISOString());
    expect(liveAssets(removed.assets).some(a => a.id === asset.id)).toBe(false);
  });

  it('lists oldest first, undated last', () => {
    expect(liveAssets(seedData().assets).map(a => a.id)).toEqual(['a0', 'a1', 'a2', 'a3', 'a4', 'a5']);
    const mixed = liveAssets([
      { ...blank, id: 'x', name: 'X' },
      { ...blank, id: 'y', name: 'Y', kind: 'car', bought: '2020-01-01' },
    ]);
    expect(mixed.map(a => a.id)).toEqual(['y', 'x']);
  });

  it('reads backups made before assets existed, and tidies bad fields', () => {
    const b = toBackup(seedData()) as unknown as { data: Record<string, unknown> };
    delete b.data.assets;
    expect(parseBackup(JSON.stringify(b)).assets).toEqual([]);

    b.data.assets = [{ id: 'z', name: 'Z', kind: 'spaceship', bought: 'last year', insuranceDue: '2027-02-30' }];
    expect(parseBackup(JSON.stringify(b)).assets).toEqual([{ ...blank, id: 'z', name: 'Z' }]);
  });
});
