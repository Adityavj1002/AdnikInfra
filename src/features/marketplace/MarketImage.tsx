'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import type { ComponentProps } from 'react'

type Props = Readonly<{ id: string; base: string; alt: string }> & Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'loader'>

/** A listing photo, sized by the provider (Cloudinary) instead of this server's optimiser. */
export function MarketImage({ id, base, alt, ...props }: Props) {
  const loader = ({ width }: ImageLoaderProps) =>
    base.startsWith('http') ? `${base}/f_auto,q_auto,c_limit,w_${width}/${id}` : `${base}/${id}?w=${width}`
  return <Image {...props} src={id} alt={alt} loader={loader} />
}
