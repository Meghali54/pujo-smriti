# PUJO SMRITI · পুজো স্মৃতি
**A Digital Home for Puja Memories.** *Some festivals end. Some stay with us forever.*

A cinematic, private, in-browser Durga Puja scrapbook built with **React 19 · Vite · TypeScript · Tailwind CSS v4 · Motion for React**.

## What's inside
| # | Feature | Where |
|---|---------|-------|
| 1 | Cinematic opening, "মা আসছেন…" (per-grapheme reveal, diya, skip / Esc) | `Opening.tsx` |
| ★ | **Amar Pujo: My Puja Through the Years.** Build a 2010 → 2015 → 2020 → 2026 timeline (photo, memory, favourite pandal, favourite person/moment, Bengali caption per year). It becomes a cinematic **My Pujo Story**: full-screen player with Ken Burns photo moves, Bengali captions and the line *একটা পুজো শেষ হয়, স্মৃতি থেকে যায়।* Share it as a story poster (PNG) or record it as a vertical 9:16 video | `AmarPujo.tsx`, `lib/story.ts` |
| 2 | Full-screen Kolkata Puja hero: hand-built SVG night scene (rooftops, Howrah Bridge, Ganga, pandal lights, chalchitra arch, kaash phool), scroll parallax | `Hero.tsx` |
| 3 | Mahalaya → Dashami interactive timeline with keyboard-navigable tabs and per-day private notes | `Timeline.tsx`, `data/days.ts` |
| 4 | Memory capsule: year, day, title, text, photo, live preview, PNG download, "keep in scrapbook" | `Capsule.tsx` |
| 5 | Letter to Maa: Bengali / English / both, sealed with sindoor, PNG + TXT export, "let it flow into the river" (delete) | `Letter.tsx` |
| 6 | Five-question Pujo personality quiz → 5 personalities → shareable result card | `Quiz.tsx`, `data/quiz.ts` |
| 7 | Scrapbook gallery: draggable polaroids; samples are original SVG illustrations labelled *Sample illustration · not a real memory*; your kept capsules appear beside them | `Gallery.tsx`, `SampleArt.tsx` |
| 8 | Alpana greeting-card studio: 4 pattern styles, palettes, editable Bengali/English text, freehand painting with radial symmetry, undo, PNG export | `Alpana.tsx`, `lib/alpana.ts` |
| 9 | Dashami finale (Sindoor Khela → Boron → Bisarjan → Bijoya) ending with **ASCHHE BOCHHOR AABAR HOBE.** | `Finale.tsx` |
| 10 | Shareable personalised cards: Pujor Chithi postcard and Pandal Pass keepsake, using your name, para/city and quiz result | `ShareStudio.tsx`, `lib/cards.ts` |

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview
```
Requires Node 20+.

### How My Pujo Story works
* Each year is saved on-device (text in `localStorage`, photo in IndexedDB under `amar-*` keys, EXIF-stripped). Years without a photo get a slowly turning alpana instead.
* **Player** (`StoryPlayer`): a native `<dialog>` with Motion crossfades, pause/play, prev/next, ←/→/Space/Esc keys, a progress bar, and an `aria-live` text description of each slide. Under reduced motion it starts paused and drops the zoom/rotation.
* **Video**: `lib/story.ts` paints every frame on a canvas (`drawStoryFrame`) and records it with `MediaRecorder` (MP4 where supported, otherwise WebM). The tab must stay open and visible while it records (~6 s per year plus intro/outro). Browsers without `MediaRecorder` still get the poster PNG.
* **Poster**: up to six years chosen evenly across the timeline.
* *Delete my story* and the footer's *Delete everything on this device* both remove the photos.

### Opening sound
`public/audio/dhak.mp3` (the dhak track, compressed to 96 kbps) plays softly under the "মা আসছেন…" opening. Browsers block sound until the visitor interacts, so it tries to autoplay and otherwise starts on the first tap or key press, with a visible *Mute dhak* button. It fades in over ~2 s, loops, fades out when the visitor enters, and the mute choice is remembered on the device. To swap the sound, replace that file (keep the name, or change `DHAK_SRC` in `components/Opening.tsx`). Please keep the track's licence/attribution terms from wherever you obtained it.

## Privacy by design
* **No backend, no analytics, no accounts, no third-party requests.** Fonts are self-hosted (`@fontsource`); the shipped CSP (`public/_headers`, `vercel.json`) blocks all outbound connections.
* Drafts, notes, letters, quiz result and kept capsules live in `localStorage` / IndexedDB **on the visitor's device only**. The letter draft can be turned off, and "Let it flow into the river" deletes it. The footer button **Delete everything on this device** wipes all of it.
* Photos are re-encoded through a canvas, which shrinks them and **strips EXIF/GPS metadata**. A photo is only persisted if the visitor presses *Keep in my scrapbook*.
* Sharing uses the Web Share API with a PNG file when the browser supports it; otherwise it downloads. Nothing is ever posted for the visitor.
* No testimonials, user counts or community submissions are shown or fabricated. All gallery samples are labelled illustrations.

## Accessibility & motion
* Skip link, landmarks, visible gold focus rings, ≥44px targets, labelled fields, `role="tablist"` with arrow / Home / End keys, native `<dialog>` for the lightbox, `aria-live` status messages, `lang="bn"` on Bengali text.
* `MotionConfig reducedMotion="user"` plus explicit `useReducedMotion` handling, and a CSS `prefers-reduced-motion` block that stops the film grain, flicker, sway and shimmer. The finale does not autoplay under reduced motion (Next / Skip buttons instead).
* Drawing in the alpana studio is pointer-based; keyboard users get the "Add a ring of dots and buds" button, and every other control is a standard form control.

## Performance
* Zero raster images in the bundle: all art is SVG or canvas drawn in code. Below-the-fold sections are `React.lazy` code-split; Motion and React are cached as long-lived chunks. Only the Latin and Bengali font subsets actually used are shipped (WOFF2 first).
* User photos are downscaled to ≤1400px JPEG before use.

## SEO
`index.html` ships title, description, canonical, Open Graph + Twitter card, JSON-LD (`WebApplication`), manifest, favicon, `robots.txt`, `sitemap.xml`, and a 1200×630 `public/og.png`.
**Before deploying**, set your real URL in `.env` (`VITE_SITE_URL=https://your-domain`), and update the domain in `public/robots.txt` and `public/sitemap.xml`.

## Deploy
The output is static (`dist/`), so any static host works.

**Vercel**: import the repo; framework preset *Vite*. `vercel.json` adds security headers.

**Netlify**: import the repo; `netlify.toml` sets `npm run build` / `dist`. Headers come from `public/_headers`.

**Cloudflare Pages**: build command `npm run build`, output `dist`. `_headers` is honoured.

**GitHub Pages** (project site):
```bash
VITE_BASE=/your-repo-name/ VITE_SITE_URL=https://you.github.io/your-repo-name npm run build
# publish dist/ (e.g. with the actions/deploy-pages action)
```
Note: GitHub Pages cannot set headers, so the CSP is not applied there. The app still makes no network calls.

Set the environment variable `VITE_SITE_URL` in your host's dashboard so canonical/OG tags use the production URL.

## Known limits / ideas
* Bengali is typed with the visitor's own Bengali keyboard; there is no built-in transliteration.

## Structure
```
src/
  App.tsx              layout, lazy sections, opening gate
  components/          one file per experience (+ ui, CardPreview, MandalaSvg)
  data/                timeline days and quiz content
  lib/                 storage (localStorage + IndexedDB), canvas helpers,
                       alpana generator, card renderers
public/                favicon, og.png, manifest, robots, sitemap, _headers
```
