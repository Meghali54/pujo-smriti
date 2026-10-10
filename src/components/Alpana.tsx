import { useCallback, useEffect, useRef, useState } from 'react';
import { drawMandala, drawStrokes, drawVine, type AlpanaStyle, type Stroke } from '../lib/alpana';
import { clampLines, ensureFonts, grain, paintPaper, setSpacing, wrapText } from '../lib/canvas';
import { F } from '../lib/theme';
import { ExportBar } from './CardPreview';
import { Btn, Field, PrivacyNote, SectionHeading, inputDark } from './ui';

const W = 1080;
const H = 1350;
const CX = 540;
const CY = 520;

const PALETTES = {
  rice: { label: 'Rice paste on red oxide', bg: '#8f1a14', line: '#fbf3e3', text: '#fbf3e3', accent: '#e0c076' },
  ink: { label: 'Gold on midnight ink', bg: '#0b0e1c', line: '#e0c076', text: '#faf3e3', accent: '#b3261e' },
  paper: { label: 'Sindoor on antique paper', bg: 'paper', line: '#b3261e', text: '#2a1d14', accent: '#8f1a14' },
  indigo: { label: 'White on indigo', bg: '#1b2146', line: '#faf3e3', text: '#faf3e3', accent: '#e0c076' },
} as const;
type PaletteId = keyof typeof PALETTES;

const OCCASIONS = {
  bijoya: { label: 'Shubho Bijoya', headline: 'শুভ বিজয়া', message: 'Sweetness, sindoor and a long hug for you this Bijoya.' },
  mahalaya: { label: 'Shubho Mahalaya', headline: 'শুভ মহালয়া', message: 'The dawn has begun. Maa is on her way.' },
  sharodiya: { label: 'Shubho Sharodiya', headline: 'শুভ শারদীয়া', message: 'May your Pujo be full of light, dhak and good company.' },
  custom: { label: 'Write my own', headline: '', message: '' },
} as const;
type OccasionId = keyof typeof OCCASIONS;

export function Alpana() {
  const [occasion, setOccasion] = useState<OccasionId>('bijoya');
  const [headline, setHeadline] = useState<string>(OCCASIONS.bijoya.headline);
  const [message, setMessage] = useState<string>(OCCASIONS.bijoya.message);
  const [from, setFrom] = useState('');
  const [style, setStyle] = useState<AlpanaStyle>('padma');
  const [petals, setPetals] = useState(10);
  const [rings, setRings] = useState(3);
  const [palette, setPalette] = useState<PaletteId>('rice');
  const [draw, setDraw] = useState(false);
  const [sym, setSym] = useState(8);
  const [mirror, setMirror] = useState(false);
  const [brush, setBrush] = useState(9);
  const [fontsReady, setFontsReady] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const canvas = useRef<HTMLCanvasElement>(null);
  const base = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const raf = useRef(0);
  const P = PALETTES[palette];

  useEffect(() => {
    ensureFonts().then(() => setFontsReady(true));
  }, []);

  const paint = useCallback(() => {
    const c = canvas.current;
    const b = base.current;
    if (!c || !b) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(b, 0, 0);
    const all = current.current ? [...strokes.current, current.current] : strokes.current;
    drawStrokes(ctx, all, CX, CY, PALETTES[palette].line);
  }, [palette]);

  // Rebuild the static layer (background, border, mandala, text) when any setting changes.
  useEffect(() => {
    if (!fontsReady) return;
    const b = base.current ?? (base.current = document.createElement('canvas'));
    b.width = W;
    b.height = H;
    const ctx = b.getContext('2d')!;
    if (P.bg === 'paper') paintPaper(ctx, W, H);
    else {
      ctx.fillStyle = P.bg;
      ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(CX, CY, 60, CX, CY, 800);
      g.addColorStop(0, 'rgba(255,220,160,.12)');
      g.addColorStop(1, 'rgba(0,0,0,.35)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      grain(ctx, W, H, 0.8);
    }
    // frame + vines + corner motifs
    ctx.strokeStyle = P.line;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 44, W - 88, H - 88);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.globalAlpha = 0.9;
    drawVine(ctx, 190, 101, W - 190, 101, 9, 64, P.line, 3);
    drawVine(ctx, 190, H - 101, W - 190, H - 101, 9, 64, P.line, 3);
    drawVine(ctx, 101, 190, 101, H - 190, 9, 64, P.line, 3);
    drawVine(ctx, W - 101, 190, W - 101, H - 190, 9, 64, P.line, 3);
    [[101, 101], [W - 101, 101], [101, H - 101], [W - 101, H - 101]].forEach(([x, y]) => drawMandala(ctx, x, y, 52, { style: 'padma', petals: 6, rings: 1, color: P.line, lineWidth: 2.4 }));
    ctx.globalAlpha = 1;

    drawMandala(ctx, CX, CY, 360, { style, petals, rings, color: P.line, lineWidth: 3.6 });
    ctx.fillStyle = P.accent;
    ctx.beginPath();
    ctx.arc(CX, CY, 15, 0, Math.PI * 2);
    ctx.fill();

    // words
    ctx.textAlign = 'center';
    ctx.fillStyle = P.text;
    let size = 116;
    ctx.font = `400 ${size}px ${F.bn}`;
    const hl = headline || 'Your words';
    while (ctx.measureText(hl).width > 860 && size > 48) {
      size -= 4;
      ctx.font = `400 ${size}px ${F.bn}`;
    }
    ctx.fillText(hl, CX, 1002);
    ctx.font = `italic 400 42px ${F.display}, ${F.bn}`;
    ctx.fillStyle = P.text;
    clampLines(ctx, wrapText(ctx, message || 'Write a short message.', 800), 3, 800).forEach((l, i) => ctx.fillText(l, CX, 1078 + i * 56));
    if (from) {
      ctx.font = `500 56px ${F.hand}`;
      ctx.fillStyle = P.accent;
      ctx.fillText(`— ${from}`, CX, 1262);
    } else {
      ctx.font = `400 20px ${F.ui}`;
      ctx.fillStyle = P.text;
      ctx.globalAlpha = 0.6;
      setSpacing(ctx, 6);
      ctx.fillText('PUJO SMRITI', CX + 3, 1262);
      setSpacing(ctx, 0);
      ctx.globalAlpha = 1;
    }
    paint();
  }, [fontsReady, style, petals, rings, palette, headline, message, from, P, paint]);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const schedule = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paint);
  };
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!draw) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = { pts: [pt(e)], sym, mirror, w: brush };
    schedule();
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    const s = current.current;
    if (!s) return;
    const p = pt(e);
    const last = s.pts[s.pts.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 3) {
      s.pts.push(p);
      schedule();
    }
  }
  function up() {
    if (!current.current) return;
    strokes.current.push(current.current);
    current.current = null;
    setStrokeCount(strokes.current.length);
    schedule();
  }
  function flourish() {
    const r = [140, 200, 260, 320][strokes.current.length % 4];
    strokes.current.push({ pts: [[CX, CY - r]], sym: 12, mirror: false, w: brush + 4 });
    strokes.current.push({ pts: [[CX + 10, CY - r - 26], [CX, CY - r - 44], [CX - 10, CY - r - 26]], sym: 12, mirror: false, w: Math.max(4, brush - 3) });
    setStrokeCount(strokes.current.length);
    paint();
  }
  const undo = () => {
    strokes.current.pop();
    setStrokeCount(strokes.current.length);
    paint();
  };
  const clear = () => {
    strokes.current = [];
    setStrokeCount(0);
    paint();
  };

  function chooseOccasion(id: OccasionId) {
    setOccasion(id);
    if (id !== 'custom') {
      setHeadline(OCCASIONS[id].headline);
      setMessage(OCCASIONS[id].message);
    }
  }

  return (
    <section aria-labelledby="alpana-h" className="relative bg-ink py-24 md:py-32">
      <SectionHeading id="alpana-h" bn="আলপনার কার্ড" title="Alpana greeting-card studio">
        Design the pattern, write your greeting, then paint over it yourself with rice-paste strokes that repeat around the centre.
      </SectionHeading>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="order-2 space-y-8 lg:order-1">
          <fieldset className="space-y-4">
            <legend className="mb-1 font-display text-2xl text-gold-2">1. Your greeting</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Occasion">
              {(Object.keys(OCCASIONS) as OccasionId[]).map((id) => (
                <button key={id} aria-pressed={occasion === id} onClick={() => chooseOccasion(id)} className={`min-h-11 rounded-full border px-4 text-sm ${occasion === id ? 'border-gold-2 bg-gold text-ink' : 'border-paper/30 hover:border-gold-2'}`}>
                  {OCCASIONS[id].label}
                </button>
              ))}
            </div>
            <Field label="Headline (Bengali or English)" htmlFor="al-head">
              <input id="al-head" lang="bn" maxLength={28} className={`${inputDark} font-bn`} value={headline} onChange={(e) => { setHeadline(e.target.value); setOccasion('custom'); }} />
            </Field>
            <Field label="Message" htmlFor="al-msg" hint={`${message.length}/140`}>
              <textarea id="al-msg" rows={3} maxLength={140} className={`${inputDark} font-display text-lg`} value={message} onChange={(e) => { setMessage(e.target.value); setOccasion('custom'); }} />
            </Field>
            <Field label="From (optional)" htmlFor="al-from">
              <input id="al-from" maxLength={26} className={inputDark} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 font-display text-2xl text-gold-2">2. The pattern</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Alpana style" htmlFor="al-style">
                <select id="al-style" className={inputDark} value={style} onChange={(e) => setStyle(e.target.value as AlpanaStyle)}>
                  <option value="padma">Padma: lotus petals</option>
                  <option value="chakra">Chakra: scalloped rings</option>
                  <option value="lata">Lata: winding vine</option>
                  <option value="dots">Bindu: dots and buds</option>
                </select>
              </Field>
              <Field label="Colours" htmlFor="al-pal">
                <select id="al-pal" className={inputDark} value={palette} onChange={(e) => setPalette(e.target.value as PaletteId)}>
                  {(Object.keys(PALETTES) as PaletteId[]).map((k) => <option key={k} value={k}>{PALETTES[k].label}</option>)}
                </select>
              </Field>
              <Field label={`Petals: ${petals}`} htmlFor="al-pet">
                <input id="al-pet" type="range" min={6} max={16} step={2} value={petals} onChange={(e) => setPetals(+e.target.value)} />
              </Field>
              <Field label={`Rings: ${rings}`} htmlFor="al-rings">
                <input id="al-rings" type="range" min={2} max={5} value={rings} onChange={(e) => setRings(+e.target.value)} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 font-display text-2xl text-gold-2">3. Paint your own</legend>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-h-11 items-center gap-2.5 text-paper">
                <input type="checkbox" className="h-4 w-4" checked={draw} onChange={(e) => setDraw(e.target.checked)} />
                Drawing mode (draw on the card with mouse, finger or pen)
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Repeat around centre" htmlFor="al-sym">
                <select id="al-sym" className={inputDark} value={sym} onChange={(e) => setSym(+e.target.value)}>
                  {[1, 4, 6, 8, 12].map((n) => <option key={n} value={n}>{n === 1 ? 'Off' : `${n} times`}</option>)}
                </select>
              </Field>
              <Field label={`Brush: ${brush}px`} htmlFor="al-brush">
                <input id="al-brush" type="range" min={4} max={22} value={brush} onChange={(e) => setBrush(+e.target.value)} />
              </Field>
              <label className="flex min-h-11 items-end gap-2.5 pb-2 text-paper">
                <input type="checkbox" className="h-4 w-4" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Mirror
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="ghost" onClick={flourish}>Add a ring of dots and buds</Btn>
              <Btn variant="ghost" disabled={!strokeCount} onClick={undo}>Undo</Btn>
              <Btn variant="ghost" disabled={!strokeCount} onClick={clear}>Clear my painting</Btn>
            </div>
            <p className="text-sm text-paper/60">Prefer no drawing? The “ring of dots and buds” button adds a flourish with one key press.</p>
          </fieldset>
          <PrivacyNote>Everything is drawn in your browser. Nothing is uploaded, and the card is not saved unless you download it.</PrivacyNote>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <div className="mx-auto w-full max-w-[460px]">
            <div className="overflow-hidden rounded-[3px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] ring-1 ring-gold/30">
              <canvas
                ref={canvas}
                width={W}
                height={H}
                role="img"
                aria-label={`Alpana greeting card reading ${headline || 'your words'}. ${draw ? 'Drawing mode is on.' : ''}`}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                className={`block h-auto w-full bg-ink-2 ${draw ? 'cursor-crosshair' : ''}`}
                style={{ touchAction: draw ? 'none' : 'auto' }}
              />
            </div>
            <div className="mt-4">
              <ExportBar getCanvas={() => canvas.current} filename={`alpana-card-${Date.now().toString(36)}.png`} shareText={`${headline}. Made with Pujo Smriti.`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
