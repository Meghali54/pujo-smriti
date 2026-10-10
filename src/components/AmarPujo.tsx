import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { downscaleImage, uid } from '../lib/image';
import { deletePhoto, loadPhoto, savePhoto, useStored } from '../lib/storage';
import { QUOTE_BN, QUOTE_EN, canRecordVideo, closeStory, loadStory, recordStory, renderStoryPoster, type AmarYear } from '../lib/story';
import { slug } from '../lib/canvas';
import { CardPreview } from './CardPreview';
import { MandalaSvg } from './MandalaSvg';
import { Btn, Field, PrivacyNote, SectionHeading, inputDark } from './ui';

const NOW = new Date().getFullYear();
const LIST0: AmarYear[] = [];
const PROFILE0 = { name: '' };
const QUICK = [2010, 2015, 2020, NOW];
const CAPTIONS = ['একটা পুজো শেষ হয়, স্মৃতি থেকে যায়।', 'সেই বছরের পুজো', 'মায়ের কোলে আর একটা বছর', 'ঢাকের আওয়াজে ফেরা', 'ঠাকুর দেখার রাত'];

interface Form {
  year: string;
  memory: string;
  pandal: string;
  person: string;
  caption: string;
}
const FORM0: Form = { year: '', memory: '', pandal: '', person: '', caption: '' };

/** Object URLs for the saved photos, so <img> can show them. */
function usePhotoUrls(items: AmarYear[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = items.map((i) => `${i.id}:${i.photo ?? ''}`).join('|');
  useEffect(() => {
    let live = true;
    const made: string[] = [];
    (async () => {
      const out: Record<string, string> = {};
      for (const it of items) {
        if (!it.photo) continue;
        const b = await loadPhoto(it.photo);
        if (b) {
          const u = URL.createObjectURL(b);
          made.push(u);
          out[it.id] = u;
        }
      }
      if (live) setUrls(out);
      else made.forEach(URL.revokeObjectURL);
    })();
    return () => {
      live = false;
      setTimeout(() => made.forEach(URL.revokeObjectURL), 500);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}

export function AmarPujo() {
  const reduce = useReducedMotion();
  const [stored, setStored] = useStored<AmarYear[]>('amarPujo', LIST0);
  const [profile, setProfile] = useStored<{ name: string }>('profile', PROFILE0);
  const items = useMemo(() => [...stored].sort((a, b) => a.year - b.year), [stored]);
  const urls = usePhotoUrls(items);

  const [form, setForm] = useState<Form>(FORM0);
  const [editing, setEditing] = useState<string | null>(null);
  const [staged, setStaged] = useState<{ blob: Blob; url: string } | null>(null);
  const [dropPhoto, setDropPhoto] = useState(false);
  const [msg, setMsg] = useState('');
  const [play, setPlay] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const memoryRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const editingItem = editing ? items.find((i) => i.id === editing) : undefined;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => () => { if (staged) URL.revokeObjectURL(staged.url); }, [staged]);

  async function onFile(f?: File) {
    if (!f) return;
    try {
      const blob = await downscaleImage(f, 1800);
      setStaged({ blob, url: URL.createObjectURL(blob) });
      setDropPhoto(false);
      setMsg('Photo added. It stays on this device, and location data was removed.');
    } catch (e) {
      setMsg((e as Error).message || 'Could not read that photo.');
    }
  }

  function reset() {
    setForm(FORM0);
    setEditing(null);
    setStaged(null);
    setDropPhoto(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const y = parseInt(form.year, 10);
    if (!y || y < 1950 || y > NOW) return setMsg(`Please enter a year between 1950 and ${NOW}.`);
    const keepsOldPhoto = !!editingItem?.photo && !dropPhoto;
    if (!form.memory.trim() && !form.caption.trim() && !staged && !keepsOldPhoto) return setMsg('Add at least a photo, a memory or a caption for this year.');

    const sameYear = items.find((i) => i.year === y);
    const id = editing ?? sameYear?.id ?? uid();
    const prev = items.find((i) => i.id === id);
    let photo = prev?.photo;
    if (staged) {
      if (prev?.photo) await deletePhoto(prev.photo);
      photo = `amar-${uid()}`;
      await savePhoto(photo, staged.blob);
    } else if (dropPhoto && prev?.photo) {
      await deletePhoto(prev.photo);
      photo = undefined;
    }
    const entry: AmarYear = { id, year: y, memory: form.memory.trim(), pandal: form.pandal.trim(), person: form.person.trim(), caption: form.caption.trim(), photo };
    setStored((l) => (l.some((i) => i.id === id) ? l.map((i) => (i.id === id ? entry : i)) : [...l, entry]));
    setMsg(prev ? `${y} updated in your story.` : `${y} added to your story.`);
    reset();
  }

  function edit(it: AmarYear) {
    setEditing(it.id);
    setForm({ year: String(it.year), memory: it.memory, pandal: it.pandal, person: it.person, caption: it.caption });
    setStaged(null);
    setDropPhoto(false);
    setMsg(`Editing ${it.year}. Change anything, then update.`);
    formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  async function remove(it: AmarYear) {
    if (!window.confirm(`Remove ${it.year} from your story?`)) return;
    if (it.photo) await deletePhoto(it.photo);
    setStored((l) => l.filter((i) => i.id !== it.id));
    if (editing === it.id) reset();
    setMsg(`${it.year} removed.`);
  }

  async function clearStory() {
    if (!window.confirm('Delete your whole Amar Pujo story and its photos from this device?')) return;
    for (const it of items) if (it.photo) await deletePhoto(it.photo);
    setStored([]);
    reset();
    setMsg('Your story was deleted from this device.');
  }

  /* ---------------- video export ---------------- */
  const [rec, setRec] = useState<{ p: number } | null>(null);
  const [video, setVideo] = useState<{ blob: Blob; ext: string; url: string } | null>(null);
  const [vmsg, setVmsg] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => { if (video) URL.revokeObjectURL(video.url); }, [video]);
  useEffect(() => () => abort.current?.abort(), []);

  async function makeVideo() {
    setVideo(null);
    setVmsg('');
    const ac = (abort.current = new AbortController());
    setRec({ p: 0 });
    const story = await loadStory(items, profile.name);
    try {
      const r = await recordStory(story, { onProgress: (p) => setRec({ p }), signal: ac.signal });
      setVideo({ blob: r.blob, ext: r.ext, url: URL.createObjectURL(r.blob) });
      setVmsg('Your story video is ready.');
    } catch (e) {
      setVmsg((e as DOMException).name === 'AbortError' ? 'Cancelled.' : (e as Error).message || 'Could not create the video.');
    } finally {
      closeStory(story);
      setRec(null);
    }
  }
  const vname = `my-pujo-story-${slug(profile.name || 'amar-pujo')}.${video?.ext ?? 'webm'}`;
  function downloadVideo() {
    if (!video) return;
    const a = document.createElement('a');
    a.href = video.url;
    a.download = vname;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  async function shareVideo() {
    if (!video) return;
    const file = new File([video.blob], vname, { type: video.blob.type });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${QUOTE_EN} My Pujo Story, made with Pujo Smriti.` });
        return;
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return;
      }
    }
    downloadVideo();
    setVmsg('Sharing files is not supported here, so the video was downloaded instead.');
  }

  const posterKey = items.map((i) => `${i.id}${i.year}${i.caption}${i.pandal}${i.memory}${i.photo ?? ''}`).join('|');

  return (
    <section aria-labelledby="amar-h" className="relative overflow-hidden bg-[#150d1c] py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(179,38,30,.28),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(201,162,75,.12),transparent_55%)]" />
      <SectionHeading id="amar-h" bn="আমার পুজো" title="Amar Pujo: my Puja through the years">
        Pick the years you remember. Add a photo, a memory, a pandal and a person. We turn them into a cinematic story you can play and send.
      </SectionHeading>
      <p lang="bn" className="relative -mt-6 mb-12 text-center font-bn text-2xl text-gold-2 md:text-3xl">{QUOTE_BN}</p>

      <div className="relative mx-auto max-w-6xl px-5">
        {/* year track */}
        <div className="mb-14">
          <h3 className="sr-only">Your years</h3>
          {items.length === 0 ? (
            <div className="text-center">
              <p className="font-display text-3xl text-paper/55 md:text-5xl" aria-hidden>2010 <span className="text-gold/60">→</span> 2015 <span className="text-gold/60">→</span> 2020 <span className="text-gold/60">→</span> {NOW}</p>
              <p className="mt-3 font-display text-xl italic text-paper/75">Your story starts here. Tap a year to begin:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK.map((y) => (
                  <button key={y} onClick={() => { set('year', String(y)); memoryRef.current?.focus(); }} className="min-h-11 rounded-full border border-paper/30 px-5 font-display text-xl text-cream hover:border-gold-2 hover:text-gold-2">{y}</button>
                ))}
              </div>
            </div>
          ) : (
            <ol className="flex items-start gap-0 overflow-x-auto px-2 pb-4" aria-label="Years in your story">
              {items.map((it, k) => (
                <li key={it.id} className="flex shrink-0 items-start">
                  <button onClick={() => edit(it)} aria-label={`Edit ${it.year}`} className={`group w-28 rounded-md px-2 py-1 text-center sm:w-32 ${editing === it.id ? 'bg-sindoor/20' : ''}`}>
                    <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-gold/70 bg-ink-3 text-gold-2 transition-colors group-hover:border-gold-2 sm:h-24 sm:w-24">
                      {urls[it.id] ? <img src={urls[it.id]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <MandalaSvg petals={6 + (k % 4) * 2} rings={2} className="h-12 w-12" strokeWidth={3} />}
                    </span>
                    <span className="mt-2 block font-display text-2xl text-cream">{it.year}</span>
                    <span lang="bn" className="block truncate font-bn text-sm text-paper/70">{it.caption || it.pandal || '·'}</span>
                  </button>
                  {k < items.length - 1 && <span aria-hidden className="mt-10 flex w-10 items-center text-gold/70 sm:w-14"><span className="h-px flex-1 bg-gold/50" />→</span>}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-16">
          {/* editor */}
          <form ref={formRef} onSubmit={save} className="space-y-5" aria-label="Add a year to your story">
            <h3 className="font-display text-3xl text-cream">{editing ? `Editing ${form.year || 'a year'}` : 'Add a year'}</h3>
            <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
              <Field label="Year" htmlFor="am-year">
                <input id="am-year" inputMode="numeric" maxLength={4} required className={inputDark} placeholder={String(NOW)} value={form.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </Field>
              <Field label="A Puja photo (optional)" htmlFor="am-photo" hint="Used only in your browser to build the story. It is not uploaded, and location data is stripped.">
                <input id="am-photo" ref={fileRef} type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full font-ui text-sm text-paper file:mr-4 file:rounded-full file:border-0 file:bg-sindoor file:px-5 file:py-2.5 file:font-medium file:text-cream hover:file:bg-sindoor-2" />
              </Field>
            </div>
            {(staged || (editingItem?.photo && !dropPhoto && urls[editingItem.id])) && (
              <div className="flex items-center gap-4">
                <img src={staged?.url ?? urls[editingItem!.id]} alt="Selected photo preview" className="h-20 w-20 rounded-md object-cover ring-1 ring-gold/40" />
                <button type="button" className="min-h-11 text-sm text-paper/80 underline underline-offset-4 hover:text-cream" onClick={() => { if (staged) { setStaged(null); if (fileRef.current) fileRef.current.value = ''; } else setDropPhoto(true); }}>Remove photo</button>
              </div>
            )}
            <Field label="A short memory" htmlFor="am-mem" hint={`${form.memory.length}/200`}>
              <textarea id="am-mem" ref={memoryRef} rows={3} maxLength={200} className={`${inputDark} font-display text-lg`} placeholder="What do you remember most about this Pujo?" value={form.memory} onChange={(e) => set('memory', e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Favourite pandal" htmlFor="am-pandal">
                <input id="am-pandal" maxLength={50} className={inputDark} placeholder="e.g. the one near our para" value={form.pandal} onChange={(e) => set('pandal', e.target.value)} />
              </Field>
              <Field label="Favourite person or moment" htmlFor="am-person">
                <input id="am-person" maxLength={60} className={inputDark} placeholder="e.g. Dida at Pushpanjali" value={form.person} onChange={(e) => set('person', e.target.value)} />
              </Field>
            </div>
            <Field label="Bengali caption" htmlFor="am-cap" hint="Type with your Bengali keyboard, or tap a line below.">
              <input id="am-cap" lang="bn" maxLength={60} className={`${inputDark} font-bn`} placeholder="বাংলায় একটা লাইন…" value={form.caption} onChange={(e) => set('caption', e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Caption suggestions">
              {CAPTIONS.map((c) => (
                <button key={c} type="button" lang="bn" onClick={() => set('caption', c)} className="min-h-11 rounded-full border border-paper/25 px-4 py-1 font-bn text-sm text-paper/90 hover:border-gold-2 hover:text-gold-2">{c}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Btn type="submit" variant="red">{editing ? 'Update this year' : 'Add to my story'}</Btn>
              {(editing || form.year || form.memory) && <Btn type="button" variant="ghost" onClick={reset}>{editing ? 'Cancel editing' : 'Clear form'}</Btn>}
              {editing && editingItem && <Btn type="button" variant="ghost" onClick={() => remove(editingItem)}>Remove this year</Btn>}
            </div>
            <p role="status" aria-live="polite" className="min-h-6 text-sm text-gold-2">{msg}</p>
            <PrivacyNote>Your years and photos are stored only in this browser (IndexedDB). They are never uploaded or published, and you can delete them any time.</PrivacyNote>
          </form>

          {/* story panel */}
          <div>
            <h3 className="mb-5 font-display text-3xl text-cream">Your Pujo story</h3>
            <div className="mb-5 max-w-sm">
              <Field label="Name for the opening title (optional)" htmlFor="am-name">
                <input id="am-name" maxLength={24} className={inputDark} value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn variant="gold" disabled={items.length === 0} onClick={() => setPlay(true)}>
                <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 1l11 6-11 6z" /></svg>
                Play my Pujo story
              </Btn>
              {canRecordVideo() ? (
                rec ? (
                  <Btn variant="ghost" onClick={() => abort.current?.abort()}>Cancel</Btn>
                ) : (
                  <Btn variant="ghost" disabled={items.length === 0} onClick={makeVideo}>Make a video to share</Btn>
                )
              ) : null}
              {items.length > 0 && <Btn variant="ghost" onClick={clearStory}>Delete my story</Btn>}
            </div>
            {items.length === 0 && <p className="mt-3 text-sm text-paper/65">Add at least one year to play your story.</p>}
            {rec && (
              <div className="mt-4" role="status" aria-live="polite">
                <div className="h-1.5 overflow-hidden rounded-full bg-paper/20"><div className="h-full bg-gold-2" style={{ width: `${Math.round(rec.p * 100)}%` }} /></div>
                <p className="mt-2 text-sm text-paper/75">Recording your story… {Math.round(rec.p * 100)}%. Keep this tab open and in view until it finishes.</p>
              </div>
            )}
            {video && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Btn variant="gold" onClick={downloadVideo}>Download video (.{video.ext})</Btn>
                {typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && <Btn variant="ghost" onClick={shareVideo}>Share…</Btn>}
              </div>
            )}
            <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-paper/75">{vmsg}</p>
            {!canRecordVideo() && <p className="mt-1 text-sm text-paper/60">This browser can’t record video. Save the poster below, or screen-record the player.</p>}

            <div className="mt-6">
              <CardPreview
                maxWidth={420}
                label={`Your Pujo story poster with ${items.length} ${items.length === 1 ? 'year' : 'years'}`}
                filename={`my-pujo-story-${slug(profile.name || 'amar-pujo')}.png`}
                shareText={`${QUOTE_EN} My Pujo Story, made with Pujo Smriti.`}
                deps={[posterKey, profile.name]}
                render={async (c) => {
                  const story = await loadStory(items, profile.name);
                  try {
                    await renderStoryPoster(c, story);
                  } finally {
                    closeStory(story);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{play && <StoryPlayer items={items} urls={urls} name={profile.name} onClose={() => setPlay(false)} />}</AnimatePresence>
    </section>
  );
}

/* ====================================================================== player */
type Slide = { kind: 'intro' } | { kind: 'year'; item: AmarYear } | { kind: 'outro' };
const DUR = { intro: 4500, year: 7500, outro: 9000 };

function StoryPlayer({ items, urls, name, onClose }: { items: AmarYear[]; urls: Record<string, string>; name: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const dlg = useRef<HTMLDialogElement>(null);
  const slides = useMemo<Slide[]>(() => [{ kind: 'intro' }, ...items.map((item) => ({ kind: 'year' as const, item })), { kind: 'outro' }], [items]);
  const last = slides.length - 1;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(!!reduce);
  const s = slides[i];
  const dur = DUR[s.kind];

  useEffect(() => {
    const d = dlg.current;
    if (d && !d.open) d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (paused || i >= last) return;
    const t = setTimeout(() => setI((n) => Math.min(last, n + 1)), dur);
    return () => clearTimeout(t);
  }, [paused, i, last, dur]);

  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      setPaused((p) => !p);
    }
  }

  const live = s.kind === 'intro' ? 'My Pujo Story' : s.kind === 'outro' ? `${QUOTE_EN} Aschhe bochhor aabar hobe.` : `${s.item.year}. ${s.item.caption} ${s.item.memory} ${s.item.pandal ? `Favourite pandal: ${s.item.pandal}.` : ''} ${s.item.person ? `Favourite person or moment: ${s.item.person}.` : ''}`;
  const fadeT = { duration: reduce ? 0.15 : 1 };

  return (
    <motion.dialog ref={dlg} aria-label="My Pujo Story" onKeyDown={onKey} onClose={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 m-0 h-[100svh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-ink p-0 text-paper">
      <div className="sr-only" aria-live="polite">{live}</div>

      <AnimatePresence mode="sync">
        <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeT}>
          {s.kind === 'intro' && <IntroSlide name={name} items={items} reduce={!!reduce} />}
          {s.kind === 'year' && <YearSlide item={s.item} url={urls[s.item.id]} idx={i - 1} total={items.length} dur={dur} reduce={!!reduce} />}
          {s.kind === 'outro' && <OutroSlide reduce={!!reduce} onReplay={() => { setI(0); setPaused(!!reduce); }} onClose={() => dlg.current?.close()} />}
        </motion.div>
      </AnimatePresence>

      {/* chrome */}
      <div className="absolute inset-x-0 top-0 z-20 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <ol className="flex gap-1.5" aria-label="Story progress">
          {slides.map((_, k) => (
            <li key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-paper/25">
              {k < i ? <div className="h-full w-full bg-gold-2" /> : k === i ? (paused || k === last ? <div className="h-full w-full bg-gold-2/70" /> : <motion.div key={`${i}-${paused}`} className="h-full origin-left bg-gold-2" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: dur / 1000, ease: 'linear' }} />) : null}
            </li>
          ))}
        </ol>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'} className="grid h-11 w-11 place-items-center rounded-full bg-ink/60 backdrop-blur hover:bg-ink">
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="currentColor">{paused ? <path d="M3 1l12 7-12 7z" /> : <path d="M3 1h4v14H3zM9 1h4v14H9z" />}</svg>
            </button>
            <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full bg-ink/60 backdrop-blur hover:bg-ink disabled:opacity-40"><span aria-hidden>←</span></button>
            <button onClick={() => go(i + 1)} disabled={i === last} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full bg-ink/60 backdrop-blur hover:bg-ink disabled:opacity-40"><span aria-hidden>→</span></button>
          </div>
          <button onClick={() => dlg.current?.close()} aria-label="Close story" className="grid h-11 w-11 place-items-center rounded-full bg-ink/60 backdrop-blur hover:bg-ink">
            <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" fill="none"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>
      </div>
    </motion.dialog>
  );
}

function IntroSlide({ name, items, reduce }: { name: string; items: AmarYear[]; reduce: boolean }) {
  const a = items[0]?.year;
  const b = items[items.length - 1]?.year;
  const d = (n: number) => (reduce ? 0 : n);
  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_55%,rgba(201,120,40,.3),transparent_60%)] px-6 text-center">
      <motion.div aria-hidden className="absolute left-1/2 top-[42%] h-[min(130vw,820px)] w-[min(130vw,820px)] -translate-x-1/2 -translate-y-1/2 text-gold/35" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 120, ease: 'linear', repeat: Infinity }}>
        <MandalaSvg petals={12} rings={4} strokeWidth={0.4} />
      </motion.div>
      <div className="relative mt-[28vh]">
        <motion.h2 lang="bn" className="font-bn text-[clamp(3.4rem,15vw,8rem)] leading-tight text-cream" initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(0.5), duration: d(1.2) }}>আমার পুজো</motion.h2>
        <motion.p className="font-display text-3xl italic text-gold-2 md:text-4xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(1.3), duration: d(1) }}>My Pujo Story</motion.p>
        {name && <motion.p className="mt-4 font-hand text-4xl text-paper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2), duration: d(1) }}>{name}</motion.p>}
        {a && <motion.p className="mt-3 font-ui text-sm tracking-[0.3em] text-paper/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2.4), duration: d(1) }}>{a === b ? a : `${a}  →  ${b}`}</motion.p>}
      </div>
    </div>
  );
}

function YearSlide({ item, url, idx, total, dur, reduce }: { item: AmarYear; url?: string; idx: number; total: number; dur: number; reduce: boolean }) {
  const d = (n: number) => (reduce ? 0 : n);
  return (
    <div className="relative h-full overflow-hidden bg-ink">
      {url ? (
        <motion.img src={url} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.04 }} animate={{ scale: reduce ? 1.04 : 1.16 }} transition={{ duration: dur / 1000, ease: 'linear' }} />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,120,40,.35),transparent_65%)]">
          <motion.div aria-hidden className="absolute left-1/2 top-[34%] h-[min(120vw,760px)] w-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 text-gold/45" animate={reduce ? undefined : { rotate: idx % 2 ? -360 : 360 }} transition={{ duration: 140, ease: 'linear', repeat: Infinity }}>
            <MandalaSvg petals={10 + (idx % 3) * 2} rings={4} strokeWidth={0.4} />
          </motion.div>
        </div>
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,14,.82),rgba(5,6,14,.1)_22%,rgba(5,6,14,.2)_48%,rgba(5,6,14,.85)_72%,rgba(5,6,14,.97))]" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-12">
        <motion.p className="font-display text-[clamp(5rem,22vw,10rem)] font-semibold leading-[0.85] text-gold-2" initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(0.2), duration: d(0.9) }}>{item.year}</motion.p>
        {item.caption && <motion.p lang="bn" className="mt-3 font-bn text-[clamp(1.8rem,6vw,3.2rem)] leading-snug text-cream" initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(0.7), duration: d(1) }}>{item.caption}</motion.p>}
        {item.memory && <motion.p className="mt-3 max-w-xl font-display text-xl italic leading-relaxed text-paper/95 md:text-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(1.4), duration: d(1) }}>{item.memory}</motion.p>}
        {(item.pandal || item.person) && (
          <motion.dl className="mt-5 grid gap-3 sm:grid-cols-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2.2), duration: d(1) }}>
            {item.pandal && <div><dt className="font-ui text-[0.7rem] tracking-[0.22em] text-gold-2">FAVOURITE PANDAL</dt><dd className="font-display text-xl text-cream">{item.pandal}</dd></div>}
            {item.person && <div><dt className="font-ui text-[0.7rem] tracking-[0.22em] text-gold-2">FAVOURITE PERSON OR MOMENT</dt><dd className="font-display text-xl text-cream">{item.person}</dd></div>}
          </motion.dl>
        )}
        <p className="mt-6 font-ui text-xs tracking-[0.2em] text-paper/55" aria-hidden>{idx + 1} / {total}</p>
      </div>
    </div>
  );
}

function OutroSlide({ reduce, onReplay, onClose }: { reduce: boolean; onReplay: () => void; onClose: () => void }) {
  const d = (n: number) => (reduce ? 0 : n);
  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_50%,rgba(179,38,30,.25),transparent_60%)] px-6 text-center">
      <div className="relative max-w-3xl">
        <motion.p lang="bn" className="font-bn text-[clamp(2.4rem,9vw,5.2rem)] leading-snug text-cream" initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(0.5), duration: d(1.4) }}>{QUOTE_BN}</motion.p>
        <motion.p className="mt-5 font-display text-2xl italic text-gold-2 md:text-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2), duration: d(1.2) }}>{QUOTE_EN}</motion.p>
        <motion.p className="mt-10 font-display text-xl tracking-[0.18em] text-cream md:text-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(3.4), duration: d(1.2) }}>ASCHHE BOCHHOR AABAR HOBE.</motion.p>
        <motion.div className="mt-10 flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(4.6), duration: d(1) }}>
          <Btn variant="gold" onClick={onReplay}>Watch again</Btn>
          <Btn variant="ghost" onClick={onClose}>Close and share</Btn>
        </motion.div>
      </div>
    </div>
  );
}
