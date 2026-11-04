import { livPrime, villasSkit } from '../images'
import type { Project, UnitArea } from '../types'

// Liv Prime, the company's own project, from its brochure (photos, location and details only).
// An admin can edit it in Admin → Projects; this is the default. The RERA number is left out on
// purpose: the brochure's registration was issued under the company's old name.

const sqft = (value: number) => ({ value, unit: 'sqft' as const })
const sqyd = (value: number) => ({ value, unit: 'sqyd' as const })

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
  {
    slug: 'villas-near-skit-college-jagatpura',
    name: 'Villas near SKIT College',
    type: 'villa',
    status: 'ongoing',
    localitySlug: 'jagatpura',
    tagline: '4 BHK villas on 18 × 35 plots, JDA approved',
    summary:
      '4 BHK villas on 18 × 35 plots near SKIT College, Jagatpura: JDA approved, in a gated colony, with covered car parking. Now under construction.',
    description: [
      'Independent 4 BHK villas on 18 × 35 ft plots in a gated, JDA-approved colony near SKIT College in Jagatpura, Jaipur. Each villa rises ground plus two floors, with a terrace above.',
      'The ground floor has a covered car parking, a front lawn, a lobby with a puja space and a master bedroom. The first floor holds the kitchen, an 18-foot lounge and dining room, a second master bedroom and a balcony. The second floor has two more bedrooms and a balcony. Every bedroom has its own toilet.',
      'Construction is under way: the structure is up to the second floor. Call or WhatsApp to visit the site.',
    ],
    address: 'Near SKIT College, Jagatpura, Jaipur, Rajasthan',
    configurations: [{ label: '4 BHK villa', area: sqyd(70) }],
    plans: [villasSkit.plans],
    film: {
      title: 'Villas near SKIT College: the design and the site today',
      description:
        'How the 18 × 35 villas near SKIT College, Jagatpura, will look, the construction in November 2026, and the floor plans for all three levels.',
      poster: '/media/villas-skit-film-poster.jpg',
      sources: [{ src: '/media/villas-skit-film.mp4', type: 'video/mp4' }],
      duration: 'PT21S',
      uploadDate: '2026-11-05',
      transcript: [
        'An artist’s impression of the villa: ground plus two floors in brick, white and charcoal, with a covered car parking. 4 BHK villas on 18 × 35 plots near SKIT College, Jagatpura. JDA approved, gated colony, car parking.',
        'On site in November 2026: construction under way, with ground plus two floors taking shape.',
        'Floor plans: ground floor with car parking, lawn and a bedroom with toilet; first floor with kitchen, lounge and a bedroom with toilet; second floor with two bedrooms, two toilets and a balcony.',
        'Book a site visit. Call or WhatsApp 77372 09850.',
      ],
    },
    possession: 'On request',
    rera: null,
    facts: [
      { label: 'Plot size', value: '18 × 35 ft (70 sq yd)' },
      { label: 'Floors', value: 'Ground + 2, with terrace' },
      { label: 'Bedrooms', value: '4, each with a toilet' },
      { label: 'Approval', value: 'JDA approved' },
      { label: 'Colony', value: 'Gated' },
      { label: 'Parking', value: 'Covered car parking' },
    ],
    amenities: ['gated', 'parking'],
    specifications: [
      {
        group: 'Ground floor',
        items: ['Covered car parking', 'Front lawn (10 ft)', 'Lobby, 5′6″ wide, with a puja space', 'Master bedroom 12′0″ × 10′3″ with toilet', 'Store under the stair'],
      },
      {
        group: 'First floor',
        items: ['Lounge and dining 9′6″ × 18′0″', 'Kitchen 7′10½″ × 10′0″', 'Master bedroom 12′0″ × 10′3″ with toilet', 'Balcony, 4′0″ wide'],
      },
      {
        group: 'Second floor',
        items: ['Master bedroom 12′0″ × 10′3″ with toilet', 'Bedroom 12′0″ × 10′0″ with toilet', 'Balcony, 6′6″ wide', 'Passage, 4′0″ wide'],
      },
    ],
    nearby: [],
    geo: { lat: 26.8197, lng: 75.858 },
    gallery: [villasSkit.front, villasSkit.site],
    updates: [{ date: '2026-11-04', text: 'The structure is up to the second floor; plaster work is under way.' }],
    featured: false,
    updatedAt: '2026-11-05',
  },
]
