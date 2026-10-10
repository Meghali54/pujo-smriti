import type { AlpanaStyle } from '../lib/alpana';

export interface Archetype {
  id: string;
  bn: string;
  en: string;
  line: string;
  plate: string;
  style: AlpanaStyle;
  petals: number;
}

export const ARCHETYPES: Record<string, Archetype> = {
  dhunuchi: {
    id: 'dhunuchi',
    bn: 'ধুনুচির নাচিয়ে',
    en: 'The Dhunuchi Dancer',
    line: 'You arrive when the dhak gets louder, and you stay till the smoke carries your worries away. For you, Pujo is felt in the chest before it is understood.',
    plate: 'A hot egg roll from the para corner, eaten mid-beat',
    style: 'chakra',
    petals: 12,
  },
  pandal: {
    id: 'pandal',
    bn: 'ঠাকুর দেখার যাত্রী',
    en: 'The Pandal Hopper',
    line: 'Maps are open, shoes are broken in, and the night is a route. You believe every pandal has one thing worth seeing, and you go to find it.',
    plate: 'Phuchka and ghugni, eaten standing in a queue',
    style: 'dots',
    petals: 10,
  },
  bhog: {
    id: 'bhog',
    bn: 'ভোগ আর আড্ডার প্রাণ',
    en: 'The Bhog & Adda Soul',
    line: 'Pujo is people, and people gather around plates. You remember who sat where, who asked for a second helping, and what was said over the last cup of cha.',
    plate: 'Khichuri, labra, begun bhaja and payesh on a steel plate',
    style: 'padma',
    petals: 8,
  },
  shiuli: {
    id: 'shiuli',
    bn: 'শিউলির মন',
    en: 'The Shiuli Soul',
    line: 'You love the edges of the festival: the dawn radio, the first shiuli on the steps, the hush of Sandhi Puja. You carry more Pujo home than anyone realises.',
    plate: 'Luchi and alur dom after Pushpanjali, with tea in a bhar',
    style: 'lata',
    petals: 8,
  },
  para: {
    id: 'para',
    bn: 'পাড়ার পুজোর ভরসা',
    en: 'The Para Pujo Anchor',
    line: 'You are the reason the lights turn on. Chanda, chairs, loudspeakers and last-minute flowers: you make the neighbourhood’s Pujo happen and seldom sit still to see it.',
    plate: 'Whatever is left after everyone else has eaten, and it is still the best',
    style: 'padma',
    petals: 12,
  },
};

export interface Question {
  q: string;
  bn: string;
  options: { text: string; type: keyof typeof ARCHETYPES }[];
}

export const QUESTIONS: Question[] = [
  {
    q: 'It is Shashthi evening. Where are you?',
    bn: 'ষষ্ঠীর সন্ধ্যা',
    options: [
      { text: 'On the road already, deciding which pandal to see first.', type: 'pandal' },
      { text: 'At the para pandal, fixing the last string of lights.', type: 'para' },
      { text: 'Near the dhaki, waiting for the beat to build.', type: 'dhunuchi' },
      { text: 'On the balcony with tea, listening to the first dhak from far away.', type: 'shiuli' },
    ],
  },
  {
    q: 'Which sound is Pujo, for you?',
    bn: 'পুজোর আওয়াজ',
    options: [
      { text: 'The clink of steel plates and ladles at bhog.', type: 'bhog' },
      { text: 'Dhak and kansor rising together.', type: 'dhunuchi' },
      { text: 'A thousand footsteps shuffling in a slow queue.', type: 'pandal' },
      { text: 'A loudspeaker crackling “testing, testing” at six a.m.', type: 'para' },
    ],
  },
  {
    q: 'Pick one plate.',
    bn: 'একটাই থালা',
    options: [
      { text: 'Khichuri, labra and begun bhaja.', type: 'bhog' },
      { text: 'Phuchka and ghugni, standing up.', type: 'pandal' },
      { text: 'Luchi and alur dom after Pushpanjali.', type: 'shiuli' },
      { text: 'Whatever the volunteers are eating behind the tent.', type: 'para' },
    ],
  },
  {
    q: 'Ashtami night. Where do you want to be?',
    bn: 'অষ্টমীর রাত',
    options: [
      { text: 'In the hush of Sandhi Puja, watching the lamps.', type: 'shiuli' },
      { text: 'In the smoke of the dhunuchi naach.', type: 'dhunuchi' },
      { text: 'At a long adda with old friends and one more cup of cha.', type: 'bhog' },
      { text: 'In the queue for the year’s most talked-about pandal.', type: 'pandal' },
    ],
  },
  {
    q: 'Dashami evening. Bisarjan. You…',
    bn: 'দশমীর সন্ধ্যা',
    options: [
      { text: 'Keep the dhak beat going all the way to the ghat.', type: 'dhunuchi' },
      { text: 'Go around with Shubho Bijoya, pronam and a box of nimki.', type: 'bhog' },
      { text: 'Stand quietly, with a lump in your throat.', type: 'shiuli' },
      { text: 'Stay behind to help clear the pandal ground.', type: 'para' },
    ],
  },
];

export function score(answers: (keyof typeof ARCHETYPES)[]): Archetype {
  const tally: Record<string, number> = {};
  answers.forEach((a) => (tally[a] = (tally[a] ?? 0) + 1));
  const max = Math.max(...Object.values(tally));
  const tied = Object.keys(tally).filter((k) => tally[k] === max);
  // Ties: the most recent answer wins, because Dashami feelings say the most.
  for (let i = answers.length - 1; i >= 0; i--) if (tied.includes(answers[i])) return ARCHETYPES[answers[i]];
  return ARCHETYPES.shiuli;
}
