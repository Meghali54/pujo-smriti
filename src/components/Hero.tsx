import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useMemo, useRef } from 'react';
import { Btn } from './ui';

const TOP: [number, number][] = [[0, 640], [180, 550], [360, 420], [450, 372], [540, 376], [680, 450], [800, 470], [920, 450], [1060, 376], [1150, 372], [1240, 420], [1420, 550], [1600, 640]];
const DECK = 640;
const topAt = (x: number) => {
  for (let i = 0; i < TOP.length - 1; i++) {
    const [x1, y1] = TOP[i];
    const [x2, y2] = TOP[i + 1];
    if (x >= x1 && x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  }
  return DECK;
};
const rnd = (seed: number) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

function quad(p0: [number, number], p1: [number, number], p2: [number, number], t: number): [number, number] {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]];
}

function Scene() {
  const data = useMemo(() => {
    const r = rnd(42);
    const stars = Array.from({ length: 70 }, () => ({ x: r() * 1600, y: r() * 380, r: 0.5 + r() * 1.3, d: r() * 4 }));
    const roofs: { x: number; w: number; h: number; tank: boolean }[] = [];
    for (let x = -20; x < 1620; ) {
      const w = 46 + r() * 70;
      roofs.push({ x, w, h: 26 + r() * 62, tank: r() > 0.72 });
      x += w + 2;
    }
    const truss: string[] = [];
    for (let x = 0; x < 1600; x += 40) {
      truss.push(`M${x} ${DECK}V${topAt(x)}`, `M${x} ${DECK}L${x + 40} ${topAt(x + 40)}`, `M${x + 40} ${DECK}L${x} ${topAt(x)}`);
    }
    const deckLights = Array.from({ length: 40 }, (_, i) => 20 + i * 40);
    const strings = [
      { p0: [-20, 46], p1: [400, 200], p2: [800, 58] },
      { p0: [800, 58], p1: [1200, 200], p2: [1620, 46] },
    ] as const;
    const bulbs = strings.flatMap((s, si) =>
      Array.from({ length: 15 }, (_, i) => {
        const [x, y] = quad(s.p0 as [number, number], s.p1 as [number, number], s.p2 as [number, number], (i + 0.5) / 15);
        return { x, y, c: ['#ffd98a', '#ff9d5c', '#faf3e3', '#ff6a4d'][(i + si) % 4], d: r() * 3 };
      }),
    );
    const ripples = Array.from({ length: 26 }, () => ({ x: 560 + r() * 480, y: 664 + r() * 200, w: 20 + r() * 90, d: r() * 4 }));
    const diyas = Array.from({ length: 9 }, () => ({ x: 120 + r() * 1360, y: 720 + r() * 150, d: r() * 3 }));
    return { stars, roofs, truss, deckLights, bulbs, ripples, diyas, strings };
  }, []);

  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05060f" />
          <stop offset=".45" stopColor="#141335" />
          <stop offset=".72" stopColor="#4a1d33" />
          <stop offset="1" stopColor="#a5471f" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1418" />
          <stop offset="1" stopColor="#07080f" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="46%" r="42%">
          <stop offset="0" stopColor="#ff9a3c" stopOpacity=".6" />
          <stop offset=".55" stopColor="#c8481f" stopOpacity=".18" />
          <stop offset="1" stopColor="#c8481f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a0f16" />
          <stop offset=".6" stopColor="#7a1a17" />
          <stop offset="1" stopColor="#20090c" />
        </linearGradient>
        <linearGradient id="bamboo" x1="0" x2="1">
          <stop offset="0" stopColor="#2a1c0f" />
          <stop offset=".5" stopColor="#7a5a2c" />
          <stop offset="1" stopColor="#2a1c0f" />
        </linearGradient>
        <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="blur2">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <path id="eye" d="M-62 4C-30-26 34-30 66-6 34 14-26 24-62 4Z" />
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />
      {data.stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6dc" className="twinkle" style={{ animationDelay: `${s.d}s` }} opacity=".8" />
      ))}
      <rect width="1600" height="900" fill="url(#glow)" />

      {/* north Kolkata rooftops */}
      <g fill="#0b0a18" opacity=".95">
        {data.roofs.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={DECK - b.h - 20} width={b.w} height={b.h + 20} />
            <rect x={b.x - 2} y={DECK - b.h - 24} width={b.w + 4} height="5" />
            {b.tank && <rect x={b.x + b.w * 0.3} y={DECK - b.h - 44} width={b.w * 0.3} height="20" rx="3" />}
          </g>
        ))}
      </g>
      <g fill="#ffcf7a" opacity=".55">
        {data.roofs.map((b, i) => (i % 2 ? <rect key={i} x={b.x + b.w * 0.25} y={DECK - b.h - 6} width="6" height="9" className="twinkle" style={{ animationDelay: `${(i % 5) * 0.7}s` }} /> : null))}
      </g>

      {/* Howrah Bridge */}
      <g stroke="#090913" strokeWidth="3" fill="none" opacity=".97">
        <path d={data.truss.join('')} strokeWidth="2.2" />
        <path d={`M${TOP.map((p) => p.join(' ')).join('L')}`} strokeWidth="6" />
        <path d={`M0 ${DECK}H1600`} strokeWidth="9" />
      </g>
      <g fill="#ffd47a">
        {data.deckLights.map((x) => (
          <circle key={x} cx={x} cy={DECK - 6} r="2.6" opacity=".9" />
        ))}
      </g>

      {/* river */}
      <rect y={DECK + 4} width="1600" height="260" fill="url(#river)" />
      <g fill="#ffb457">
        {data.ripples.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height="2.4" rx="1.2" className="shimmer" style={{ animationDelay: `${r.d}s` }} />
        ))}
      </g>

      {/* Chalchitra arch */}
      <g>
        <ellipse cx="800" cy="640" rx="260" ry="18" fill="#000" opacity=".5" filter="url(#blur6)" />
        <circle cx="800" cy="350" r="215" fill="none" stroke="#e0c076" strokeOpacity=".25" strokeWidth="2" />
        <path d="M596 648V340Q596 190 800 84Q1004 190 1004 340V648Z" fill="#1a0a0d" stroke="#c9a24b" strokeWidth="5" />
        <path d="M596 648V340Q596 190 800 84Q1004 190 1004 340V648Z" fill="none" stroke="#e0c076" strokeWidth="5" strokeLinecap="round" strokeDasharray="0 16" transform="translate(0 0)" />
        <path d="M624 640V342Q624 208 800 116Q976 208 976 342V640Z" fill="url(#arch)" />
        <path d="M646 640V346Q646 226 800 144Q954 226 954 346V640Z" fill="none" stroke="#c9a24b" strokeOpacity=".55" strokeWidth="2" />
        {/* the eyes (tana chokh) */}
        <g className="twinkle" style={{ animationDuration: '6s' }}>
          <g transform="translate(722 372)">
            <use href="#eye" fill="#f6ead0" />
            <use href="#eye" fill="none" stroke="#120708" strokeWidth="5" strokeLinejoin="round" />
            <circle cx="6" cy="-4" r="13" fill="#1a0e0a" />
            <circle cx="10" cy="-8" r="3.4" fill="#fff" />
            <path d="M-62 4Q-84 8 -98 22" stroke="#120708" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
          <g transform="translate(878 372) scale(-1 1)">
            <use href="#eye" fill="#f6ead0" />
            <use href="#eye" fill="none" stroke="#120708" strokeWidth="5" strokeLinejoin="round" />
            <circle cx="6" cy="-4" r="13" fill="#1a0e0a" />
            <circle cx="10" cy="-8" r="3.4" fill="#fff" />
            <path d="M-62 4Q-84 8 -98 22" stroke="#120708" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <path d="M712 334Q722 318 800 316Q878 318 888 334" stroke="#120708" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
        <circle cx="800" cy="298" r="12" fill="#b3261e" />
        <circle cx="800" cy="298" r="18" fill="none" stroke="#e0c076" strokeWidth="1.6" />
        <g fill="#ffd47a" className="flicker">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${652 + i * 37.5} 628q5-10 0-18q-5 8 0 18Z`} />
          ))}
        </g>
        <rect x="590" y="646" width="420" height="14" fill="#2a1408" stroke="#c9a24b" strokeOpacity=".5" />
      </g>

      {/* river diyas */}
      {data.diyas.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y})`} className="floaty" style={{ animationDelay: `${d.d}s` }}>
          <ellipse cx="0" cy="0" rx="34" ry="10" fill="#ff9a3c" opacity=".25" filter="url(#blur6)" />
          <path d="M-8 0Q0 6 8 0Q6 6 0 7Q-6 6 -8 0Z" fill="#7a3a17" />
          <path d="M0-12Q4-5 0-1Q-4-5 0-12Z" fill="#ffd98a" className="flicker" />
        </g>
      ))}

      {/* bamboo pandal frame */}
      {[46, 1554].map((x) => (
        <g key={x}>
          <rect x={x - 11} y="0" width="22" height="900" fill="url(#bamboo)" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={x - 13} y={70 + i * 100} width="26" height="7" rx="2" fill="#2a1c0f" />
          ))}
        </g>
      ))}
      <path d="M46 0L250 120M1554 0L1350 120" stroke="url(#bamboo)" strokeWidth="14" strokeLinecap="round" />

      {/* string lights */}
      {data.strings.map((s, i) => (
        <path key={i} d={`M${s.p0[0]} ${s.p0[1]}Q${s.p1[0]} ${s.p1[1]} ${s.p2[0]} ${s.p2[1]}`} stroke="#120a08" strokeWidth="2.4" fill="none" />
      ))}
      {data.bulbs.map((b, i) => (
        <g key={i} className="twinkle" style={{ animationDelay: `${b.d}s` }}>
          <circle cx={b.x} cy={b.y + 8} r="16" fill={b.c} opacity=".5" filter="url(#blur6)" />
          <circle cx={b.x} cy={b.y + 8} r="5" fill={b.c} />
        </g>
      ))}

      {/* kaash phool tufts */}
      {[
        [90, 900],
        [150, 900],
        [1450, 900],
        [1510, 900],
      ].map(([x, y], i) => (
        <g key={i} className="sway" style={{ animationDelay: `${i * 0.8}s` }}>
          {Array.from({ length: 6 }, (_, k) => (
            <g key={k}>
              <path d={`M${x + k * 8} ${y}Q${x + (k - 3) * 22} ${y - 120} ${x + (k - 3) * 30} ${y - 190 - (k % 3) * 22}`} stroke="#d9d0b8" strokeWidth="2" fill="none" opacity=".75" />
              <ellipse cx={x + (k - 3) * 30} cy={y - 200 - (k % 3) * 22} rx="9" ry="40" transform={`rotate(${(k - 3) * 8} ${x + (k - 3) * 30} ${y - 200 - (k % 3) * 22})`} fill="#f4efe0" opacity=".82" filter="url(#blur2)" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink">
      <motion.div style={{ y, scale }} className="absolute inset-0 origin-top">
        <Scene />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,6,14,.95)_0%,rgba(5,6,14,.55)_32%,transparent_60%),radial-gradient(ellipse_at_center,transparent_45%,rgba(5,6,14,.6)_100%)]" />

      <motion.div style={{ y: textY }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 pt-24 md:pb-20">
        <p lang="bn" className="font-bn text-xl text-gold-2 md:text-2xl">
          কলকাতা · আশ্বিন
        </p>
        <h1 id="hero-title" className="mt-1 font-display text-[clamp(3.2rem,12vw,9rem)] font-medium leading-[0.9] tracking-[0.04em] text-cream">
          PUJO SMRITI
        </h1>
        <p className="mt-5 max-w-xl font-display text-[clamp(1.5rem,3.6vw,2.4rem)] italic leading-snug text-paper">Some festivals end. Some stay with us forever.</p>
        <p className="mt-3 max-w-lg font-ui text-[0.95rem] text-paper/75">A private, handmade scrapbook for your Durga Puja memories. Nothing you write or add leaves your device.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Btn variant="red" onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>
            Walk from Mahalaya to Dashami
          </Btn>
          <Btn variant="ghost" onClick={() => document.getElementById('capsule')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>
            Keep a memory
          </Btn>
        </div>
      </motion.div>
    </section>
  );
}
