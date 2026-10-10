import { AnimatePresence, MotionConfig } from 'motion/react';
import { Suspense, lazy, useCallback, useState } from 'react';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Opening } from './components/Opening';
import { Timeline } from './components/Timeline';

const AmarPujo = lazy(() => import('./components/AmarPujo').then((m) => ({ default: m.AmarPujo })));
const Capsule = lazy(() => import('./components/Capsule').then((m) => ({ default: m.Capsule })));
const Letter = lazy(() => import('./components/Letter').then((m) => ({ default: m.Letter })));
const Quiz = lazy(() => import('./components/Quiz').then((m) => ({ default: m.Quiz })));
const Gallery = lazy(() => import('./components/Gallery').then((m) => ({ default: m.Gallery })));
const Alpana = lazy(() => import('./components/Alpana').then((m) => ({ default: m.Alpana })));
const ShareStudio = lazy(() => import('./components/ShareStudio').then((m) => ({ default: m.ShareStudio })));
const Finale = lazy(() => import('./components/Finale').then((m) => ({ default: m.Finale })));

const seen = () => {
  try {
    return sessionStorage.getItem('pujo-smriti:opened') === '1';
  } catch {
    return false;
  }
};

function Slot({ id, children, h = 600 }: { id: string; children: React.ReactNode; h?: number }) {
  return (
    <div id={id} className="scroll-mt-14">
      <Suspense fallback={<div style={{ minHeight: h }} className="grid place-items-center bg-ink font-display text-xl italic text-paper/60">Lighting the lamps…</div>}>{children}</Suspense>
    </div>
  );
}

export default function App() {
  const [opening, setOpening] = useState(!seen());
  const done = useCallback(() => {
    try {
      sessionStorage.setItem('pujo-smriti:opened', '1');
    } catch {
      /* ignore */
    }
    setOpening(false);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only-focusable fixed left-3 top-3 z-[200] rounded-md bg-gold px-4 py-2 text-ink">Skip to content</a>
      <div className="grain" aria-hidden />
      <AnimatePresence>{opening && <Opening onDone={done} />}</AnimatePresence>
      <Nav />
      <main id="main">
        <Hero />
        <div id="timeline" className="scroll-mt-14"><Timeline /></div>
        <Slot id="amar" h={800}><AmarPujo /></Slot>
        <Slot id="capsule"><Capsule /></Slot>
        <Slot id="letter"><Letter /></Slot>
        <Slot id="quiz"><Quiz /></Slot>
        <Slot id="gallery"><Gallery /></Slot>
        <Slot id="alpana"><Alpana /></Slot>
        <Slot id="cards"><ShareStudio /></Slot>
        <Slot id="dashami" h={800}><Finale /></Slot>
      </main>
      <Footer onReplay={() => { try { sessionStorage.removeItem('pujo-smriti:opened'); } catch { /* ignore */ } setOpening(true); }} />
    </MotionConfig>
  );
}
