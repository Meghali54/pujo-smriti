import { useState } from 'react';
import { ARCHETYPES } from '../data/quiz';
import { renderShare, type ShareOpts } from '../lib/cards';
import { slug } from '../lib/canvas';
import { useStored } from '../lib/storage';
import { CardPreview } from './CardPreview';
import type { QuizResult } from './Quiz';
import { Field, PrivacyNote, SectionHeading, inputLight } from './ui';

const PROFILE0 = { name: '' };
const NONE: QuizResult | null = null;

export function ShareStudio() {
  const [profile, setProfile] = useStored<{ name: string }>('profile', PROFILE0);
  const [quiz] = useStored<QuizResult | null>('quizResult', NONE);
  const [template, setTemplate] = useState<ShareOpts['template']>('postcard');
  const [from, setFrom] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [line, setLine] = useState('');
  const [usePersona, setUsePersona] = useState(true);
  const persona = quiz && usePersona ? ARCHETYPES[quiz.id].en : '';

  return (
    <section aria-labelledby="cards-h" className="paper relative py-24 md:py-32">
      <SectionHeading id="cards-h" tone="light" bn="ছোট্ট স্মৃতিপত্র" title="Memory cards to send">
        Turn one line into a postcard or a keepsake pandal pass. It is a picture file you can send to family, so you choose who sees it.
      </SectionHeading>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_minmax(0,460px)]">
        <div className="space-y-5">
          <div role="radiogroup" aria-label="Card design" className="inline-flex overflow-hidden rounded-full border border-brown/40">
            {([['postcard', 'Pujor Chithi postcard'], ['pass', 'Pandal Pass keepsake']] as const).map(([v, l]) => (
              <button key={v} role="radio" aria-checked={template === v} onClick={() => setTemplate(v)} className={`min-h-11 px-5 text-sm ${template === v ? 'bg-sindoor text-cream' : 'text-brown hover:bg-brown/10'}`}>{l}</button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field light label="Your name" htmlFor="sh-name"><input id="sh-name" maxLength={26} className={inputLight} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} /></Field>
            <Field light label="Para or city" htmlFor="sh-from" hint="Shown on the card. Skip it if you prefer."><input id="sh-from" maxLength={26} className={inputLight} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field light label="Year" htmlFor="sh-year"><input id="sh-year" inputMode="numeric" maxLength={4} className={inputLight} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} /></Field>
          </div>
          <Field light label="Your line" htmlFor="sh-line" hint={`${line.length}/200`}>
            <textarea id="sh-line" rows={4} maxLength={200} className={`${inputLight} font-display text-lg`} placeholder="The one sentence you want to remember from this Pujo." value={line} onChange={(e) => setLine(e.target.value)} />
          </Field>
          {quiz ? (
            <label className="flex min-h-11 items-center gap-2.5 text-brown"><input type="checkbox" className="h-4 w-4" checked={usePersona} onChange={(e) => setUsePersona(e.target.checked)} /> Include my Pujo personality ({ARCHETYPES[quiz.id].en})</label>
          ) : (
            <p className="text-sm text-brown/75">Take the <a href="#quiz" className="underline decoration-sindoor underline-offset-4">Pujo personality quiz</a> to add your result to the card.</p>
          )}
          <PrivacyNote light>Your details stay in this browser. The card is created here, and you decide whether to download or share it.</PrivacyNote>
        </div>
        <CardPreview light label={`Preview of your ${template === 'postcard' ? 'postcard' : 'pandal pass'}`} filename={`pujo-${template}-${slug(profile.name || 'memory')}.png`} shareText="A Pujo memory card, made with Pujo Smriti." deps={[template, profile.name, from, year, line, persona]} render={(c) => renderShare(c, { template, name: profile.name, from, year, line, personality: persona })} />
      </div>
    </section>
  );
}
