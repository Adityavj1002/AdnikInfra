import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { site } from '@/config/site'

export const ogSize = { width: 1200, height: 630 } as const
export const ogContentType = 'image/png'

const fontDir = join(process.cwd(), 'src/assets/fonts')
// Static instances (Satori cannot read variable fonts). Read once per process, not per request.
const fonts = Promise.all([
  readFile(join(fontDir, 'PlusJakartaSans-Bold.ttf')),
  readFile(join(fontDir, 'Inter-Regular.ttf')),
  readFile(join(fontDir, 'Inter-SemiBold.ttf')),
])

type Card = Readonly<{
  eyebrow: string
  title: string
  facts?: readonly Readonly<{ term: string; detail: string }>[]
}>

const INK = '#1a1a1a'
const GOLD = '#c5a880'
const MUTED = 'rgba(255,255,255,0.7)'

/** Branded share card: what people see when a page is shared on WhatsApp, Facebook, LinkedIn or X. */
export async function renderOgCard({ eyebrow, title, facts = [] }: Card): Promise<ImageResponse> {
  const [bold, regular, semibold] = await fonts
  const titleSize = title.length > 40 ? 64 : 80

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: INK,
          color: '#fff',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK,
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 30,
            }}
          >
            VB
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 32 }}>{site.name}</span>
            <span style={{ fontSize: 20, color: MUTED }}>
              {site.descriptor} · {site.city}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ color: GOLD, fontFamily: 'Inter SemiBold', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
          <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: titleSize, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1050 }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {facts.map((fact) => (
            <div
              key={fact.term}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '16px 24px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <span style={{ color: MUTED, fontSize: 18 }}>{fact.term}</span>
              <span style={{ fontFamily: 'Inter SemiBold', fontSize: 28 }}>{fact.detail}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Plus Jakarta Sans', data: bold, style: 'normal', weight: 700 },
        { name: 'Inter', data: regular, style: 'normal', weight: 400 },
        { name: 'Inter SemiBold', data: semibold, style: 'normal', weight: 600 },
      ],
    },
  )
}
