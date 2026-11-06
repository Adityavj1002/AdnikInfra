/**
 * Bundled images that also live on Cloudinary, by file name (scripts/upload-images.mjs uploads
 * them under these ids). The image loader serves these from Cloudinary's CDN; a unit test fails
 * if a new image is added to the code without an entry here.
 */
export const cloudImages: Readonly<Record<string, string>> = {
  'adnik-emblem': 'adnik/site/adnik-emblem',
  'adnik-infra-logo-512': 'adnik/site/adnik-infra-logo-512',
  'adnik-logo': 'adnik/site/adnik-logo',
  'agricultural-land': 'adnik/site/agricultural-land',
  'apartments-facade': 'adnik/site/apartments-facade',
  'apartments-modern': 'adnik/site/apartments-modern',
  'bathroom': 'adnik/site/bathroom',
  'bedroom-city': 'adnik/site/bedroom-city',
  'bedroom-master': 'adnik/site/bedroom-master',
  'construction-plans': 'adnik/site/construction-plans',
  'construction-rebar': 'adnik/site/construction-rebar',
  'construction-site': 'adnik/site/construction-site',
  'engineer-site': 'adnik/site/engineer-site',
  'floor-plan': 'adnik/site/floor-plan',
  'handover-keys': 'adnik/site/handover-keys',
  'hero-villa-pool': 'adnik/site/hero-villa-pool',
  'house-gable': 'adnik/site/house-gable',
  'house-glass-night': 'adnik/site/house-glass-night',
  'house-modern-day': 'adnik/site/house-modern-day',
  'jaipur-aerial': 'adnik/site/jaipur-aerial',
  'kitchen-island': 'adnik/site/kitchen-island',
  'kitchen-modular': 'adnik/site/kitchen-modular',
  'living-apartment': 'adnik/site/living-apartment',
  'living-room': 'adnik/site/living-room',
  'naigrowth-logo': 'adnik/site/naigrowth-logo',
  'office-tower': 'adnik/site/office-tower',
  'row-villas': 'adnik/site/row-villas',
  'villa-entrance': 'adnik/site/villa-entrance',
  'villa-pool': 'adnik/site/villa-pool',
  'warehouse-racking': 'adnik/site/warehouse-racking',
}
