import type { Graph } from 'schema-dts'
import { safeJsonLd } from '@/seo/safe-json-ld'

/**
 * The codebase's only dangerouslySetInnerHTML (ARCHITECTURE.md §10.2). Input is typed,
 * trusted content; safeJsonLd escapes everything that could end the script element.
 */
export function JsonLd({ graph }: Readonly<{ graph: Graph }>) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }} />
}
