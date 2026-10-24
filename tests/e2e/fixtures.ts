/** Every page template, with the primary keyword its H1 must carry. */
export const pages = [
  { path: '/', keyword: 'builders in jaipur' },
  { path: '/projects', keyword: 'new residential projects in jaipur' },
  { path: '/projects/vijay-aura-villas', keyword: 'vijay aura villas, jagatpura' },
  { path: '/projects/vijay-greens', keyword: 'vijay greens, ajmer road' },
  { path: '/properties', keyword: 'property for sale in jaipur' },
  { path: '/properties/3-bhk-apartment-malviya-nagar', keyword: '3 bhk apartment in malviya nagar' },
  { path: '/construction', keyword: 'home construction company in jaipur' },
  { path: '/locations', keyword: 'best areas to buy property in jaipur' },
  { path: '/locations/vaishali-nagar', keyword: 'property in vaishali nagar, jaipur' },
  { path: '/about', keyword: 'about vijay builders' },
  { path: '/blog', keyword: 'home buying and construction guides' },
  { path: '/blog/home-buying-checklist-jaipur', keyword: 'buying a new home in jaipur' },
  { path: '/contact', keyword: 'contact vijay builders' },
  { path: '/privacy', keyword: 'privacy notice' },
  { path: '/disclaimer', keyword: 'disclaimer' },
  { path: '/accessibility', keyword: 'accessibility statement' },
] as const

/** Phones from the smallest foldable up, landscape, tablets and desktop. */
export const viewports = [
  { name: 'Galaxy Fold (folded) 280', width: 280, height: 653 },
  { name: 'iPhone SE (1st) 320', width: 320, height: 568 },
  { name: 'Android 360', width: 360, height: 800 },
  { name: 'iPhone SE 375', width: 375, height: 667 },
  { name: 'iPhone 15 390', width: 390, height: 844 },
  { name: 'Pixel 412', width: 412, height: 915 },
  { name: 'iPhone Pro Max 430', width: 430, height: 932 },
  { name: 'Phone landscape 844×390', width: 844, height: 390 },
  { name: 'iPad 768', width: 768, height: 1024 },
  { name: 'iPad Pro 1024', width: 1024, height: 1366 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
] as const

let ipCounter = 0
/** A unique client address per test, so per-client rate limits never couple tests together. */
export function uniqueClientIp(): string {
  ipCounter += 1
  return `198.51.${process.pid % 250}.${ipCounter % 250}`
}
