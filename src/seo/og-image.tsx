import 'server-only'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { BRAND_GOLD, BRAND_INK, LogoMark } from '@/components/layout/LogoMark'
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

const IVORY = '#fcfaf5'
const GOLD_INK = '#7c5e1a'
const MUTED = '#4d473d'
const LINE = '#dccb9f'

/** Branded share card: what people see when a page is shared on WhatsApp, Facebook, LinkedIn or X. */
export async function renderOgCard({ eyebrow, title, facts = [] }: Card): Promise<ImageResponse> {
  const [bold, regular, semibold] = await fonts
  const titleSize = title.length > 40 ? 64 : 80
  const [first = site.name, ...rest] = site.name.split(' ')

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
          background: IVORY,
          borderTop: `10px solid ${BRAND_GOLD}`,
          color: BRAND_INK,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LogoMark size={76} knockout={IVORY} ink={BRAND_INK} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', fontFamily: 'Plus Jakarta Sans', fontSize: 34, letterSpacing: 3 }}>
              {first.toUpperCase()}
              {rest.length > 0 && <span style={{ color: GOLD_INK, marginLeft: 12 }}>{rest.join(' ').toUpperCase()}</span>}
            </span>
            <span style={{ fontFamily: 'Inter SemiBold', fontSize: 16, letterSpacing: 4, color: MUTED }}>
              {`${site.tagline} · ${site.city}`.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ color: GOLD_INK, fontFamily: 'Inter SemiBold', fontSize: 24, letterSpacing: 3, textTransform: 'uppercase' }}>
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
                borderRadius: 4,
                background: '#ffffff',
                border: `1px solid ${LINE}`,
                borderTop: `3px solid ${BRAND_GOLD}`,
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
