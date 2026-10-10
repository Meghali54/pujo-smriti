import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { renderLetter } from '../lib/cards';
import { downloadText, slug } from '../lib/canvas';
import { removeStored, useStored } from '../lib/storage';
import { CardPreview } from './CardPreview';
import { MandalaSvg } from './MandalaSvg';
import { Btn, PrivacyNote, SectionHeading } from './ui';

type Lang = 'bn' | 'en' | 'mix';
interface LetterState {
  lang: Lang;
  body: string;
  name: string;
}
const L0: LetterState = { lang: 'mix', body: '', name: '' };
const SAL: Record<Lang, string> = { bn: 'মা গো,', en: 'Dear Maa,', mix: 'মা গো, dear Maa,' };
const SIGN: Record<Lang, string> = { bn: 'তোমার সন্তান,', en: 'Your child,', mix: 'তোমার সন্তান, your child,' };
const PHRASES = [
  'মা, এ বছর তুমি আসছ বলে বুকটা হালকা লাগছে।',
  'Thank you for the year that held me together.',
  'তোমার কাছে আমার একটাই চাওয়া…',
  'There is someone I miss more than usual this Pujo.',
  'আসছে বছর আবার হবে।',
];

export function Letter() {
  const reduce = useReducedMotion();
  const [saved, setSaved] = useStored<LetterState>('letter', L0);
  const [keep, setKeep] = useStored<boolean>('letterKeep', true);
  const [mem, setMem] = useState<LetterState>(saved);
  const [sealed, setSealed] = useState(false);
  const [flowing, setFlowing] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const year = String(new Date().getFullYear());

  // The letter is only written to this browser when "keep a draft" is on.
  useEffect(() => {
    if (keep) setSaved(mem);
    else removeStored('letter');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mem, keep]);

  const set = (p: Partial<LetterState>) => setMem((m) => ({ ...m, ...p }));

  function insert(t: string) {
    const el = area.current;
    if (!el) return set({ body: mem.body + (mem.body ? '\n' : '') + t });
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = mem.body.slice(0, s) + t + ' ' + mem.body.slice(e);
    set({ body: next });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + t.length + 1;
    });
  }

  function release() {
    setFlowing(true);
    setTimeout(() => {
      setMem({ ...L0, lang: mem.lang });
      removeStored('letter');
      setSealed(false);
      setFlowing(false);
    }, reduce ? 200 : 1800);
  }

  const txt = `${SAL[mem.lang]}\n\n${mem.body}\n\n${SIGN[mem.lang]}\n${mem.name}`;

  return (
    <section aria-labelledby="letter-h" className="relative overflow-hidden bg-[#150f1f] py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(179,38,30,.22),transparent_60%)]" />
      <SectionHeading id="letter-h" bn="মায়ের কাছে চিঠি" title="A letter to Maa">
        Say what you did not say at the pandal. Write it, seal it, keep it. Nobody reads it but you.
      </SectionHeading>

      <div className="relative mx-auto max-w-3xl px-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div role="radiogroup" aria-label="Letter language" className="inline-flex overflow-hidden rounded-full border border-paper/30">
            {([['bn', 'বাংলা'], ['en', 'English'], ['mix', 'Both']] as const).map(([v, l]) => (
              <button key={v} role="radio" aria-checked={mem.lang === v} onClick={() => set({ lang: v })} className={`min-h-11 px-5 text-sm transition-colors ${mem.lang === v ? 'bg-gold text-ink' : 'text-paper hover:bg-ink-3'}`}>
                <span lang={v === 'bn' ? 'bn' : undefined}>{l}</span>
              </button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-2.5 text-sm text-paper/85">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-4 w-4" />
            Keep an autosaved draft on this device
          </label>
        </div>

        <AnimatePresence mode="wait">
          {!sealed ? (
            <motion.div key="write" exit={{ opacity: 0 }} className="paper relative rounded-[3px] px-5 pb-6 pt-7 shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] sm:px-10">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="font-hand text-[2rem] text-sindoor-2">{SAL[mem.lang]}</p>
                <p className="font-display text-sm italic text-brown/60">{year}</p>
              </div>
              <label htmlFor="letter-body" className="sr-only">Your letter to Maa</label>
              <motion.textarea
                ref={area}
                id="letter-body"
                rows={10}
                value={mem.body}
                onChange={(e) => set({ body: e.target.value })}
                placeholder={mem.lang === 'en' ? 'Begin anywhere…' : 'যেখান থেকে ইচ্ছে শুরু করো…'}
                className="lined block w-full resize-y bg-transparent font-hand text-[1.75rem] text-[#20150e] placeholder:text-brown/35"
                animate={flowing ? { opacity: 0, y: reduce ? 0 : 60, filter: 'blur(8px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: reduce ? 0.1 : 1.6, ease: 'easeIn' }}
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label htmlFor="letter-name" className="font-hand text-2xl text-sindoor-2">{SIGN[mem.lang].split(' your')[0]}</label>
                <input id="letter-name" value={mem.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} placeholder="your name" className="min-w-0 flex-1 border-b border-brown/40 bg-transparent px-1 py-1 font-hand text-2xl text-[#20150e] placeholder:text-brown/35" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="sealed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="relative">
                <CardPreview
                  maxWidth={520}
                  label="Your sealed letter to Maa"
                  filename={`letter-to-maa-${slug(mem.name || 'me')}.png`}
                  shareText="A letter to Maa, written in Pujo Smriti."
                  deps={[mem, year]}
                  render={(c) => renderLetter(c, { salutation: SAL[mem.lang], body: mem.body, signoff: SIGN[mem.lang], name: mem.name, year })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sealed && (
          <div className="mt-5">
            <p className="mb-2 text-sm text-paper/70">Stuck? Tap a line to add it.</p>
            <div className="flex flex-wrap gap-2">
              {PHRASES.map((p) => (
                <button key={p} onClick={() => insert(p)} className="min-h-11 rounded-full border border-paper/25 px-4 py-1.5 text-left text-sm text-paper/90 hover:border-gold-2 hover:text-gold-2">
                  <span lang={/[\u0980-\u09FF]/.test(p) ? 'bn' : 'en'}>{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!sealed ? (
            <Btn variant="red" disabled={!mem.body.trim()} onClick={() => setSealed(true)}>
              <span aria-hidden className="inline-block h-5 w-5 text-cream"><MandalaSvg petals={6} rings={1} strokeWidth={6} /></span>
              Seal with sindoor
            </Btn>
          ) : (
            <Btn variant="ghost" onClick={() => setSealed(false)}>Unseal to edit</Btn>
          )}
          <Btn variant="ghost" disabled={!mem.body.trim()} onClick={() => downloadText(txt, `letter-to-maa-${slug(mem.name || 'me')}.txt`)}>
            Download as text
          </Btn>
          <Btn variant="ghost" disabled={!mem.body.trim() || flowing} onClick={release}>
            Let it flow into the river
          </Btn>
        </div>
        <p className="mt-3 max-w-xl text-sm text-paper/60">
          “Let it flow” deletes the letter from this device, like a bisarjan. Export it first if you want to keep it.
        </p>
        <div className="mt-6">
          <PrivacyNote>This letter is never uploaded or published. No one can read it, including us. To write in Bengali, use your phone or computer’s Bengali keyboard.</PrivacyNote>
        </div>
      </div>
    </section>
  );
}
