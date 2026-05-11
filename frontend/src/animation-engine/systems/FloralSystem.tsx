/**
 * FloralSystem — SVG corner decorations
 *
 * Elegant botanical corner ornaments that trace in with GSAP strokeDashoffset.
 * Scalable and configurable per theme.
 */

import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-init'
import type { FloralConfig } from '../core/types'

interface Props {
  config: FloralConfig
  visible: boolean
}

const CORNER_SVG = (color: string, opacity: number) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <path d="M10,10 Q10,60 60,60 Q10,60 10,110" stroke="${color}" stroke-width="1" stroke-dasharray="200" stroke-dashoffset="200" opacity="${opacity}" class="floral-path"/>
  <path d="M10,10 Q60,10 60,60 Q60,10 110,10" stroke="${color}" stroke-width="1" stroke-dasharray="200" stroke-dashoffset="200" opacity="${opacity}" class="floral-path"/>
  <circle cx="60" cy="60" r="4" fill="${color}" opacity="${opacity}" class="floral-dot"/>
  <circle cx="10" cy="10" r="3" fill="${color}" opacity="${opacity * 0.8}" class="floral-dot"/>
  <path d="M20,20 Q35,15 40,30 Q50,10 60,25" stroke="${color}" stroke-width="0.8" opacity="${opacity * 0.7}" fill="none" class="floral-path"/>
  <path d="M20,20 Q15,35 30,40 Q10,50 25,60" stroke="${color}" stroke-width="0.8" opacity="${opacity * 0.7}" fill="none" class="floral-path"/>
  <circle cx="40" cy="30" r="3" fill="${color}" opacity="${opacity * 0.6}" class="floral-dot"/>
  <circle cx="30" cy="40" r="3" fill="${color}" opacity="${opacity * 0.6}" class="floral-dot"/>
  <circle cx="60" cy="25" r="2.5" fill="${color}" opacity="${opacity * 0.5}" class="floral-dot"/>
  <circle cx="25" cy="60" r="2.5" fill="${color}" opacity="${opacity * 0.5}" class="floral-dot"/>
</svg>
`

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'top-left':     { top: 0, left: 0, transform: 'rotate(0deg)' },
  'top-right':    { top: 0, right: 0, transform: 'rotate(90deg)' },
  'bottom-right': { bottom: 0, right: 0, transform: 'rotate(180deg)' },
  'bottom-left':  { bottom: 0, left: 0, transform: 'rotate(270deg)' },
  'center-top':   { top: 0, left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
  'center-bottom':{ bottom: 0, left: '50%', transform: 'translateX(-50%) rotate(225deg)' },
}

export function FloralSystem({ config, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !config.enabled) return

    // Create corner elements
    config.positions.forEach((pos) => {
      const host = document.createElement('div')
      Object.assign(host.style, {
        position: 'absolute',
        width: '120px',
        height: '120px',
        opacity: '0',
        pointerEvents: 'none',
        ...(POSITION_STYLES[pos] as object ?? {}),
      })
      host.innerHTML = CORNER_SVG(config.color, config.opacity)
      container.appendChild(host)
    })
  }, [config])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const hosts = Array.from(container.children) as HTMLDivElement[]
    if (visible) {
      hosts.forEach((host, i) => {
        gsap.to(host, { opacity: 1, duration: 0.6, delay: i * 0.15, ease: 'power2.out' })

        // Trace the paths
        const paths = host.querySelectorAll('.floral-path')
        gsap.fromTo(paths,
          { strokeDashoffset: 200 },
          { strokeDashoffset: 0, duration: 1.2, stagger: 0.15, ease: 'power2.inOut', delay: i * 0.15 }
        )
        // Pop the dots
        const dots = host.querySelectorAll('.floral-dot')
        gsap.fromTo(dots,
          { scale: 0, opacity: 0, transformOrigin: 'center' },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(2)', delay: 0.8 + i * 0.15 }
        )
      })
    } else {
      hosts.forEach(host => gsap.to(host, { opacity: 0, duration: 0.4 }))
    }
  }, [visible])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9100,
      }}
    />
  )
}
