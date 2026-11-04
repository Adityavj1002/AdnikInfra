import agriculturalLand from '@/assets/images/agricultural-land.jpg'
import apartmentsFacade from '@/assets/images/apartments-facade.jpg'
import apartmentsModern from '@/assets/images/apartments-modern.jpg'
import bathroom from '@/assets/images/bathroom.jpg'
import bedroomCity from '@/assets/images/bedroom-city.jpg'
import bedroomMaster from '@/assets/images/bedroom-master.jpg'
import constructionPlans from '@/assets/images/construction-plans.jpg'
import constructionRebar from '@/assets/images/construction-rebar.jpg'
import constructionSite from '@/assets/images/construction-site.jpg'
import engineerSite from '@/assets/images/engineer-site.jpg'
import floorPlan from '@/assets/images/floor-plan.jpg'
import handoverKeys from '@/assets/images/handover-keys.jpg'
import heroVillaPool from '@/assets/images/hero-villa-pool.jpg'
import houseGable from '@/assets/images/house-gable.jpg'
import houseGlassNight from '@/assets/images/house-glass-night.jpg'
import houseModernDay from '@/assets/images/house-modern-day.jpg'
import jaipurAerial from '@/assets/images/jaipur-aerial.jpg'
import kitchenIsland from '@/assets/images/kitchen-island.jpg'
import kitchenModular from '@/assets/images/kitchen-modular.jpg'
import livAerial from '@/assets/images/liv-prime/aerial.jpg'
import livBanquetHall from '@/assets/images/liv-prime/banquet-hall.jpg'
import livExteriorFront from '@/assets/images/liv-prime/exterior-front.jpg'
import livExteriorStreet from '@/assets/images/liv-prime/exterior-street.jpg'
import livGamesRoom from '@/assets/images/liv-prime/games-room.jpg'
import livGym from '@/assets/images/liv-prime/gym.jpg'
import livIndoorPool from '@/assets/images/liv-prime/indoor-pool.jpg'
import livKidsPlayroom from '@/assets/images/liv-prime/kids-playroom.jpg'
import livLibrary from '@/assets/images/liv-prime/library.jpg'
import livPlan2bhk from '@/assets/images/liv-prime/plan-2bhk-3d.jpg'
import livPlan3bhk from '@/assets/images/liv-prime/plan-3bhk-3d.jpg'
import livTheatre from '@/assets/images/liv-prime/private-theatre.jpg'
import livingApartment from '@/assets/images/living-apartment.jpg'
import livingRoom from '@/assets/images/living-room.jpg'
import officeTower from '@/assets/images/office-tower.jpg'
import rowVillas from '@/assets/images/row-villas.jpg'
import villaEntrance from '@/assets/images/villa-entrance.jpg'
import villaPool from '@/assets/images/villa-pool.jpg'
import type { Img } from './types'

/**
 * SAMPLE PHOTOGRAPHY: CC0 and CC BY placeholders (see src/assets/images/CREDITS.md). Replace with the
 * company's own renders and site photos before launch. Alt text describes what is shown.
 */
export const photos = {
  heroVillaPool: {
    src: heroVillaPool,
    alt: 'Three-level modern villa with glass walls, timber soffits and an infinity pool, lit at dusk',
  },
  houseGable: { src: houseGable, alt: 'Contemporary two-gable home with timber cladding and full-height glass, in a green garden' },
  villaPool: { src: villaPool, alt: 'Single-storey modern villa beside a swimming pool and deck' },
  houseModernDay: { src: houseModernDay, alt: 'Contemporary white and charcoal house with large windows and a landscaped garden' },
  houseGlassNight: { src: houseGlassNight, alt: 'Three-storey glass-fronted home lit up at night' },
  villaEntrance: { src: villaEntrance, alt: 'Villa entrance with dark brick, glass doors and stone steps' },
  rowVillas: { src: rowVillas, alt: 'Row of modern white townhouses along a paved, tree-lined lane' },
  apartmentsFacade: { src: apartmentsFacade, alt: 'Clean white apartment building facade with square windows' },
  apartmentsModern: { src: apartmentsModern, alt: 'Modern apartment block with white and red facade panels against a blue sky' },
  officeTower: { src: officeTower, alt: 'Glass office tower seen from below' },
  livingRoom: { src: livingRoom, alt: 'Bright living room with a full-height window, dark sofa and lounge chair' },
  livingApartment: { src: livingApartment, alt: 'Apartment living room with a white sofa and wooden TV wall' },
  kitchenIsland: { src: kitchenIsland, alt: 'Open kitchen with a white island, wood cabinets and built-in appliances' },
  kitchenModular: { src: kitchenModular, alt: 'Modular kitchen with cream cabinets and a window over the sink' },
  bedroomMaster: { src: bedroomMaster, alt: 'Master bedroom with warm lighting and a walk-in wardrobe' },
  bedroomCity: { src: bedroomCity, alt: 'Bedroom with a large window overlooking the city' },
  bathroom: { src: bathroom, alt: 'Modern bathroom with a freestanding tub beside a window' },
  constructionSite: { src: constructionSite, alt: 'Building site with steel reinforcement and workers in safety gear' },
  constructionPlans: { src: constructionPlans, alt: 'Site engineer reviewing plans on a clipboard' },
  constructionRebar: { src: constructionRebar, alt: 'Worker tying steel reinforcement for a concrete slab' },
  engineerSite: { src: engineerSite, alt: 'Engineer in a hard hat inspecting a house under construction' },
  floorPlan: { src: floorPlan, alt: 'Architectural floor plan with a ruler' },
  handoverKeys: { src: handoverKeys, alt: 'Hand holding the keys to a new home' },
  jaipurAerial: { src: jaipurAerial, alt: 'Aerial view across Jaipur city' },
  agriculturalLand: { src: agriculturalLand, alt: 'Open agricultural land with dry grass under an evening sky' },
} as const satisfies Record<string, Img>

/** Liv Prime: the company's own renders, from the project brochure. */
export const livPrime = {
  exteriorFront: { src: livExteriorFront, alt: 'Liv Prime, Jagatpura: seven-level apartment building in beige, grey and brown, seen from the road' },
  exteriorStreet: { src: livExteriorStreet, alt: 'Liv Prime apartments along Ram Nagariya Road, Jagatpura, with landscaped frontage' },
  aerial: { src: livAerial, alt: 'Aerial view of Liv Prime with landscaped terraces, surrounded by trees' },
  indoorPool: { src: livIndoorPool, alt: 'Indoor swimming pool at Liv Prime with timber walls and a slatted ceiling' },
  gym: { src: livGym, alt: 'Gym at Liv Prime with weight benches and mirrored walls' },
  library: { src: livLibrary, alt: 'Library and reading room at Liv Prime with timber shelves and lounge chairs' },
  theatre: { src: livTheatre, alt: 'Private theatre at Liv Prime with red recliner seats and a large screen' },
  gamesRoom: { src: livGamesRoom, alt: 'Games room at Liv Prime with a pool table and sports equipment' },
  kidsPlayroom: { src: livKidsPlayroom, alt: 'Kids’ playroom at Liv Prime with a ball pit, toys and a colourful wall' },
  banquetHall: { src: livBanquetHall, alt: 'Banquet hall at Liv Prime with a chandelier and dining tables' },
  plan2bhk: { src: livPlan2bhk, alt: '3D plan of a 2 BHK apartment at Liv Prime: two bedrooms, two bathrooms, kitchen, living and dining' },
  plan3bhk: { src: livPlan3bhk, alt: '3D plan of a 3 BHK apartment at Liv Prime: three bedrooms, kitchen, living and dining' },
} as const satisfies Record<string, Img>
