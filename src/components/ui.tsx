import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const Bn = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span lang="bn" className={`font-bn ${className}`}>
    {children}
  </span>
);

export function SectionHeading({ bn, title, children, id, tone = 'dark' }: { bn: string; title: string; children?: ReactNode; id: string; tone?: 'dark' | 'light' }) {
  return (
    <header className="mx-auto mb-10 max-w-3xl px-5 text-center md:mb-14">
      <p lang="bn" className={`font-bn text-2xl md:text-3xl ${tone === 'dark' ? 'text-gold-2' : 'text-sindoor'}`}>
        {bn}
      </p>
      <h2 id={id} className={`mt-2 font-display text-4xl font-medium leading-[1.05] md:text-6xl ${tone === 'dark' ? 'text-cream' : 'text-brown'}`}>
        {title}
      </h2>
      {children && <p className={`mx-auto mt-5 max-w-xl font-display text-xl leading-relaxed md:text-[1.4rem] ${tone === 'dark' ? 'text-paper/80' : 'text-brown/75'}`}>{children}</p>}
    </header>
  );
}

type Variant = 'red' | 'gold' | 'ghost' | 'paper';
const variants: Record<Variant, string> = {
  red: 'bg-sindoor text-cream hover:bg-sindoor-2 border-sindoor',
  gold: 'bg-gold text-ink hover:bg-gold-2 border-gold',
  ghost: 'bg-transparent text-paper border-paper/40 hover:border-gold-2 hover:text-gold-2',
  paper: 'bg-transparent text-brown border-brown/40 hover:border-sindoor hover:text-sindoor',
};

export function Btn({ variant = 'red', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-6 py-2 font-ui text-[0.95rem] font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export function Field({ label, htmlFor, hint, children, light = false }: { label: string; htmlFor: string; hint?: string; children: ReactNode; light?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={`font-ui text-sm font-medium ${light ? 'text-brown' : 'text-paper'}`}>
        {label}
      </label>
      {children}
      {hint && <p className={`text-[0.82rem] leading-snug ${light ? 'text-brown/65' : 'text-paper/60'}`}>{hint}</p>}
    </div>
  );
}

export const inputDark =
  'w-full rounded-md border border-paper/25 bg-ink-2/80 px-3.5 py-2.5 font-ui text-base text-cream placeholder:text-paper/40 focus:border-gold-2';
export const inputLight =
  'w-full rounded-md border border-brown/30 bg-cream/70 px-3.5 py-2.5 font-ui text-base text-brown placeholder:text-brown/40 focus:border-sindoor';

export function PrivacyNote({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-start gap-2 text-[0.86rem] leading-snug ${light ? 'text-brown/70' : 'text-paper/65'}`}>
      <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" className="mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
