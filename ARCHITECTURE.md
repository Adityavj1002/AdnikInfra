# Architecture

Adnik Infra's website: projects, home and warehouse construction, environmental consultancy,
a property marketplace and the admin that runs them. Next.js 16 (App Router), React 19,
TypeScript strict, hand-written CSS. [DEPLOYMENT.md](DEPLOYMENT.md) covers hosting.

## Layout

```
src/
  app/            Routes only: pages, layouts, route handlers, metadata files
  components/     Shared UI: layout/ (header, nav, footer), ui/ (cards, hero, FAQ…), seo/
  features/       One folder per feature, owning its components, server actions and rules
    admin/        Session, sign-in, admin actions and the admin form helper
    alerts/       Listing alerts: subscribe, confirm, unsubscribe
    enquiry/      The enquiry form, its validation and lead delivery
    marketplace/  Owner listings: sell form, review states, public pages, emails
    media/        Cloudinary uploads and delivery, shared by listings and projects
    projects/     Project records, the admin editor, the featured project
    calculators/  EMI and construction cost estimators
    email/        SMTP transport and the branded email layout
    gallery/, cinematic/
  store/          Persistence behind one interface: Supabase in production, memory in dev/e2e
  content/        Static content (data/) and the read-only repository pages use
  config/         Brand and business constants (site.ts)
  security/       Env validation, CSP, headers, rate limits, tokens, passwords, input limits
  seo/            Titles, metadata, JSON-LD graph, keyword ownership, share images
  lib/            Small pure helpers: routes, formatting, slugs, image loader, cache tags
  design/         Tokens, reset, primitives and cascade layers
supabase/         SQL migrations and the first projects (seed/projects.json)
scripts/          One-off operations: create the first admin, seed projects, upload images
tests/            unit/ (Vitest) and e2e/ (Playwright)
```

Dependencies point one way: `app` → `features` / `components` → `store`, `content`, `lib`,
`security`, `seo`. Nothing under `lib` or `security` imports a feature.

## Data

- **Static content** (localities, towns, FAQs, packages, guides) is typed, readonly data in
  `src/content/data`, read through `src/content/repository.ts`.
- **Projects** exist only in the database: one JSON record per project in `project_content`,
  validated by `recordSchema` (`features/projects/content.ts`) on every read and write.
  An invalid record is logged and skipped, never rendered. Admins create, edit and delete
  projects in Admin → Projects; a fresh database is filled once with `scripts/seed-projects.mjs`.
- **Everything else that changes** (listings, admins, sessions, subscribers, campaigns, the
  featured project) goes through the `Store` interface in `src/store/store.ts`.
  `MARKETPLACE_MODE` picks Supabase or the in-memory store; the memory store refuses to run on
  Vercel or an indexable site.
- **Caching:** public reads use `unstable_cache` with a tag per dataset (`lib/cache-tags.ts`).
  The admin action that changes the data expires its tag immediately; other instances catch up
  within `CACHE_SECONDS`.

## Media

Photos and videos are uploaded from the browser straight to Cloudinary with a short-lived
signature from a server action, so large files never pass through the app. Only Cloudinary ids
are stored, and every id is checked to exist before it is saved. Bundled images are served from
Cloudinary too when it is configured (`lib/image-loader.ts`, `lib/cloud-images.ts`).

## Security

- Nonce-based CSP per request (`src/proxy.ts`, `security/csp.ts`), plus static headers
  (`security/headers.ts`). `CSP_MODE` switches between report-only and enforce.
- Server actions normalise input, validate it with Zod, cap its size and rate-limit by client
  and globally (`security/rate-limit.ts`, shared through Upstash when configured).
- Zod stays on the server: client components import plain `constants.ts` / `validation.ts`.
- Admin sessions are opaque random tokens, stored hashed; passwords use scrypt. Every admin page
  and action calls `requireAdmin()`; the proxy check is only a first filter.
- No HTML sinks except the escaped JSON-LD script (`components/seo/JsonLd.tsx`).
- Environment variables are validated once at start-up (`security/env.ts`); a misconfigured
  production build stops with the full list of problems.

## SEO

Every internal URL comes from `lib/routes.ts`. Each page owns one primary keyword
(`seo/keywords.ts`, checked by a unit test) that appears in its H1. Titles step down a length
ladder (`seo/titles.ts`), and structured data is one `@graph` of linked nodes (`seo/schema.ts`).
Non-production deployments are `noindex` through both the meta tag and `X-Robots-Tag`.

## Quality gates

`npm run check` runs typecheck, lint and unit tests. `npm run test:e2e` covers responsive
layouts from 280px up, accessibility (axe, WCAG 2.2 AA), SEO tags, CSP violations, forms with
and without JavaScript, and the marketplace and admin flows, against the memory store.
