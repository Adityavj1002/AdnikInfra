import type { Faq, Town } from '../types'

/** The questions every town page answers, worded for that town. */
function townFaqs(name: string, corridor: string): readonly Faq[] {
  return [
    {
      question: `Do you build houses in ${name}?`,
      answer: `Yes. We build independent homes on our customers’ own plots in and around ${name}: drawings, approvals, construction and handover, with one contract and stage-wise payments. Our site team covers the ${corridor} corridor.`,
    },
    {
      question: `Can I buy agricultural land or a plot in ${name}?`,
      answer: `Yes. We list residential plots and agricultural land in and around ${name}, and check the jamabandi, khasra map and mutation records before anything is listed. Building on agricultural land usually needs land-use conversion first, and we explain what applies to each parcel.`,
    },
    {
      question: `Can I visit land or homes in ${name} with your team?`,
      answer: `Yes, site visits are free. Tell us what you are looking for and we will plan a visit to the options in ${name} that fit your budget.`,
    },
  ]
}

/**
 * Towns around Jaipur that we serve (site.serviceArea.towns). Distances are approximate road
 * distances from central Jaipur, rounded to 5 km. Each page carries its own copy: towns are
 * genuinely different places, and near-identical pages would rank for none of them.
 */
export const towns: readonly Town[] = [
  {
    slug: 'chaksu',
    name: 'Chaksu',
    corridor: 'Tonk Road',
    direction: 'south',
    distanceKm: 40,
    summary:
      'Plots, agricultural land and home construction in Chaksu, about 40 km south of Jaipur on Tonk Road, by builders who work across the Jaipur region.',
    intro: [
      'Chaksu is a growing town on Tonk Road, south of Jaipur. Direct highway access and land prices well below the city’s make it a natural choice for residential plots, agricultural land and warehouse sites.',
      'Many buyers here are families from Jaipur who want a larger plot, and investors who expect the Tonk Road corridor to keep growing.',
    ],
    offers: ['Residential plots', 'Agricultural land', 'Home construction on your plot', 'Warehouse construction'],
    faqs: townFaqs('Chaksu', 'Tonk Road'),
  },
  {
    slug: 'niwai',
    name: 'Niwai',
    corridor: 'Tonk Road',
    direction: 'south',
    distanceKm: 70,
    summary:
      'Plots, agricultural land and home construction in Niwai, Tonk district, on Tonk Road about 70 km south of Jaipur, near Banasthali Vidyapith.',
    intro: [
      'Niwai is a town in Tonk district on the Jaipur–Tonk highway, close to Banasthali Vidyapith. Many families here build their own homes, and we design and build them end to end.',
      'Land along the highway draws buyers looking for farmland, larger residential plots and warehouse sites.',
    ],
    offers: ['Home construction on your plot', 'Agricultural land', 'Residential plots', 'Warehouse construction'],
    faqs: townFaqs('Niwai', 'Tonk Road'),
  },
  {
    slug: 'tonk',
    name: 'Tonk',
    corridor: 'Tonk Road',
    direction: 'south',
    distanceKm: 100,
    summary:
      'Property, plots and home construction in Tonk, the district town about 100 km south of Jaipur at the end of the Tonk Road corridor.',
    intro: [
      'Tonk is the district headquarters south of Jaipur, at the far end of the Tonk Road corridor that also runs through Chaksu and Niwai.',
      'We build independent homes in Tonk and list plots and agricultural land across the district.',
    ],
    offers: ['Independent homes on your plot', 'Residential plots', 'Agricultural land', 'Shops and commercial buildings'],
    faqs: townFaqs('Tonk', 'Tonk Road'),
  },
  {
    slug: 'phagi',
    name: 'Phagi',
    corridor: 'Diggi Road',
    direction: 'south-west',
    distanceKm: 50,
    summary: 'Plots, agricultural land and home construction in Phagi on the Diggi road, about 50 km south-west of Jaipur.',
    intro: [
      'Phagi is a town south-west of Jaipur on the road to Diggi and Malpura, surrounded by farmland.',
      'Buyers come here for agricultural land and larger plots at prices well below the city’s, and we build homes for those who already own land.',
    ],
    offers: ['Agricultural land', 'Residential plots', 'Home construction on your plot'],
    faqs: townFaqs('Phagi', 'Diggi Road'),
  },
  {
    slug: 'malpura',
    name: 'Malpura',
    corridor: 'Diggi Road',
    direction: 'south-west',
    distanceKm: 95,
    summary: 'Agricultural land, plots and house construction in Malpura, Tonk district, about 95 km south-west of Jaipur via Diggi.',
    intro: [
      'Malpura is a town in Tonk district, south-west of Jaipur, reached by the road through Phagi and Diggi. It is a farming area.',
      'Most of our work here is agricultural land and independent homes built on customers’ own plots.',
    ],
    offers: ['Agricultural land', 'Home construction on your plot', 'Residential plots'],
    faqs: townFaqs('Malpura', 'Diggi Road'),
  },
  {
    slug: 'bilwa',
    name: 'Bilwa',
    corridor: 'Tonk Road',
    direction: 'south',
    distanceKm: 20,
    summary:
      'Residential plots, independent homes and construction in Bilwa, off Tonk Road about 20 km south of Jaipur near the Sitapura industrial area.',
    intro: [
      'Bilwa lies off Tonk Road on the southern edge of Jaipur, close to the Sitapura industrial area. New residential colonies here offer plots at a fraction of city prices, within easy reach of work.',
      'We list plots in and around Bilwa and build independent homes for families who already own land here.',
    ],
    offers: ['Residential plots', 'Independent homes on your plot', 'Commercial and warehouse buildings'],
    faqs: townFaqs('Bilwa', 'Tonk Road'),
  },
  {
    slug: 'shivdaspura',
    name: 'Shivdaspura',
    corridor: 'Tonk Road',
    direction: 'south',
    distanceKm: 25,
    summary:
      'Property and house construction in Shivdaspura on Tonk Road, between Sitapura and Chaksu, about 25 km south of Jaipur.',
    intro: [
      'Shivdaspura sits on Tonk Road between the Sitapura industrial area and Chaksu. It is close enough to the city to commute, with plot sizes that are hard to find in Jaipur itself.',
      'Its position on the corridor suits both family homes and small commercial or warehouse buildings.',
    ],
    offers: ['Residential plots', 'Independent homes', 'Commercial and warehouse buildings', 'Agricultural land'],
    faqs: townFaqs('Shivdaspura', 'Tonk Road'),
  },
  {
    slug: 'bagru',
    name: 'Bagru',
    corridor: 'Ajmer Road',
    direction: 'west',
    distanceKm: 30,
    summary:
      'Plots, land and home construction in Bagru on Ajmer Road, about 30 km west of Jaipur and beyond Mahindra World City.',
    intro: [
      'Bagru, famous for its hand-block printing, lies on Ajmer Road west of Jaipur. The corridor has grown quickly around Mahindra World City, which brings jobs and demand for housing.',
      'Buyers look here for residential plots and agricultural land, and for space to build factories and warehouses with highway access.',
    ],
    offers: ['Residential plots', 'Agricultural land', 'Home construction on your plot', 'Industrial and warehouse buildings'],
    faqs: townFaqs('Bagru', 'Ajmer Road'),
  },
  {
    slug: 'chomu',
    name: 'Chomu',
    corridor: 'Sikar Road',
    direction: 'north-west',
    distanceKm: 35,
    summary:
      'Property, plots and house construction in Chomu, the market town on Sikar Road about 35 km north-west of Jaipur.',
    intro: [
      'Chomu is a busy market town on Sikar Road, north-west of Jaipur, with its own schools, hospitals and shops. Families here often build independent homes on their own plots.',
      'We design and build modern homes in Chomu, and list plots and agricultural land around the town.',
    ],
    offers: ['Independent homes on your plot', 'Residential plots', 'Agricultural land', 'Shops and small commercial buildings'],
    faqs: townFaqs('Chomu', 'Sikar Road'),
  },
  {
    slug: 'bassi',
    name: 'Bassi',
    corridor: 'Agra Road',
    direction: 'east',
    distanceKm: 35,
    summary:
      'Plots, agricultural land and home construction in Bassi on Agra Road, about 35 km east of Jaipur.',
    intro: [
      'Bassi is a town on Agra Road, east of Jaipur, surrounded by farmland. It is a good fit for buyers who want agricultural land or a larger residential plot within reach of the city.',
      'We build homes on customers’ plots here and list land that we have checked on the ground.',
    ],
    offers: ['Agricultural land', 'Residential plots', 'Home construction on your plot'],
    faqs: townFaqs('Bassi', 'Agra Road'),
  },
  {
    slug: 'kanota',
    name: 'Kanota',
    corridor: 'Agra Road',
    direction: 'east',
    distanceKm: 15,
    summary:
      'Plots and home construction in Kanota on Agra Road, about 15 km east of Jaipur near Kanota Dam.',
    intro: [
      'Kanota lies on Agra Road just east of Jaipur, near Kanota Dam. Being so close to the city, it suits buyers who want a quieter plot without a long commute.',
      'We list plots here and build independent homes and villas for customers who already own land.',
    ],
    offers: ['Residential plots', 'Independent homes and villas', 'Agricultural land'],
    faqs: townFaqs('Kanota', 'Agra Road'),
  },
  {
    slug: 'kukas',
    name: 'Kukas',
    corridor: 'Delhi Road',
    direction: 'north',
    distanceKm: 20,
    summary:
      'Land, plots and villa construction in Kukas on Delhi Road, about 20 km north of Jaipur near Amer.',
    intro: [
      'Kukas is on Delhi Road north of Jaipur, near Amer, with hills on both sides and many resorts. It is popular for weekend homes and villas with views.',
      'We list land in the area and design and build villas for customers who want to build here.',
    ],
    offers: ['Villa construction on your plot', 'Residential plots', 'Agricultural land'],
    faqs: townFaqs('Kukas', 'Delhi Road'),
  },
  {
    slug: 'achrol',
    name: 'Achrol',
    corridor: 'Delhi Road',
    direction: 'north',
    distanceKm: 25,
    summary:
      'Plots, agricultural land and home construction in Achrol on Delhi Road, about 25 km north of Jaipur beyond Kukas.',
    intro: [
      'Achrol lies on Delhi Road beyond Kukas, north of Jaipur. Land here is more affordable than nearer the city, and the highway makes it easy to reach.',
      'Buyers come for agricultural land and larger plots, and we build homes for those who already own land.',
    ],
    offers: ['Agricultural land', 'Residential plots', 'Home construction on your plot'],
    faqs: townFaqs('Achrol', 'Delhi Road'),
  },
]
