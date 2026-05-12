// ─── Core animation-engine types ─────────────────────────────────────────────
// All theme/preset data flows through these interfaces.
// Backend can return JSON matching these shapes → zero refactoring needed
// when adding new event types.

export interface ColorPalette {
  background: string
  skyTop: string
  skyBottom: string
  fogColor: string
  primaryAccent: string    // e.g. Morpho blue
  secondaryAccent: string  // e.g. violet
  gold: string
  paper: string
}

export interface ButterflyConfig {
  count: number
  species: 'morpho' | 'monarch' | 'swallowtail' | 'custom'
  wingColorInner: string
  wingColorMid: string
  wingColorOuter: string
  borderColor: string
  beatHz: number           // wing beats per second (Morpho ≈ 1.6)
  scaleMin: number
  scaleMax: number
  flightRangeX: number     // horizontal amplitude in px
  flightRangeY: number     // vertical amplitude in px
  opacity: number
  showOnLanding: boolean   // show after envelope opens
  showDuringEnvelope: boolean
}

export interface CloudConfig {
  count: number
  opacity: number
  blur: number
  speedMin: number
  speedMax: number
  colorTop: string
  colorBottom: string
}

export interface ParticleConfig {
  count: number
  type: 'sparkle' | 'petal' | 'snow' | 'firefly'
  color: string
  sizeMin: number
  sizeMax: number
  opacity: number
}

export interface FloralConfig {
  enabled: boolean
  positions: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top' | 'center-bottom')[]
  color: string
  opacity: number
}

export interface EnvelopeConfig {
  paperColor: string
  sealColor: string
  sealSymbol: string        // emoji or SVG id
  creaseIntensity: number   // 0–1
  openDuration: number      // ms
}

export interface AnimationPreset {
  id: string
  name: string
  eventType: 'wedding' | 'birthday' | 'corporate' | 'anniversary' | string
  colorPalette: ColorPalette
  envelope: EnvelopeConfig
  butterflies: ButterflyConfig
  clouds: CloudConfig
  particles: ParticleConfig
  floral: FloralConfig
}

// Entity lifecycle callbacks
export interface SceneCallbacks {
  onEnvelopeClick?: () => void
  onOpenComplete?: () => void
  onRevealComplete?: () => void
}
