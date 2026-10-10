import { useEffect, useRef, useState } from 'react';
import { downloadCanvas, shareCanvas } from '../lib/canvas';
import { Btn } from './ui';

export function ExportBar({ getCanvas, filename, shareText, light = false }: { getCanvas: () => HTMLCanvasElement | null; filename: string; shareText: string; light?: boolean }) {
  const [msg, setMsg] = useState('');
  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function';
  const v = light ? 'paper' : 'ghost';

  async function save() {
    const c = getCanvas();
    if (!c) return;
    try {
      await downloadCanvas(c, filename);
      setMsg('Saved as a PNG. Check your downloads.');
    } catch {
      setMsg('Export failed. Try a different browser.');
    }
  }
  async function share() {
    const c = getCanvas();
    if (!c) return;
    const r = await shareCanvas(c, filename, shareText);
    if (r === 'shared') setMsg('Shared. You decide who sees it.');
    else if (r === 'unsupported') {
      await save();
      setMsg('Sharing files is not supported here, so the PNG was downloaded. Attach it wherever you like.');
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Btn variant={light ? 'red' : 'gold'} onClick={save}>
          Download PNG
        </Btn>
        {canShareFiles && (
          <Btn variant={v} onClick={share}>
            Share…
          </Btn>
        )}
      </div>
      <p role="status" aria-live="polite" className={`mt-2 min-h-6 text-sm ${light ? 'text-brown/75' : 'text-paper/75'}`}>
        {msg}
      </p>
    </div>
  );
}

/** Live canvas preview of a 1080-wide card, with export controls. What you see is exactly what you download. */
export function CardPreview({
  render,
  deps,
  filename,
  shareText,
  label,
  light = false,
  maxWidth = 460,
}: {
  render: (c: HTMLCanvasElement) => Promise<void>;
  deps: unknown[];
  filename: string;
  shareText: string;
  label: string;
  light?: boolean;
  maxWidth?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef(render);
  renderRef.current = render;
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    let live = true;
    const t = setTimeout(async () => {
      const c = ref.current;
      if (!c) return;
      try {
        await renderRef.current(c);
      } catch (e) {
        console.error(e);
      }
      if (live) setBusy(false);
    }, 180);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      <div className="relative overflow-hidden rounded-[3px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)] ring-1 ring-gold/30">
        <canvas ref={ref} width={1080} height={1350} role="img" aria-label={label} className="block h-auto w-full bg-ink-2" />
        {busy && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/40 font-display text-lg italic text-cream">Preparing your card…</div>}
      </div>
      <div className="mt-4">
        <ExportBar getCanvas={() => ref.current} filename={filename} shareText={shareText} light={light} />
      </div>
    </div>
  );
}
