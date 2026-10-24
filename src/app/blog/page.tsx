import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { PageHero } from '@/components/ui/PageHero'
import { getPosts } from '@/content/repository'
import { formatDate } from '@/lib/format'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { breadcrumbNode, graph, webPageNode, type Crumb } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from './blog.module.css'

const description =
  'Home buying and construction guides for Jaipur: construction cost per sq ft, RERA checks before you book, and how modular homes work.'
const { title } = buildTitle({ name: 'Home Buying & Construction Guides' })
const crumbs: readonly Crumb[] = [
  { name: 'Home', path: routes.home },
  { name: 'Guides', path: routes.blog },
]

export const metadata = buildMetadata({ title, description, path: routes.blog })

export default async function BlogPage() {
  const posts = await getPosts()
  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path: routes.blog, name: title, description, type: 'CollectionPage', breadcrumb: true }),
          breadcrumbNode(routes.blog, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHero eyebrow="Guides" title="Home buying and construction guides" lead={<p>Plain answers to the questions families ask us most.</p>} />
      <section className="section section--tight" aria-label="Guides">
        <ul role="list" className={`container grid-cards ${styles.list}`}>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={routes.post(post.slug)} className={styles.card}>
                <span className={styles.media}>
                  <Image src={post.cover.src} alt="" fill sizes="(min-width: 60rem) 30vw, 100vw" placeholder="blur" />
                </span>
                <span className={styles.meta}>
                  <time dateTime={post.published}>{formatDate(post.published)}</time> · {post.readingMinutes} min read
                </span>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.summary}>{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
