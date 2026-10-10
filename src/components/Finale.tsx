import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Btn } from './ui';

const STAGES = [
  { bn: 'দশমী', en: 'Dashami. The lights are still on, but the air has changed.' },
  { bn: 'সিঁদুর খেলা', en: 'Red on white borders, on cheeks, on Maa’s feet. Laughter that is also a goodbye.' },
  { bn: 'বরণ', en: 'Betel leaf, sweets, sindoor. A daughter is sent home with love, and the promise of return.' },
  { bn: 'বিসর্জন', en: 'The dhak slows. The river takes the clay. What stays is us.' },
  { bn: 'শুভ বিজয়া', en: 'Pronam to elders. Long hugs. Nimki, narkel naru, mishti. The house smells of sweets and camphor.' },
];
const LAST = STAGES.length; // the final line

function River() {
  const d = useMemo(() => {
    let s = 9;
    const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
    return {
      stars: Array.from({ length: 50 }, () => ({ x: r() * 1600, y: r() * 420, r: 0.5 + r(), d: r() * 4 })),
      diyas: Array.from({ length: 22 }, () => ({ x: r() * 1600, y: 540 + r() * 330, d: r() * 4, s: 0.6 + r() * 0.9 })),
    };
  }, []);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04050d" />
          <stop offset=".5" stopColor="#141335" />
          <stop offset=".62" stopColor="#3b1a2e" />
          <stop offset="1" stopColor="#0a0a14" />
        </linearGradient>
        <filter id="fb"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <rect width="1600" height="900" fill="url(#fsky)" />
      {d.stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6dc" className="twinkle" style={{ animationDelay: `${s.d}s` }} />)}
      <path d="M0 560Q200 540 420 556T820 552T1240 558T1600 548V900H0Z" fill="#090a14" />
      {/* ghat steps */}
      <g fill="#171425">
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1180 + i * 20} y={470 + i * 20} width={420 - i * 20} height="20" />)}
      </g>
      {/* distant boat carrying the idol's arch */}
      <g transform="translate(560 560)">
        <path d="M-120 0H140L110 26H-90Z" fill="#050509" />
        <path d="M-44 0V-70Q-44-110 0-130Q44-110 44-70V0Z" fill="#2a0d10" stroke="#c9a24b" strokeOpacity=".6" />
        <circle cx="0" cy="-70" r="4" fill="#ffd47a" className="flicker" />
        <ellipse cx="0" cy="36" rx="160" ry="10" fill="#ff9a3c" opacity=".18" filter="url(#fb)" />
      </g>
      {d.diyas.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`} className="floaty" style={{ animationDelay: `${p.d}s`, animationDuration: `${5 + p.d}s` }}>
          <ellipse cx="0" cy="2" rx="30" ry="9" fill="#ff9a3c" opacity=".28" filter="url(#fb)" />
          <path d="M-9 0Q0 7 9 0Q7 7 0 8Q-7 7 -9 0Z" fill="#7a3a17" />
          <path d="M0-13Q5-6 0-1Q-5-6 0-13Z" fill="#ffd98a" className="flicker" />
        </g>
      ))}
    </svg>
  );
}

export function Finale() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.55, once: true });
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (inView && !reduce && stage === 0) setPlaying(true);
  }, [inView, reduce, stage]);
  useEffect(() => {
    if (!playing) return;
    if (stage >= LAST) return setPlaying(false);
    const t = setTimeout(() => setStage((s) => s + 1), stage === 0 ? 4200 : 5200);
    return () => clearTimeout(t);
  }, [playing, stage]);

  const done = stage >= LAST;
  const words = 'ASCHHE BOCHHOR AABAR HOBE.'.split(' ');

  return (
    <section ref={ref} aria-labelledby="dashami-h" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <River />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(5,6,14,.1),rgba(5,6,14,.75)_85%)]" />
      <h2 id="dashami-h" className="sr-only">Dashami: the finale</h2>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <div aria-live="polite" aria-atomic="true" className="min-h-[15rem] w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={stage} initial={{ opacity: 0, y: reduce ? 0 : 16, filter: reduce ? 'none' : 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: reduce ? 'none' : 'blur(6px)' }} transition={{ duration: reduce ? 0.1 : 1.1 }}>
                <p lang="bn" className="font-bn text-[clamp(3.5rem,14vw,8rem)] leading-tight text-cream">{STAGES[stage].bn}</p>
                <p className="mx-auto mt-4 max-w-xl font-display text-2xl italic leading-relaxed text-paper/90 md:text-3xl">{STAGES[stage].en}</p>
              </motion.div>
            ) : (
              <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0.1 : 1.4 }}>
                <p lang="bn" className="font-bn text-2xl text-gold-2 md:text-3xl">আসছে বছর আবার হবে।</p>
                <p className="mt-6 font-display text-[clamp(2.4rem,8.5vw,6.2rem)] font-medium leading-[1.02] tracking-[0.05em] text-cream">
                  {words.map((w, i) => (
                    <motion.span key={w} className="mr-[0.28em] inline-block" initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.9 + i * 0.9, duration: reduce ? 0.1 : 1.2 }}>
                      {w}
                    </motion.span>
                  ))}
                </p>
                <motion.p className="mx-auto mt-6 max-w-md font-display text-xl italic text-gold-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 4.4, duration: 1.4 }}>
                  Until next year, Maa. Keep the memories warm.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {!done ? (
            <>
              <Btn variant="ghost" onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : stage === 0 && !inView ? 'Begin' : 'Play'}</Btn>
              <Btn variant="ghost" onClick={() => { setPlaying(false); setStage((s) => Math.min(LAST, s + 1)); }}>Next</Btn>
              <Btn variant="ghost" onClick={() => { setPlaying(false); setStage(LAST); }}>Skip to the end</Btn>
            </>
          ) : (
            <motion.div className="flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 5.6, duration: 1 }}>
              <Btn variant="red" onClick={() => document.getElementById('alpana')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>Send a Bijoya card</Btn>
              <Btn variant="ghost" onClick={() => document.getElementById('letter')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>Write to Maa</Btn>
              <Btn variant="ghost" onClick={() => { setStage(0); setPlaying(!reduce); }}>Watch again</Btn>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
