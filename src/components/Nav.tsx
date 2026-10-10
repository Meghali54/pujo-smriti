import { motion, useScroll, useSpring } from 'motion/react';
import { useState } from 'react';

const LINKS = [
  ['timeline', 'Timeline'],
  ['amar', 'Amar Pujo'],
  ['capsule', 'Capsule'],
  ['letter', 'Letter to Maa'],
  ['quiz', 'Quiz'],
  ['gallery', 'Scrapbook'],
  ['alpana', 'Alpana'],
  ['cards', 'Cards'],
  ['dashami', 'Dashami'],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/15 bg-ink/80 backdrop-blur-md">
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <a href="#top" className="flex items-baseline gap-3 rounded-sm">
          <span lang="bn" className="font-bn text-xl text-gold-2">পুজো স্মৃতি</span>
          <span className="hidden font-display text-lg tracking-[0.22em] text-cream sm:inline">PUJO SMRITI</span>
        </a>
        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="font-ui text-[0.92rem] text-paper/80 transition-colors hover:text-gold-2">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-paper/30 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.6" fill="none" aria-hidden>
            {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </nav>
      {open && (
        <ul id="mobile-menu" className="grid grid-cols-2 gap-1 border-t border-gold/15 bg-ink px-5 pb-4 pt-2 lg:hidden">
          {LINKS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setOpen(false)} className="block rounded-md px-2 py-3 font-ui text-paper/90 hover:bg-ink-3">
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <motion.div aria-hidden style={{ scaleX }} className="h-[2px] origin-left bg-gradient-to-r from-sindoor via-gold to-gold-2" />
    </header>
  );
}
