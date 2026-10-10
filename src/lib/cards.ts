import { drawMandala, drawVine } from './alpana';
import { clampLines, drawCover, ensureFonts, grain, paintInk, paintPaper, setSpacing, tape, wrapText, type Img } from './canvas';
import { C, F } from './theme';
import type { Archetype } from '../data/quiz';

export const CARD_W = 1080;
export const CARD_H = 1350;

function setup(canvas: HTMLCanvasElement, w = CARD_W, h = CARD_H) {
  canvas.width = w;
  canvas.height = h;
  return canvas.getContext('2d')!;
}
function centered(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing = 0) {
  setSpacing(ctx, spacing);
  ctx.textAlign = 'center';
  ctx.fillText(text, x + spacing / 2, y);
  setSpacing(ctx, 0);
}

/* ---------------------------------------------------------------- Memory capsule (polaroid) */
export interface PolaroidOpts {
  year: string;
  day: string;
  title: string;
  text: string;
  photo: Img | null;
  name: string;
}

export async function renderPolaroid(canvas: HTMLCanvasElement, o: PolaroidOpts) {
  await ensureFonts();
  const ctx = setup(canvas);
  paintInk(ctx, CARD_W, CARD_H);

  // album page corner ornaments
  ctx.strokeStyle = 'rgba(201,162,75,.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, CARD_W - 72, CARD_H - 72);

  // polaroid
  ctx.save();
  ctx.translate(540, 500);
  ctx.rotate(-0.035);
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#f6eedc';
  ctx.fillRect(-390, -420, 780, 880);
  ctx.shadowColor = 'transparent';
  // photo area
  const px = -350, py = -380, pw = 700, ph = 640;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  if (o.photo) {
    drawCover(ctx, o.photo, px, py, pw, ph);
    const v = ctx.createLinearGradient(0, py, 0, py + ph);
    v.addColorStop(0, 'rgba(255,170,60,.08)');
    v.addColorStop(1, 'rgba(40,10,0,.25)');
    ctx.fillStyle = v;
    ctx.fillRect(px, py, pw, ph);
  } else {
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, '#1a1a3a');
    g.addColorStop(1, '#5a2318');
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    drawMandala(ctx, 0, py + ph / 2, 250, { style: 'padma', petals: 10, rings: 3, color: 'rgba(224,192,118,.75)', lineWidth: 3 });
    ctx.fillStyle = 'rgba(250,243,227,.75)';
    ctx.font = `italic 400 30px ${F.display}`;
    centered(ctx, 'a photograph belongs here', 0, py + ph - 26);
  }
  grain(ctx, 1080, 1350, 0.5);
  ctx.restore();

  // caption
  ctx.fillStyle = C.brown;
  ctx.font = `500 62px ${F.hand}`;
  const title = clampLines(ctx, wrapText(ctx, o.title || 'Untitled memory', 640), 1, 640)[0];
  centered(ctx, title, 0, 350);
  ctx.fillStyle = 'rgba(42,29,20,.6)';
  ctx.font = `400 25px ${F.ui}`;
  centered(ctx, `${o.day}  ·  ${o.year}`.toUpperCase(), 0, 405, 5);
  tape(ctx, 0, -424, 220, 58, 0.05);
  ctx.restore();

  // note
  ctx.fillStyle = C.gold2;
  ctx.font = `600 132px ${F.display}`;
  ctx.textAlign = 'left';
  ctx.fillText(o.year, 92, 1132);
  ctx.fillStyle = C.cream;
  ctx.font = `italic 400 37px ${F.display}, ${F.bn}`;
  const lines = clampLines(ctx, wrapText(ctx, o.text || 'Write the smell, the sound, the person…', 520), 4, 520);
  lines.forEach((l, i) => ctx.fillText(l, 470, 1060 + i * 56));
  ctx.fillStyle = 'rgba(224,192,118,.9)';
  ctx.font = `400 24px ${F.ui}`;
  ctx.textAlign = 'left';
  setSpacing(ctx, 5);
  ctx.fillText(o.name ? `— ${o.name.toUpperCase()}` : '', 92, 1200);
  ctx.textAlign = 'center';
  ctx.fillText('PUJO SMRITI', CARD_W / 2, 1290);
  setSpacing(ctx, 0);
}

/* ---------------------------------------------------------------- Letter to Maa */
export interface LetterOpts {
  salutation: string;
  body: string;
  signoff: string;
  name: string;
  year: string;
}

export async function renderLetter(canvas: HTMLCanvasElement, o: LetterOpts) {
  await ensureFonts();
  const W = CARD_W;
  const lh = 78;
  const left = 150;
  const right = W - 110;
  // measure first
  const m = document.createElement('canvas').getContext('2d')!;
  m.font = `500 54px ${F.hand}`;
  const lines = wrapText(m, o.body || '…', right - left);
  const top = 330;
  const H = Math.max(CARD_H, top + (lines.length + 4) * lh + 260);
  const ctx = setup(canvas, W, H);
  paintPaper(ctx, W, H);

  // red-and-white border
  ctx.strokeStyle = C.sindoor;
  ctx.lineWidth = 10;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  // ruled lines + margin
  ctx.strokeStyle = 'rgba(120,90,50,.28)';
  ctx.lineWidth = 2;
  for (let y = top + 16; y < H - 200; y += lh) {
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(W - 100, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(179,38,30,.45)';
  ctx.beginPath();
  ctx.moveTo(120, 90);
  ctx.lineTo(120, H - 90);
  ctx.stroke();

  drawVine(ctx, 140, 118, W - 140, 118, 8, 60, 'rgba(179,38,30,.55)', 3);

  ctx.fillStyle = C.sindoor;
  ctx.textAlign = 'center';
  ctx.font = `400 52px ${F.bn}`;
  ctx.fillText('মায়ের কাছে চিঠি', W / 2, 210);
  ctx.fillStyle = 'rgba(42,29,20,.55)';
  ctx.font = `italic 400 30px ${F.display}`;
  ctx.fillText('a letter to Maa', W / 2, 254);

  ctx.textAlign = 'left';
  ctx.fillStyle = C.sindoor2;
  ctx.font = `500 58px ${F.hand}`;
  ctx.fillText(o.salutation, left, top);
  ctx.fillStyle = '#20150e';
  ctx.font = `500 54px ${F.hand}`;
  lines.forEach((l, i) => ctx.fillText(l, left, top + (i + 1) * lh));
  const endY = top + (lines.length + 2) * lh;
  ctx.fillStyle = C.sindoor2;
  ctx.font = `500 54px ${F.hand}`;
  ctx.fillText(o.signoff, left + 300, endY);
  ctx.fillStyle = '#20150e';
  ctx.fillText(o.name || '', left + 300, endY + lh);

  // sindoor seal
  const sx = 210, sy = H - 200;
  ctx.save();
  ctx.shadowColor = 'rgba(80,0,0,.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = C.sindoor;
  ctx.beginPath();
  ctx.arc(sx, sy, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawMandala(ctx, sx, sy, 66, { style: 'padma', petals: 6, rings: 1, color: 'rgba(250,243,227,.85)', lineWidth: 2.2 });
  ctx.fillStyle = 'rgba(42,29,20,.6)';
  ctx.font = `400 22px ${F.ui}`;
  ctx.textAlign = 'right';
  setSpacing(ctx, 4);
  ctx.fillText(`PUJO SMRITI  ·  ${o.year}`, W - 110, H - 100);
  ctx.fillText('KEPT ON THIS DEVICE', W - 110, H - 134);
  setSpacing(ctx, 0);
}

/* ---------------------------------------------------------------- Quiz result */
export async function renderQuiz(canvas: HTMLCanvasElement, o: { name: string; arch: Archetype }) {
  await ensureFonts();
  const ctx = setup(canvas);
  paintInk(ctx, CARD_W, CARD_H);
  ctx.strokeStyle = 'rgba(201,162,75,.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, CARD_W - 80, CARD_H - 80);
  ctx.strokeStyle = 'rgba(179,38,30,.8)';
  ctx.lineWidth = 6;
  ctx.strokeRect(58, 58, CARD_W - 116, CARD_H - 116);

  ctx.fillStyle = C.gold2;
  ctx.font = `400 26px ${F.ui}`;
  centered(ctx, 'MY PUJO PERSONALITY', 540, 128, 8);
  drawMandala(ctx, 540, 445, 285, { style: o.arch.style, petals: o.arch.petals, rings: 3, color: 'rgba(224,192,118,.92)', lineWidth: 3.2 });
  ctx.fillStyle = C.sindoor;
  ctx.beginPath();
  ctx.arc(540, 445, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = C.cream;
  ctx.font = `400 84px ${F.bn}`;
  const bn = clampLines(ctx, wrapText(ctx, o.arch.bn, 900), 1, 900)[0];
  centered(ctx, bn, 540, 855);
  ctx.fillStyle = C.gold2;
  ctx.font = `italic 500 58px ${F.display}`;
  centered(ctx, o.arch.en, 540, 930);

  ctx.fillStyle = 'rgba(250,243,227,.88)';
  ctx.font = `400 33px ${F.display}`;
  const lines = clampLines(ctx, wrapText(ctx, o.arch.line, 800), 4, 800);
  lines.forEach((l, i) => centered(ctx, l, 540, 1005 + i * 46));
  ctx.fillStyle = C.gold2;
  ctx.font = `italic 400 29px ${F.display}`;
  const plate = clampLines(ctx, wrapText(ctx, `Signature plate: ${o.arch.plate}`, 820), 2, 820);
  plate.forEach((l, i) => centered(ctx, l, 540, 1200 + i * 38));

  ctx.fillStyle = 'rgba(250,243,227,.75)';
  ctx.font = `400 22px ${F.ui}`;
  centered(ctx, o.name ? `${o.name.toUpperCase()}'S PUJO  ·  PUJO SMRITI` : 'PUJO SMRITI', 540, 1268, 5);
}

/* ---------------------------------------------------------------- Shareable memory cards */
export interface ShareOpts {
  template: 'postcard' | 'pass';
  name: string;
  from: string;
  year: string;
  line: string;
  personality: string;
}

export async function renderShare(canvas: HTMLCanvasElement, o: ShareOpts) {
  return o.template === 'postcard' ? renderPostcard(canvas, o) : renderPass(canvas, o);
}

async function renderPostcard(canvas: HTMLCanvasElement, o: ShareOpts) {
  await ensureFonts();
  const ctx = setup(canvas);
  paintPaper(ctx, CARD_W, CARD_H, C.cream);

  // lal-paar (red border) frame
  ctx.fillStyle = C.sindoor;
  ctx.fillRect(0, 0, CARD_W, 46);
  ctx.fillRect(0, CARD_H - 46, CARD_W, 46);
  ctx.fillRect(0, 0, 46, CARD_H);
  ctx.fillRect(CARD_W - 46, 0, 46, CARD_H);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(62, 62, CARD_W - 124, CARD_H - 124);
  ctx.strokeStyle = 'rgba(250,243,227,.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, CARD_W - 36, CARD_H - 36);

  ctx.fillStyle = C.sindoor;
  ctx.textAlign = 'left';
  ctx.font = `400 96px ${F.bn}`;
  ctx.fillText('পুজোর চিঠি', 110, 230);
  ctx.fillStyle = 'rgba(42,29,20,.7)';
  ctx.font = `italic 400 36px ${F.display}`;
  ctx.fillText('a postcard from Pujo', 114, 285);

  // stamp
  const sx = 790, sy = 120, sw = 200, sh = 240;
  ctx.fillStyle = '#fff8e6';
  ctx.fillRect(sx, sy, sw, sh);
  ctx.strokeStyle = C.sindoor;
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 6;
  ctx.strokeRect(sx, sy, sw, sh);
  ctx.setLineDash([]);
  ctx.fillStyle = '#1b1830';
  ctx.fillRect(sx + 18, sy + 18, sw - 36, sh - 36);
  drawMandala(ctx, sx + sw / 2, sy + sh / 2 - 10, 68, { style: 'padma', petals: 6, rings: 2, color: C.gold2, lineWidth: 1.6 });
  ctx.fillStyle = C.gold2;
  ctx.font = `400 15px ${F.ui}`;
  centered(ctx, 'PUJO', sx + sw / 2, sy + sh - 32, 5);
  // postmark
  ctx.save();
  ctx.translate(690, 345);
  ctx.rotate(-0.15);
  ctx.strokeStyle = 'rgba(42,29,20,.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(42,29,20,.6)';
  ctx.font = `500 15px ${F.ui}`;
  centered(ctx, o.from ? o.from.toUpperCase().slice(0, 12) : 'ASHWIN', 0, -4, 2);
  ctx.font = `500 19px ${F.ui}`;
  centered(ctx, o.year, 0, 24, 3);
  ctx.restore();

  drawVine(ctx, 110, 350, 640, 350, 7, 56, 'rgba(179,38,30,.55)', 3);

  ctx.globalAlpha = 0.16;
  drawMandala(ctx, 540, 1000, 300, { style: 'padma', petals: 10, rings: 3, color: C.sindoor, lineWidth: 3 });
  ctx.globalAlpha = 1;

  // handwritten message
  ctx.fillStyle = '#20150e';
  ctx.textAlign = 'left';
  ctx.font = `500 62px ${F.hand}`;
  const lines = clampLines(ctx, wrapText(ctx, o.line || 'Some festivals end. Some stay with us forever.', 830), 8, 830);
  lines.forEach((l, i) => ctx.fillText(l, 118, 480 + i * 84));
  const sigY = Math.min(1135, Math.max(820, 480 + lines.length * 84 + 60));

  // signature block
  ctx.fillStyle = C.sindoor2;
  ctx.font = `500 58px ${F.hand}`;
  ctx.fillText(o.name ? `— ${o.name}` : '— someone who remembers', 118, sigY);
  ctx.fillStyle = 'rgba(42,29,20,.68)';
  ctx.font = `italic 400 32px ${F.display}`;
  if (o.personality) ctx.fillText(`Pujo personality: ${o.personality}`, 118, sigY + 55);
  ctx.fillStyle = 'rgba(42,29,20,.55)';
  ctx.font = `400 21px ${F.ui}`;
  ctx.textAlign = 'center';
  setSpacing(ctx, 5);
  ctx.fillText('PUJO SMRITI', CARD_W / 2, 1272);
  setSpacing(ctx, 0);
}

async function renderPass(canvas: HTMLCanvasElement, o: ShareOpts) {
  await ensureFonts();
  const ctx = setup(canvas);
  paintInk(ctx, CARD_W, CARD_H);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(46, 46, CARD_W - 92, CARD_H - 92);
  ctx.strokeStyle = 'rgba(201,162,75,.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, CARD_W - 128, CARD_H - 128);

  ctx.fillStyle = C.gold2;
  ctx.font = `400 26px ${F.ui}`;
  centered(ctx, 'A KEEPSAKE, NOT A REAL PASS', 540, 130, 6);
  ctx.fillStyle = C.cream;
  ctx.font = `500 108px ${F.display}`;
  centered(ctx, 'Pandal Pass', 540, 260);
  ctx.fillStyle = '#e8574c';
  ctx.font = `400 60px ${F.bn}`;
  centered(ctx, 'একটি স্মৃতির প্রবেশপত্র', 540, 345);

  // perforation
  ctx.setLineDash([2, 14]);
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(224,192,118,.7)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(90, 405);
  ctx.lineTo(CARD_W - 90, 405);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.globalAlpha = 0.28;
  drawMandala(ctx, 800, 700, 210, { style: 'chakra', petals: 8, rings: 3, color: C.gold2, lineWidth: 2.4 });
  ctx.restore();

  const field = (label: string, value: string, y: number) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(224,192,118,.85)';
    ctx.font = `400 22px ${F.ui}`;
    setSpacing(ctx, 5);
    ctx.fillText(label, 110, y);
    setSpacing(ctx, 0);
    ctx.fillStyle = C.cream;
    ctx.font = `400 50px ${F.display}, ${F.bn}`;
    ctx.fillText(clampLines(ctx, [value || '—'], 1, 860)[0], 110, y + 56);
  };
  field('ADMIT ONE', o.name || 'Someone who remembers', 480);
  field('PARA / CITY', o.from || 'Wherever the dhak reached', 610);
  field('PUJO OF', o.year, 740);
  field('PUJO PERSONALITY', o.personality || 'Still deciding', 870);

  ctx.fillStyle = 'rgba(250,243,227,.9)';
  ctx.font = `italic 400 38px ${F.display}, ${F.bn}`;
  ctx.textAlign = 'left';
  clampLines(ctx, wrapText(ctx, `“${o.line || 'Some festivals end. Some stay with us forever.'}”`, 860), 3, 860).forEach((l, i) => ctx.fillText(l, 110, 1020 + i * 54));

  // decorative bars derived from the name (not a scannable code)
  let seed = 7;
  for (const ch of o.name + o.year) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  ctx.fillStyle = 'rgba(224,192,118,.85)';
  let x = 110;
  while (x < 970) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const w = 3 + (seed >>> 28) % 5;
    ctx.fillRect(x, 1170, w, 56);
    x += w + 5 + ((seed >>> 24) % 4);
  }
  ctx.fillStyle = 'rgba(250,243,227,.6)';
  ctx.font = `400 20px ${F.ui}`;
  centered(ctx, 'PUJO SMRITI', 540, 1262, 6);
}
