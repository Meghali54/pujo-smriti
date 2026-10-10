import { drawMandala } from './alpana';
import { clampLines, drawCover, ensureFonts, grain, paintInk, setSpacing, wrapText, type Img } from './canvas';
import { loadPhoto } from './storage';
import { C, F } from './theme';

/** "Amar Pujo": one entry per year the visitor chooses to remember. */
export interface AmarYear {
  id: string;
  year: number;
  memory: string;
  pandal: string;
  person: string;
  caption: string; // Bengali caption
  photo?: string; // IndexedDB key (photo never leaves the device)
}
export interface StoryYear {
  id: string;
  year: number;
  memory: string;
  pandal: string;
  person: string;
  caption: string;
  photo: Img | null;
}
export interface Story {
  name: string;
  years: StoryYear[];
}

export const QUOTE_BN = 'একটা পুজো শেষ হয়, স্মৃতি থেকে যায়।';
export const QUOTE_EN = 'A Puja ends, but the memories stay.';

export async function loadStory(items: AmarYear[], name: string): Promise<Story> {
  const sorted = [...items].sort((a, b) => a.year - b.year);
  const years = await Promise.all(
    sorted.map(async (it): Promise<StoryYear> => {
      let photo: Img | null = null;
      if (it.photo) {
        const b = await loadPhoto(it.photo);
        if (b) {
          try {
            photo = await createImageBitmap(b);
          } catch {
            photo = null;
          }
        }
      }
      return { id: it.id, year: it.year, memory: it.memory, pandal: it.pandal, person: it.person, caption: it.caption, photo };
    }),
  );
  return { name, years };
}
export function closeStory(s: Story) {
  s.years.forEach((y) => {
    if (y.photo && 'close' in y.photo) y.photo.close();
  });
}

/* ------------------------------------------------------------------ timing */
export const INTRO = 3.8;
export const YEAR = 6;
export const OUTRO = 6.5;
const FADE = 0.8;
export const storyDuration = (n: number) => INTRO + n * YEAR + OUTRO;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

type Ctx = CanvasRenderingContext2D;
const centered = (ctx: Ctx, text: string, x: number, y: number, spacing = 0) => {
  setSpacing(ctx, spacing);
  ctx.textAlign = 'center';
  ctx.fillText(text, x + spacing / 2, y);
  setSpacing(ctx, 0);
};

/** The 2010 → 2015 → 2020 → 2026 progress strip. */
function strip(ctx: Ctx, years: StoryYear[], idx: number, y: number, x0 = 130, x1 = 950, alpha = 1) {
  const n = years.length;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = 'rgba(250,243,227,.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  const xs = years.map((_, i) => (n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1)));
  if (idx >= 0) {
    ctx.strokeStyle = C.gold2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(xs[Math.min(idx, n - 1)], y);
    ctx.stroke();
  }
  years.forEach((yr, i) => {
    const on = i === idx;
    ctx.fillStyle = on ? C.sindoor : i < idx ? C.gold2 : 'rgba(250,243,227,.55)';
    ctx.beginPath();
    ctx.arc(xs[i], y, on ? 14 : 8, 0, Math.PI * 2);
    ctx.fill();
    if (on) {
      ctx.strokeStyle = C.gold2;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (n <= 6 || on || i === 0 || i === n - 1) {
      ctx.fillStyle = on ? C.cream : 'rgba(250,243,227,.7)';
      ctx.font = `${on ? 500 : 400} ${on ? 30 : 24}px ${F.ui}`;
      centered(ctx, String(yr.year), xs[i], y + 52);
    }
  });
  ctx.restore();
}

/* ------------------------------------------------------------------ frames (1080×1920 design space) */
function introFrame(ctx: Ctx, s: Story, local: number) {
  paintInk(ctx, 1080, 1920);
  ctx.save();
  ctx.translate(540, 780);
  ctx.rotate(local * 0.12);
  drawMandala(ctx, 0, 0, 400, { style: 'padma', petals: 12, rings: 4, color: 'rgba(224,192,118,.55)', lineWidth: 3 });
  ctx.restore();
  ctx.fillStyle = C.sindoor;
  ctx.beginPath();
  ctx.arc(540, 780, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = ease((local - 0.5) / 1.2);
  ctx.fillStyle = C.cream;
  ctx.font = `400 170px ${F.bn}`;
  centered(ctx, 'আমার পুজো', 540, 1320);
  ctx.globalAlpha = ease((local - 1.3) / 1.0);
  ctx.fillStyle = C.gold2;
  ctx.font = `italic 500 66px ${F.display}`;
  centered(ctx, 'My Pujo Story', 540, 1412);
  ctx.globalAlpha = ease((local - 2.0) / 1.0);
  if (s.name) {
    ctx.fillStyle = C.paper;
    ctx.font = `500 74px ${F.hand}`;
    centered(ctx, s.name, 540, 1522);
  }
  if (s.years.length) {
    ctx.fillStyle = 'rgba(250,243,227,.75)';
    ctx.font = `400 34px ${F.ui}`;
    const a = s.years[0].year;
    const b = s.years[s.years.length - 1].year;
    centered(ctx, a === b ? String(a) : `${a}  →  ${b}`, 540, 1612, 6);
  }
  ctx.globalAlpha = 1;
}

function yearFrame(ctx: Ctx, s: Story, i: number, local: number) {
  const y = s.years[i];
  const t = clamp(local / YEAR);
  paintInk(ctx, 1080, 1920);
  if (y.photo) {
    // slow Ken Burns push, alternating drift direction
    const sc = 1.04 + 0.12 * t;
    ctx.save();
    ctx.translate(540 + (i % 2 ? -1 : 1) * t * 34, 960);
    ctx.scale(sc, sc);
    ctx.translate(-540, -960);
    drawCover(ctx, y.photo, 0, 0, 1080, 1920);
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, 'rgba(5,6,14,.82)');
    g.addColorStop(0.22, 'rgba(5,6,14,.1)');
    g.addColorStop(0.5, 'rgba(5,6,14,.2)');
    g.addColorStop(0.72, 'rgba(5,6,14,.82)');
    g.addColorStop(1, 'rgba(5,6,14,.96)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = 'rgba(224,150,50,.06)';
    ctx.fillRect(0, 0, 1080, 1920);
    grain(ctx, 1080, 1920, 0.5);
  } else {
    const glow = ctx.createRadialGradient(540, 700, 20, 540, 700, 700);
    glow.addColorStop(0, 'rgba(201,120,40,.35)');
    glow.addColorStop(1, 'rgba(201,120,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.save();
    ctx.translate(540, 650);
    ctx.rotate(local * (i % 2 ? -0.1 : 0.1));
    drawMandala(ctx, 0, 0, 380, { style: (['padma', 'chakra', 'lata', 'dots'] as const)[i % 4], petals: 10 + (i % 3) * 2, rings: 4, color: 'rgba(224,192,118,.6)', lineWidth: 3 });
    ctx.restore();
  }

  strip(ctx, s.years, i, 130);

  // year
  const r1 = ease(local / 0.9);
  ctx.globalAlpha = r1;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold2;
  ctx.font = `600 210px ${F.display}`;
  ctx.fillText(String(y.year), 80, 1130 + (1 - r1) * 24);

  // Bengali caption
  let yy = 1260;
  ctx.globalAlpha = ease((local - 0.7) / 1.0);
  if (y.caption) {
    ctx.fillStyle = C.cream;
    ctx.font = `400 74px ${F.bn}`;
    clampLines(ctx, wrapText(ctx, y.caption, 920), 2, 920).forEach((l, k) => ctx.fillText(l, 80, yy + k * 102));
    yy += Math.min(2, wrapText(ctx, y.caption, 920).length) * 102;
  }
  ctx.globalAlpha = ease((local - 1.4) / 1.0);
  if (y.memory) {
    ctx.fillStyle = 'rgba(239,227,204,.92)';
    ctx.font = `italic 400 42px ${F.display}, ${F.bn}`;
    clampLines(ctx, wrapText(ctx, y.memory, 920), 3, 920).forEach((l, k) => ctx.fillText(l, 80, yy + 12 + k * 58));
  }
  ctx.globalAlpha = ease((local - 2.2) / 1.0);
  const detail = (label: string, value: string, yPos: number) => {
    if (!value) return;
    ctx.fillStyle = C.gold2;
    ctx.font = `400 22px ${F.ui}`;
    setSpacing(ctx, 5);
    ctx.fillText(label, 80, yPos);
    setSpacing(ctx, 0);
    ctx.fillStyle = C.cream;
    ctx.font = `400 42px ${F.display}, ${F.bn}`;
    ctx.fillText(clampLines(ctx, [value], 1, 920)[0], 80, yPos + 48);
  };
  detail('FAVOURITE PANDAL', y.pandal, 1700);
  detail('FAVOURITE PERSON OR MOMENT', y.person, 1806);
  ctx.globalAlpha = 1;
}

function outroFrame(ctx: Ctx, s: Story, local: number) {
  paintInk(ctx, 1080, 1920);
  strip(ctx, s.years, s.years.length, 130, 130, 950, 0.9);
  ctx.save();
  ctx.translate(540, 520);
  ctx.rotate(local * 0.1);
  drawMandala(ctx, 0, 0, 230, { style: 'lata', petals: 10, rings: 3, color: 'rgba(224,192,118,.5)', lineWidth: 3 });
  ctx.restore();
  ctx.globalAlpha = ease((local - 0.5) / 1.4);
  ctx.fillStyle = C.cream;
  ctx.font = `400 104px ${F.bn}`;
  wrapText(ctx, QUOTE_BN, 900).forEach((l, k) => centered(ctx, l, 540, 980 + k * 148));
  ctx.globalAlpha = ease((local - 2.1) / 1.2);
  ctx.fillStyle = C.gold2;
  ctx.font = `italic 500 58px ${F.display}`;
  centered(ctx, QUOTE_EN, 540, 1320);
  ctx.globalAlpha = ease((local - 3.6) / 1.2);
  ctx.fillStyle = C.cream;
  ctx.font = `500 52px ${F.display}`;
  centered(ctx, 'ASCHHE BOCHHOR AABAR HOBE.', 540, 1520, 4);
  ctx.globalAlpha = ease((local - 4.4) / 1.0);
  ctx.fillStyle = 'rgba(250,243,227,.7)';
  ctx.font = `400 24px ${F.ui}`;
  centered(ctx, 'PUJO SMRITI', 540, 1790, 8);
  ctx.globalAlpha = 1;
}

export function drawStoryFrame(ctx: Ctx, W: number, H: number, s: Story, time: number) {
  const n = s.years.length;
  let kind: 'intro' | 'year' | 'outro' = 'intro';
  let i = -1;
  let local = time;
  let dur = INTRO;
  if (time >= INTRO) {
    const t = time - INTRO;
    if (t < n * YEAR) {
      kind = 'year';
      i = Math.floor(t / YEAR);
      local = t - i * YEAR;
      dur = YEAR;
    } else {
      kind = 'outro';
      local = t - n * YEAR;
      dur = OUTRO;
    }
  }
  ctx.save();
  ctx.scale(W / 1080, H / 1920);
  ctx.textBaseline = 'alphabetic';
  if (kind === 'intro') introFrame(ctx, s, local);
  else if (kind === 'year') yearFrame(ctx, s, i, local);
  else outroFrame(ctx, s, local);
  const a = 1 - Math.min(1, local / FADE, (dur - local) / FADE);
  if (a > 0) {
    ctx.fillStyle = `rgba(5,6,14,${clamp(a)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ poster (1080×1350) */
export async function renderStoryPoster(canvas: HTMLCanvasElement, s: Story) {
  await ensureFonts();
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d')!;
  paintInk(ctx, 1080, 1350);
  ctx.strokeStyle = 'rgba(201,162,75,.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1000, 1270);
  ctx.strokeStyle = 'rgba(179,38,30,.8)';
  ctx.lineWidth = 6;
  ctx.strokeRect(58, 58, 964, 1234);

  ctx.fillStyle = C.cream;
  ctx.font = `400 112px ${F.bn}`;
  centered(ctx, 'আমার পুজো', 540, 220);
  ctx.fillStyle = C.gold2;
  ctx.font = `italic 500 44px ${F.display}`;
  centered(ctx, s.name ? `${s.name}’s Pujo Story` : 'My Pujo Story', 540, 280);

  const years = s.years;
  if (!years.length) {
    ctx.fillStyle = 'rgba(250,243,227,.7)';
    ctx.font = `italic 400 40px ${F.display}`;
    centered(ctx, 'Add your first year to begin your story.', 540, 700);
  } else {
    // up to six frames, evenly picked across the years
    const pick = years.length <= 6 ? years.map((_, i) => i) : Array.from({ length: 6 }, (_, k) => Math.round((k * (years.length - 1)) / 5));
    strip(ctx, pick.map((i) => years[i]), -1, 345, 150, 930);
    const rows = Math.ceil(pick.length / 3);
    const cw = rows > 1 ? 262 : 290;
    const ch = rows > 1 ? 340 : 400;
    const gx = rows > 1 ? 36 : 40;
    const gy = 34;
    const ph = ch - 138; // photo height
    const top = 430 + (730 - (rows * ch + (rows - 1) * gy)) / 2;
    pick.forEach((idx, k) => {
      const y = years[idx];
      const row = Math.floor(k / 3);
      const inRow = row === rows - 1 ? pick.length - row * 3 : 3;
      const col = k % 3;
      const rowW = inRow * cw + (inRow - 1) * gx;
      const x = (1080 - rowW) / 2 + col * (cw + gx);
      const yPos = top + row * (ch + gy);
      ctx.save();
      ctx.translate(x + cw / 2, yPos + ch / 2);
      ctx.rotate(((k % 2 ? 1 : -1) * (1.2 + (k % 3) * 0.6) * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#f6eedc';
      ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.beginPath();
      ctx.rect(-cw / 2 + 14, -ch / 2 + 14, cw - 28, ph);
      ctx.clip();
      if (y.photo) drawCover(ctx, y.photo, -cw / 2 + 14, -ch / 2 + 14, cw - 28, ph);
      else {
        const g = ctx.createLinearGradient(0, -ch / 2, 0, 0);
        g.addColorStop(0, '#1a1a3a');
        g.addColorStop(1, '#5a2318');
        ctx.fillStyle = g;
        ctx.fillRect(-cw / 2 + 14, -ch / 2 + 14, cw - 28, ph);
        drawMandala(ctx, 0, -ch / 2 + 14 + ph / 2, Math.min(100, ph / 2 - 14), { style: 'padma', petals: 8, rings: 2, color: 'rgba(224,192,118,.8)', lineWidth: 2 });
      }
      ctx.restore();
      ctx.fillStyle = C.brown;
      ctx.font = `600 54px ${F.display}`;
      centered(ctx, String(y.year), 0, ch / 2 - 96);
      ctx.fillStyle = 'rgba(42,29,20,.78)';
      const sub = y.caption || y.pandal || y.memory;
      if (sub) {
        ctx.font = `400 25px ${F.bn}`;
        centered(ctx, clampLines(ctx, [sub], 1, cw - 36)[0], 0, ch / 2 - 42);
      }
      ctx.restore();
    });
  }

  ctx.fillStyle = C.gold2;
  ctx.font = `400 50px ${F.bn}`;
  centered(ctx, QUOTE_BN, 540, 1226);
  ctx.fillStyle = 'rgba(250,243,227,.7)';
  ctx.font = `400 21px ${F.ui}`;
  centered(ctx, 'PUJO SMRITI', 540, 1272, 7);
}

/* ------------------------------------------------------------------ video export (MediaRecorder) */
export function canRecordVideo() {
  return typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement !== 'undefined' && typeof HTMLCanvasElement.prototype.captureStream === 'function';
}

export async function recordStory(s: Story, opts: { onProgress: (p: number) => void; signal: AbortSignal }): Promise<{ blob: Blob; ext: 'mp4' | 'webm' }> {
  await ensureFonts();
  const W = 720;
  const H = 1280;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const mime = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
  if (!mime) throw new Error('This browser cannot record video.');
  const total = storyDuration(s.years.length);
  drawStoryFrame(ctx, W, H, s, 0);
  const stream = c.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  return new Promise((resolve, reject) => {
    let cancelled = false;
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (cancelled) reject(new DOMException('Cancelled', 'AbortError'));
      else resolve({ blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: mime.startsWith('video/mp4') ? 'mp4' : 'webm' });
    };
    const start = performance.now();
    const tick = (now: number) => {
      if (opts.signal.aborted) {
        cancelled = true;
        rec.stop();
        return;
      }
      const t = (now - start) / 1000;
      drawStoryFrame(ctx, W, H, s, Math.min(t, total - 0.01));
      opts.onProgress(Math.min(1, t / total));
      if (t < total) requestAnimationFrame(tick);
      else rec.stop();
    };
    rec.start(500);
    requestAnimationFrame(tick);
  });
}
