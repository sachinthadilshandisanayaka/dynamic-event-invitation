/**
 * EnvelopeScene — Premium luxury envelope, landscape 3:2
 *
 * Reference: "Beige Elegant Envelope Coming Soon" — large warm-ivory envelope,
 * prominent gold wax seal at center fold intersection, clean X-fold crease lines,
 * elegant italic "You're Invited" script on the top flap.
 *
 * Layer stack (back → front):
 *   1. AmbientGoldDust  — delicate CSS gold particles drifting upward
 *   2. GroundShadow     — soft ellipse, breathes with float animation
 *   3. InnerLetter      — cream card; slides up after flap opens
 *   4. EnvelopeBody     — ivory rectangle with 4-panel fold shading + SVG crease lines
 *   5. EnvelopeFlap     — top triangle; rotateX −175° on open (origin: top center)
 *                         italic "You're Invited" + diagonal crease lines
 *   6. WaxSeal          — gold PNG, large, prominent, at envelope center; breaks first
 *   7. HoverGlow        — ambient radial glow on hover (GSAP, no re-render)
 *   8. TapPrompt        — "tap to open" shimmer + ripple rings
 *
 * Geometry (paddingBottom: '66%' → landscape 3:2):
 *   FLAP_APEX = 50   — center of envelope = 50% of body height
 *   Flap element     — height: 50%, clipPath: polygon(0% 0%, 100% 0%, 50% 100%)
 *   Body clip        — polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 50% 50%)
 *   Wax seal         — top: 50%, left: 50%, translate(−50%, −50%) = center
 */

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from '../../lib/gsap-init'

type State = 'idle' | 'hinted' | 'opening' | 'revealing' | 'revealed'

interface Props {
  state: State
  onEnvelopeClick: () => void
  onOpenComplete: () => void
  paperColor?: string
  flapColor?: string
  accentColor?: string
}

const FLAP_APEX = 50

export function EnvelopeScene({
  state,
  onEnvelopeClick,
  onOpenComplete,
  paperColor  = '#EDE8D8',
  flapColor   = '#E4DDCA',
  accentColor = '#C8A96E',
}: Props) {
  const sceneRef      = useRef<HTMLDivElement>(null)
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const shadowRef     = useRef<HTMLDivElement>(null)
  const envelopeRef   = useRef<HTMLDivElement>(null)
  const letterRef     = useRef<HTMLDivElement>(null)
  const flapRef       = useRef<HTMLDivElement>(null)
  const sealRef       = useRef<HTMLDivElement>(null)
  const glowRef       = useRef<HTMLDivElement>(null)
  const hintRef       = useRef<HTMLDivElement>(null)
  const floatTlRef    = useRef<gsap.core.Timeline | null>(null)
  const openCalledRef = useRef(false)

  // ── A. Entry ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const w = wrapperRef.current
    const s = shadowRef.current
    if (!w || !s) return
    gsap.set(w, { y: 70, opacity: 0, scale: 0.86 })
    gsap.set(s, { opacity: 0 })
    gsap.timeline()
      .to(w, { y: 0, opacity: 1, scale: 1, duration: 1.6, ease: 'power4.out', delay: 0.5 })
      .to(s, { opacity: 1, duration: 1.0, ease: 'power2.out' }, '-=0.7')
  }, [])

  // ── B. Idle float ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'idle' && state !== 'hinted') return
    floatTlRef.current?.kill()
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(wrapperRef.current, { y: -12, rotateZ: -0.35, duration: 3.4, ease: 'sine.inOut' })
    tl.to(shadowRef.current,  { scaleX: 0.90, opacity: 0.10, duration: 3.4, ease: 'sine.inOut' }, 0)
    floatTlRef.current = tl
    return () => { tl.kill() }
  }, [state])

  // ── C. Opening sequence ───────────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'opening' || openCalledRef.current) return
    openCalledRef.current = true
    floatTlRef.current?.kill()

    const wrap   = wrapperRef.current
    const shadow = shadowRef.current
    const flap   = flapRef.current
    const seal   = sealRef.current
    const letter = letterRef.current
    const scene  = sceneRef.current

    const envelopeH = envelopeRef.current?.offsetHeight ?? 320
    const riseY     = -(envelopeH * 1.05 + 56)

    const tl = gsap.timeline()

    // 1. Tactile press
    tl.to(wrap,   { scale: 1.025, duration: 0.22, ease: 'power2.out' })
    tl.to(shadow, { scaleX: 1.06, opacity: 0.28, duration: 0.22 }, '<')
    tl.to({}, { duration: 0.16 })

    // 2. Seal cracks and dissolves
    tl.to(seal, { scale: 1.16, duration: 0.18, ease: 'power2.out' })
    tl.to(seal, { scale: 0, rotation: 22, opacity: 0, duration: 0.44, ease: 'back.in(2.2)' })

    // 3. Flap sweeps open from top edge
    tl.to(flap, { rotateX: -175, duration: 1.35, ease: 'power2.inOut' }, '-=0.16')

    // 4. Envelope settles
    tl.to(wrap, { scale: 1, duration: 0.60, ease: 'power2.out' }, '-=1.10')

    // 5. Letter rises through opening
    tl.to(letter, { y: riseY, duration: 1.70, ease: 'power3.out' }, '-=0.55')

    // 6. Envelope fades as letter clears
    tl.to(envelopeRef.current, { opacity: 0.08, duration: 0.75 }, '-=0.60')
    tl.to(shadow,              { opacity: 0,    duration: 0.50 }, '<')

    // 7. Letter breathing peak
    tl.to(letter, { scale: 1.06, duration: 0.35, ease: 'power2.out' }, '-=0.18')

    // 8. Graceful scene fade → InvitationReveal
    tl.to(scene, { opacity: 0, duration: 0.60, ease: 'power2.in' }, '-=0.08')
    tl.call(() => onOpenComplete())
  }, [state, onOpenComplete])

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'hinted') onEnvelopeClick()
  }, [state, onEnvelopeClick])

  const handleMouseEnter = useCallback(() => {
    if (state !== 'idle' && state !== 'hinted') return
    gsap.to(glowRef.current, { opacity: 1, duration: 0.38, ease: 'power2.out' })
  }, [state])

  const handleMouseLeave = useCallback(() => {
    gsap.to(glowRef.current, { opacity: 0, duration: 0.50, ease: 'power2.in' })
  }, [])

  const interactive = state === 'idle' || state === 'hinted'

  return (
    <div
      ref={sceneRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <AmbientGoldDust accentColor={accentColor} />

      {/* Perspective container */}
      <div style={{ perspective: '1400px', perspectiveOrigin: '50% 60%', position: 'relative' }}>

        {/* Float + interaction wrapper */}
        <div
          ref={wrapperRef}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            /* Large — fills ~80% of viewport, matches reference aesthetic */
            width: 'clamp(320px, 78vw, 700px)',
            cursor: interactive ? 'pointer' : 'default',
            userSelect: 'none',
            willChange: 'transform',
          }}
        >
          {/* Ground shadow — soft, large */}
          <div
            ref={shadowRef}
            style={{
              position: 'absolute',
              bottom: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '84%',
              height: 28,
              background: 'radial-gradient(ellipse, rgba(60,42,18,0.30) 0%, transparent 70%)',
              filter: 'blur(14px)',
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          />

          {/* Envelope 3D container — landscape 3:2 */}
          <div
            ref={envelopeRef}
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '66%',
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
            }}
          >
            {/* Hover glow — GSAP controlled */}
            <div
              ref={glowRef}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: 14,
                background: `radial-gradient(ellipse at 50% 50%,
                  rgba(${hexToRgb(accentColor)},0.16) 0%,
                  rgba(${hexToRgb(accentColor)},0.07) 42%,
                  transparent 68%)`,
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 1,
                willChange: 'opacity',
              }}
            />

            {/* ── Inner letter — slides up on open ──────────────────────── */}
            <div
              ref={letterRef}
              style={{
                position: 'absolute',
                bottom: '7%',
                left: '8%',
                right: '8%',
                height: '74%',
                background: 'linear-gradient(155deg, #FEFCF8 0%, #F8F2E8 100%)',
                borderRadius: 4,
                boxShadow: [
                  '0 10px 40px rgba(70,48,16,0.18)',
                  '0 3px 10px  rgba(70,48,16,0.12)',
                  'inset 0 1px 0 rgba(255,255,255,0.90)',
                ].join(', '),
                zIndex: 2,
                overflow: 'hidden',
                willChange: 'transform',
              }}
            >
              <LetterPreview accentColor={accentColor} />
            </div>

            {/* ── Envelope body — real photographic envelope texture + CSS fold panels ── */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: paperColor,
                backgroundImage: 'url(/assets/themes/wedding/envelope/envelope-body.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 50% ${FLAP_APEX}%)`,
                borderRadius: 4,
                zIndex: 5,
                overflow: 'hidden',
              }}
            >
              {/* Left fold panel — shadow side, slightly warmer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(30,20,8,0.055) 0%, transparent 50%)',
                clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
              }} />

              {/* Right fold panel — light side, slightly cooler */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to left, rgba(255,252,248,0.08) 0%, transparent 50%)',
                clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
              }} />

              {/* Bottom fold panel */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(30,20,8,0.04) 0%, transparent 50%)',
                clipPath: 'polygon(0% 100%, 50% 50%, 100% 100%)',
              }} />

              {/* Inner pocket darkness where flap opens */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: `${FLAP_APEX}%`,
                background: 'linear-gradient(to bottom, rgba(25,16,6,0.10) 0%, transparent 88%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              }} />

              {/* Subtle paper texture overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 3px,
                  rgba(200,180,140,0.018) 3px,
                  rgba(200,180,140,0.018) 4px
                )`,
              }} />

              {/* SVG crease lines — all 4 diagonals from corners → center */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="0"   y1="100" x2="50" y2="50" stroke="rgba(38,26,10,0.13)" strokeWidth="0.5" />
                <line x1="100" y1="100" x2="50" y2="50" stroke="rgba(38,26,10,0.13)" strokeWidth="0.5" />
                <line x1="0"   y1="0"   x2="50" y2="50" stroke="rgba(38,26,10,0.08)" strokeWidth="0.5" />
                <line x1="100" y1="0"   x2="50" y2="50" stroke="rgba(38,26,10,0.08)" strokeWidth="0.5" />
              </svg>
            </div>

            {/* ── Top flap — rotates backward on open ──────────────────── */}
            <div
              ref={flapRef}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '50%',
                background: flapColor,
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 15,
                willChange: 'transform',
                overflow: 'hidden',
              }}
            >
              {/* Flap specular highlight */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 10%, rgba(255,252,248,0.18) 0%, transparent 50%)',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              }} />

              {/* Paper texture on flap */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 3px,
                  rgba(200,180,140,0.018) 3px,
                  rgba(200,180,140,0.018) 4px
                )`,
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              }} />

              {/* Flap crease lines */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="0"   y1="0" x2="50" y2="100" stroke="rgba(38,26,10,0.07)" strokeWidth="0.5" />
                <line x1="100" y1="0" x2="50" y2="100" stroke="rgba(38,26,10,0.07)" strokeWidth="0.5" />
              </svg>

              {/* "You're Invited" — elegant italic script */}
              <div style={{
                position: 'absolute',
                top: '18%',
                left: 0, right: 0,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(11px, 2.0vw, 17px)',
                  letterSpacing: '0.18em',
                  color: 'rgba(52,36,16,0.52)',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}>
                  You&apos;re Invited
                </span>
              </div>
            </div>

            {/* ── Wax seal — large, gold, at envelope center ────────────── */}
            <div
              ref={sealRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                willChange: 'transform, opacity',
                transformOrigin: 'center center',
              }}
            >
              {/* Seal glow ring */}
              <div style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, rgba(${hexToRgb(accentColor)},0.20) 0%, transparent 70%)`,
                animation: 'seal-pulse 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              <img
                src="/assets/themes/wedding/envelope/wax-seal-gold.webp"
                alt=""
                draggable={false}
                style={{
                  /* Large and prominent — matches reference proportions */
                  width: 'clamp(76px, 14.5vw, 118px)',
                  height: 'auto',
                  display: 'block',
                  position: 'relative',
                  filter: [
                    'drop-shadow(0 6px 18px rgba(140,90,20,0.50))',
                    'drop-shadow(0 2px 5px  rgba(140,90,20,0.35))',
                    'drop-shadow(0 0px 30px rgba(200,160,80,0.22))',
                  ].join(' '),
                }}
              />
            </div>
          </div>
        </div>

        {/* Tap prompt */}
        <TapPrompt hintRef={hintRef} visible={interactive} accentColor={accentColor} />
      </div>

      <style>{`
        @keyframes es-dust {
          0%   { transform: translateY(0) translateX(0) scale(1);   opacity: 0;    }
          15%  { opacity: 0.80; }
          75%  { opacity: 0.38; }
          100% { transform: translateY(-100px) translateX(var(--dx)) scale(0.15); opacity: 0; }
        }
        @keyframes seal-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50%       { opacity: 1.0; transform: scale(1.06); }
        }
      `}</style>
    </div>
  )
}

// ── Letter preview content ────────────────────────────────────────────────────

function LetterPreview({ accentColor }: { accentColor: string }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10% 14% 10%',
      gap: 12,
    }}>
      <GoldOrnament accentColor={accentColor} />
      {[1, 0.70, 0.88, 0.55, 0.75].map((w, i) => (
        <div key={i} style={{
          width: `${w * 72}%`,
          height: i === 0 ? 10 : i === 2 ? 8 : 5,
          borderRadius: 4,
          background: `linear-gradient(to right, transparent, ${accentColor}55, transparent)`,
          opacity: 0.58 - i * 0.07,
        }} />
      ))}
      <div style={{ marginTop: 8 }}>
        <GoldOrnament accentColor={accentColor} />
      </div>
    </div>
  )
}

function GoldOrnament({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '62%' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${accentColor}88)` }} />
      <div style={{ width: 6, height: 6, background: accentColor, transform: 'rotate(45deg)', opacity: 0.70 }} />
      <div style={{ width: 3, height: 3, background: accentColor, transform: 'rotate(45deg)', opacity: 0.45 }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${accentColor}88)` }} />
    </div>
  )
}

// ── Ambient gold dust — drifts upward, very delicate ─────────────────────────

const DUST_COUNT = 26

function AmbientGoldDust({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: DUST_COUNT }).map((_, i) => {
        const x    = 5 + (i / DUST_COUNT) * 90
        const size = 1.2 + (i % 5) * 0.7
        const dur  = 6 + (i % 7) * 1.3
        const del  = (i * 0.44) % 10
        const bot  = 6 + (i % 6) * 12
        const dx   = (i % 2 === 0 ? 1 : -1) * (4 + (i % 5) * 3)

        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: `${bot}%`,
            left:   `${x}%`,
            width:  size,
            height: size,
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 ${size * 3}px ${accentColor}88`,
            opacity: 0,
            // @ts-ignore
            '--dx': `${dx}px`,
            animation: `es-dust ${dur}s ${del}s ease-in-out infinite`,
          } as React.CSSProperties} />
        )
      })}
    </div>
  )
}

// ── Tap prompt ────────────────────────────────────────────────────────────────

function TapPrompt({
  hintRef,
  visible,
  accentColor,
}: {
  hintRef: React.RefObject<HTMLDivElement>
  visible: boolean
  accentColor: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (visible) {
      gsap.fromTo(el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 1.8 }
      )
    } else {
      gsap.to(el, { opacity: 0, y: -8, duration: 0.30, ease: 'power2.in' })
    }
  }, [visible])

  const setRef = (el: HTMLDivElement | null) => {
    (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (hintRef as React.MutableRefObject<HTMLDivElement | null>).current = el
  }

  return (
    <div
      ref={setRef}
      style={{
        marginTop: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        {[0, 0.55, 1.10].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `1.5px solid ${accentColor}58`,
            animation: `tap-ring 2.2s ${d}s ease-out infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
          animation: 'tap-bounce 2.0s ease-in-out infinite',
          filter: `drop-shadow(0 2px 6px ${accentColor}60)`,
        }}>✦</div>
      </div>

      <span style={{
        fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 'clamp(12px, 1.9vw, 15px)',
        letterSpacing: '0.28em',
        color: 'transparent',
        background: `linear-gradient(90deg, ${accentColor} 0%, #E8C88A 38%, ${accentColor} 68%, #E8C88A 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        animation: 'tap-shimmer 3.4s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        Tap to open
      </span>

      <style>{`
        @keyframes tap-ring   { 0% { transform: scale(0.5); opacity: 0.65; } 100% { transform: scale(2.8); opacity: 0; } }
        @keyframes tap-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes tap-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
      `}</style>
    </div>
  )
}

// ── Utility ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return isNaN(r) ? '200,169,110' : `${r},${g},${b}`
}
