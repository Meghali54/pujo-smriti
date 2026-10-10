/**
 * Procedural alpana: the rice-paste floor art of Bengal. Petals (padma / lotus), scalloped circles,
 * vines (lata) and dots, drawn with round, hand-painted looking strokes.
 */
export type AlpanaStyle = 'padma' | 'chakra' | 'lata' | 'dots';

export interface MandalaOpts {
  style: AlpanaStyle;
  petals: number;
  rings: number;
  color: string;
  lineWidth: number;
}

export interface Stroke {
  pts: [number, number][];
  sym: number;
  mirror: boolean;
  w: number;
}

type Ctx = CanvasRenderingContext2D;

function petal(ctx: Ctx, r0: number, r1: number, w: number, inner = false) {
  const d = r1 - r0;
  ctx.beginPath();
  ctx.moveTo(0, -r0);
  ctx.bezierCurveTo(w, -r0 - d * 0.25, w * 0.7, -r1 + d * 0.2, 0, -r1);
  ctx.bezierCurveTo(-w * 0.7, -r1 + d * 0.2, -w, -r0 - d * 0.25, 0, -r0);
  ctx.closePath();
  ctx.stroke();
  if (inner) {
    const a = r0 + d * 0.22;
    const b = r1 - d * 0.16;
    const dd = b - a;
    const ww = w * 0.52;
    ctx.beginPath();
    ctx.moveTo(0, -a);
    ctx.bezierCurveTo(ww, -a - dd * 0.25, ww * 0.7, -b + dd * 0.2, 0, -b);
    ctx.bezierCurveTo(-ww * 0.7, -b + dd * 0.2, -ww, -a - dd * 0.25, 0, -a);
    ctx.stroke();
  }
}
const ring = (ctx: Ctx, r: number) => {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
};
const dot = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};
function each(ctx: Ctx, n: number, offset: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.rotate(offset + (i * Math.PI * 2) / n);
    fn(i);
    ctx.restore();
  }
}

export function drawMandala(ctx: Ctx, cx: number, cy: number, R: number, o: MandalaOpts) {
  const lw = o.lineWidth;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = o.color;
  ctx.fillStyle = o.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;

  // bindu (centre point) and first lotus
  dot(ctx, 0, 0, R * 0.035);
  ring(ctx, R * 0.075);
  each(ctx, 8, 0, () => petal(ctx, R * 0.095, R * 0.25, R * 0.065));

  const inner = R * 0.29;
  const outer = R * 0.9;
  const step = (outer - inner) / o.rings;
  for (let i = 0; i < o.rings; i++) {
    const r0 = inner + i * step;
    const r1 = r0 + step;
    const n = o.petals + i * 2;
    const w = ((Math.PI * r0) / n) * 0.78;
    const off = (i % 2) * (Math.PI / n);
    ring(ctx, r0);
    switch (o.style) {
      case 'padma':
        each(ctx, n, off, () => petal(ctx, r0, r1 - lw, w, true));
        each(ctx, n, off + Math.PI / n, () => dot(ctx, 0, -(r0 + step * 0.42), lw * 0.9));
        break;
      case 'chakra': {
        const m = n * 2;
        const s = (Math.PI * r0) / m;
        each(ctx, m, 0, () => {
          ctx.beginPath();
          ctx.arc(0, -r0, s, Math.PI, Math.PI * 2);
          ctx.stroke();
          dot(ctx, 0, -r0 - s * 0.45, lw * 0.85);
        });
        each(ctx, n, off, () => {
          ctx.beginPath();
          ctx.moveTo(0, -(r0 + s * 1.5));
          ctx.lineTo(0, -(r1 - lw));
          ctx.stroke();
          dot(ctx, 0, -(r1 - lw), lw * 1.1);
        });
        break;
      }
      case 'lata': {
        const mid = r0 + step * 0.5;
        const amp = step * 0.26;
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 2) {
          const t = (a * Math.PI) / 180;
          const r = mid + Math.sin(t * n) * amp;
          const x = Math.sin(t) * r;
          const y = -Math.cos(t) * r;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        each(ctx, n, Math.PI / (2 * n), () => petal(ctx, mid + amp * 0.9, r1 - lw, w * 0.45));
        break;
      }
      case 'dots':
        each(ctx, n * 2, 0, (k) => dot(ctx, 0, -(r0 + step * 0.5), lw * (k % 2 ? 0.9 : 1.6)));
        each(ctx, n, off, () => petal(ctx, r0 + step * 0.62, r1 - lw, w * 0.5));
        break;
    }
  }
  ring(ctx, outer);
  ring(ctx, outer + lw * 3.4);
  each(ctx, o.petals * 4, 0, () => dot(ctx, 0, -(outer + lw * 7), lw * 0.85));
  each(ctx, o.petals * 2, 0, () => petal(ctx, outer + lw * 10, R, (Math.PI * R) / (o.petals * 2) * 0.38));
  ctx.restore();
}

/** A vine (lata) with leaves running along a straight line. */
export function drawVine(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, amp: number, wave: number, color: string, lw: number) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let x = 0; x <= len; x += 4) {
    const y = Math.sin((x / wave) * Math.PI * 2) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const leaves = Math.floor(len / (wave / 2));
  for (let i = 0; i < leaves; i++) {
    const x = ((i + 0.5) * wave) / 2;
    const up = i % 2 === 0 ? -1 : 1;
    const y = Math.sin((x / wave) * Math.PI * 2) * amp;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(up > 0 ? Math.PI : 0);
    petal(ctx, 0, amp * 1.15, amp * 0.42);
    ctx.restore();
    dot(ctx, x, y + up * amp * 1.5, lw * 0.9);
  }
  ctx.restore();
}

export function drawStrokes(ctx: Ctx, strokes: Stroke[], cx: number, cy: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    ctx.lineWidth = s.w;
    for (let k = 0; k < s.sym; k++) {
      for (const m of s.mirror ? [1, -1] : [1]) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((k * Math.PI * 2) / s.sym);
        ctx.scale(m, 1);
        ctx.translate(-cx, -cy);
        if (s.pts.length === 1) {
          dot(ctx, s.pts[0][0], s.pts[0][1], s.w / 2);
        } else {
          ctx.beginPath();
          s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  ctx.restore();
}
