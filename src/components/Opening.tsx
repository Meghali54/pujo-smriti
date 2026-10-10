import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStored } from '../lib/storage';
import { MandalaSvg } from './MandalaSvg';
import { Btn } from './ui';

const TEXT = 'মা আসছেন...';
const DHAK_SRC = `${import.meta.env.BASE_URL}audio/dhak.mp3`;
const MAX_VOLUME = 0.65;
function splitGraphemes(s: string) {
  if ('Segmenter' in Intl) return Array.from(new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(s), (x) => x.segment);
  return [s];
}

export function Opening({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const chars = useMemo(() => splitGraphemes(TEXT), []);

  /* ---- dhak sound ----
     Browsers only allow sound after a user gesture, so we try to autoplay and, if blocked,
     start on the first tap / key press anywhere. The visitor can mute it at any time. */
  const [wantSound, setWantSound] = useStored<boolean>('openingSound', true);
  const wantRef = useRef(wantSound);
  wantRef.current = wantSound;
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const ramp = useCallback((to: number, ms: number, then?: () => void) => {
    const a = audio.current;
    if (!a) return;
    window.clearInterval(timer.current);
    const from = a.volume;
    const t0 = performance.now();
    timer.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k >= 1) {
        window.clearInterval(timer.current);
        then?.();
      }
    }, 50);
  }, []);

  const start = useCallback(async () => {
    const a = audio.current;
    if (!a || !wantRef.current) return;
    try {
      a.volume = 0;
      await a.play();
      setPlaying(true);
      setBlocked(false);
      ramp(MAX_VOLUME, 2200);
    } catch {
      setBlocked(true);
    }
  }, [ramp]);

  useEffect(() => {
    const a = new Audio(DHAK_SRC);
    a.loop = true;
    a.preload = 'auto';
    audio.current = a;
    if (wantRef.current) void start();
    return () => {
      window.clearInterval(timer.current);
      a.pause();
      a.removeAttribute('src');
      a.load();
      audio.current = null;
    };
  }, [start]);

  // If autoplay was blocked, the first gesture anywhere starts the sound.
  useEffect(() => {
    if (!blocked || !wantSound) return;
    const go = () => void start();
    window.addEventListener('pointerdown', go, { once: true });
    window.addEventListener('keydown', go, { once: true });
    return () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
    };
  }, [blocked, wantSound, start]);

  function toggleSound() {
    if (playing) {
      wantRef.current = false;
      setWantSound(false);
      ramp(0, 350, () => {
        audio.current?.pause();
        setPlaying(false);
      });
    } else {
      wantRef.current = true;
      setWantSound(true);
      void start();
    }
  }

  const finish = useCallback(() => {
    // let the dhak fade away with the screen
    ramp(0, 1100, () => audio.current?.pause());
    onDone();
  }, [ramp, onDone]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), reduce ? 200 : 3600);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', esc);
    };
  }, [reduce, finish]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Opening"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 1.2 } }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_58%,rgba(201,120,40,.32),transparent_55%)]" />

      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={playing}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-paper/30 bg-ink/60 px-4 font-ui text-sm text-paper backdrop-blur hover:border-gold-2 hover:text-gold-2"
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          {playing ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
        </svg>
        {playing ? 'Mute dhak' : 'Play dhak sound'}
      </button>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(140vw,900px)] w-[min(140vw,900px)] -translate-x-1/2 -translate-y-1/2 text-gold/25"
        initial={{ opacity: 0, rotate: -12 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: reduce ? 0 : 5, ease: 'easeOut' }}
      >
        <MandalaSvg petals={12} rings={4} strokeWidth={0.35} />
      </motion.div>

      {/* diya */}
      <motion.svg aria-hidden viewBox="0 0 80 90" className="relative mb-10 h-24 w-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.4, duration: reduce ? 0 : 1.6 }}>
        <defs>
          <radialGradient id="fl" cx="50%" cy="70%" r="60%">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset=".5" stopColor="#f0a53a" />
            <stop offset="1" stopColor="#b3261e" stopOpacity=".0" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="38" r="34" fill="url(#fl)" opacity=".35" />
        <path className="flicker" d="M40 8c8 12 12 20 8 30-2 5-6 7-8 7s-6-2-8-7c-4-10 0-18 8-30Z" fill="url(#fl)" />
        <path d="M10 56c0-6 14-10 30-10s30 4 30 10c0 14-12 22-30 22S10 70 10 56Z" fill="#8a4a1e" stroke="#c9a24b" strokeWidth="1.5" />
        <ellipse cx="40" cy="52" rx="24" ry="5" fill="#2a1408" />
      </motion.svg>

      <h1 lang="bn" aria-label="মা আসছেন" className="relative font-bn text-[clamp(3rem,13vw,7.5rem)] leading-tight text-cream">
        {chars.map((c, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: reduce ? 0 : 1 + i * 0.28, duration: reduce ? 0 : 1.1 }}
          >
            {c}
          </motion.span>
        ))}
      </h1>
      <motion.p className="relative mt-2 font-display text-xl italic text-gold-2 md:text-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 3, duration: reduce ? 0 : 1.2 }}>
        Maa is coming…
      </motion.p>

      <p role="status" aria-live="polite" className="relative mt-4 h-5 font-ui text-sm text-paper/60">
        {blocked && wantSound ? 'Tap anywhere to hear the dhak' : ''}
      </p>
      <div className="relative mt-3 h-12">
        {ready ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Btn variant="gold" onClick={finish} autoFocus>
              <span lang="bn" className="font-bn">প্রবেশ করুন</span> · Enter
            </Btn>
          </motion.div>
        ) : (
          <button onClick={finish} className="font-ui text-sm text-paper/50 underline underline-offset-4 hover:text-paper">
            Skip
          </button>
        )}
      </div>
    </motion.div>
  );
}
