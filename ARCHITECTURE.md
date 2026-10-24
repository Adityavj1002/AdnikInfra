# Architecture Plan v2: Vijay Builders (Modern Homes & Real Estate, Jaipur)

Status: **v2, replaces the heritage concept** · 2026-10-24
v1 (heritage real estate + travel) was retired at the client's request. The engineering foundation (security, SEO engine, testing, mobile-first system) carries over unchanged; positioning, information architecture, design system and content model are new.

---

## 1. Positioning

**Vijay Builders** is a Jaipur builder and real-estate company. It does three things:

| Line of business | What the visitor wants | Primary page |
|---|---|---|
| **Our projects**: modern villas, apartments and plotted developments the company builds and sells | Compare projects, see prices and plans, book a site visit | `/projects` |
| **Home construction**: modern and modular homes built on the customer's own plot | Know the cost, the process and the timeline, and trust the builder | `/construction` |
| **Property sales**: ready, resale and new properties (flats, villas, plots, commercial) | Search by type, area and budget; contact quickly | `/properties` |

Tone: modern, direct, trustworthy. Plain language, real numbers, no heritage or "luxury" clichés.

## 2. Design direction

The reference was arggroupjaipur.com: photography first, a clean sans-serif, a gold accent, prominent phone contact and a RERA disclaimer. We keep that structure in a modern, faster, more readable form.

| Element | Decision |
|---|---|
| Typography | **Plus Jakarta Sans** (headings, 600–800) + **Inter** (body/UI). Body 16–18px, line-height 1.6. No light-weight display serifs |
| Palette | Off-white `#F9F8F6` base, charcoal `#1A1A1A` text, gold `#C5A880`/`#D4AF37` accents (CTAs on dark, badges, highlights), stone `#E2DFD5` panels, white cards. Gold-coloured text on light surfaces uses `#7D6224` (5.4:1) |
| Shape | 12–16px radius cards, 999px pills, soft layered shadows, generous whitespace |
| Imagery | Full-bleed hero photography, 4:3 and 16:9 card images, gallery lightbox. Placeholders until real project photos arrive (§7) |
| Icons | Lucide line icons (amenities, specs, contact). Stroke 1.75, one consistent set |
| Motion | Subtle: fade/rise on scroll, image zoom on hover, animated counters. All off under reduced motion |
| Avoid | Gradient blobs, glassmorphism, emoji, stock slogans ("Elevate your lifestyle"), auto-advancing carousels |

## 3. Information architecture and keywords (Jaipur local SEO)

Each URL owns one primary search phrase, enforced by a unit test.

| URL | Primary keyword | Supporting |
|---|---|---|
| `/` | builders in Jaipur | real estate developers in Jaipur, modern homes Jaipur |
| `/projects` | new residential projects in Jaipur | RERA approved projects Jaipur, villas for sale in Jaipur |
| `/projects/[slug]` | `[Project] [Locality] Jaipur` | `[n] BHK villa in [Locality]` |
| `/properties` | property for sale in Jaipur | flats for sale in Jaipur, plots in Jaipur, resale property Jaipur |
| `/properties/[slug]` | `[n] BHK [type] for sale in [Locality]` | — |
| `/construction` | home construction company in Jaipur | house construction cost per sq ft Jaipur, modular homes Jaipur, turnkey construction |
| `/locations/[area]` | property in `[Area]` Jaipur | builders in `[Area]`, villas in `[Area]` |
| `/about` | about Vijay Builders | trusted builders Jaipur |
| `/blog/[slug]` | long-tail guides (cost, RERA, buying checklist) | — |
| `/contact` | contact Vijay Builders Jaipur | site visit, call, WhatsApp |

**Local ranking** also needs a verified Google Business Profile with the same name, address and phone as the site, plus customer reviews there (see §8).

## 4. Key features

- **Smart search** on the home page: type, locality and budget, which jumps to filtered `/properties`.
- **Project pages:** gallery and lightbox, configuration table (BHK / area / price), amenities with icons, specifications, location and distances, possession date, RERA number, construction updates, site-visit booking, and a brochure request.
- **EMI calculator** (loan amount, rate, tenure) on project and property pages.
- **Construction cost estimator:** plot area × floors × package gives an instant estimate with a breakdown, then a "get exact quote" form.
- **Construction process timeline** with stage-wise payments.
- **Sticky mobile action bar** (Call · WhatsApp · Enquire) and a floating WhatsApp button once a number is configured.
- **RERA disclaimer** and "images are representative" notices, as Indian real-estate advertising requires.
- **Testimonials and stats** are shown only when real data is configured. The site never fabricates reviews or numbers.

## 5. Content model

`Project` (developer projects), `Property` (listings), `Locality`, `ConstructionPackage`, `Post`, plus `site` config (contact, address, RERA, social profiles, stats). All are typed and readonly, and served through `ContentRepository` (local fixtures → CMS later, as in v1).

## 6. Engineering (unchanged from v1, still in force)

- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, hand-written CSS (tokens + modules + cascade layers).
- **Security:** nonce CSP via `src/proxy.ts`, static security headers, Zod-validated server actions with rate limits, honeypot, size caps, no `eval` / HTML sinks (lint-enforced), Zod kept out of client bundles, `security.txt`, honest lead delivery (`LEADS_MODE`).
- **SEO:** `buildTitle` ladder (≤ 60 chars, keeps the locality), `buildMetadata`, generated OG cards, JSON-LD `@graph` (Organization → `GeneralContractor` + `RealEstateAgent`; `Residence`/`Accommodation` listings with `Offer`; `Place` for localities; `BreadcrumbList`; `FAQPage`), sitemap, robots, breadcrumbs, keyword-ownership test.
- **Mobile:** 280px → 1440px device matrix, 44px targets, safe areas, 16px inputs, hover only where hover exists.
- **Quality gates:** typecheck, lint, Vitest (unit), Playwright (responsive × 11 devices, axe WCAG 2.2 AA, SEO, CSP violations, forms incl. no-JS).

## 7. Placeholders to replace before launch

Project photos, project names, prices, RERA numbers, contact details, address and stats are **sample data** and marked as such. Placeholder photos are licence-free stock (Unsplash Licence) and must be replaced with the company's own renders and site photos before going live; RERA rules treat misleading project imagery as false advertising.

## 8. Go-live checklist (client)

1. Real project data, photos and RERA registration numbers.
2. Business name, address, phone and WhatsApp in `src/config/site.ts`, matching the Google Business Profile exactly.
3. Create and verify the Google Business Profile, add photos, and ask customers for reviews.
4. Set `SITE_URL`, `SITE_INDEXABLE=true` and a CRM/email lead sink in production. Submit the sitemap in Google Search Console.
