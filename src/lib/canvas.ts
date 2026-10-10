import { C } from './theme';

let fontsPromise: Promise<void> | null = null;
/** Makes sure the web fonts are actually loaded before we paint text onto a canvas. */
export function ensureFonts(): Promise<void> {
  if (!fontsPromise) {
    const bn = 'মা আসছেন শুভ বিজয়া পুজো স্মৃতি';
    const jobs = [
      document.fonts.load('400 48px "Cormorant Garamond"', 'Pujo Smriti'),
      document.fonts.load('italic 400 48px "Cormorant Garamond"', 'Pujo Smriti'),
      document.fonts.load('500 48px "Cormorant Garamond"', 'Pujo Smriti'),
      document.fonts.load('600 48px "Cormorant Garamond"', 'Pujo Smriti'),
      document.fonts.load('400 48px "Tiro Bangla"', bn),
      document.fonts.load('400 48px "Noto Serif Bengali"', bn),
      document.fonts.load('400 48px "Atma"', bn),
      document.fonts.load('500 48px "Caveat"', 'Dear Maa'),
      document.fonts.load('400 24px "Jost"', 'PUJO SMRITI'),
      document.fonts.load('500 24px "Jost"', 'PUJO SMRITI'),
    ];
    fontsPromise = Promise.allSettled(jobs).then(() => undefined);
  }
  return fontsPromise;
}

export type Img = ImageBitmap | HTMLImageElement;

export function setSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* older browsers: no letter spacing */
  }
}

const graphemes = (s: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(s), (x) => x.segment);
  }
  return Array.from(s);
};
export { graphemes };

/** Word-wraps text (respecting newlines). Very long words are broken at grapheme boundaries. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r/g, '').split('\n')) {
    if (!para.trim()) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
        continue;
      }
      if (line) out.push(line);
      line = '';
      if (ctx.measureText(word).width <= maxWidth) {
        line = word;
      } else {
        let chunk = '';
        for (const g of graphemes(word)) {
          if (ctx.measureText(chunk + g).width > maxWidth && chunk) {
            out.push(chunk);
            chunk = '';
          }
          chunk += g;
        }
        line = chunk;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export function clampLines(ctx: CanvasRenderingContext2D, lines: string[], max: number, maxWidth: number): string[] {
  const over = lines.length > max;
  const kept = over ? lines.slice(0, max) : lines.slice();
  if (!kept.length) return kept;
  let last = kept[kept.length - 1];
  // Ellipsize when we dropped lines, or when a single line is still wider than the box.
  if (over || ctx.measureText(last).width > maxWidth) {
    while (last && ctx.measureText(last + '…').width > maxWidth) last = graphemes(last).slice(0, -1).join('');
    kept[kept.length - 1] = last + '…';
  }
  return kept;
}

let noiseCanvas: HTMLCanvasElement | null = null;
function noise(): HTMLCanvasElement {
  if (noiseCanvas) return noiseCanvas;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  const id = x.createImageData(256, 256);
  let s = 1234567;
  for (let i = 0; i < id.data.length; i += 4) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const v = s >>> 24;
    const dark = v < 128;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = dark ? 30 : 255;
    id.data[i + 3] = (Math.abs(v - 128) / 128) * 34;
  }
  x.putImageData(id, 0, 0);
  noiseCanvas = c;
  return c;
}

export function grain(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(noise(), 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function paintPaper(ctx: CanvasRenderingContext2D, w: number, h: number, base: string = C.paper) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.25, h * 0.15, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
  g.addColorStop(0, 'rgba(255,250,235,.55)');
  g.addColorStop(1, 'rgba(120,80,30,.14)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 0.9);
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(60,35,10,0)');
  v.addColorStop(1, 'rgba(60,35,10,.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

export function paintInk(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#080a17');
  g.addColorStop(0.55, C.ink2);
  g.addColorStop(1, '#1a1024');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h * 0.35, 20, w / 2, h * 0.35, w * 0.8);
  glow.addColorStop(0, 'rgba(201,120,40,.22)');
  glow.addColorStop(1, 'rgba(201,120,40,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 0.7);
}

export function tape(ctx: CanvasRenderingContext2D, x: number, y: number, w = 190, h = 56, rot = -0.08) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(224,192,118,.62)';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
  ctx.restore();
}

export function drawCover(ctx: CanvasRenderingContext2D, img: Img, x: number, y: number, w: number, h: number) {
  const iw = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const ih = 'naturalHeight' in img ? img.naturalHeight : img.height;
  const s = Math.max(w / iw, h / ih);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

export function toBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Export failed'))), 'image/png'));
}

export async function downloadCanvas(c: HTMLCanvasElement, filename: string) {
  const blob = await toBlob(c);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function shareCanvas(c: HTMLCanvasElement, filename: string, text: string): Promise<'shared' | 'unsupported' | 'cancelled'> {
  const blob = await toBlob(c);
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (e) {
      return (e as DOMException).name === 'AbortError' ? 'cancelled' : 'unsupported';
    }
  }
  return 'unsupported';
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'memory';
