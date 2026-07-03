// Concise clinical info for each recommendation (short summary + frequency + category)
// Follows the user's decision-table wording exactly.

export const RECOMMENDATION_INFO = {
  // ------- EYE RELAXATION EXERCISES -------
  'Level 1 Eye Relaxation Exercises': {
    category: 'Exercises',
    summary: 'Basic eye-relaxation routine — 20-20-20 rule, palming, and slow blinking.',
    details: [],
    frequency: '3–5 times daily',
  },
  'Level 2 Eye Relaxation Exercises': {
    category: 'Exercises',
    summary: 'Structured eye-relaxation exercises for moderate strain.',
    details: [],
    frequency: '2× daily (morning & evening)',
  },
  'Level 3 Eye Relaxation Exercises': {
    category: 'Exercises',
    summary: 'Intensive eye-relaxation therapy for high strain.',
    details: [],
    frequency: '3× daily',
  },
  'Level 4 Eye Relaxation Exercises': {
    category: 'Exercises',
    summary: 'Rehabilitative eye exercises — clinician supervised.',
    details: [],
    frequency: '4× daily + weekly clinic visit',
  },

  // ------- ARTIFICIAL TEARS -------
  'Artificial Tears (Tear Drops)': {
    category: 'Medication',
    summary: 'Lubricating tear drops to replenish the tear film disrupted by screen use.',
    details: [],
    frequency: '4–6× daily',
  },

  // ------- DESP GLASSES -------
  'DESP Glasses (Optional)': {
    category: 'Optical',
    summary: 'DESP (Digital Eye Strain Protection) blue-light filtering glasses — optional at this stage.',
    details: [],
    frequency: 'Wear during screen use',
  },
  'DESP Glasses (Compulsory)': {
    category: 'Optical',
    summary: 'DESP (Digital Eye Strain Protection) blue-light filtering glasses — compulsory to reduce eye fatigue.',
    details: [],
    frequency: 'Wear during all screen use',
  },

  // ------- REFRACTIVE ERROR -------
  'Refractive Error Correction': {
    category: 'Clinical',
    summary: 'Correction of underlying refractive error (myopia / hypermetropia) with prescription glasses.',
    details: [],
    frequency: 'Reassess every 12 months',
  },

  // ------- MEDITATION -------
  'Meditation': {
    category: 'Lifestyle',
    summary: 'Guided meditation to reduce stress, headache, and sleeplessness that worsen eye strain.',
    details: [],
    frequency: '10–15 min daily',
  },

  // ------- SUPPLEMENTS -------
  'Nutritional Supplements': {
    category: 'Nutrition',
    summary: 'Omega-3, Lutein, Zeaxanthin and vitamin supplements for eye and macular health.',
    details: [],
    frequency: 'Daily with meals',
  },
  'Nutritional Supplements (Optional)': {
    category: 'Nutrition',
    summary: 'Optional Omega-3, Lutein, Zeaxanthin supplements to support eye health.',
    details: [],
    frequency: 'Daily with meals (optional)',
  },

  // ------- GENERAL FALLBACKS -------
  'Take frequent screen breaks': {
    category: 'Ergonomics',
    summary: 'Micro-break protocol every 45–60 minutes to prevent accommodative fatigue.',
    details: [],
    frequency: 'Every 45–60 minutes',
  },
}

export function getRecommendationInfo(rec) {
  return RECOMMENDATION_INFO[rec] || {
    category: 'General',
    summary: rec,
    details: [],
    frequency: 'As advised',
  }
}
