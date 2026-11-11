export interface QuickEntry {
  name: string;
  qty: number;
  /** Small JPEG data URL, when the thing was photographed. */
  photo?: string;
}

/**
 * Turns what someone types while filling a shelf into things to add.
 * Commas and new lines separate things; a trailing "x3" (or "×3") sets the quantity:
 * "chargers x3, watch" → Chargers ×3, Watch.
 */
export function parseQuickAdd(text: string): QuickEntry[] {
  return text
    .split(/[,\n]/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(part => {
      // The space before "x" is required, so names like "Xbox 360" stay whole.
      const m = /^(.+?)\s+[x×]\s*(\d+)$/i.exec(part);
      const raw = (m ? m[1]! : part).trim();
      // Capitalise plain lower-case names, but leave "iPhone cable" alone.
      const name = /^[a-z](?![A-Z])/.test(raw) ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
      return { name, qty: m ? Math.max(1, Number(m[2])) : 1 };
    });
}
