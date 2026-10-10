export type SampleKind = 'shiuli' | 'dhunuchi' | 'bhog' | 'lights' | 'kumartuli' | 'laalpaar';

/** Original vector sketches used as clearly labelled sample content. They are illustrations, not photographs. */
export function SampleArt({ kind, className = '' }: { kind: SampleKind; className?: string }) {
  return (
    <svg viewBox="0 0 400 320" className={className} role="img" aria-label={`Sample illustration: ${kind}`} preserveAspectRatio="xMidYMid slice">
      {kind === 'shiuli' && (
        <g>
          <rect width="400" height="320" fill="#1d2a2a" />
          <rect y="200" width="400" height="120" fill="#c9bda3" />
          {[0, 1, 2, 3].map((i) => <rect key={i} y={200 + i * 30} width="400" height="4" fill="#a99b7e" />)}
          {Array.from({ length: 22 }, (_, i) => {
            const x = 30 + ((i * 97) % 340);
            const y = 210 + ((i * 53) % 90);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
                {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-7" rx="4" ry="7" fill="#fbf6ea" transform={`rotate(${r})`} />)}
                <circle r="3.6" fill="#f08a2c" />
              </g>
            );
          })}
          <path d="M40 0v200M360 0v200" stroke="#0e1616" strokeWidth="26" />
          <circle cx="330" cy="70" r="46" fill="#e8d9a8" opacity=".14" />
        </g>
      )}
      {kind === 'dhunuchi' && (
        <g>
          <rect width="400" height="320" fill="#120f1e" />
          <radialGradient id="dg" cx="50%" cy="70%" r="50%"><stop offset="0" stopColor="#ff9a3c" stopOpacity=".6" /><stop offset="1" stopColor="#ff9a3c" stopOpacity="0" /></radialGradient>
          <circle cx="200" cy="220" r="170" fill="url(#dg)" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${170 + i * 30} 200C${140 + i * 40} 150 ${230 - i * 20} 110 ${190 + i * 20} 40`} stroke="#d9cdb8" strokeOpacity=".4" strokeWidth={14 - i * 3} fill="none" strokeLinecap="round" />)}
          <path d="M130 200h140l-16 60c-2 8-10 12-18 12h-72c-8 0-16-4-18-12Z" fill="#8a3a1a" stroke="#c9a24b" />
          <path d="M120 200h160" stroke="#c9a24b" strokeWidth="5" />
          <circle cx="200" cy="192" r="9" fill="#ffb457" />
        </g>
      )}
      {kind === 'bhog' && (
        <g>
          <rect width="400" height="320" fill="#efe1c0" />
          <path d="M40 90Q200 30 360 90Q380 200 340 270Q200 300 60 270Q20 200 40 90Z" fill="#2f6b3a" />
          <path d="M200 50V285" stroke="#1f4c29" strokeWidth="3" />
          <ellipse cx="150" cy="150" rx="52" ry="34" fill="#fbf4df" />
          <circle cx="255" cy="130" r="26" fill="#e6b43c" />
          <circle cx="250" cy="200" r="22" fill="#7a3a17" />
          <circle cx="170" cy="225" r="24" fill="#b2842a" />
          <circle cx="310" cy="190" r="18" fill="#e8dcc0" />
        </g>
      )}
      {kind === 'lights' && (
        <g>
          <rect width="400" height="320" fill="#0c0b1c" />
          <path d="M-10 60Q100 130 200 70T410 60" stroke="#241a14" strokeWidth="2" fill="none" />
          <path d="M-10 130Q100 200 200 140T410 130" stroke="#241a14" strokeWidth="2" fill="none" />
          {Array.from({ length: 24 }, (_, i) => {
            const row = i % 2;
            const x = 20 + (i * 16.5);
            const y = (row ? 145 : 78) + Math.sin(i * 0.7) * 22;
            return <g key={i}><circle cx={x} cy={y} r="14" fill={['#ffd98a', '#ff9d5c', '#ff6a4d'][i % 3]} opacity=".35" /><circle cx={x} cy={y} r="4" fill={['#ffd98a', '#ff9d5c', '#ff6a4d'][i % 3]} /></g>;
          })}
          <rect y="260" width="400" height="60" fill="#06060f" />
        </g>
      )}
      {kind === 'kumartuli' && (
        <g>
          <rect width="400" height="320" fill="#b89a72" />
          <path d="M60 0V320M340 0V320M60 90H340M60 210H340" stroke="#6b4e2a" strokeWidth="7" />
          <path d="M60 90L340 210M340 90L60 210" stroke="#6b4e2a" strokeWidth="3" />
          <ellipse cx="200" cy="160" rx="62" ry="86" fill="#d8bf98" />
          <path d="M160 145Q180 132 196 146M204 146Q220 132 240 145" stroke="#5a4028" strokeWidth="3" fill="none" />
          <path d="M186 205Q200 214 214 205" stroke="#5a4028" strokeWidth="3" fill="none" />
          <text x="200" y="300" textAnchor="middle" fontSize="16" fill="#4a3620" fontStyle="italic">clay awaiting its eyes</text>
        </g>
      )}
      {kind === 'laalpaar' && (
        <g>
          <rect width="400" height="320" fill="#f6efdf" />
          <rect y="0" width="400" height="46" fill="#b3261e" />
          <rect y="274" width="400" height="46" fill="#b3261e" />
          <rect y="56" width="400" height="6" fill="#c9a24b" />
          <rect y="258" width="400" height="6" fill="#c9a24b" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${20 + i * 44} 20q6-8 0-14q-6 6 0 14M${20 + i * 44} 302q6-8 0-14q-6 6 0 14`} fill="#f6efdf" />)}
          <circle cx="200" cy="160" r="46" fill="#b3261e" opacity=".92" />
          <circle cx="200" cy="160" r="60" fill="none" stroke="#b3261e" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
