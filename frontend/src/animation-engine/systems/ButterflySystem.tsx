/**
 * ButterflySystem — GIF images + GSAP waypoint flight
 *
 * Uses the actual butterfly GIF assets (moved to public/assets/animations/butterflies/).
 * Flight design:
 *   • Each butterfly launches from a random off-screen edge
 *   • Flies through a mid-screen waypoint then exits off another edge
 *   • Vertical bobbing layered on top via a separate inner element
 *   • Horizontal flip on side-view GIF based on travel direction
 *   • Staggered launch delays → never appears robotic or synchronised
 *   • Smooth opacity: fade-in on entry, fade-out on exit
 */

import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap-init'
import type { ButterflyConfig } from '../core/types'

interface Props {
  config: ButterflyConfig
  visible: boolean
}

// GIF types: 0,1 = Morpho overhead view; 2 = side-view in-flight
const GIFS = [
  '/assets/animations/butterflies/butterfly-1.gif',
  '/assets/animations/butterflies/butterfly-2.gif',
  '/assets/animations/butterflies/butterfly-3.gif',
]

interface Butterfly {
  outer: HTMLDivElement   // flight path controlled by GSAP (x, y, rotation)
  inner: HTMLDivElement   // vertical bobbing (y oscillation, doesn't clash with outer)
  img:   HTMLImageElement
  gifIdx: number
  mainTl:  gsap.core.Timeline | null
  bobTl:   gsap.core.Timeline | null
}

// ── DOM factory ──────────────────────────────────────────────────────────────

function createButterfly(gifIdx: number, sizePx: number): Butterfly {
  const outer = document.createElement('div')
  outer.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    pointer-events: none;
    z-index: 9500;
    will-change: transform;
    opacity: 0;
  `

  const inner = document.createElement('div')
  inner.style.cssText = `
    display: block;
    transform-origin: center center;
  `

  const img = document.createElement('img')
  img.src   = GIFS[gifIdx]
  img.alt   = ''
  img.draggable = false
  img.style.cssText = `
    width: ${sizePx}px;
    height: auto;
    display: block;
    pointer-events: none;
    user-select: none;
  `

  inner.appendChild(img)
  outer.appendChild(inner)
  return { outer, inner, img, gifIdx, mainTl: null, bobTl: null }
}

// ── Flight helpers ────────────────────────────────────────────────────────────

function randomEdge(): [number, number, number] {
  // returns [x, y, edgeIndex: 0=top 1=right 2=bottom 3=left]
  const w = window.innerWidth
  const h = window.innerHeight
  const m = 150
  const e = Math.floor(Math.random() * 4)
  switch (e) {
    case 0: return [m + Math.random() * (w - m * 2), -m, 0]
    case 1: return [w + m, m + Math.random() * (h - m * 2), 1]
    case 2: return [m + Math.random() * (w - m * 2), h + m, 2]
    default: return [-m, m + Math.random() * (h - m * 2), 3]
  }
}

function exitEdge(entryIdx: number): [number, number] {
  const choices = [0, 1, 2, 3].filter(e => e !== entryIdx)
  const pick = choices[Math.floor(Math.random() * choices.length)]
  const [x, y] = randomEdge()
  // Re-roll using the chosen edge
  const w = window.innerWidth
  const h = window.innerHeight
  const m = 150
  switch (pick) {
    case 0: return [m + Math.random() * (w - m * 2), -m]
    case 1: return [w + m, m + Math.random() * (h - m * 2)]
    case 2: return [m + Math.random() * (w - m * 2), h + m]
    default: return [-m, m + Math.random() * (h - m * 2)]
  }
  void x; void y  // unused but needed for type
}

// Gentle tilt based on travel direction — butterflies bank subtly, not like planes
function tiltAngle(fromX: number, fromY: number, toX: number, toY: number): number {
  const deg = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI)
  return Math.max(-22, Math.min(22, deg * 0.28))
}

// ── Core flight function ──────────────────────────────────────────────────────

function launch(bf: Butterfly, delay: number) {
  bf.mainTl?.kill()
  bf.bobTl?.kill()

  const w = window.innerWidth
  const h = window.innerHeight

  const [sx, sy, entryIdx] = randomEdge()

  // Mid-waypoint: somewhere in the visible screen, varied heights
  // Upper 60% of screen feels airy; avoid dead-center (envelope territory)
  const midBias = Math.random()
  const mx = w * 0.12 + Math.random() * w * 0.76
  const my = midBias < 0.4
    ? h * 0.06 + Math.random() * h * 0.25   // upper screen
    : h * 0.32 + Math.random() * h * 0.35   // mid screen

  const [ex, ey] = exitEdge(entryIdx)

  // Side-view GIF (gifIdx 2) flips horizontally with travel direction
  const isSideView = bf.gifIdx === 2
  const hFlip1 = isSideView ? (mx > sx ? 1 : -1) : 1
  const hFlip2 = isSideView ? (ex > mx ? 1 : -1) : 1

  const tilt1 = isSideView ? 0 : tiltAngle(sx, sy, mx, my)
  const tilt2 = isSideView ? 0 : tiltAngle(mx, my, ex, ey)

  // Speed: side-view flies faster (it looks like it's actively flapping forward)
  const dur1 = isSideView
    ? 2.5 + Math.random() * 2.5
    : 4.0 + Math.random() * 4.0
  const dur2 = isSideView
    ? 2.5 + Math.random() * 2.5
    : 4.0 + Math.random() * 4.0

  bf.mainTl = gsap.timeline({ delay })
  bf.mainTl
    // Position off-screen silently
    .set(bf.outer, {
      x: sx, y: sy,
      rotation: tilt1,
      scaleX: hFlip1,
      scaleY: 1,
      opacity: 0,
    })
    // Entry: glide to mid-waypoint, fade in
    .to(bf.outer, {
      x: mx, y: my,
      rotation: tilt1,
      scaleX: hFlip1,
      opacity: 0.9,
      duration: dur1,
      ease: 'power1.inOut',
    })
    // Exit: glide to far edge, fade out
    .to(bf.outer, {
      x: ex, y: ey,
      rotation: tilt2,
      scaleX: hFlip2,
      opacity: 0,
      duration: dur2,
      ease: 'power1.inOut',
      onComplete: () => {
        // Re-launch after a natural pause
        launch(bf, 0.5 + Math.random() * 5)
      },
    })

  // Bobbing: up/down on inner element — layered independently of flight path
  const bobAmp = 10 + Math.random() * 18
  const bobDur = 0.65 + Math.random() * 0.55

  bf.bobTl = gsap.timeline({ delay, repeat: -1, yoyo: true })
  bf.bobTl.to(bf.inner, {
    y: bobAmp,
    duration: bobDur,
    ease: 'sine.inOut',
  })
}

// ── React component ───────────────────────────────────────────────────────────

export function ButterflySystem({ config, visible }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const butterfliesRef = useRef<Butterfly[]>([])

  // Create instances and start staggered flights
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const list: Butterfly[] = []

    for (let i = 0; i < config.count; i++) {
      const gifIdx = i % 3

      // Size: Morpho top-view larger (they're majestic), side-view medium
      const sizePx = gifIdx === 2
        ? 75  + Math.floor(Math.random() * 55)  // side-view: 75–130 px
        : 110 + Math.floor(Math.random() * 75)  // top-view:  110–185 px

      const bf = createButterfly(gifIdx, sizePx)
      container.appendChild(bf.outer)
      list.push(bf)

      // Stagger so they arrive at different times — feels alive, not cloned
      const initDelay = i * 0.9 + Math.random() * 2.5
      launch(bf, initDelay)
    }

    butterfliesRef.current = list

    return () => {
      list.forEach(bf => {
        bf.mainTl?.kill()
        bf.bobTl?.kill()
        bf.outer.remove()
      })
    }
  }, [config])

  // Visibility: pause/resume timelines; fade out instantly when hidden
  useEffect(() => {
    for (const bf of butterfliesRef.current) {
      if (visible) {
        bf.mainTl?.resume()
        bf.bobTl?.resume()
      } else {
        bf.mainTl?.pause()
        bf.bobTl?.pause()
        gsap.to(bf.outer, { opacity: 0, duration: 0.5 })
      }
    }
  }, [visible])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9500,
        overflow: 'hidden',
      }}
    />
  )
}
