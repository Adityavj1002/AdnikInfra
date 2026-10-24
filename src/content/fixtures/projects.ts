import { photos } from '../images'
import type { Project } from '../types'

// SAMPLE CONTENT: fictional projects for designing the templates. RERA numbers are null on
// purpose — a registration number must never be invented.

const lakh = (n: number) => ({ amount: Math.round(n * 100_000), currency: 'INR' as const })
const crore = (n: number) => ({ amount: Math.round(n * 10_000_000), currency: 'INR' as const })
const sqft = (value: number) => ({ value, unit: 'sqft' as const })
const sqyd = (value: number) => ({ value, unit: 'sqyd' as const })

export const projects: readonly Project[] = [
  {
    slug: 'vijay-aura-villas',
    name: 'Vijay Aura Villas',
    type: 'villa',
    status: 'ongoing',
    localitySlug: 'jagatpura',
    tagline: 'Modern 3 & 4 BHK villas in a gated community',
    summary:
      'Modern 3 and 4 BHK independent villas in a gated Jagatpura community, with a clubhouse, pool and private gardens. Possession from December 2027.',
    description: [
      'Vijay Aura Villas is a gated community of contemporary independent villas in Jagatpura. Every villa has its own garden, double-height living room and covered parking for two cars.',
      'Homes are built with an RCC frame, branded fittings and a design that brings in daylight while keeping summer heat out: deep overhangs, insulated roofs and cross-ventilation.',
    ],
    priceFrom: crore(1.45),
    configurations: [
      { label: '3 BHK Villa', area: sqft(1850), price: crore(1.45) },
      { label: '4 BHK Villa', area: sqft(2450), price: crore(1.89) },
      { label: '4 BHK Corner Villa', area: sqft(2650), price: crore(2.05) },
    ],
    possession: 'December 2027',
    rera: null,
    facts: [
      { label: 'Villas', value: '48' },
      { label: 'Land', value: '6 acres' },
      { label: 'Plot sizes', value: '200–270 sq yd' },
    ],
    amenities: ['gated', 'clubhouse', 'pool', 'gym', 'garden', 'kids-play', 'jogging-track', 'security', 'cctv', 'power-backup', 'solar', 'ev-charging', 'rainwater'],
    specifications: [
      { group: 'Structure', items: ['Earthquake-resistant RCC frame structure', 'AAC block masonry with insulated roof'] },
      { group: 'Flooring', items: ['Vitrified tiles 800×1600 mm in living areas', 'Wooden-finish tiles in bedrooms', 'Anti-skid tiles in bathrooms and balconies'] },
      { group: 'Kitchen', items: ['Modular kitchen with granite counter', 'Provision for water purifier and chimney'] },
      { group: 'Doors & windows', items: ['Teak-frame main door', 'UPVC windows with mosquito mesh'] },
      { group: 'Electrical', items: ['Concealed copper wiring', 'Modular switches', 'Provision for split ACs in all rooms'] },
    ],
    nearby: [
      { place: 'Jaipur International Airport', km: 9 },
      { place: 'Schools and colleges', km: 2 },
      { place: 'Hospital', km: 3 },
      { place: 'Shopping and markets', km: 2.5 },
    ],
    geo: { lat: 26.8197, lng: 75.858 },
    gallery: [photos.houseGable, photos.heroVillaPool, photos.villaPool, photos.livingRoom, photos.kitchenIsland, photos.bedroomMaster, photos.bathroom],
    updates: [
      { date: '2026-10-05', text: 'Phase 1 villa structures complete; brickwork and plumbing under way.' },
      { date: '2026-08-20', text: 'Clubhouse foundation poured and internal roads laid.' },
      { date: '2026-06-10', text: 'Construction started on phase 1 (24 villas).' },
    ],
    featured: true,
    updatedAt: '2026-10-18',
  },
  {
    slug: 'vijay-skyline-residences',
    name: 'Vijay Skyline Residences',
    type: 'apartment',
    status: 'ongoing',
    localitySlug: 'vaishali-nagar',
    tagline: '2 & 3 BHK apartments in west Jaipur',
    summary:
      'Bright 2 and 3 BHK apartments in Vaishali Nagar with lifts, gym, kids’ play area and covered parking, close to markets and schools.',
    description: [
      'Vijay Skyline Residences is a G+12 apartment building in Vaishali Nagar designed around light and air: every home has at least two balconies and windows on two sides.',
      'Shared facilities include a gym, community hall, kids’ play area, EV charging and 24×7 security, all within walking distance of Vaishali Nagar’s markets.',
    ],
    priceFrom: lakh(68),
    configurations: [
      { label: '2 BHK', area: sqft(1150), price: lakh(68) },
      { label: '3 BHK', area: sqft(1480), price: lakh(88) },
      { label: '3 BHK + Study', area: sqft(1650), price: lakh(98) },
    ],
    possession: 'June 2028',
    rera: null,
    facts: [
      { label: 'Floors', value: 'G + 12' },
      { label: 'Homes', value: '96' },
      { label: 'Lifts', value: '3 incl. service' },
    ],
    amenities: ['lift', 'gym', 'community-hall', 'kids-play', 'parking', 'power-backup', 'security', 'cctv', 'ev-charging', 'rainwater', 'wifi'],
    specifications: [
      { group: 'Structure', items: ['Earthquake-resistant RCC frame structure', 'AAC block masonry'] },
      { group: 'Flooring', items: ['Vitrified tiles in all rooms', 'Anti-skid tiles in bathrooms and balconies'] },
      { group: 'Kitchen', items: ['Granite counter with stainless-steel sink', 'Provision for modular kitchen'] },
      { group: 'Electrical', items: ['Concealed copper wiring', 'Power backup for lifts and common areas'] },
    ],
    nearby: [
      { place: 'Markets and restaurants', km: 1 },
      { place: 'Schools', km: 1.5 },
      { place: 'Hospital', km: 2 },
      { place: 'Railway station', km: 9 },
    ],
    geo: { lat: 26.9116, lng: 75.7425 },
    gallery: [photos.apartmentsModern, photos.apartmentsFacade, photos.livingApartment, photos.kitchenModular, photos.bedroomCity, photos.bathroom],
    updates: [
      { date: '2026-09-28', text: 'Fourth-floor slab cast.' },
      { date: '2026-07-15', text: 'Basement parking structure complete.' },
    ],
    featured: true,
    updatedAt: '2026-10-12',
  },
  {
    slug: 'vijay-greens',
    name: 'Vijay Greens',
    type: 'plot',
    status: 'upcoming',
    localitySlug: 'ajmer-road',
    tagline: 'Residential plots in a gated layout',
    summary:
      'Residential plots of 150–300 sq yd on Ajmer Road in a gated layout with wide roads, parks and the option to have us build your home.',
    description: [
      'Vijay Greens is a gated plotted development on Ajmer Road with 40- and 30-foot internal roads, parks and underground utilities.',
      'Buy a plot on its own, or with a home designed and built by our construction team for one combined, stage-wise payment plan.',
    ],
    priceFrom: lakh(32),
    configurations: [
      { label: 'Residential plot', area: [sqyd(150), sqyd(300)], price: lakh(32) },
      { label: 'Plot + villa (build package)', area: sqyd(200), price: lakh(84) },
    ],
    possession: 'Plot registry from March 2027',
    rera: null,
    facts: [
      { label: 'Plots', value: '120' },
      { label: 'Roads', value: '30–40 ft' },
      { label: 'Parks', value: '3' },
    ],
    amenities: ['gated', 'garden', 'kids-play', 'jogging-track', 'security', 'rainwater'],
    specifications: [
      { group: 'Infrastructure', items: ['Paved internal roads with street lighting', 'Underground electricity and water lines', 'Storm-water drainage'] },
      { group: 'Common areas', items: ['Landscaped parks', 'Boundary wall with guarded entrance'] },
    ],
    nearby: [
      { place: 'National highway', km: 1 },
      { place: 'Schools', km: 4 },
      { place: 'Hospital', km: 6 },
    ],
    geo: { lat: 26.895, lng: 75.69 },
    gallery: [photos.rowVillas, photos.jaipurAerial, photos.houseModernDay],
    updates: [{ date: '2026-09-01', text: 'Layout planning and approvals in progress. Register your interest for launch prices.' }],
    featured: true,
    updatedAt: '2026-10-08',
  },
  {
    slug: 'vijay-courtyard-homes',
    name: 'Vijay Courtyard Homes',
    type: 'villa',
    status: 'completed',
    localitySlug: 'mansarovar',
    tagline: 'Completed 4 BHK villas, families living here since 2025',
    summary:
      'A completed community of 4 BHK courtyard villas in Mansarovar, handed over in 2025. A few resale homes are occasionally available.',
    description: [
      'Vijay Courtyard Homes was completed and handed over in 2025. Each villa is planned around a private central courtyard that brings light into every room.',
      'All homes are occupied. Ask us about resale availability or a similar home in one of our current projects.',
    ],
    priceFrom: null,
    configurations: [{ label: '4 BHK Courtyard Villa', area: sqft(2600), price: null }],
    possession: 'Handed over 2025',
    rera: null,
    facts: [
      { label: 'Villas', value: '32' },
      { label: 'Completed', value: '2025' },
    ],
    amenities: ['gated', 'garden', 'security', 'cctv', 'power-backup', 'parking'],
    specifications: [{ group: 'Structure', items: ['RCC frame structure', 'Private courtyard in every villa'] }],
    nearby: [
      { place: 'Metro station', km: 1.5 },
      { place: 'Markets', km: 1 },
    ],
    geo: { lat: 26.8695, lng: 75.76 },
    gallery: [photos.houseModernDay, photos.villaEntrance, photos.livingRoom, photos.kitchenIsland],
    updates: [{ date: '2025-03-15', text: 'Project completed and all villas handed over.' }],
    featured: false,
    updatedAt: '2026-06-01',
  },
  {
    slug: 'vijay-business-park',
    name: 'Vijay Business Park',
    type: 'commercial',
    status: 'upcoming',
    localitySlug: 'tonk-road',
    tagline: 'Offices and showrooms on Tonk Road',
    summary:
      'Offices and ground-floor showrooms on Tonk Road, from 450 to 2,000 sq ft, with high-speed lifts, parking and power backup.',
    description: [
      'Vijay Business Park brings flexible office floors and street-facing showrooms to Tonk Road.',
      'Units from 450 sq ft can be combined into larger floors, with dedicated parking, power backup and fibre connectivity.',
    ],
    priceFrom: lakh(55),
    configurations: [
      { label: 'Office space', area: [sqft(450), sqft(2000)], price: lakh(55) },
      { label: 'Ground-floor showroom', area: [sqft(600), sqft(1200)], price: crore(1.2) },
    ],
    possession: 'Launching 2027',
    rera: null,
    facts: [
      { label: 'Floors', value: 'G + 7' },
      { label: 'Frontage', value: 'Tonk Road' },
    ],
    amenities: ['lift', 'parking', 'power-backup', 'security', 'cctv', 'wifi', 'ev-charging'],
    specifications: [{ group: 'Building', items: ['Glass facade with high-performance glazing', 'High-speed lifts', 'Fibre-ready floors'] }],
    nearby: [
      { place: 'Airport', km: 6 },
      { place: 'Railway station', km: 8 },
    ],
    geo: { lat: 26.852, lng: 75.8 },
    gallery: [photos.officeTower, photos.constructionPlans],
    updates: [{ date: '2026-09-10', text: 'Design finalised; register interest for priority allotment.' }],
    featured: false,
    updatedAt: '2026-09-20',
  },
]
