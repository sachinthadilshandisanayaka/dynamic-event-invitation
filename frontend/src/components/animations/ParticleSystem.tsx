import { useEffect, useRef } from 'react'
import type { AnimationCollection } from '../../data/animationCollections'

interface Props {
  collection: AnimationCollection
}

export function ParticleSystem({ collection }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || collection.particleType === 'none' || collection.particleCount === 0) return

    const particles: HTMLElement[] = []

    const spawn = () => {
      const el = document.createElement('div')
      el.style.cssText = baseStyle(collection)
      el.innerHTML = particleHTML(collection)
      positionAndAnimate(el, collection)
      container.appendChild(el)
      particles.push(el)

      // Remove after animation completes
      const dur = getAnimationDuration(collection)
      setTimeout(() => {
        el.remove()
        const idx = particles.indexOf(el)
        if (idx > -1) particles.splice(idx, 1)
      }, dur + 500)
    }

    // Initial burst then trickle
    const burstCount = Math.min(collection.particleCount, 8)
    for (let i = 0; i < burstCount; i++) {
      setTimeout(spawn, i * 400)
    }

    const interval = setInterval(spawn, getSpawnInterval(collection))

    return () => {
      clearInterval(interval)
      particles.forEach((p) => p.remove())
    }
  }, [collection.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        zIndex: 10, overflow: 'hidden',
      }}
    />
  )
}

/* ── helpers ── */

function getSpawnInterval(c: AnimationCollection): number {
  const map: Record<string, number> = {
    butterflies: 2800,
    petals:      1200,
    sparkles:    900,
    blossoms:    1500,
  }
  return map[c.particleType] ?? 2000
}

function getAnimationDuration(c: AnimationCollection): number {
  const map: Record<string, number> = {
    butterflies: 12000,
    petals:      6000,
    sparkles:    3000,
    blossoms:    7000,
  }
  return map[c.particleType] ?? 5000
}

function baseStyle(c: AnimationCollection): string {
  return `position:absolute; pointer-events:none;`
}

function particleHTML(c: AnimationCollection): string {
  const color = c.loadingAccent
  switch (c.particleType) {
    case 'butterflies': return butterflySvgHTML(color, 20 + Math.random() * 14)
    case 'petals':      return petalSvgHTML(color, 12 + Math.random() * 10)
    case 'sparkles':    return sparkleSvgHTML(color, 6 + Math.random() * 6)
    case 'blossoms':    return blossomSvgHTML(color, 10 + Math.random() * 8)
    default:            return ''
  }
}

function positionAndAnimate(el: HTMLElement, c: AnimationCollection) {
  const rnd = () => Math.random()

  switch (c.particleType) {
    case 'butterflies': {
      const top = 10 + rnd() * 70
      el.style.top = `${top}%`
      el.style.left = '-80px'
      const dur = 10000 + rnd() * 5000
      const delay = rnd() * 2000
      el.style.animation = `flutter-across ${dur}ms ${delay}ms linear both`
      if (rnd() > 0.5) {
        el.style.transform = 'scaleY(-0.85)'  // slight vertical variation
        el.style.opacity = '0.65'
      }
      break
    }
    case 'petals': {
      const left = rnd() * 100
      el.style.top = '-40px'
      el.style.left = `${left}%`
      const dur = 5000 + rnd() * 3000
      const delay = rnd() * 1500
      el.style.animation = `petal-fall ${dur}ms ${delay}ms ease-in both`
      break
    }
    case 'sparkles': {
      const left = 5 + rnd() * 90
      const bottom = 5 + rnd() * 60
      el.style.left = `${left}%`
      el.style.bottom = `${bottom}%`
      const dur = 2000 + rnd() * 2000
      const delay = rnd() * 3000
      el.style.animation = `sparkle-rise ${dur}ms ${delay}ms ease both`
      break
    }
    case 'blossoms': {
      const left = -5 + rnd() * 100
      el.style.top = '-40px'
      el.style.left = `${left}%`
      const dur = 6000 + rnd() * 3500
      const delay = rnd() * 2000
      el.style.animation = `blossom-drift ${dur}ms ${delay}ms ease-in both`
      break
    }
  }
}

/* ── SVG HTML strings ── */

function butterflySvgHTML(color: string, size: number): string {
  const h = size * 0.75
  return `<svg width="${size}" height="${h}" viewBox="0 0 120 90" style="overflow:visible">
    <g style="transform-origin:60px 45px;animation:wing-beat 0.6s ease-in-out infinite">
      <path d="M60,45 C40,20 5,15 8,40 C11,58 38,62 60,45Z" fill="${color}" opacity="0.7"/>
      <path d="M60,45 C38,55 12,72 22,82 C34,90 55,72 60,45Z" fill="${color}" opacity="0.55"/>
    </g>
    <g style="transform-origin:60px 45px;animation:wing-beat 0.6s ease-in-out infinite;transform:scaleX(-1) translateX(-120px)">
      <path d="M60,45 C40,20 5,15 8,40 C11,58 38,62 60,45Z" fill="${color}" opacity="0.7"/>
      <path d="M60,45 C38,55 12,72 22,82 C34,90 55,72 60,45Z" fill="${color}" opacity="0.55"/>
    </g>
    <ellipse cx="60" cy="45" rx="2.5" ry="16" fill="${color}" opacity="0.8"/>
  </svg>`
}

function petalSvgHTML(color: string, size: number): string {
  return `<svg width="${size}" height="${size*1.5}" viewBox="0 0 20 30">
    <ellipse cx="10" cy="15" rx="7" ry="13" fill="${color}" opacity="0.7" transform="rotate(-8 10 15)"/>
  </svg>`
}

function sparkleSvgHTML(color: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 12 12">
    <polygon points="6,0 7.5,4.5 12,6 7.5,7.5 6,12 4.5,7.5 0,6 4.5,4.5" fill="${color}"/>
  </svg>`
}

function blossomSvgHTML(color: string, size: number): string {
  const cx = size / 2
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const px = cx + Math.cos(a) * (size * 0.3)
    const py = cx + Math.sin(a) * (size * 0.3)
    const rot = (i / 5) * 360 - 90
    return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(size*0.22).toFixed(1)}" ry="${(size*0.15).toFixed(1)}" fill="${color}" opacity="0.8" transform="rotate(${rot} ${px.toFixed(1)} ${py.toFixed(1)})"/>`
  }).join('')
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${petals}<circle cx="${cx}" cy="${cx}" r="${(size*0.12).toFixed(1)}" fill="#FFE0A3"/></svg>`
}
