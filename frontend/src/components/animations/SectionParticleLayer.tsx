import { useMemo, useEffect, useRef, useState, useId } from 'react'

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
  if (!particleId || particleId === 'none') return null

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

// Separated so hooks run unconditionally (no early return before hooks)
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
  const pixelSize = SIZE_MAP[size]
  const speedMul  = SPEED_MULTIPLIER[speed]

  // Unique ID per instance → unique @keyframes names, no cross-section conflicts
  const rawId = useId()
  const uid   = rawId.replace(/[^a-zA-Z0-9]/g, 'x')
  const fallAnim  = `sdp-fall-${uid}`
  const driftAnim = `sdp-drift-${uid}`

  // Measure parent section height so particles travel the exact section distance
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [fallPx, setFallPx] = useState(800)

  useEffect(() => {
    // The particle wrapper sits inside the section div — its parentElement is the section
    const section = wrapperRef.current?.parentElement
    if (!section) return
    const update = () => setFallPx(Math.max(section.offsetHeight, 150) + pixelSize + 40)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(section)
    return () => ro.disconnect()
  }, [pixelSize])

  const startY = -(pixelSize + 20)

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
        @keyframes ${fallAnim} {
          0%   { transform: translateY(${startY}px) rotate(0deg); }
          100% { transform: translateY(${fallPx}px) rotate(720deg); }
        }
        @keyframes ${driftAnim} {
          0%, 100% { transform: translateX(0px); }
          50%      { transform: translateX(24px); }
        }
      `}</style>

      {/* translateZ(0) fixes iOS Safari overflow:hidden + transform clipping */}
      <div
        ref={wrapperRef}
        style={{
          position:      'absolute',
          inset:         0,
          pointerEvents: 'none',
          overflow:      'hidden',
          zIndex:        1,
          transform:     'translateZ(0)',
        }}
      >
        {particles.map((p, i) => (
          // Outer div handles horizontal drift independently from fall
          <div
            key={i}
            style={{
              position:     'absolute',
              top:          0,
              left:         p.left,
              width:        p.size,
              height:       p.size,
              willChange:   'transform',
              animation:    `${driftAnim} ${p.driftDuration}s ease-in-out ${p.delay}s alternate infinite`,
            }}
          >
            {/* Inner img handles fall + rotate — no competing transforms */}
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width:      p.size,
                height:     p.size,
                opacity,
                userSelect: 'none',
                willChange: 'transform',
                animation:  `${fallAnim} ${p.duration}s linear ${p.delay}s infinite`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
