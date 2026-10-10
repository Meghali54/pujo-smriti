export interface PujoDay {
  id: string;
  bn: string;
  en: string;
  tagline: string;
  story: string;
  rituals: string[];
  prompt: string;
  petals: number;
}

/**
 * Descriptions follow widely observed Bengali Durga Puja customs. Practices vary between families,
 * neighbourhoods and traditions (Barowari, Bonedi Bari, sarbojanin); dates shift each year with the lunar
 * calendar, so check a panjika for this year's tithi and timings.
 */
export const DAYS: PujoDay[] = [
  {
    id: 'mahalaya',
    bn: 'মহালয়া',
    en: 'Mahalaya',
    tagline: 'The dark before dawn, and a voice on the radio.',
    story:
      'Mahalaya ends Pitri Paksha, the fortnight for remembering ancestors, and opens Devi Paksha. Many families rise before dawn to offer tarpan at a river or ghat. For generations, homes have filled with the radio broadcast Mahishasuramardini, and in Kumartuli the artisans paint the goddess’s eyes in the ritual of chokkhu daan.',
    rituals: ['Tarpan for ancestors at the ghat', 'The pre-dawn radio programme, Chandipath and song', 'Chokkhu daan: the eyes of the idol are painted'],
    prompt: 'Whose voice do you hear when you think of Mahalaya morning?',
    petals: 6,
  },
  {
    id: 'shashthi',
    bn: 'ষষ্ঠী',
    en: 'Shashthi',
    tagline: 'She is awakened. The pandal finally opens its eyes.',
    story:
      'On Shashthi the goddess is welcomed through Bodhon, her ritual awakening, followed by Amantran and Adhivas. The cloth over the idol’s face is lifted. New clothes come out, the dhak begins to sound in earnest, and the first pandal-hopping walks start.',
    rituals: ['Bodhon, Amantran and Adhivas', 'The unveiling of the face', 'New clothes, first dhak, first pandal walk'],
    prompt: 'What did you wear on your first evening of Pujo, and who saw it first?',
    petals: 8,
  },
  {
    id: 'saptami',
    bn: 'সপ্তমী',
    en: 'Saptami',
    tagline: 'A bride of plants is bathed, and Ma is fully present.',
    story:
      'The Nabapatrika, nine plants bound together and draped in a red-bordered white sari, is bathed in holy water, often at a river, and placed beside Ganesha. Many people call her Kola Bou. Pran Pratishtha invites the divine presence into the idol, and Pushpanjali offerings begin.',
    rituals: ['Nabapatrika snan (the Kola Bou bath)', 'Pran Pratishtha', 'The first Pushpanjali'],
    prompt: 'Where did you stand when the conch and the dhak rose together?',
    petals: 10,
  },
  {
    id: 'ashtami',
    bn: 'অষ্টমী',
    en: 'Ashtami',
    tagline: 'Fast, flowers, then the hush of Sandhi Puja.',
    story:
      'Ashtami morning is the great Pushpanjali; many families fast until they have offered flowers, and then eat luchi and alur dom. Kumari Puja honours a young girl as the goddess. At the meeting point of Ashtami and Navami comes Sandhi Puja, traditionally with 108 lamps and 108 lotuses, in a hush that even crowded pandals fall into.',
    rituals: ['Pushpanjali on an empty stomach', 'Kumari Puja', 'Sandhi Puja with 108 lamps and 108 lotuses'],
    prompt: 'What did the pandal smell like at Pushpanjali: marigold, incense, or wet cloth?',
    petals: 12,
  },
  {
    id: 'navami',
    bn: 'নবমী',
    en: 'Navami',
    tagline: 'The loudest night, and the one that hurts most.',
    story:
      'Navami holds the Maha Aarti, community bhog, and the swirl of dhunuchi naach with smoking clay burners held in both hands and the dhak at full force. It is also the night when everyone quietly knows tomorrow is Dashami, so people stay out later than they should.',
    rituals: ['Maha Aarti', 'Bhog: khichuri, labra, chutney, payesh', 'Dhunuchi naach to the dhak'],
    prompt: 'Who stayed out with you until the lights were switched off?',
    petals: 14,
  },
  {
    id: 'dashami',
    bn: 'দশমী',
    en: 'Dashami · Bijoya',
    tagline: 'A daughter goes home. We say: come back soon.',
    story:
      'Dashami is Bijoya. Married women offer Boron with betel leaf and sweets, then play Sindoor Khela, smearing sindoor on the goddess and on one another. The idol is carried to the water for Bisarjan. Afterwards come the greetings: Shubho Bijoya, pronam to elders, hugs, nimki, narkel naru and mishti.',
    rituals: ['Boron and Sindoor Khela', 'Bisarjan at the river', 'Shubho Bijoya: pronam, hugs, sweets'],
    prompt: 'Who did you touch the feet of first this Bijoya?',
    petals: 16,
  },
];
