import 'server-only'
import type {
  Article,
  BreadcrumbList,
  FAQPage,
  Graph,
  ItemAvailability,
  Organization,
  Place,
  RealEstateListing,
  Service,
  Thing,
  VideoObject,
  WebPage,
  WebSite,
} from 'schema-dts'
import { site } from '@/config/site'
import type { ConstructionPackage, Faq, Film, Locality, Post, Project, Property, Town } from '@/content/types'
import type { PublicListing } from '@/features/marketplace/types'
import { areaUnitLabel } from '@/lib/format'
import { routes } from '@/lib/routes'
import { env } from '@/security/env'

/**
 * JSON-LD graph builders. Nodes reference each other by stable @id; Place nodes (Jaipur and
 * its localities) join projects, listings and the businesses. Business facts (address,
 * phone) are emitted only when they exist in site config.
 */

export const absoluteUrl = (path: string): string => new URL(path, env.SITE_URL).href
const nodeId = (path: string, fragment: string): string => `${absoluteUrl(path)}#${fragment}`
const ref = (id: string) => ({ '@id': id })

export const ids = {
  website: nodeId(routes.home, 'website'),
  organization: nodeId(routes.home, 'organization'),
  city: nodeId(routes.locations, 'jaipur'),
  builder: nodeId(routes.construction, 'builder'),
  sales: nodeId(routes.properties, 'sales'),
  locality: (slug: string) => nodeId(routes.location(slug), 'place'),
  town: (slug: string) => nodeId(routes.town(slug), 'place'),
}

export function graph(...nodes: readonly Thing[]): Graph {
  return { '@context': 'https://schema.org', '@graph': [...nodes] }
}

function businessDetails() {
  const { business, contact } = site
  return {
    ...(business.address ? { address: { '@type': 'PostalAddress' as const, ...business.address } } : {}),
    ...(business.geo
      ? { geo: { '@type': 'GeoCoordinates' as const, latitude: business.geo.lat, longitude: business.geo.lng } }
      : {}),
    ...(business.openingHours ? { openingHours: [...business.openingHours] } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
  }
}

/** Site-wide entities, rendered once from the root layout. */
export function siteNodes(): readonly Thing[] {
  const parent = ref(ids.organization)
  // The city plus the nearby towns we work in, so "near Jaipur" searches match too.
  const areaServed = [
    ref(ids.city),
    ...site.serviceArea.towns.map((town) => ({ '@type': 'Place' as const, name: `${town}, ${site.state}` })),
  ]

  const website: WebSite = {
    '@type': 'WebSite',
    '@id': ids.website,
    url: absoluteUrl(routes.home),
    name: site.name,
    description: site.description,
    inLanguage: site.locale,
    publisher: parent,
  }

  const city: Place = {
    '@type': 'City',
    '@id': ids.city,
    name: site.city,
    containedInPlace: { '@type': 'State', name: site.state, containedInPlace: { '@type': 'Country', name: 'India' } },
  } as Place

  const organization: Organization = {
    '@type': 'Organization',
    '@id': ids.organization,
    name: site.name,
    url: absoluteUrl(routes.home),
    // Google wants a raster logo of at least 112px that reads on white.
    logo: absoluteUrl('/brand/adnik-infra-logo-512.png'),
    description: site.description,
    areaServed,
    ...(site.business.profiles.length > 0 ? { sameAs: [...site.business.profiles] } : {}),
    department: [ref(ids.builder), ref(ids.sales)],
    ...businessDetails(),
  }

  // schema.org has no "ConstructionBusiness"; GeneralContractor is the LocalBusiness subtype.
  const builder: Thing = {
    '@type': 'GeneralContractor',
    '@id': ids.builder,
    name: `${site.name} Construction`,
    url: absoluteUrl(routes.construction),
    parentOrganization: parent,
    areaServed,
    knowsAbout: ['Home construction', 'Modular homes', 'Turnkey villa construction', 'Residential development'],
    ...businessDetails(),
  }

  const sales: Thing = {
    '@type': 'RealEstateAgent',
    '@id': ids.sales,
    name: `${site.name} Real Estate`,
    url: absoluteUrl(routes.properties),
    parentOrganization: parent,
    areaServed,
    ...(site.business.reraAgent ? { identifier: site.business.reraAgent } : {}),
    ...businessDetails(),
  }

  return [website, city, organization, builder, sales]
}

export function webPageNode(
  input: Readonly<{
    path: string
    name: string
    description: string
    type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'SearchResultsPage'
    breadcrumb?: boolean
    about?: string
  }>,
): WebPage {
  const url = absoluteUrl(input.path)
  return {
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: site.locale,
    isPartOf: ref(ids.website),
    ...(input.breadcrumb ? { breadcrumb: ref(`${url}#breadcrumb`) } : {}),
    ...(input.about ? { about: ref(input.about) } : {}),
  } as WebPage
}

export type Crumb = Readonly<{ name: string; path: string }>

export function breadcrumbNode(pagePath: string, crumbs: readonly Crumb[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(pagePath)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function localityNode(locality: Locality): Place {
  return {
    '@type': 'Place',
    '@id': ids.locality(locality.slug),
    name: `${locality.name}, ${site.city}`,
    url: absoluteUrl(routes.location(locality.slug)),
    description: locality.summary,
    geo: { '@type': 'GeoCoordinates', latitude: locality.geo.lat, longitude: locality.geo.lng },
    containedInPlace: ref(ids.city),
  }
}

/** A town near Jaipur, plus what we offer there as a Service the builder provides. */
export function townNodes(town: Town): readonly Thing[] {
  const url = absoluteUrl(routes.town(town.slug))
  return [
    {
      '@type': 'Place',
      '@id': ids.town(town.slug),
      name: `${town.name}, ${site.state}`,
      url,
      description: town.summary,
      containedInPlace: { '@type': 'State', name: site.state },
    } as Place,
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `Real estate and construction in ${town.name}`,
      serviceType: town.offers.join(', '),
      provider: ref(ids.organization),
      areaServed: ref(ids.town(town.slug)),
      url,
    } as Service,
  ]
}

export function faqNode(pagePath: string, faqs: readonly Faq[]): FAQPage {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(pagePath)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

const residenceType: Record<Project['type'], string> = {
  villa: 'GatedResidenceCommunity',
  apartment: 'ApartmentComplex',
  plot: 'Place',
  commercial: 'Place',
}

const projectAvailability: Record<Project['status'], ItemAvailability> = {
  ongoing: 'https://schema.org/PreOrder',
  upcoming: 'https://schema.org/PreSale',
  completed: 'https://schema.org/LimitedAvailability',
}

export function projectNode(project: Project, locality: Locality): RealEstateListing {
  const url = absoluteUrl(routes.project(project.slug))
  const prices = project.configurations.flatMap((c) => (c.price ? [c.price.amount] : []))
  const offers =
    prices.length > 0
      ? {
          '@type': 'AggregateOffer' as const,
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          priceCurrency: 'INR',
          offerCount: project.configurations.length,
          availability: projectAvailability[project.status],
          offeredBy: ref(ids.sales),
        }
      : undefined

  return {
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: project.name,
    description: project.summary,
    dateModified: project.updatedAt,
    inLanguage: site.locale,
    isPartOf: ref(ids.website),
    breadcrumb: ref(`${url}#breadcrumb`),
    image: project.gallery.map((img) => absoluteUrl(img.src.src)),
    ...(offers ? { offers } : {}),
    mainEntity: {
      '@type': residenceType[project.type],
      name: project.name,
      description: project.summary,
      containedInPlace: ref(ids.locality(locality.slug)),
      geo: { '@type': 'GeoCoordinates', latitude: project.geo.lat, longitude: project.geo.lng },
      ...(project.rera ? { identifier: { '@type': 'PropertyValue', name: 'RERA registration', value: project.rera } } : {}),
    },
  } as RealEstateListing
}

const accommodationType: Record<Property['type'], string> = {
  apartment: 'Apartment',
  villa: 'SingleFamilyResidence',
  plot: 'Place',
  commercial: 'Place',
  agricultural: 'Place',
}

export function propertyNode(property: Property): RealEstateListing {
  const url = absoluteUrl(routes.property(property.slug))
  return {
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: property.title,
    description: property.summary,
    datePosted: property.listedAt,
    dateModified: property.updatedAt,
    inLanguage: site.locale,
    isPartOf: ref(ids.website),
    breadcrumb: ref(`${url}#breadcrumb`),
    image: property.gallery.map((img) => absoluteUrl(img.src.src)),
    offers: {
      '@type': 'Offer',
      price: property.price.amount,
      priceCurrency: property.price.currency,
      availability: 'https://schema.org/InStock',
      offeredBy: ref(ids.sales),
    },
    mainEntity: {
      '@type': accommodationType[property.type],
      name: property.title,
      containedInPlace: ref(ids.locality(property.localitySlug)),
      ...(property.bhk ? { numberOfBedrooms: property.bhk, numberOfRooms: property.bhk } : {}),
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.area.value,
        unitText: areaUnitLabel[property.area.unit],
      },
    },
  } as RealEstateListing
}

/** An owner's listing on the marketplace: seller contact details are never included. */
export function marketplaceListingNode(listing: PublicListing, images: readonly string[]): RealEstateListing {
  const url = absoluteUrl(routes.marketplaceListing(listing.slug))
  return {
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    url,
    name: listing.title,
    description: listing.description.slice(0, 300),
    datePosted: listing.reviewedAt ?? listing.createdAt,
    dateModified: listing.updatedAt,
    inLanguage: site.locale,
    isPartOf: ref(ids.website),
    breadcrumb: ref(`${url}#breadcrumb`),
    image: [...images],
    offers: {
      '@type': 'Offer',
      price: listing.priceInr,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    contentLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.locality,
        addressRegion: listing.state,
        addressCountry: 'IN',
      },
    },
  } as RealEstateListing
}

/** One consultancy service or sector page. */
export function consultancyServiceNode(input: Readonly<{ path: string; name: string; description: string; serviceType: string }>): Service {
  return {
    '@type': 'Service',
    '@id': nodeId(input.path, 'service'),
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    provider: ref(ids.organization),
    url: absoluteUrl(input.path),
  }
}

export function constructionServiceNode(packages: readonly ConstructionPackage[]): Service {
  return {
    '@type': 'Service',
    '@id': nodeId(routes.construction, 'service'),
    name: 'Home construction in Jaipur',
    serviceType: 'Residential construction',
    provider: ref(ids.builder),
    areaServed: ref(ids.city),
    url: absoluteUrl(routes.construction),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Construction packages',
      itemListElement: packages.map((pkg) => ({
        '@type': 'Offer',
        name: `${pkg.name} package`,
        description: pkg.summary,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: pkg.ratePerSqft,
          priceCurrency: 'INR',
          unitText: 'per sq ft of built-up area',
        },
      })),
    },
  }
}

export function articleNode(post: Post): Article {
  const url = absoluteUrl(routes.post(post.slug))
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: post.title,
    description: post.summary,
    image: absoluteUrl(post.cover.src.src),
    datePublished: post.published,
    dateModified: post.updatedAt,
    inLanguage: site.locale,
    author: ref(ids.organization),
    publisher: ref(ids.organization),
    mainEntityOfPage: ref(`${url}#webpage`),
  }
}

/** Emitted only for real footage: a VideoObject must describe an actual video file. */
export function videoNode(film: Film, pagePath: string): VideoObject {
  return {
    '@type': 'VideoObject',
    '@id': `${absoluteUrl(pagePath)}#film`,
    name: film.title,
    description: film.description,
    thumbnailUrl: absoluteUrl(film.poster),
    uploadDate: film.uploadDate,
    duration: film.duration,
    contentUrl: absoluteUrl(film.sources[0]?.src ?? film.poster),
    transcript: film.transcript.join(' '),
    inLanguage: site.locale,
  }
}
