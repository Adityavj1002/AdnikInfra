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
import heroVillaDusk from '@/assets/images/hero-villa-dusk.jpg'
import houseGlassNight from '@/assets/images/house-glass-night.jpg'
import houseModernDay from '@/assets/images/house-modern-day.jpg'
import jaipurAerial from '@/assets/images/jaipur-aerial.jpg'
import kitchenIsland from '@/assets/images/kitchen-island.jpg'
import kitchenModular from '@/assets/images/kitchen-modular.jpg'
import livingApartment from '@/assets/images/living-apartment.jpg'
import livingRoom from '@/assets/images/living-room.jpg'
import officeTower from '@/assets/images/office-tower.jpg'
import rowVillas from '@/assets/images/row-villas.jpg'
import villaEntrance from '@/assets/images/villa-entrance.jpg'
import villaPool from '@/assets/images/villa-pool.jpg'
import type { Img } from './types'

/**
 * SAMPLE PHOTOGRAPHY: CC0 placeholders (see src/assets/images/CREDITS.md). Replace with the
 * company's own renders and site photos before launch. Alt text describes what is shown.
 */
export const photos = {
  heroVillaDusk: { src: heroVillaDusk, alt: 'Modern two-storey villa with glass walls and a lit pool at dusk' },
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
} as const satisfies Record<string, Img>
