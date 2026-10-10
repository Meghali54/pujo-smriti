import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { DAYS } from '../data/days';
import { useStored } from '../lib/storage';
import { MandalaSvg } from './MandalaSvg';
import { Btn, PrivacyNote, SectionHeading, inputDark } from './ui';

const EMPTY: Record<string, string> = {};

export function Timeline() {
  const [active, setActive] = useState(0);
  const [notes, setNotes] = useStored<Record<string, string>>('dayNotes', EMPTY);
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const day = DAYS[active];

  function onKey(e: React.KeyboardEvent, i: number) {
    let n = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % DAYS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + DAYS.length) % DAYS.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = DAYS.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    tabs.current[n]?.focus();
  }

  return (
    <section aria-labelledby="timeline-h" className="relative bg-ink py-24 md:py-32">
      <SectionHeading id="timeline-h" bn="মহালয়া থেকে দশমী" title="Six days, one long breath">
        Step through the festival the way it unfolds. Choose a day, read what it holds, and leave a note for yourself.
      </SectionHeading>

      <div className="mx-auto max-w-6xl px-5">
        {/* rail */}
        <div role="tablist" aria-label="Days of Durga Puja" className="relative mx-auto grid max-w-4xl grid-cols-3 gap-y-6 sm:grid-cols-6">
          <div aria-hidden className="absolute left-[8%] right-[8%] top-[27px] hidden h-px bg-paper/20 sm:block" />
          <motion.div aria-hidden className="absolute left-[8%] top-[27px] hidden h-px origin-left bg-gradient-to-r from-sindoor to-gold-2 sm:block" style={{ right: '8%' }} initial={false} animate={{ scaleX: active / (DAYS.length - 1) }} transition={{ duration: reduce ? 0 : 0.7, ease: 'easeOut' }} />
          {DAYS.map((d, i) => {
            const on = i === active;
            const remembered = !!notes[d.id]?.trim();
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`tab-${d.id}`}
                aria-selected={on}
                aria-controls={`panel-${d.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className="group relative z-10 flex flex-col items-center gap-2 rounded-md px-1 py-1 text-center"
              >
                <span className={`relative grid h-14 w-14 place-items-center rounded-full border transition-colors ${on ? 'border-gold-2 bg-sindoor text-cream' : i < active ? 'border-gold/60 bg-ink-3 text-gold-2' : 'border-paper/30 bg-ink text-paper/70 group-hover:border-gold-2'}`}>
                  <MandalaSvg petals={6 + (i % 3) * 2} rings={1} className="h-9 w-9" strokeWidth={4} />
                  {remembered && <span aria-label="You wrote a memory for this day" className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border border-ink bg-gold-2" />}
                </span>
                <span lang="bn" className={`font-bn text-lg leading-none ${on ? 'text-gold-2' : 'text-paper/80'}`}>{d.bn}</span>
                <span className="font-ui text-[0.78rem] text-paper/60">{d.en.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* panel */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={day.id}
              role="tabpanel"
              id={`panel-${day.id}`}
              aria-labelledby={`tab-${day.id}`}
              tabIndex={0}
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: reduce ? 0 : 0.45 }}
              className="grid gap-8 rounded-sm border border-gold/25 bg-ink-2/60 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12 md:p-10"
            >
              <div>
                <div className="relative mx-auto aspect-square w-full max-w-[260px] text-gold/80 md:max-w-none">
                  <MandalaSvg petals={day.petals} rings={3} strokeWidth={0.5} className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span lang="bn" className="font-bn text-[clamp(2.4rem,7vw,4rem)] text-cream drop-shadow">{day.bn}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-3xl italic text-gold-2 md:text-4xl">{day.tagline}</h3>
                <p className="mt-4 font-display text-[1.28rem] leading-[1.6] text-paper/90">{day.story}</p>
                <ul className="mt-5 space-y-1.5 font-ui text-[0.95rem] text-paper/80">
                  {day.rituals.map((r) => (
                    <li key={r} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-sindoor" />
                      {r}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-gold/20 pt-6">
                  <label htmlFor={`note-${day.id}`} className="font-display text-xl italic text-cream">
                    {day.prompt}
                  </label>
                  <textarea
                    id={`note-${day.id}`}
                    rows={3}
                    value={notes[day.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [day.id]: e.target.value }))}
                    placeholder="Write a line or two. Bengali, English, or both."
                    className={`${inputDark} mt-3 resize-y font-display text-lg`}
                  />
                  <div className="mt-2">
                    <PrivacyNote>Saved only in this browser. Use the Capsule below to turn a note into a card.</PrivacyNote>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Btn variant="ghost" disabled={active === 0} onClick={() => setActive((a) => Math.max(0, a - 1))}>
              ← Previous day
            </Btn>
            <Btn variant="ghost" disabled={active === DAYS.length - 1} onClick={() => setActive((a) => Math.min(DAYS.length - 1, a + 1))}>
              Next day →
            </Btn>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-center font-ui text-[0.85rem] text-paper/55">
            Customs vary across families and neighbourhoods, and the dates move each year with the lunar calendar. Check a panjika for this year’s timings.
          </p>
        </div>
      </div>
    </section>
  );
}
