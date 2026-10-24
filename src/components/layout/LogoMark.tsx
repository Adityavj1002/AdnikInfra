/**
 * The Adnik Infra mark, drawn on a 64-unit grid: a folded "A" (gold face, ink side) with a
 * road sweeping through it and the skyline stepping down behind. Flat colours only, so it
 * stays crisp from a 32px header to print.
 *
 * Colours are literal (not CSS variables) because the same mark is rendered by next/og for
 * share images. Keep them in sync with --c-gold and --c-ink in src/design/tokens.css.
 */
export const BRAND_GOLD = '#b8913a'
export const BRAND_INK = '#17140f'

type MarkProps = Readonly<{
  size?: number | string
  className?: string
  /**
   * Colour of the thin cut lines that separate the shapes. It must match whatever the mark
   * sits on; the default reads a CSS variable so one component works on white and ivory.
   */
  knockout?: string
  /** Colour of the dark parts (tower, fold). On navy it turns cream; next/og passes a literal. */
  ink?: string
}>

export function LogoMark({ size, className, knockout = 'var(--logo-knockout, #fff)', ink = `var(--logo-ink, ${BRAND_INK})` }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M42 10h5v42h-5zM49 19h5v33h-5zM56 28h5v24h-5z" fill={ink} />
      <g stroke={knockout} strokeWidth="2.2" strokeLinejoin="round" paintOrder="stroke">
        <path d="M22 6h9l18 46h-9.5z" fill={ink} />
        <path d="M22 6h9L13 52H3z" fill={BRAND_GOLD} />
        <path d="M8 40c18-6 38-1 55 12H51C40 45 26 42 8 44z" fill={BRAND_GOLD} />
      </g>
    </svg>
  )
}
