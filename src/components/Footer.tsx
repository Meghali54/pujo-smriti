import { useState } from 'react';
import { clearAllLocalData } from '../lib/storage';
import { Btn } from './ui';

export function Footer({ onReplay }: { onReplay: () => void }) {
  const [msg, setMsg] = useState('');
  async function wipe() {
    if (!window.confirm('Delete every draft, letter, note, photo and result this site stored on this device? This cannot be undone.')) return;
    await clearAllLocalData();
    setMsg('Everything stored on this device has been deleted.');
  }
  return (
    <footer className="border-t border-gold/20 bg-[#070915] px-5 py-16 text-paper/80">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
        <div>
          <p lang="bn" className="font-bn text-2xl text-gold-2">পুজো স্মৃতি</p>
          <p className="font-display text-xl tracking-[0.2em] text-cream">PUJO SMRITI</p>
          <p className="mt-3 font-display text-lg italic">Some festivals end. Some stay with us forever.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-cream">Your privacy</h2>
          <ul className="mt-3 space-y-2 text-[0.92rem] leading-snug">
            <li>No accounts, no tracking, no analytics, no ads.</li>
            <li>Letters, photos and drafts are stored only in this browser and are never uploaded.</li>
            <li>Cards are made on your device. You decide whether to share them.</li>
            <li>Sample gallery items are original illustrations, clearly labelled. There are no testimonials, user counts or submissions from others.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Btn variant="ghost" onClick={wipe}>Delete everything on this device</Btn>
            <Btn variant="ghost" onClick={onReplay}>Replay the opening</Btn>
          </div>
          <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm text-gold-2">{msg}</p>
        </div>
        <div className="text-[0.9rem] leading-relaxed">
          <h2 className="font-display text-2xl text-cream">About</h2>
          <p className="mt-3">Made with love for the festival that UNESCO inscribed on its list of Intangible Cultural Heritage of Humanity in 2021 as “Durga Puja in Kolkata”. Rituals differ between homes and neighbourhoods; this is one respectful telling, not the only one.</p>
          <p className="mt-3 text-paper/60">Type: Cormorant Garamond, Tiro Bangla, Noto Serif Bengali, Atma, Caveat and Jost, all under the SIL Open Font License. All artwork is original and drawn in code.</p>
        </div>
      </div>
    </footer>
  );
}
