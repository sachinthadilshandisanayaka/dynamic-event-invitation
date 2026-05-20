import { useMemo } from 'react'

// ── Particle catalogue ─────────────────────────────────────────────────────────

export const SECTION_PARTICLES = [
  { id: 'none',    label: 'None',      emoji: '🚫', src: '' },
  { id: 'flower',  label: 'Flowers',   emoji: '🌸', src: '/assets/particles/flower.svg' },
  { id: 'flower2', label: 'Flowers 2', emoji: '🌺', src: '/assets/particles/flower2.svg' },
  { id: 'flower3', label: 'Flowers 3', emoji: '🌹', src: '/assets/particles/flower3.svg' },
  { id: 'flower4', label: 'Flower 4',  emoji: '💐', src: '/assets/particles/flower4.svg' },
  { id: 'flower6', label: 'Flower 6',  emoji: '🌼', src: '/assets/particles/flower6.svg' },
  { id: 'flower7', label: 'Flower 7',  emoji: '🌻', src: '/assets/particles/flower7.svg' },
  { id: 'baloon',  label: 'Balloons',  emoji: '🎈', src: '/assets/particles/baloon.svg' },
  { id: 'ring',    label: 'Rings',     emoji: '💍', src: '/assets/particles/ring.svg' },
]

// ── Size map ───────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<'small' | 'medium' | 'large', number> = {
  small:  40,
  medium: 60,
  large:  80,
}

// ── Speed → duration multiplier ────────────────────────────────────────────────

const SPEED_MULTIPLIER: Record<'slow' | 'normal' | 'fast', number> = {
  slow:   1.6,
  normal: 1.0,
  fast:   0.55,
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  particleId: string
  count?: number
  opacity?: number
  speed?: 'slow' | 'normal' | 'fast'
  size?: 'small' | 'medium' | 'large'
}

interface ParticleConfig {
  left: string
  delay: number
  duration: number
  driftDuration: number
  size: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export function SectionParticleLayer({
  particleId,
  count = 12,
  opacity = 0.7,
  speed = 'normal',
  size = 'medium',
}: Props) {
  // Return nothing for 'none' or empty
  if (!particleId || particleId === 'none') return null

  // Find the SVG source
  const entry = SECTION_PARTICLES.find((p) => p.id === particleId)
  if (!entry || !entry.src) return null

  return (
    <SectionParticleLayerInner
      src={entry.src}
      count={count}
      opacity={opacity}
      speed={speed}
      size={size}
    />
  )
}

// Separated so hooks run unconditionally (no early return before useMemo)
function SectionParticleLayerInner({
  src,
  count,
  opacity,
  speed,
  size,
}: {
  src: string
  count: number
  opacity: number
  speed: 'slow' | 'normal' | 'fast'
  size: 'small' | 'medium' | 'large'
}) {
  const pixelSize   = SIZE_MAP[size]
  const speedMul    = SPEED_MULTIPLIER[speed]

  // Generate stable particle configs — deterministic pseudo-random from index
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const baseDuration = (6 + (i * 1.3) % 6) * speedMul
        return {
          left:         `${(i * 8.3 + 3.7) % 95}%`,
          delay:        (i * 0.8) % 8,
          duration:     baseDuration,
          driftDuration: baseDuration / 3,
          size:         pixelSize,
        }
      }),
    [count, pixelSize, speedMul],
  )

  return (
    <>
      <style>{`
        @keyframes sdp-fall {
          from { transform: translateY(-80px) rotate(0deg); }
          to   { transform: translateY(calc(100% + 80px)) rotate(360deg); }
        }
        @keyframes sdp-drift {
          0%, 100% { margin-left: 0px; }
          50%       { margin-left: 28px; }
        }
      `}</style>

      <div
        style={{
          position:      'absolute',
          inset:         0,
          pointerEvents: 'none',
          overflow:      'hidden',
          zIndex:        1,
        }}
      >
        {particles.map((p, i) => (
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            style={{
              position:  'absolute',
              top:       '-80px',
              left:      p.left,
              width:     p.size,
              height:    p.size,
              opacity,
              userSelect: 'none',
              animation: [
                `sdp-fall ${p.duration}s linear ${p.delay}s infinite`,
                `sdp-drift ${p.driftDuration}s ease-in-out ${p.delay}s alternate infinite`,
              ].join(', '),
            }}
          />
        ))}
      </div>
    </>
  )
}
