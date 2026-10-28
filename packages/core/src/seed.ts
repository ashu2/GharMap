import type { HomeData, Item, Space } from './types';

/** Demo home, ported from the original React prototype's `homeData` (Gurgaon flat). */
const SPACES: Space[] = [
  { id: 'home', parent: null, name: 'Gurgaon Flat' },
  { id: 'kitchen', parent: 'home', name: 'Kitchen', color: '#FF6B35' },
  { id: 'fridge', parent: 'kitchen', name: 'Fridge' },
  { id: 'fridge-top', parent: 'fridge', name: 'Top Shelf' },
  { id: 'fridge-mid', parent: 'fridge', name: 'Middle Shelf' },
  { id: 'fridge-veg', parent: 'fridge', name: 'Veg Tray' },
  { id: 'dry-cabinet', parent: 'kitchen', name: 'Dry Cabinet' },
  { id: 'dc-top', parent: 'dry-cabinet', name: 'Top Shelf' },
  { id: 'dc-bot', parent: 'dry-cabinet', name: 'Bottom Shelf' },
  { id: 'spice-rack', parent: 'kitchen', name: 'Spice Rack' },
  { id: 'sr-1', parent: 'spice-rack', name: 'All Spices' },
  { id: 'drawing', parent: 'home', name: 'Drawing Room', color: '#4ECDC4' },
  { id: 'glass-almirah', parent: 'drawing', name: 'Glass Almirah' },
  { id: 'ga-top', parent: 'glass-almirah', name: 'Top Shelf' },
  { id: 'ga-mid', parent: 'glass-almirah', name: 'Middle Shelf' },
  { id: 'ga-bot', parent: 'glass-almirah', name: 'Bottom Shelf' },
  { id: 'tv-unit', parent: 'drawing', name: 'TV Unit' },
  { id: 'tv-top', parent: 'tv-unit', name: 'Top Surface' },
  { id: 'tv-draw', parent: 'tv-unit', name: 'Drawer' },
  { id: 'master', parent: 'home', name: 'Master Bedroom', color: '#A78BFA' },
  { id: 'wood-almirah', parent: 'master', name: 'Wooden Almirah' },
  { id: 'wa-top', parent: 'wood-almirah', name: 'Top Section' },
  { id: 'wa-left', parent: 'wood-almirah', name: 'Left Side' },
  { id: 'wa-right', parent: 'wood-almirah', name: 'Right Side' },
  { id: 'bed-drawer', parent: 'master', name: 'Bed Drawer' },
  { id: 'bd-1', parent: 'bed-drawer', name: 'Left Drawer' },
  { id: 'bd-2', parent: 'bed-drawer', name: 'Right Drawer' },
  { id: 'kids', parent: 'home', name: 'Kids Room', color: '#FCD34D' },
  { id: 'toy-shelf', parent: 'kids', name: 'Toy Shelf' },
  { id: 'ts-1', parent: 'toy-shelf', name: "Aarav's Shelf" },
  { id: 'ts-2', parent: 'toy-shelf', name: 'Younger One' },
  { id: 'study-table', parent: 'kids', name: 'Study Table' },
  { id: 'st-1', parent: 'study-table', name: 'Drawer' },
  { id: 'store', parent: 'home', name: 'Store Room', color: '#60A5FA' },
  { id: 'rack', parent: 'store', name: 'Storage Rack' },
  { id: 'rk-top', parent: 'rack', name: 'Top Shelf' },
  { id: 'rk-bot', parent: 'rack', name: 'Bottom Shelf' },
  { id: 'bath', parent: 'home', name: 'Bathrooms', color: '#94A3B8' },
  { id: 'cabinet', parent: 'bath', name: 'Cabinet' },
  { id: 'cb-1', parent: 'cabinet', name: 'Shelf' },
];

// [space, name, qty, unit]
const ITEM_ROWS: [string, string, number, string][] = [
  ['fridge-top', 'Milk', 2, 'L'], ['fridge-top', 'Curd', 1, ''], ['fridge-top', 'Butter', 1, ''], ['fridge-top', 'Cheese', 1, ''],
  ['fridge-mid', 'Apples', 6, ''], ['fridge-mid', 'Oranges', 4, ''], ['fridge-mid', 'Leftovers', 1, ''],
  ['fridge-veg', 'Tomatoes', 1, 'kg'], ['fridge-veg', 'Onions', 2, 'kg'], ['fridge-veg', 'Capsicum', 3, ''],
  ['dc-top', 'Dal', 1, 'kg'], ['dc-top', 'Rice', 5, 'kg'], ['dc-top', 'Atta', 3, 'kg'], ['dc-top', 'Poha', 1, 'kg'],
  ['dc-bot', 'Cooking Oil', 1, 'L'], ['dc-bot', 'Vinegar', 1, ''], ['dc-bot', 'Sauces', 3, ''],
  ['sr-1', 'Haldi', 1, ''], ['sr-1', 'Jeera', 1, ''], ['sr-1', 'Dhaniya', 1, ''], ['sr-1', 'Garam Masala', 1, ''],
  ['ga-top', 'Bone China Dinner Set', 1, 'set'], ['ga-top', 'Crystal Glasses', 6, ''],
  ['ga-mid', 'Photo Frames', 4, ''], ['ga-mid', 'Showpieces', 5, ''], ['ga-mid', 'Vases', 2, ''],
  ['ga-bot', 'Books', 20, ''], ['ga-bot', 'Magazines', 8, ''], ['ga-bot', 'Board Games', 3, ''],
  ['tv-top', 'Smart TV 55 inch', 1, ''], ['tv-top', 'Soundbar', 1, ''],
  ['tv-draw', 'Remote Controls', 3, ''], ['tv-draw', 'HDMI Cables', 2, ''], ['tv-draw', 'Spare Batteries', 8, ''],
  ['wa-top', 'Winter Razai', 2, ''], ['wa-top', 'Extra Pillows', 4, ''], ['wa-top', 'Blankets', 3, ''],
  ['wa-left', 'Medicines', 1, 'box'], ['wa-left', 'First Aid Kit', 1, ''], ['wa-left', 'Thermometer', 1, ''],
  ['wa-right', 'Jewellery Box', 1, ''], ['wa-right', 'Documents Folder', 1, ''], ['wa-right', 'Passports', 2, ''],
  ['bd-1', 'Chargers', 3, ''], ['bd-1', 'Watch', 1, ''], ['bd-1', 'Wallet', 1, ''],
  ['bd-2', 'Novels', 4, ''], ['bd-2', 'Pen', 2, ''], ['bd-2', 'Notepad', 1, ''],
  ['ts-1', 'Lego Sets', 3, ''], ['ts-1', 'Cricket Bat', 1, ''], ['ts-1', 'Drawing Book', 2, ''],
  ['ts-2', 'Soft Toys', 6, ''], ['ts-2', 'Blocks', 1, 'box'], ['ts-2', 'Puzzles', 4, ''],
  ['st-1', 'Stationery', 1, 'box'], ['st-1', 'School Books', 10, ''], ['st-1', 'Crayons', 2, 'box'],
  ['rk-top', 'Suitcases', 3, ''], ['rk-top', 'Diwali Lights', 4, ''],
  ['rk-bot', 'Tool Box', 1, ''], ['rk-bot', 'Extension Board', 2, ''],
  ['cb-1', 'Dettol Soap', 3, ''], ['cb-1', 'Shampoo', 2, ''], ['cb-1', 'Toothpaste', 2, ''],
];

const NOTES: Record<string, string> = {
  Passports: 'Both family passports, in the blue folder.',
  'Bone China Dinner Set': 'Wedding gift. Handle with care.',
  'Documents Folder': 'Flat registry, car RC, insurance papers.',
};

/** Sample entry times so the Settings chart has something to show on first run. */
const DEMO_TIMES = [7.4, 12.1, 6.0, 9.2, 5.1, 8.3, 4.6, 6.8, 11.0, 5.7];

/** Space new items default to when nothing else is selected. */
export const DEFAULT_ADD_SPACE = 'wa-right';

export function seedData(): HomeData {
  const items: Item[] = ITEM_ROWS.map(([space, name, qty, unit], n) => ({
    id: 'i' + n,
    space,
    name,
    qty,
    unit,
    notes: NOTES[name] ?? '',
    history: ['Added from the prototype data'],
  }));
  return { spaces: SPACES.map(s => ({ ...s })), items, times: [...DEMO_TIMES] };
}
