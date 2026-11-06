import type { Locality } from '../types'

// SAMPLE CONTENT: general descriptions of real Jaipur localities. Coordinates are approximate.

export const localities: readonly Locality[] = [
  {
    slug: 'jagatpura',
    name: 'Jagatpura',
    zone: 'South-east Jaipur',
    summary:
      'A fast-growing residential area of south-east Jaipur with new villa communities, schools and easy access to the airport side of the city.',
    intro: [
      'Jagatpura has grown from open land into one of Jaipur’s busiest new residential areas, popular with families buying their first independent home.',
      'Wide roads, newer gated communities and a steady supply of schools and hospitals make it a practical choice for villas and plots.',
    ],
    highlights: ['Newer gated villa communities', 'Schools and colleges nearby', 'Airport side of the city', 'Plots and villas at moderate prices'],
    geo: { lat: 26.8197, lng: 75.858 },
    faqs: [
      {
        question: 'Is Jagatpura good for buying a villa?',
        answer:
          'Many buyers choose Jagatpura for independent villas because newer gated communities offer more space for the price than central Jaipur. Visit at different times of day and check the approvals of any project you shortlist.',
      },
    ],
    updatedAt: '2026-10-20',
  },
  {
    slug: 'vaishali-nagar',
    name: 'Vaishali Nagar',
    zone: 'West Jaipur',
    summary:
      'An established west Jaipur neighbourhood with markets, hospitals and schools close by — a long-standing favourite for flats and family homes.',
    intro: [
      'Vaishali Nagar is one of west Jaipur’s best-known residential areas, with mature markets, restaurants and services within a short drive.',
      'Demand is steady for both apartments and independent homes, and resale property changes hands regularly.',
    ],
    highlights: ['Mature markets and restaurants', 'Hospitals and schools nearby', 'Strong resale demand', 'Apartments and independent homes'],
    geo: { lat: 26.9116, lng: 75.7425 },
    faqs: [
      {
        question: 'Are new apartments available in Vaishali Nagar?',
        answer:
          'Yes, though land is scarcer than in newer areas, so most new projects are mid-rise apartment buildings. Ask us about current launches and resale flats.',
      },
    ],
    updatedAt: '2026-10-20',
  },
  {
    slug: 'mansarovar',
    name: 'Mansarovar',
    zone: 'South-west Jaipur',
    summary:
      'One of Jaipur’s largest planned residential areas, served by the metro, with a wide mix of flats, villas and ready-to-move homes.',
    intro: [
      'Mansarovar is a large planned residential area in south-west Jaipur, connected to the city centre by the Jaipur Metro.',
      'Its size means a wide choice: compact flats, independent houses and newer villa projects at its edges.',
    ],
    highlights: ['Jaipur Metro connectivity', 'Large, planned layout', 'Wide choice of homes', 'Established community'],
    geo: { lat: 26.8695, lng: 75.76 },
    faqs: [
      {
        question: 'Is Mansarovar connected by metro?',
        answer: 'Yes. The Jaipur Metro runs from Mansarovar towards the walled city, which makes daily commuting easier.',
      },
    ],
    updatedAt: '2026-10-20',
  },
  {
    slug: 'ajmer-road',
    name: 'Ajmer Road',
    zone: 'West Jaipur corridor',
    summary:
      'Jaipur’s western growth corridor along the highway to Ajmer, known for plotted developments and new residential townships.',
    intro: [
      'Ajmer Road is the western corridor out of Jaipur along the national highway, and one of the city’s main areas for new plotted developments.',
      'Buyers here are often investing early or planning to build their own home on a larger plot.',
    ],
    highlights: ['Plotted developments', 'Highway connectivity', 'Larger plot sizes', 'Early-stage growth'],
    geo: { lat: 26.895, lng: 75.69 },
    faqs: [
      {
        question: 'Can Adnik Infra build a house on my plot on Ajmer Road?',
        answer:
          'Yes. Our construction team builds on customers’ own plots across Jaipur. Share your plot size and we will send an estimate and a suggested layout.',
      },
    ],
    updatedAt: '2026-10-20',
  },
  {
    slug: 'tonk-road',
    name: 'Tonk Road',
    zone: 'South Jaipur',
    summary:
      'A major south Jaipur arterial road lined with offices, showrooms and hospitals — a natural address for commercial property.',
    intro: [
      'Tonk Road runs south from the city centre and is lined with offices, showrooms, hospitals and educational institutions.',
      'Its visibility and connectivity make it one of Jaipur’s main addresses for commercial property.',
    ],
    highlights: ['Commercial frontage', 'Offices and showrooms', 'Hospitals and institutions', 'Central-south location'],
    geo: { lat: 26.852, lng: 75.8 },
    faqs: [],
    updatedAt: '2026-10-20',
  },
  {
    slug: 'malviya-nagar',
    name: 'Malviya Nagar',
    zone: 'South-east Jaipur',
    summary:
      'A well-established south-east Jaipur neighbourhood with malls, hospitals and schools, and good demand for ready apartments.',
    intro: [
      'Malviya Nagar is a mature residential area with shopping, hospitals and schools close at hand.',
      'Ready-to-move apartments here are popular with working professionals and families alike.',
    ],
    highlights: ['Shopping and malls', 'Hospitals and schools', 'Ready-to-move flats', 'Good connectivity'],
    geo: { lat: 26.8549, lng: 75.8243 },
    faqs: [],
    updatedAt: '2026-10-20',
  },
]
