import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { ARCHETYPES, QUESTIONS, score } from '../data/quiz';
import { renderQuiz } from '../lib/cards';
import { slug } from '../lib/canvas';
import { useStored } from '../lib/storage';
import { CardPreview } from './CardPreview';
import { Btn, Field, PrivacyNote, SectionHeading, inputDark } from './ui';

export interface QuizResult {
  id: string;
}
const NONE: QuizResult | null = null;
const PROFILE0 = { name: '' };

export function Quiz() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(QUESTIONS.length).fill(null));
  const [result, setResult] = useStored<QuizResult | null>('quizResult', NONE);
  const [profile, setProfile] = useStored<{ name: string }>('profile', PROFILE0);
  const [taking, setTaking] = useState(!result);

  const q = QUESTIONS[i];
  const picked = answers[i];

  function finish() {
    const arch = score(answers as string[]);
    setResult({ id: arch.id });
    setTaking(false);
  }
  function retake() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setI(0);
    setTaking(true);
  }

  const arch = result ? ARCHETYPES[result.id] : null;

  return (
    <section aria-labelledby="quiz-h" className="relative bg-ink-2 py-24 md:py-32">
      <SectionHeading id="quiz-h" bn="তুমি কোন ধরনের পুজো-মানুষ?" title="Your Pujo personality">
        Five questions, no wrong answers. You get a card you can keep or send.
      </SectionHeading>

      <div className="mx-auto max-w-5xl px-5">
        {taking || !arch ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center gap-2" aria-hidden>
              {QUESTIONS.map((_, k) => (
                <span key={k} className={`h-1.5 flex-1 rounded-full transition-colors ${k < i ? 'bg-gold-2' : k === i ? 'bg-sindoor' : 'bg-paper/20'}`} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.fieldset key={i} initial={{ opacity: 0, x: reduce ? 0 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : -30 }} transition={{ duration: reduce ? 0 : 0.35 }} className="min-w-0 border-0 p-0">
                <legend className="mb-6">
                  <span lang="bn" className="block font-bn text-xl text-gold-2">{q.bn}</span>
                  <span className="mt-1 block font-display text-3xl leading-tight text-cream md:text-4xl">{q.q}</span>
                  <span className="mt-2 block font-ui text-sm text-paper/60">Question {i + 1} of {QUESTIONS.length}</span>
                </legend>
                <div className="grid gap-3">
                  {q.options.map((o) => {
                    const on = picked === o.type;
                    return (
                      <label key={o.text} className={`flex min-h-14 cursor-pointer items-start gap-4 rounded-md border px-5 py-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-2 ${on ? 'border-gold-2 bg-sindoor/25' : 'border-paper/25 hover:border-gold/70'}`}>
                        <input type="radio" name={`q${i}`} className="sr-only" checked={on} onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? o.type : x)))} />
                        <span aria-hidden className={`mt-1.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? 'border-gold-2' : 'border-paper/50'}`}>
                          {on && <span className="h-2 w-2 rounded-full bg-gold-2" />}
                        </span>
                        <span className="font-display text-[1.3rem] leading-snug text-paper">{o.text}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.fieldset>
            </AnimatePresence>
            <div className="mt-8 flex justify-between">
              <Btn variant="ghost" disabled={i === 0} onClick={() => setI((n) => n - 1)}>Back</Btn>
              {i < QUESTIONS.length - 1 ? (
                <Btn variant="red" disabled={!picked} onClick={() => setI((n) => n + 1)}>Next</Btn>
              ) : (
                <Btn variant="gold" disabled={!picked} onClick={finish}>Show my card</Btn>
              )}
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,460px)]">
            <div>
              <p lang="bn" className="font-bn text-3xl text-gold-2">{arch.bn}</p>
              <h3 className="mt-1 font-display text-5xl font-medium text-cream md:text-6xl">{arch.en}</h3>
              <p className="mt-5 max-w-xl font-display text-2xl leading-relaxed text-paper/90">{arch.line}</p>
              <p className="mt-4 font-display text-xl italic text-gold-2">Signature plate: {arch.plate}</p>
              <div className="mt-8 max-w-sm">
                <Field label="Add your name to the card (optional)" htmlFor="quiz-name">
                  <input id="quiz-name" maxLength={24} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} className={inputDark} />
                </Field>
              </div>
              <div className="mt-6 flex gap-3">
                <Btn variant="ghost" onClick={retake}>Take it again</Btn>
                <Btn variant="ghost" onClick={() => document.getElementById('cards')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })}>Make a postcard with this</Btn>
              </div>
              <div className="mt-6"><PrivacyNote>Your answers are not sent anywhere. The result is remembered on this device only, so other cards can mention it.</PrivacyNote></div>
            </div>
            <CardPreview label={`Pujo personality card: ${arch.en}`} filename={`pujo-personality-${slug(arch.en)}.png`} shareText={`My Pujo personality: ${arch.en}`} deps={[arch.id, profile.name]} render={(c) => renderQuiz(c, { name: profile.name, arch })} />
          </div>
        )}
      </div>
    </section>
  );
}
