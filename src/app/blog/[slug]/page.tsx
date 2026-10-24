import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHero } from '@/components/ui/PageHero'
import { site } from '@/config/site'
import { getPost, isValidSlug } from '@/content/repository'
import { formatDate } from '@/lib/format'
import { contactHref, routes } from '@/lib/routes'
import { buildMetadata } from '@/seo/metadata'
import { articleNode, breadcrumbNode, graph, webPageNode } from '@/seo/schema'
import { buildTitle } from '@/seo/titles'
import styles from '../blog.module.css'

type PageProps = Readonly<{ params: Promise<{ slug: string }> }>

async function load(slug: string) {
  return isValidSlug(slug) ? getPost(slug) : undefined
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await load((await params).slug)
  if (!post) return {}
  return buildMetadata({
    ...buildTitle({ name: post.title }),
    description: post.summary,
    path: routes.post(post.slug),
    type: 'article',
    publishedTime: post.published,
    modifiedTime: post.updatedAt,
  })
}

export default async function PostPage({ params }: PageProps) {
  const post = await load((await params).slug)
  if (!post) notFound()
  const path = routes.post(post.slug)
  const crumbs = [
    { name: 'Home', path: routes.home },
    { name: 'Guides', path: routes.blog },
    { name: post.title, path },
  ] as const

  return (
    <>
      <JsonLd
        graph={graph(
          webPageNode({ path, name: post.title, description: post.summary, breadcrumb: true }),
          articleNode(post),
          breadcrumbNode(path, crumbs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <article>
        <PageHero
          eyebrow={`${formatDate(post.published)} · ${post.readingMinutes} min read`}
          title={post.title}
          lead={<p>{post.summary}</p>}
        />
        <div className="container">
          <div className={styles.article}>
            <div className={styles.cover}>
              <Image src={post.cover.src} alt={post.cover.alt} fill sizes="(min-width: 48rem) 46rem, 100vw" placeholder="blur" />
            </div>
            <div className="prose">
              {post.body.map((block, index) => {
                if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>
                if (block.type === 'ul')
                  return (
                    <ul key={index}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )
                return <p key={index}>{block.text}</p>
              })}
            </div>
            <p className={styles.byline}>
              By the {site.name} team
              {post.updatedAt !== post.published && (
                <>
                  {' '}
                  · Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                </>
              )}
            </p>
          </div>
        </div>
      </article>
      <div className="section" />
      <CtaBand
        id="post-cta"
        title="Have a question we didn’t answer?"
        body="Talk to our team about buying, building or selling in Jaipur."
        primary={{ href: contactHref('other'), label: 'Ask us' }}
        secondary={{ href: routes.blog, label: 'More guides' }}
      />
    </>
  )
}
