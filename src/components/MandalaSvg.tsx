const petalPath = (r0: number, r1: number, w: number) => {
  const d = r1 - r0;
  return `M0 ${-r0} C${w} ${-r0 - d * 0.25} ${w * 0.7} ${-r1 + d * 0.2} 0 ${-r1} C${-w * 0.7} ${-r1 + d * 0.2} ${-w} ${-r0 - d * 0.25} 0 ${-r0}Z`;
};

/** Decorative alpana-style mandala. Colour follows `currentColor`. */
export function MandalaSvg({ petals = 12, rings = 3, className = '', strokeWidth = 0.8 }: { petals?: number; rings?: number; className?: string; strokeWidth?: number }) {
  const inner = 28;
  const outer = 92;
  const step = (outer - inner) / rings;
  return (
    <svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle r="3.4" fill="currentColor" />
      <circle r="7.5" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={petalPath(9.5, 25, 6.5)} transform={`rotate(${i * 45})`} />
      ))}
      {Array.from({ length: rings }, (_, r) => {
        const r0 = inner + r * step;
        const n = petals + r * 2;
        const w = ((Math.PI * r0) / n) * 0.78;
        const off = (r % 2) * (180 / n);
        return (
          <g key={r}>
            <circle r={r0} />
            {Array.from({ length: n }, (_, i) => (
              <path key={i} d={petalPath(r0, r0 + step - 1, w)} transform={`rotate(${off + (i * 360) / n})`} />
            ))}
          </g>
        );
      })}
      <circle r={outer} />
      <circle r={outer + 3.4} />
      {Array.from({ length: petals * 4 }, (_, i) => (
        <circle key={i} r="0.9" cx="0" cy={-(outer + 6.5)} fill="currentColor" stroke="none" transform={`rotate(${(i * 360) / (petals * 4)})`} />
      ))}
    </svg>
  );
}
