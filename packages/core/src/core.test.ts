import { describe, expect, it } from 'vitest';
import {
  addItem,
  addSpace,
  buildTree,
  median,
  moveItem,
  nameSuggestions,
  newId,
  parseBackup,
  searchItems,
  seedData,
  toBackup,
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

  it('adds a section under a space', () => {
    const d = addSpace(seedData(), 'rack', 'Blue Box');
    expect(d.spaces.at(-1)).toMatchObject({ parent: 'rack', name: 'Blue Box' });
  });

  it('makes v4 UUIDs', () => {
    expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
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
