import type { AnimationPreset } from '../../core/types'

export const WEDDING_PRESET: AnimationPreset = {
  id: 'butterfly-garden',
  name: 'Butterfly Garden Wedding',
  eventType: 'wedding',

  colorPalette: {
    background:      '#FDF6EE',   // warm cream
    skyTop:          '#FDF6EE',
    skyBottom:       '#F5EBE0',   // slightly deeper cream at bottom
    fogColor:        '#FDF6EE',
    primaryAccent:   '#C8858A',   // dusty rose (matches seal)
    secondaryAccent: '#B8A090',   // warm taupe
    gold:            '#C4956A',   // warm gold for UI elements
    paper:           '#FFFFFF',
  },

  envelope: {
    paperColor:      '#F8F3EC',
    sealColor:       '#C8858A',
    sealSymbol:      '❧',
    creaseIntensity: 1.0,
    openDuration:    1300,
  },

  butterflies: {
    count:              10,
    species:            'morpho',
    wingColorInner:     '#4A8FE8',
    wingColorMid:       '#2255CC',
    wingColorOuter:     '#1A3A99',
    borderColor:        '#0A0F1A',
    beatHz:             1.65,
    scaleMin:           0.55,
    scaleMax:           1.1,
    flightRangeX:       300,
    flightRangeY:       180,
    opacity:            0.92,
    showOnLanding:      true,
    showDuringEnvelope: false,
  },

  clouds: {
    count:       4,
    opacity:     0.08,
    blur:        32,
    speedMin:    24,
    speedMax:    48,
    colorTop:    'rgba(220,200,190,0.25)',
    colorBottom: 'rgba(200,180,165,0.10)',
  },

  particles: {
    count:   80,
    type:    'sparkle',
    color:   '#C4956A',
    sizeMin: 2,
    sizeMax: 4,
    opacity: 0.6,
  },

  floral: {
    enabled:   true,
    positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    color:     '#C4956A',
    opacity:   0.30,
  },
}
