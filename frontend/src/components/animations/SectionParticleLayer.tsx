import { useEffect, useRef } from 'react'

// ── Particle catalogue ─────────────────────────────────────────────────────────
// emoji is used both as the UI button icon (PropEditor) and as the drawn symbol.
// No SVG assets needed — emoji are built-in system fonts, instant render.

export const SECTION_PARTICLES = [
  { id: 'none',    label: 'None',      emoji: '🚫' },
  { id: 'flower',  label: 'Flowers',   emoji: '🌸' },
  { id: 'flower2', label: 'Flowers 2', emoji: '🌺' },
  { id: 'flower3', label: 'Flowers 3', emoji: '🌹' },
  { id: 'flower4', label: 'Flower 4',  emoji: '💐' },
  { id: 'flower6', label: 'Flower 6',  emoji: '🌼' },
  { id: 'flower7', label: 'Flower 7',  emoji: '🌻' },
  { id: 'baloon',  label: 'Balloons',  emoji: '🎈' },
  { id: 'ring',    label: 'Rings',     emoji: '💍' },
]

// ── Maps ───────────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<'small' | 'medium' | 'large', number> = {
  small:  32,
  medium: 48,
  large:  68,
}

// pixels per frame at ~60 fps
const SPEED_MAP: Record<'slow' | 'normal' | 'fast', number> = {
  slow:   0.55,
  normal: 1.1,
  fast:   2.2,
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  particleId: string
  count?: number
  opacity?: number
  speed?: 'slow' | 'normal' | 'fast'
  size?: 'small' | 'medium' | 'large'
}

// ── Public component ───────────────────────────────────────────────────────────

export function SectionParticleLayer({
  particleId,
  count = 12,
  opacity = 0.7,
  speed = 'normal',
  size = 'medium',
}: Props) {
  if (!particleId || particleId === 'none') return null
  const entry = SECTION_PARTICLES.find((p) => p.id === particleId)
  if (!entry || entry.id === 'none') return null

  return (
    <ParticleCanvas
      symbol={entry.emoji}
      count={count}
      opacity={opacity}
      speed={speed}
      size={size}
    />
  )
}

// ── Canvas particle engine ─────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  rot: number
  rotSpeed: number
  fallSpeed: number
  driftAmp: number
  driftPhase: number
}

function ParticleCanvas({
  symbol,
  count,
  opacity,
  speed,
  size,
}: {
  symbol: string
  count: number
  opacity: number
  speed: 'slow' | 'normal' | 'fast'
  size: 'small' | 'medium' | 'large'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelSize  = SIZE_MAP[size]
    const pxPerFrame = SPEED_MAP[speed]

    // Sync canvas pixel dimensions to its CSS-laid-out size (parent section)
    const syncSize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width  = parent.offsetWidth  || 320
      canvas.height = parent.offsetHeight || 400
    }
    syncSize()

    const ro = new ResizeObserver(syncSize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Create particles with deterministic pseudo-random starting positions
    // spread across the full section height so they're visible immediately.
    const makeParticles = (): Particle[] =>
      Array.from({ length: count }, (_, i) => ({
        x:          ((i * 97  + 37) % 100) / 100 * canvas.width,
        y:          ((i * 73  + 11) % 100) / 100 * canvas.height,
        rot:         (i * 0.7) % (Math.PI * 2),
        rotSpeed:    0.010 + (i % 5) * 0.004,
        fallSpeed:   pxPerFrame * (0.75 + (i % 7) * 0.08),
        driftAmp:    16 + (i % 4) * 7,
        driftPhase:  (i * 1.3) % (Math.PI * 2),
      }))

    const particles = makeParticles()

    let frame = 0
    let animId: number

    const draw = () => {
      animId = requestAnimationFrame(draw)
      frame++

      const w = canvas.width
      const h = canvas.height
      if (!w || !h) return

      ctx.clearRect(0, 0, w, h)
      ctx.font         = `${pixelSize}px serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha  = opacity

      for (const p of particles) {
        const driftX = Math.sin(frame * 0.018 + p.driftPhase) * p.driftAmp

        ctx.save()
        ctx.translate(p.x + driftX, p.y)
        ctx.rotate(p.rot)
        ctx.fillText(symbol, 0, 0)
        ctx.restore()

        p.y   += p.fallSpeed
        p.rot += p.rotSpeed

        // Loop back to top when particle exits the bottom
        if (p.y > h + pixelSize) {
          p.y = -pixelSize - Math.random() * 40
          p.x = Math.random() * w
        }
      }
    }

    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [symbol, count, opacity, speed, size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        1,
      }}
    />
  )
}
