import { useEffect, useRef, useState } from 'react';
import { DAYS } from '../data/days';
import { downscaleImage, uid } from '../lib/image';
import { renderPolaroid } from '../lib/cards';
import { slug } from '../lib/canvas';
import { deletePhoto, loadPhoto, savePhoto, useStored } from '../lib/storage';
import { CardPreview } from './CardPreview';
import { Btn, Field, PrivacyNote, SectionHeading, inputLight } from './ui';

export interface CapsuleItem {
  id: string;
  year: string;
  day: string;
  title: string;
  text: string;
  hasPhoto: boolean;
  savedAt: number;
}
interface Draft {
  year: string;
  day: string;
  title: string;
  text: string;
  name: string;
}
const NOW = new Date().getFullYear();
const DRAFT0: Draft = { year: String(NOW), day: 'Ashtami', title: '', text: '', name: '' };
const LIST0: CapsuleItem[] = [];

export function Capsule() {
  const [draft, setDraft] = useStored<Draft>('capsuleDraft', DRAFT0);
  const [items, setItems] = useStored<CapsuleItem[]>('capsules', LIST0);
  const [photo, setPhoto] = useState<{ blob: Blob; bmp: ImageBitmap } | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => photo?.bmp.close(), [photo]);

  async function onFile(f?: File) {
    if (!f) return;
    try {
      const blob = await downscaleImage(f);
      const bmp = await createImageBitmap(blob);
      setPhoto({ blob, bmp });
      setMsg('Photo added. Location data was stripped, and the photo stays on this device.');
    } catch (e) {
      setMsg((e as Error).message || 'Could not read that photo.');
    }
  }

  async function keep() {
    const id = uid();
    if (photo) await savePhoto(id, photo.blob);
    setItems((l) => [{ id, year: draft.year, day: draft.day, title: draft.title, text: draft.text, hasPhoto: !!photo, savedAt: Date.now() }, ...l]);
    setMsg('Added to your scrapbook on this device. Find it in the gallery below.');
  }

  function clearDraft() {
    setDraft(DRAFT0);
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
    setMsg('Draft cleared.');
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <section aria-labelledby="capsule-h" className="paper relative py-24 md:py-32">
      <SectionHeading id="capsule-h" tone="light" bn="স্মৃতির কৌটো" title="Your memory capsule">
        One year, one moment, one photo if you have it. See the card as you write, then keep it or download it.
      </SectionHeading>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field light label="Year" htmlFor="cap-year">
              <input id="cap-year" inputMode="numeric" maxLength={4} className={inputLight} value={draft.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, '').slice(0, 4))} />
            </Field>
            <Field light label="Which day of Pujo?" htmlFor="cap-day">
              <select id="cap-day" className={inputLight} value={draft.day} onChange={(e) => set('day', e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d.id} value={d.en.split(' ')[0]}>
                    {d.en.split(' ')[0]} ({d.bn})
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field light label="Title" htmlFor="cap-title" hint="Short works best. It becomes the handwritten caption.">
            <input id="cap-title" maxLength={42} className={inputLight} placeholder="Dida’s red-bordered sari" value={draft.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field light label="The memory" htmlFor="cap-text" hint={`${draft.text.length}/280`}>
            <textarea id="cap-text" rows={5} maxLength={280} className={`${inputLight} font-display text-lg`} placeholder="What could you smell, hear or taste? Who was there? Bengali and English both work." value={draft.text} onChange={(e) => set('text', e.target.value)} />
          </Field>
          <Field light label="Your name (optional)" htmlFor="cap-name">
            <input id="cap-name" maxLength={30} className={inputLight} value={draft.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field light label="A photo (optional)" htmlFor="cap-photo" hint="Only used to draw the card in your browser. Nothing is uploaded, and it is not kept unless you press “Keep in my scrapbook”.">
            <input id="cap-photo" ref={fileRef} type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full font-ui text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sindoor file:px-5 file:py-2.5 file:font-medium file:text-cream hover:file:bg-sindoor-2" />
          </Field>
          <div className="flex flex-wrap gap-3 pt-2">
            <Btn onClick={keep}>Keep in my scrapbook</Btn>
            <Btn variant="paper" onClick={clearDraft}>Clear draft</Btn>
          </div>
          <p role="status" aria-live="polite" className="min-h-6 text-sm text-brown/80">{msg}</p>
          <PrivacyNote light>Your text draft is autosaved in this browser only. Photos are re-encoded in your browser, which removes location metadata.</PrivacyNote>
          {items.length > 0 && <p className="text-sm text-brown/70">{items.length} kept on this device. <a href="#gallery" className="underline decoration-sindoor underline-offset-4">Open scrapbook</a></p>}
        </div>

        <CardPreview
          light
          label={`Preview of your memory card: ${draft.title || 'untitled'}, ${draft.day} ${draft.year}`}
          filename={`pujo-smriti-${slug(draft.title)}-${draft.year}.png`}
          shareText="A Puja memory, made with Pujo Smriti."
          deps={[draft, photo]}
          render={(c) => renderPolaroid(c, { year: draft.year || String(NOW), day: draft.day, title: draft.title, text: draft.text, name: draft.name, photo: photo?.bmp ?? null })}
        />
      </div>
    </section>
  );
}

/** Used by the gallery */
export async function removeCapsule(item: CapsuleItem) {
  await deletePhoto(item.id);
}
export { loadPhoto };
