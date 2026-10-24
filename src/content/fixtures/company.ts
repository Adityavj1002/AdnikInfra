import { site } from '@/config/site'
import { photos } from '../images'
import type { ConstructionPackage, Post, Stat } from '../types'

// SAMPLE CONTENT: rates, stats and articles to design the templates. Replace with real figures.

/** Indicative 2026 rates per sq ft of built-up area. Shown with an "indicative" note everywhere. */
export const packages: readonly ConstructionPackage[] = [
  {
    slug: 'standard',
    name: 'Standard',
    ratePerSqft: 1650,
    summary: 'A solid, well-finished home with dependable materials.',
    inclusions: [
      'Architectural plan and structural design',
      'RCC frame with branded cement and TMT steel',
      'Vitrified tile flooring',
      'Standard sanitaryware and fittings',
      'Concealed electrical wiring',
    ],
  },
  {
    slug: 'premium',
    name: 'Premium',
    ratePerSqft: 1950,
    summary: 'Better finishes and more design, our most chosen package.',
    inclusions: [
      'Everything in Standard',
      '3D elevation and interior layout',
      'Large-format tiles and granite counters',
      'Premium sanitaryware and UPVC windows',
      'Modular kitchen shell',
    ],
  },
  {
    slug: 'luxury',
    name: 'Luxury',
    ratePerSqft: 2450,
    summary: 'Top-grade materials, smart-home wiring and full interiors.',
    inclusions: [
      'Everything in Premium',
      'Italian marble or engineered wood flooring',
      'Smart-home and security wiring',
      'Designer lighting and false ceilings',
      'Complete modular kitchen and wardrobes',
    ],
  },
]

export const stats: readonly Stat[] = [
  { value: '12+', label: 'Years building in Jaipur' },
  // Supplied by the client (2026-10-24).
  { value: '60+', label: 'Homes delivered' },
  { value: String(site.serviceArea.towns.length), label: 'Towns served near Jaipur' },
  { value: '6', label: 'Localities across Jaipur' },
]

export const posts: readonly Post[] = [
  {
    slug: 'house-construction-cost-jaipur',
    title: 'House construction cost in Jaipur: what you pay for per sq ft',
    summary:
      'What goes into the price per sq ft of building a house in Jaipur — structure, finishes, approvals — and how to compare quotes fairly.',
    published: '2026-09-20',
    updatedAt: '2026-10-10',
    readingMinutes: 6,
    cover: photos.constructionSite,
    body: [
      { type: 'p', text: 'The price per square foot is the number every quote leads with, but two quotes at the same rate can describe very different houses. Here is what the rate usually covers, and what to check.' },
      { type: 'h2', text: 'What the rate covers' },
      { type: 'ul', items: ['Structure: foundation, RCC frame, slabs and masonry', 'Finishes: flooring, plaster, paint, doors and windows', 'Services: electrical, plumbing and drainage', 'Design: architectural drawings and structural design'] },
      { type: 'h2', text: 'What often costs extra' },
      { type: 'ul', items: ['Approval and authority fees', 'Boundary walls, gates and landscaping', 'Basements and very deep foundations', 'Furniture, appliances and loose interiors'] },
      { type: 'h2', text: 'How to compare quotes' },
      { type: 'p', text: 'Ask every builder for the same thing: a written specification with brands, a stage-wise payment schedule and a timeline. Compare like with like, not just the headline rate.' },
    ],
  },
  {
    slug: 'home-buying-checklist-jaipur',
    title: 'Buying a new home in Jaipur: a 10-point checklist',
    summary:
      'A practical checklist for buying a flat or villa in Jaipur: RERA registration, approvals, carpet area, payment plans and possession terms.',
    published: '2026-08-30',
    updatedAt: '2026-08-30',
    readingMinutes: 7,
    cover: photos.handoverKeys,
    body: [
      { type: 'p', text: 'Buying a home is the biggest purchase most families make. These checks take a few hours and can save years of trouble.' },
      { type: 'ul', items: [
        'Check the project’s registration on the Rajasthan RERA website (rera.rajasthan.gov.in).',
        'Confirm the land title and the approved building plan.',
        'Compare prices on carpet area, not only super built-up area.',
        'Read the possession date and the delay clause in the agreement.',
        'Ask for a stage-wise payment plan linked to construction progress.',
        'Get the specification list with brands in writing.',
        'Visit the site, and talk to people who already live in the builder’s earlier projects.',
        'Check the maintenance charges and who manages the society.',
        'Get your home loan pre-approved before you book.',
        'Keep copies of every receipt and document.',
      ] },
    ],
  },
  {
    slug: 'modular-homes-explained',
    title: 'Modular homes explained: faster, cleaner construction on your plot',
    summary:
      'How modular and prefab-assisted construction works, where it saves time on a house in Jaipur, and what still has to be built on site.',
    published: '2026-07-12',
    updatedAt: '2026-07-12',
    readingMinutes: 5,
    cover: photos.houseGlassNight,
    body: [
      { type: 'p', text: 'In modular construction, parts of the house are made in a factory while the foundation is prepared on site, then assembled. The result is a shorter, tidier building phase.' },
      { type: 'h2', text: 'What is made off site' },
      { type: 'ul', items: ['Wall and floor panels', 'Staircases and railings', 'Kitchen and wardrobe units', 'Bathroom pods in some designs'] },
      { type: 'h2', text: 'Where it helps' },
      { type: 'p', text: 'Factory-made parts are built to tighter tolerances and are not held up by weather. On many houses this shortens the on-site schedule by several weeks.' },
    ],
  },
]
