/**
 * WeddingEnvelopeExperience — "Butterfly Garden" interactive entrance
 *
 * Phase flow:
 *   welcome  → Elegant welcome card with ambient gold sparkles.
 *              User sees couple name + animated "Touch to open" hint.
 *
 *   bursting → User tapped/clicked at (x, y).
 *              • Ripple ring expands from exact touch point.
 *              • 20 sparkle dots scatter outward from touch point.
 *              • 12 butterflies emerge from touch point — microscopic at
 *                birth, growing to full size as they scatter in every
 *                direction along natural curved paths.
 *              • Background + card fade away revealing the invitation.
 *
 *   done     → onComplete() fired; component returns null so the page
 *              content beneath is fully interactive.
 *
 * No video, no busy watercolor decorations, no crowded z-stack.
 * One clean interaction → one magical moment.
 */

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { gsap } from '../../lib/gsap-init'
import { ensureGoogleFont } from '../../lib/googleFonts'

type Phase = 'welcome' | 'bursting' | 'done'

interface Props {
  onComplete?:    () => void
  coupleName?:    string
  accentColor?:   string
  skip?:          boolean
  /** Legacy props — accepted for API compat but not used in the new flow */
  eventTitle?:    string
  eventDate?:     string
  eventLocation?: string
}

// ── Gold palette ───────────────────────────────────────────────────────────────
const G = {
  light: '#EDD49A',
  mid:   '#C8A96E',
  deep:  '#9E7540',
  glow:  'rgba(200,169,110,0.48)',
}

// ── Butterfly GIF assets ───────────────────────────────────────────────────────
const GIFS = [
  '/assets/animations/butterflies/butterfly-1.gif',
  '/assets/animations/butterflies/butterfly-2.gif',
  '/assets/animations/butterflies/butterfly-3.gif',
]

// ── Background bokeh points (generated once) ───────────────────────────────────
const BOKEH = [
  { x: '13%', y: '15%', s: 260, bl: 70, c: 'rgba(210,168,105,0.10)', d: 5.2 },
  { x: '84%', y: '11%', s: 210, bl: 58, c: 'rgba(200,142,92,0.08)',  d: 4.4 },
  { x: '50%', y: '87%', s: 320, bl: 80, c: 'rgba(210,168,105,0.08)', d: 6.2 },
  { x: '7%',  y: '68%', s: 185, bl: 52, c: 'rgba(200,142,92,0.06)',  d: 4.9 },
  { x: '91%', y: '62%', s: 235, bl: 64, c: 'rgba(210,168,105,0.06)', d: 5.7 },
  { x: '30%', y: '5%',  s: 170, bl: 48, c: 'rgba(205,185,140,0.06)', d: 4.1 },
]

// ── Ambient sparkle positions (stable across renders) ─────────────────────────
const AMBIENT = Array.from({ length: 40 }, (_, i) => ({
  id:  i,
  x:   Math.random() * 100,
  y:   Math.random() * 100,
  sz:  1.1 + Math.random() * 2.6,
  dl:  Math.random() * 7.5,
  dr:  4 + Math.random() * 6,
  dx:  ((Math.random() - 0.5) * 7).toFixed(2) + 'vw',
  dy:  (-(2 + Math.random() * 7)).toFixed(2) + 'vh',
}))

// ── Click-point sparkle burst ──────────────────────────────────────────────────

function fireBurst(x: number, y: number, container: HTMLElement, accent: string) {
  // Expanding ripple ring
  const ring = document.createElement('div')
  ring.style.cssText = [
    `position:fixed;left:${x}px;top:${y}px`,
    `width:0;height:0;border-radius:50%`,
    `border:2px solid ${accent}`,
    `transform:translate(-50%,-50%)`,
    `pointer-events:none`,
  ].join(';')
  container.appendChild(ring)
  gsap.to(ring, {
    width: 140, height: 140, opacity: 0,
    duration: 0.85, ease: 'power2.out',
    onComplete: () => ring.remove(),
  })

  // A second, faster inner ring
  const ring2 = document.createElement('div')
  ring2.style.cssText = ring.style.cssText
  container.appendChild(ring2)
  gsap.to(ring2, {
    width: 70, height: 70, opacity: 0,
    duration: 0.5, ease: 'power3.out',
    onComplete: () => ring2.remove(),
  })

  // Sparkle dots
  const COLORS = [G.light, G.mid, G.deep, '#FFFFFF', '#F5E4BE', accent]
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const dist  = 45 + Math.random() * 115
    const sz    = 1.8 + Math.random() * 4.5
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    const dot = document.createElement('div')
    dot.style.cssText = [
      `position:fixed;left:${x}px;top:${y}px`,
      `width:${sz}px;height:${sz}px;border-radius:50%`,
      `background:${color}`,
      `box-shadow:0 0 ${sz * 3}px ${sz}px ${G.glow}`,
      `pointer-events:none;transform:translate(-50%,-50%)`,
    ].join(';')
    container.appendChild(dot)

    gsap.to(dot, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: Math.random() < 0.4 ? 0 : 1.3,
      duration: 0.55 + Math.random() * 0.75,
      ease: 'power2.out',
      onComplete: () => dot.remove(),
    })
  }
}

// ── Butterfly: emerge from click point, grow as they fly outward ───────────────

function launchButterfly(
  container: HTMLElement,
  ox: number,         // viewport x of origin
  oy: number,         // viewport y of origin
  angle: number,      // direction (radians)
  delay: number,
) {
  const gifIdx = Math.floor(Math.random() * 3)
  const sizePx = gifIdx === 2
    ? 55 + Math.floor(Math.random() * 58)   // side-view: smaller
    : 75 + Math.floor(Math.random() * 72)   // top-view: larger

  // Build DOM butterfly
  const outer = document.createElement('div')
  outer.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;will-change:transform;'

  const inner = document.createElement('div')
  // Flip side-view GIF based on horizontal travel direction
  if (gifIdx === 2) inner.style.transform = Math.cos(angle) < 0 ? 'scaleX(-1)' : 'scaleX(1)'

  const img = document.createElement('img')
  img.src       = GIFS[gifIdx]
  img.alt       = ''
  img.draggable = false
  img.style.cssText = `width:${sizePx}px;height:auto;display:block;pointer-events:none;`

  inner.appendChild(img)
  outer.appendChild(inner)
  container.appendChild(outer)

  // ── Flight path: origin → curved mid-point → destination ──────────────────
  const vw   = window.innerWidth
  const vh   = window.innerHeight
  // Travel distance: enough to reach/pass the screen edge
  const dist = Math.max(vw, vh) * (0.55 + Math.random() * 0.72)

  // Curved mid-point (natural S/arc in flight)
  const curveDev = (Math.random() - 0.5) * (Math.PI * 0.52)
  const midDist  = dist * (0.33 + Math.random() * 0.17)
  const half     = sizePx / 2

  const sx = ox - half
  const sy = oy - half
  const mx = ox + Math.cos(angle + curveDev) * midDist - half
  const my = oy + Math.sin(angle + curveDev) * midDist - half
  const ex = ox + Math.cos(angle) * dist - half
  const ey = oy + Math.sin(angle) * dist - half

  // Start microscopic at origin
  gsap.set(outer, { x: sx, y: sy, scale: 0.025, opacity: 0 })

  const dur1 = 0.68 + Math.random() * 0.58   // emergence burst
  const dur2 = 1.10 + Math.random() * 0.95   // exit glide

  gsap.timeline({ delay })
    // Phase 1 — burst outward from origin, grow rapidly
    .to(outer, {
      x: mx, y: my,
      scale: 0.78,
      opacity: 0.92,
      duration: dur1,
      ease: 'expo.out',
    })
    // Phase 2 — continue to destination, full size then fade
    .to(outer, {
      x: ex, y: ey,
      scale: 0.88 + Math.random() * 0.30,
      opacity: 0,
      duration: dur2,
      ease: 'power1.inOut',
      onComplete: () => outer.remove(),
    })

  // Natural wing-bob on inner element (independent of flight path)
  gsap.timeline({ delay, repeat: -1, yoyo: true })
    .to(img, {
      y: 7 + Math.random() * 14,
      duration: 0.44 + Math.random() * 0.40,
      ease: 'sine.inOut',
    })
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WeddingEnvelopeExperience({
  onComplete,
  coupleName,
  accentColor,
  skip = false,
}: Props) {
  const accent = accentColor || G.mid

  const [phase, setPhase] = useState<Phase>(skip ? 'done' : 'welcome')

  const overlayRef  = useRef<HTMLDivElement>(null)  // outermost layer (click target)
  const bgRef       = useRef<HTMLDivElement>(null)   // background + ambient (fades out)
  const cardRef     = useRef<HTMLDivElement>(null)   // welcome card wrapper (fades out)
  const burstRef    = useRef<HTMLDivElement>(null)   // butterfly layer (stays visible)
  const effectsRef  = useRef<HTMLDivElement>(null)   // sparkle effects (self-cleaning)
  const clickedRef  = useRef(false)

  // Load elegant script font for couple name
  useEffect(() => {
    ensureGoogleFont("'Great Vibes', cursive")
  }, [])

  // Skip: call onComplete immediately
  useEffect(() => {
    if (skip) onComplete?.()
  }, [skip]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate welcome card elements in sequentially
  useEffect(() => {
    if (phase !== 'welcome') return
    const card = cardRef.current
    if (!card) return

    const items = Array.from(card.querySelectorAll<HTMLElement>('[data-seq]'))
    gsap.set(items, { opacity: 0, y: 28 })

    const tl = gsap.timeline({ delay: 0.4 })
    items.forEach((el, i) => {
      tl.to(el, { opacity: 1, y: 0, duration: 0.70, ease: 'power3.out' }, i * 0.17)
    })

    return () => { tl.kill() }
  }, [phase])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'welcome' || clickedRef.current) return
    clickedRef.current = true

    const x = e.clientX
    const y = e.clientY

    setPhase('bursting')

    const burst   = burstRef.current!
    const effects = effectsRef.current!

    // Disable further click interaction
    if (overlayRef.current) overlayRef.current.style.cursor = 'default'

    // ① Sparkle burst + ripple rings at exact tap point
    fireBurst(x, y, effects, accent)

    // ② 12 butterflies emerge from tap point in all directions
    const COUNT = 12
    for (let i = 0; i < COUNT; i++) {
      const baseAngle = (i / COUNT) * Math.PI * 2
      const jitter    = (Math.random() - 0.5) * 0.55
      launchButterfly(burst, x, y, baseAngle + jitter, i * 0.055)
    }

    // ③ Fade background + card to reveal invitation beneath
    const targets = [bgRef.current, cardRef.current].filter(Boolean)
    gsap.to(targets, {
      opacity: 0,
      duration: 0.9,
      delay: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        // Unblock page interaction immediately
        if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none'
        onComplete?.()
        // Let lingering butterflies finish their paths before unmounting
        setTimeout(() => setPhase('done'), 1400)
      },
    })
  }, [phase, accent, onComplete])

  const handleSkip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (clickedRef.current) return
    clickedRef.current = true
    gsap.to([bgRef.current, cardRef.current].filter(Boolean), {
      opacity: 0, duration: 0.55, ease: 'power2.inOut',
      onComplete: () => {
        setPhase('done')
        onComplete?.()
      },
    })
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      ref={overlayRef}
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 9000,
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ── CSS keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes wed-bokeh {
          from { opacity: .25; transform: translate(-50%,-50%) scale(.82); }
          to   { opacity: .90; transform: translate(-50%,-50%) scale(1.24); }
        }
        @keyframes wed-float {
          0%   { opacity: 0;   transform: translate(0, 0) scale(1); }
          15%  { opacity: .78; }
          85%  { opacity: .32; }
          100% { opacity: 0;   transform: translate(var(--sp-dx), var(--sp-dy)) scale(.3); }
        }
        @keyframes wed-pulse {
          0%   { transform: scale(.52); opacity: .88; }
          100% { transform: scale(2.65); opacity: 0; }
        }
        @keyframes wed-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes wed-breathe {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(200,169,110,0.55)); }
          50%       { filter: drop-shadow(0 0 18px rgba(200,169,110,0.90)); }
        }
      `}</style>

      {/* ── Background layer (fades out on click) ──────────────────────── */}
      <div ref={bgRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <WelcomeBackground />
        <AmbientSparkles accent={accent} />
      </div>

      {/* ── Welcome card (fades out on click) ──────────────────────────── */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <WelcomeCard coupleName={coupleName} accent={accent} />
      </div>

      {/* ── Butterfly burst layer (persists through fade) ───────────────── */}
      <div ref={burstRef}  style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 20 }} />

      {/* ── Click-point effects: ripple + sparkles ─────────────────────── */}
      <div ref={effectsRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 25 }} />

      {/* ── Skip button ────────────────────────────────────────────────── */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute', bottom: 22, right: 22,
          background: 'transparent',
          border: `1px solid ${accent}44`,
          color: `${accent}88`,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 12,
          letterSpacing: '0.22em',
          padding: '7px 22px',
          borderRadius: 3,
          cursor: 'pointer',
          zIndex: 9900,
          pointerEvents: 'all',
          transition: 'border-color .2s, color .2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${accent}90`
          e.currentTarget.style.color       = `${accent}ee`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = `${accent}44`
          e.currentTarget.style.color       = `${accent}88`
        }}
      >
        Skip
      </button>
    </div>
  )
}

// ── WelcomeBackground ──────────────────────────────────────────────────────────

function WelcomeBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      {/* Warm ivory base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 165% 145% at 50% 32%,',
          '  #FFFDF8 0%,',
          '  #FAF2E0 26%,',
          '  #F3E8CA 54%,',
          '  #EBDAA8 100%)',
        ].join(''),
      }} />

      {/* Soft cinematic vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 88% 88% at 50% 50%,',
          '  transparent 38%,',
          '  rgba(75,45,8,0.10) 100%)',
        ].join(''),
      }} />

      {/* Bokeh glows */}
      {BOKEH.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: b.x, top: b.y,
          width: b.s, height: b.s,
          borderRadius: '50%',
          background: b.c,
          filter: `blur(${b.bl}px)`,
          transform: 'translate(-50%,-50%)',
          animation: `wed-bokeh ${b.d}s ${i * 0.75}s ease-in-out infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  )
}

// ── AmbientSparkles ────────────────────────────────────────────────────────────

function AmbientSparkles({ accent }: { accent: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {AMBIENT.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.sz,
            height: s.sz,
            borderRadius: '50%',
            background: accent,
            opacity: 0,
            boxShadow: `0 0 ${s.sz * 3}px ${s.sz}px ${G.glow}`,
            animation: `wed-float ${s.dr}s ${s.dl}s ease-in-out infinite`,
            '--sp-dx': s.dx,
            '--sp-dy': s.dy,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}

// ── WelcomeCard ────────────────────────────────────────────────────────────────

function WelcomeCard({ coupleName, accent }: { coupleName?: string; accent: string }) {
  const name = coupleName?.trim() || 'Your Invitation'

  return (
    <div style={{
      textAlign: 'center',
      padding: '0 clamp(24px, 7vw, 68px)',
      maxWidth: 'clamp(300px, 88vw, 580px)',
    }}>

      {/* ── Ornamental top rule ──────────────────────────────────────── */}
      <div
        data-seq
        style={{
          display: 'flex', alignItems: 'center',
          gap: 14, marginBottom: 22, justifyContent: 'center',
        }}
      >
        <div style={{
          height: 1, flex: 1, maxWidth: 80,
          background: `linear-gradient(90deg, transparent, ${accent}99)`,
        }} />
        <span style={{ color: accent, fontSize: 12, opacity: 0.8, letterSpacing: 3 }}>✦</span>
        <div style={{
          height: 1, flex: 1, maxWidth: 80,
          background: `linear-gradient(90deg, ${accent}99, transparent)`,
        }} />
      </div>

      {/* ── Eyebrow ──────────────────────────────────────────────────── */}
      <p
        data-seq
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(9px, 1.7vw, 12px)',
          letterSpacing: '0.46em',
          textTransform: 'uppercase',
          color: accent,
          opacity: 0.65,
          marginBottom: 16,
        }}
      >
        You Are Warmly Invited
      </p>

      {/* ── Couple name / main heading ───────────────────────────────── */}
      <h1
        data-seq
        style={{
          fontFamily: "'Great Vibes', 'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(46px, 11.5vw, 94px)',
          fontWeight: 400,
          color: '#3A2414',
          lineHeight: 1.18,
          marginBottom: 24,
          letterSpacing: '0.01em',
        }}
      >
        {name}
      </h1>

      {/* ── Decorative heart divider ─────────────────────────────────── */}
      <div
        data-seq
        style={{
          display: 'flex', alignItems: 'center',
          gap: 16, justifyContent: 'center', marginBottom: 48,
        }}
      >
        <div style={{
          height: 1, width: 56,
          background: `linear-gradient(90deg, transparent, ${accent}88)`,
        }} />
        <span style={{ color: accent, fontSize: 17, opacity: 0.85 }}>♡</span>
        <div style={{
          height: 1, width: 56,
          background: `linear-gradient(90deg, ${accent}88, transparent)`,
        }} />
      </div>

      {/* ── Pulsing tap-target ───────────────────────────────────────── */}
      <div
        data-seq
        style={{ position: 'relative', width: 68, height: 68, margin: '0 auto 22px' }}
      >
        {/* Three concentric expanding rings with staggered delays */}
        {[0, 0.8, 1.6].map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: `1.5px solid ${accent}`,
              animation: `wed-pulse 2.8s ${d}s ease-out infinite`,
            }}
          />
        ))}

        {/* Center ✦ icon with breathing glow */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          color: accent,
          animation: 'wed-breathe 2.5s ease-in-out infinite',
        }}>
          ✦
        </div>
      </div>

      {/* ── Shimmer touch hint ───────────────────────────────────────── */}
      <p
        data-seq
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 'clamp(12px, 2.1vw, 15px)',
          letterSpacing: '0.26em',
          color: 'transparent',
          background: `linear-gradient(90deg, ${accent} 0%, #F0D898 38%, ${accent} 65%, #F0D898 100%)`,
          backgroundSize: '220% auto',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          animation: 'wed-shimmer 3.8s linear infinite',
        }}
      >
        Touch anywhere to open
      </p>
    </div>
  )
}
