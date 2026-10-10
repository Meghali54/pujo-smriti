/**
 * Re-encodes a chosen photo through a canvas. This (1) shrinks it so it is light to store and export,
 * and (2) strips EXIF metadata such as GPS location, which is good for privacy.
 */
export async function downscaleImage(file: File, max = 1400): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not process image.'))), 'image/jpeg', 0.84));
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
