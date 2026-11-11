/** Longest side of a saved photo, in pixels. Deliberately small: this is a reminder of what it looks like, not a picture. */
const MAX_SIDE = 320;
const QUALITY = 0.6;

/** Reads a picked or captured image and returns a small JPEG data URL (roughly 10 to 25 KB). */
export async function shrinkPhoto(file: Blob): Promise<string> {
  const bmp = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas');
    ctx.drawImage(bmp, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', QUALITY);
  } finally {
    bmp.close();
  }
}
