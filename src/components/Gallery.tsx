import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { renderPolaroid } from '../lib/cards';
import { slug } from '../lib/canvas';
import { loadPhoto, deletePhoto, useStored } from '../lib/storage';
import { CardPreview } from './CardPreview';
import type { CapsuleItem } from './Capsule';
import { SampleArt, type SampleKind } from './SampleArt';
import { Btn, SectionHeading } from './ui';

const SAMPLES: { kind: SampleKind; title: string; note: string; rot: number }[] = [
  { kind: 'shiuli', title: 'Shiuli on the steps', note: 'Fallen at dawn, they stain the fingers orange.', rot: -3 },
  { kind: 'dhunuchi', title: 'Dhunuchi smoke', note: 'Coconut husk and camphor. You can smell this picture.', rot: 2.5 },
  { kind: 'bhog', title: 'Bhog on a leaf', note: 'Khichuri, labra, chutney: the taste of noon.', rot: -1.5 },
  { kind: 'lights', title: 'A lane in lights', note: 'The night the whole para stays up.', rot: 3 },
  { kind: 'kumartuli', title: 'Clay, before the eyes', note: 'A frame of bamboo, a face waiting for chokkhu daan.', rot: -2.5 },
  { kind: 'laalpaar', title: 'Red on white', note: 'The border of a sari, the circle of sindoor.', rot: 1.8 },
];
type Filter = 'all' | 'samples' | 'mine';
const LIST0: CapsuleItem[] = [];

function Thumb({ item }: { item: CapsuleItem }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    let live = true;
    if (item.hasPhoto) loadPhoto(item.id).then((b) => { if (b && live) { u = URL.createObjectURL(b); setUrl(u); } });
    return () => { live = false; if (u) URL.revokeObjectURL(u); };
  }, [item]);
  if (url) return <img src={url} alt={`Your photo: ${item.title || 'untitled memory'}`} loading="lazy" decoding="async" className="h-full w-full object-cover sepia-[.25]" />;
  return <div className="grid h-full w-full place-items-center bg-gradient-to-b from-ink-3 to-[#5a2318] p-4 text-center font-display text-xl italic text-cream">{item.text.slice(0, 80) || 'A memory without a photo'}</div>;
}

export function Gallery() {
  const reduce = useReducedMotion();
  const [items, setItems] = useStored<CapsuleItem[]>('capsules', LIST0);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<{ type: 'sample'; i: number } | { type: 'mine'; item: CapsuleItem } | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia('(pointer: fine)').matches && !reduce), [reduce]);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const remove = useCallback(async (item: CapsuleItem) => {
    if (!window.confirm('Remove this memory from this device?')) return;
    await deletePhoto(item.id);
    setItems((l) => l.filter((x) => x.id !== item.id));
    setOpen(null);
  }, [setItems]);

  const showSamples = filter !== 'mine';
  const showMine = filter !== 'samples';

  return (
    <section aria-labelledby="gallery-h" className="paper relative overflow-hidden py-24 md:py-32">
      <SectionHeading id="gallery-h" tone="light" bn="স্মৃতির অ্যালবাম" title="The scrapbook">
        Drag the pictures around if you like. The pieces marked <em>Sample</em> are illustrations that show how it looks. Your own memories appear beside them.
      </SectionHeading>

      <div className="mx-auto max-w-6xl px-5">
        <div role="group" aria-label="Filter scrapbook" className="mb-10 flex flex-wrap justify-center gap-2">
          {([['all', 'Everything'], ['samples', 'Sample illustrations'], ['mine', `My memories (${items.length})`]] as const).map(([v, l]) => (
            <button key={v} aria-pressed={filter === v} onClick={() => setFilter(v)} className={`min-h-11 rounded-full border px-5 text-sm ${filter === v ? 'border-sindoor bg-sindoor text-cream' : 'border-brown/40 text-brown hover:border-sindoor'}`}>{l}</button>
          ))}
        </div>

        <div ref={boardRef} className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {showMine && items.map((it, k) => (
            <motion.figure key={it.id} drag={fine} dragConstraints={boardRef} dragMomentum={false} whileHover={fine ? { scale: 1.03, zIndex: 5 } : undefined} style={{ rotate: (k % 2 ? 1 : -1) * (1.5 + (k % 3)) }} className="relative mx-auto w-full max-w-[320px] bg-[#f6eedc] p-3 pb-4 shadow-[0_18px_30px_-12px_rgba(40,20,0,.55)]">
              <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-gold-2/70" />
              <div className="aspect-[4/3.3] overflow-hidden bg-ink"><Thumb item={it} /></div>
              <figcaption className="mt-3">
                <p className="font-hand text-[1.7rem] leading-none text-brown">{it.title || 'Untitled'}</p>
                <p className="mt-1 font-ui text-xs text-brown/70">{it.day} {it.year}</p>
                <p className="mt-2 inline-block rounded-sm bg-brown px-2 py-0.5 font-ui text-[0.7rem] font-medium text-cream">Yours · stored on this device</p>
                <div className="mt-3"><button onClick={() => setOpen({ type: 'mine', item: it })} className="min-h-11 text-sm text-sindoor underline underline-offset-4">Open card</button></div>
              </figcaption>
            </motion.figure>
          ))}
          {showMine && items.length === 0 && filter === 'mine' && (
            <p className="col-span-full text-center font-display text-2xl italic text-brown/75">Nothing here yet. Make a card in the <a href="#capsule" className="underline decoration-sindoor">memory capsule</a> and keep it, and it will appear on this page.</p>
          )}
          {showSamples && SAMPLES.map((s, k) => (
            <motion.figure key={s.kind} drag={fine} dragConstraints={boardRef} dragMomentum={false} whileHover={fine ? { scale: 1.03, zIndex: 5 } : undefined} style={{ rotate: s.rot }} className="relative mx-auto w-full max-w-[320px] bg-[#f6eedc] p-3 pb-4 shadow-[0_18px_30px_-12px_rgba(40,20,0,.55)]">
              <span aria-hidden className={`absolute -top-3 h-6 w-20 bg-gold-2/70 ${k % 2 ? 'right-6 -rotate-3' : 'left-6 rotate-3'}`} />
              <div className="aspect-[4/3.3] overflow-hidden bg-ink"><SampleArt kind={s.kind} className="h-full w-full" /></div>
              <figcaption className="mt-3">
                <p className="font-hand text-[1.7rem] leading-none text-brown">{s.title}</p>
                <p className="mt-1 font-display text-[1.02rem] italic leading-snug text-brown/80">{s.note}</p>
                <p className="mt-2 inline-block rounded-sm border border-sindoor px-2 py-0.5 font-ui text-[0.7rem] font-medium text-sindoor">Sample illustration · not a real memory</p>
                <div className="mt-2"><button onClick={() => setOpen({ type: 'sample', i: k })} className="min-h-11 text-sm text-sindoor underline underline-offset-4">Enlarge</button></div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mx-auto mt-14 max-w-xl text-center font-ui text-[0.9rem] text-brown/70">No photos, quotes or memories on this page belong to other people. Nothing is collected or published. Your own items live only in your browser.</p>
      </div>

      <dialog ref={dlg} onClose={() => setOpen(null)} onClick={(e) => e.target === dlg.current && setOpen(null)} aria-label="Scrapbook item" className="m-auto max-h-[94svh] w-[min(94vw,560px)] overflow-auto rounded-md border border-gold/40 bg-ink p-5 text-paper">
        {open?.type === 'sample' && (
          <div>
            <SampleArt kind={SAMPLES[open.i].kind} className="aspect-[4/3.2] w-full rounded-sm" />
            <p className="mt-4 font-hand text-4xl text-cream">{SAMPLES[open.i].title}</p>
            <p className="font-display text-xl italic text-paper/85">{SAMPLES[open.i].note}</p>
            <p className="mt-3 text-sm text-gold-2">Sample illustration. Not a real memory or photograph.</p>
          </div>
        )}
        {open?.type === 'mine' && <MineCard item={open.item} onDelete={() => remove(open.item)} />}
        <div className="mt-5 text-right"><Btn variant="ghost" onClick={() => setOpen(null)}>Close</Btn></div>
      </dialog>
    </section>
  );
}

function MineCard({ item, onDelete }: { item: CapsuleItem; onDelete: () => void }) {
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [ready, setReady] = useState(!item.hasPhoto);
  useEffect(() => {
    let live = true;
    let b: ImageBitmap | null = null;
    if (item.hasPhoto) loadPhoto(item.id).then(async (blob) => { if (blob && live) { b = await createImageBitmap(blob); setBmp(b); } if (live) setReady(true); });
    return () => { live = false; b?.close(); };
  }, [item]);
  if (!ready) return <p className="py-10 text-center">Opening…</p>;
  return (
    <div>
      <CardPreview maxWidth={420} label={`Your memory card: ${item.title}`} filename={`pujo-smriti-${slug(item.title)}-${item.year}.png`} shareText="A Puja memory, made with Pujo Smriti." deps={[item.id, bmp]} render={(c) => renderPolaroid(c, { year: item.year, day: item.day, title: item.title, text: item.text, name: '', photo: bmp })} />
      <button onClick={onDelete} className="mt-2 min-h-11 text-sm text-paper/70 underline underline-offset-4 hover:text-cream">Remove from this device</button>
    </div>
  );
}
