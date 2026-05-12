/**
 * CloudSystem — CSS + GSAP
 *
 * Clouds rendered as blurred CSS divs. Much better than WebGL for soft volumetric
 * look. Each cloud is 2-4 overlapping ellipses with different blur/opacity.
 * GSAP drives horizontal drift at varying speeds for parallax depth illusion.
 */

import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-init'
import type { CloudConfig } from '../core/types'

interface Props {
  config: CloudConfig
  visible: boolean
}

interface CloudData {
  el: HTMLDivElement
  anim: gsap.core.Tween
}

function buildCloud(cfg: CloudConfig, index: number): HTMLDivElement {
  const wrapper = document.createElement('div')
  const layers  = 2 + Math.floor(Math.random() * 3)   // 2–4 blob layers
  const baseW   = 280 + Math.random() * 320             // 280–600px
  const baseH   = baseW * (0.35 + Math.random() * 0.2)
  const depth   = 0.3 + Math.random() * 0.7            // 0 = far (small, dim), 1 = near

  wrapper.style.cssText = `
    position: absolute;
    width: ${baseW}px;
    height: ${baseH}px;
    top: ${5 + Math.random() * 50}%;
    left: -${baseW + 40}px;
    pointer-events: none;
    will-change: transform;
    opacity: 0;
  `

  for (let l = 0; l < layers; l++) {
    const blob = document.createElement('div')
    const bw   = baseW  * (0.5 + Math.random() * 0.55)
    const bh   = baseH  * (0.5 + Math.random() * 0.55)
    const bx   = (Math.random() - 0.3) * baseW * 0.6
    const by   = (Math.random() - 0.3) * baseH * 0.5
    const blur = cfg.blur * (0.4 + depth * 0.6) * (l === 0 ? 1 : 0.7)

    blob.style.cssText = `
      position: absolute;
      width: ${bw}px;
      height: ${bh}px;
      left: ${bx}px;
      top:  ${by}px;
      border-radius: 50%;
      background: radial-gradient(ellipse at 40% 35%, ${cfg.colorTop}, ${cfg.colorBottom});
      filter: blur(${blur}px);
      opacity: ${cfg.opacity * (0.4 + l * 0.25) * (0.5 + depth * 0.5)};
    `
    wrapper.appendChild(blob)
  }

  return wrapper
}

export function CloudSystem({ config, visible }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cloudsRef    = useRef<CloudData[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const clouds: CloudData[] = []

    for (let i = 0; i < config.count; i++) {
      const el       = buildCloud(config, i)
      const duration = config.speedMin + Math.random() * (config.speedMax - config.speedMin)
      const startX   = Math.random() * (window.innerWidth + 400) - 200
      const delay    = -Math.random() * duration  // stagger start across full cycle

      container.appendChild(el)

      // Start at a random horizontal position (not always from off-screen left)
      gsap.set(el, { x: startX })

      const anim = gsap.to(el, {
        x: window.innerWidth + parseFloat(el.style.width) + 60,
        duration,
        delay,
        ease: 'none',
        repeat: -1,
        onRepeat() {
          // Reset to left with slight variation on each loop
          gsap.set(el, {
            x: -(parseFloat(el.style.width) + 60),
            top: `${5 + Math.random() * 50}%`,
          })
        },
      })

      // Fade in
      if (visible) {
        gsap.to(el, { opacity: 1, duration: 2, delay: i * 0.4 })
      }

      clouds.push({ el, anim })
    }

    cloudsRef.current = clouds

    return () => {
      clouds.forEach(c => { c.anim.kill(); c.el.remove() })
    }
  }, [config])

  useEffect(() => {
    for (const c of cloudsRef.current) {
      gsap.to(c.el, { opacity: visible ? 1 : 0, duration: 1.5, ease: 'power2.inOut' })
    }
  }, [visible])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9200,
        overflow: 'hidden',
      }}
    />
  )
}
