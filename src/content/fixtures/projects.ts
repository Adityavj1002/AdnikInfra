import { livPrime } from '../images'
import type { Project, UnitArea } from '../types'

// Liv Prime, the company's own project, from its brochure (photos, location and details only).
// An admin can edit it in Admin → Projects; this is the default. The RERA number is left out on
// purpose: the brochure's registration was issued under the company's old name.

const sqft = (value: number) => ({ value, unit: 'sqft' as const })

// Unit areas from the approved plan (sq ft). Unit 103 / 503 means the same plan on floors 1 to 5.
const livPrimeUnits: readonly UnitArea[] = [
  { unit: '103 / 503', bhk: 2, carpet: 702.02, builtUp: 830.82, superBuiltUp: 1163.15 },
  { unit: '104 / 504', bhk: 2, carpet: 703.75, builtUp: 801.45, superBuiltUp: 1122.03 },
  { unit: '107 / 507', bhk: 2, carpet: 671.35, builtUp: 814.97, superBuiltUp: 1140.96 },
  { unit: '110 / 510', bhk: 2, carpet: 792.98, builtUp: 909.16, superBuiltUp: 1272.83 },
  { unit: '111 / 511', bhk: 2, carpet: 658.54, builtUp: 792.56, superBuiltUp: 1109.58 },
  { unit: '112 / 512', bhk: 2, carpet: 691.04, builtUp: 818.95, superBuiltUp: 1146.53 },
  { unit: '114 / 514', bhk: 2, carpet: 698.90, builtUp: 791.25, superBuiltUp: 1107.75 },
  { unit: '116 / 516', bhk: 2, carpet: 714.83, builtUp: 817.00, superBuiltUp: 1143.80 },
  { unit: '101 / 501', bhk: 3, carpet: 960.68, builtUp: 1175.72, superBuiltUp: 1646.00 },
  { unit: '102 / 502', bhk: 3, carpet: 963.48, builtUp: 1183.54, superBuiltUp: 1656.95 },
  { unit: '105 / 505', bhk: 3, carpet: 889.32, builtUp: 1059.19, superBuiltUp: 1482.87 },
  { unit: '106 / 506', bhk: 3, carpet: 876.18, builtUp: 1032.55, superBuiltUp: 1445.57 },
  { unit: '108 / 508', bhk: 3, carpet: 929.68, builtUp: 1089.97, superBuiltUp: 1525.96 },
  { unit: '109 / 509', bhk: 3, carpet: 938.72, builtUp: 1116.86, superBuiltUp: 1563.61 },
  { unit: '113 / 513', bhk: 3, carpet: 851.10, builtUp: 1007.86, superBuiltUp: 1411.01 },
  { unit: '115 / 515', bhk: 3, carpet: 935.06, builtUp: 1070.53, superBuiltUp: 1498.74 },
  { unit: '117 / 517', bhk: 3, carpet: 920.86, builtUp: 1083.86, superBuiltUp: 1517.41 },
]

export const projects: readonly Project[] = [
  {
    slug: 'liv-prime-jagatpura',
    name: 'Liv Prime',
    type: 'apartment',
    status: 'ongoing',
    localitySlug: 'jagatpura',
    tagline: '2 & 3 BHK luxury apartments near SKIT College',
    summary:
      '2 and 3 BHK luxury apartments and penthouses on Ram Nagariya Road, near SKIT College, Jagatpura, Jaipur, with an indoor pool, gym and 20+ amenities.',
    description: [
      'Liv Prime is a stilt-plus-six-floor residential building on Ram Nagariya Road in Jagatpura, a short walk from SKIT College. It offers 2 BHK and 3 BHK apartments and penthouses, with 17 homes on each floor: nine 3 BHK and eight 2 BHK.',
      'Homes open off a 5′3″-wide central corridor served by three high-speed lifts and two staircases, with open terraces above. The layouts are Vastu-friendly, and every home has a modular kitchen, UPVC windows, wardrobes in each bedroom and a smart lock on the main door.',
      'Residents share an amenity floor with an indoor swimming pool and deck, a gym, a library and reading room, a private theatre, a games room, a kids’ playroom, a banquet hall with a pre-function area and a guest room.',
    ],
    address: 'Ram Nagariya Road, near SKIT College, Jagatpura, Jaipur, Rajasthan 302017',
    configurations: [
      { label: '2 BHK', area: [sqft(1107.75), sqft(1272.83)] },
      { label: '3 BHK', area: [sqft(1411.01), sqft(1656.95)] },
    ],
    units: livPrimeUnits,
    plans: [livPrime.plan2bhk, livPrime.plan3bhk],
    possession: 'On request',
    rera: null,
    facts: [
      { label: 'Floors', value: 'Stilt + 6' },
      { label: 'Homes per floor', value: '17 (9 × 3 BHK, 8 × 2 BHK)' },
      { label: 'Lifts', value: '3 high-speed' },
      { label: 'Staircases', value: '2' },
      { label: 'Penthouses', value: 'Available' },
      { label: 'Amenities', value: '20+' },
    ],
    amenities: [
      'pool',
      'gym',
      'library',
      'theatre',
      'indoor-games',
      'kids-play',
      'banquet',
      'guest-room',
      'lift',
      'security',
      'power-backup',
      'parking',
      'water-supply',
      'rainwater',
      'ev-charging',
      'vastu',
      'accessible',
    ],
    specifications: [
      {
        group: 'Structure',
        items: ['RCC framed, earthquake-resistant structure', '100% ISI standard steel', '3-side open, with brick partition walls', 'Fire-fighting system and emergency exit'],
      },
      {
        group: 'Flooring',
        items: ['Vitrified tile flooring in all rooms', 'Designer ceramic tiles in bathrooms', 'POP finish on walls and ceilings', 'False ceiling in drawing, dining and bedroom'],
      },
      {
        group: 'Kitchen',
        items: ['Modular kitchen (without chimney)', 'Premium granite on the working counter', 'Stainless-steel sink and geyser provision', '2 ft dado above the counter and RO provision'],
      },
      {
        group: 'Bathrooms',
        items: ['Designer ceramic tiles up to 8 ft', 'Vitrified tile flooring', 'Premium CP fittings and sanitary ware', 'Floor-mounted WC, false ceiling and exhaust'],
      },
      {
        group: 'Electrical',
        items: ['Premium wires and modular switches', 'AC copper piping in all rooms', 'Provision for an inverter', 'Fans and lights in every room'],
      },
      {
        group: 'Doors & windows',
        items: ['UPVC windows throughout', 'Premium laminated flush doors', 'Designer fittings on all doors', 'Wardrobes and TV cabinet in each bedroom', 'Smart lock on every flat’s main door'],
      },
    ],
    nearby: [
      { place: 'SKIT College', km: 0.3 },
      { place: 'Ram Nagariya Police Station', km: 0.4 },
      { place: 'SRN International School', km: 0.4 },
      { place: 'EuroKids Preschool', km: 0.5 },
      { place: 'Suresh Gyan Vihar University', km: 1.3 },
      { place: 'D-Mart, Jagatpura', km: 2.2 },
      { place: '7 No. Chauraha', km: 2.5 },
      { place: 'Akshaya Patra (ISKCON)', km: 2.5 },
      { place: 'Jaipur Chaupati, Pratap Nagar', km: 2.5 },
      { place: 'Jeevan Rekha Hospital', km: 3 },
      { place: 'Jankidevi Public School', km: 3 },
      { place: 'Jayshree Periwal Global School', km: 4 },
      { place: 'Khatipura Railway Station', km: 4 },
      { place: 'Jagatpura Railway Station', km: 4.7 },
      { place: 'Ring Road', km: 5 },
      { place: 'Poornima University', km: 6 },
      { place: 'Ryan International School', km: 6 },
      { place: 'JECRC University', km: 6.5 },
      { place: 'Bombay Hospital', km: 7.4 },
      { place: 'Mahatma Gandhi Hospital', km: 7.5 },
      { place: 'Jaipur International Airport', km: 8.5 },
      { place: 'World Trade Park', km: 9 },
      { place: 'Gandhi Nagar Railway Station', km: 11 },
    ],
    // Jagatpura's centre: map links search the street address above instead.
    geo: { lat: 26.8197, lng: 75.858 },
    gallery: [
      livPrime.exteriorFront,
      livPrime.exteriorStreet,
      livPrime.aerial,
      livPrime.indoorPool,
      livPrime.gym,
      livPrime.library,
      livPrime.theatre,
      livPrime.gamesRoom,
      livPrime.kidsPlayroom,
      livPrime.banquetHall,
    ],
    updates: [],
    featured: true,
    updatedAt: '2026-11-04',
  },
]
