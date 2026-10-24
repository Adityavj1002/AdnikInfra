import type { Locality, Post, Project, Property } from '@/content/types'
import { routes } from '@/lib/routes'

/**
 * Keyword ownership (ARCHITECTURE.md §3). Each URL owns exactly one primary phrase,
 * which must appear in its H1; supporting phrases belong in H2s, copy and descriptions —
 * written naturally, never stuffed. A unit test fails on any duplicate primary, so two
 * pages never compete for the same search.
 *
 * Not emitted as <meta name="keywords">: Google ignores it and others treat it as spam.
 */
export type KeywordTarget = Readonly<{ primary: string; supporting: readonly string[] }>

export const staticKeywords = {
  [routes.home]: {
    primary: 'builders in Jaipur',
    supporting: ['real estate developers in Jaipur', 'modern homes in Jaipur', 'villas and apartments in Jaipur'],
  },
  [routes.projects]: {
    primary: 'new residential projects in Jaipur',
    supporting: ['RERA projects Jaipur', 'villas for sale in Jaipur', 'new apartments in Jaipur', 'plots in Jaipur'],
  },
  [routes.properties]: {
    primary: 'property for sale in Jaipur',
    supporting: ['flats for sale in Jaipur', 'villas for sale in Jaipur', 'plots for sale in Jaipur', 'resale property Jaipur'],
  },
  [routes.construction]: {
    primary: 'home construction company in Jaipur',
    supporting: [
      'house construction cost per sq ft in Jaipur',
      'modular homes Jaipur',
      'turnkey house construction',
      'build your own house in Jaipur',
    ],
  },
  [routes.locations]: {
    primary: 'best areas to buy property in Jaipur',
    supporting: ['Jaipur localities', 'where to buy a home in Jaipur'],
  },
  [routes.about]: {
    primary: 'about Vijay Builders',
    supporting: ['trusted builders in Jaipur', 'real estate company Jaipur'],
  },
  [routes.blog]: {
    primary: 'home buying and construction guides',
    supporting: ['Jaipur real estate guide', 'house construction tips'],
  },
  [routes.contact]: {
    primary: 'contact Vijay Builders',
    supporting: ['book a site visit', 'get a construction quote'],
  },
} as const satisfies Record<string, KeywordTarget>

export function localityKeywords(locality: Locality): KeywordTarget {
  return {
    primary: `property in ${locality.name}, Jaipur`,
    supporting: [`builders in ${locality.name}`, `villas in ${locality.name}`, `flats in ${locality.name}`],
  }
}

export function projectKeywords(project: Project, locality: Locality): KeywordTarget {
  return {
    primary: `${project.name}, ${locality.name}`,
    supporting: project.configurations.map((c) => `${c.label} in ${locality.name}`),
  }
}

export function propertyKeywords(property: Property): KeywordTarget {
  return { primary: property.title, supporting: [] }
}

export function postKeywords(post: Post): KeywordTarget {
  return { primary: post.title, supporting: [] }
}
