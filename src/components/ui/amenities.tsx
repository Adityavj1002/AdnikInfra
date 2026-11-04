import {
  Accessibility,
  ArrowUpDown,
  Baby,
  BedDouble,
  Clapperboard,
  Compass,
  Droplets,
  Gamepad2,
  Library,
  PartyPopper,
  BatteryCharging,
  Cctv,
  CloudRain,
  Dumbbell,
  EvCharger,
  Fence,
  Footprints,
  Landmark,
  ShieldCheck,
  SolarPanel,
  SquareParking,
  Trees,
  Users,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import type { AmenityKey } from '@/content/types'
import styles from './Amenities.module.css'

export const amenityMeta: Readonly<Record<AmenityKey, Readonly<{ label: string; icon: LucideIcon }>>> = {
  clubhouse: { label: 'Clubhouse', icon: Landmark },
  pool: { label: 'Swimming pool', icon: Waves },
  gym: { label: 'Gym', icon: Dumbbell },
  garden: { label: 'Landscaped gardens', icon: Trees },
  'kids-play': { label: 'Kids’ play area', icon: Baby },
  security: { label: '24×7 security', icon: ShieldCheck },
  cctv: { label: 'CCTV surveillance', icon: Cctv },
  'power-backup': { label: 'Power backup', icon: BatteryCharging },
  parking: { label: 'Covered parking', icon: SquareParking },
  'jogging-track': { label: 'Jogging track', icon: Footprints },
  rainwater: { label: 'Rainwater harvesting', icon: CloudRain },
  solar: { label: 'Solar power', icon: SolarPanel },
  'ev-charging': { label: 'EV charging', icon: EvCharger },
  lift: { label: 'Lifts', icon: ArrowUpDown },
  gated: { label: 'Gated community', icon: Fence },
  'community-hall': { label: 'Community hall', icon: Users },
  wifi: { label: 'Fibre internet', icon: Wifi },
  library: { label: 'Library and reading room', icon: Library },
  theatre: { label: 'Private theatre', icon: Clapperboard },
  'indoor-games': { label: 'Indoor games room', icon: Gamepad2 },
  banquet: { label: 'Banquet hall', icon: PartyPopper },
  'guest-room': { label: 'Guest room', icon: BedDouble },
  'water-supply': { label: '24×7 water supply', icon: Droplets },
  vastu: { label: 'Vastu-friendly layout', icon: Compass },
  accessible: { label: 'Accessible toilet', icon: Accessibility },
}

export function AmenityGrid({ amenities }: Readonly<{ amenities: readonly AmenityKey[] }>) {
  return (
    <ul role="list" className={styles.grid}>
      {amenities.map((key) => {
        const { label, icon: Icon } = amenityMeta[key]
        return (
          <li key={key} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon strokeWidth={1.75} />
            </span>
            {label}
          </li>
        )
      })}
    </ul>
  )
}
