/**
 * WeddingEnvelopeExperience — Cinematic orchestrator
 *
 * Layer stack (z-index):
 *   [10 ]  PremiumBackground  — warm ivory radial gradient + vignette + bokeh
 *   [15 ]  SceneDecorations   — blue watercolor florals framing the envelope
 *   [20 ]  EnvelopeScene      — large CSS/GSAP 3D envelope (idle → revealing)
 *   [60 ]  ButterflySystem    — 6 Morpho GIF butterflies (idle/hinted only)
 *   [9100] FloralSystem       — SVG gold ornaments (reveal phase only)
 *   [9200] CloudSystem        — soft mist clouds (reveal phase only)
 *   [200 ] InvitationReveal   — Blue Floral card overlay (revealing phase)
 *   [9600] SkipButton         — always visible until revealed
 *
 * State machine: idle → hinted → opening → revealing → revealed (→ unmounts)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { EnvelopeScene }    from './EnvelopeScene'
import { InvitationReveal } from './InvitationReveal'
import { ButterflySystem }  from '../../animation-engine/systems/ButterflySystem'
import { CloudSystem }      from '../../animation-engine/systems/CloudSystem'
import { FloralSystem }     from '../../animation-engine/systems/FloralSystem'
import { WEDDING_PRESET }   from '../../animation-engine/presets/wedding/WeddingPreset'

type EnvelopeState = 'idle' | 'hinted' | 'opening' | 'revealing' | 'revealed'

interface Props {
  onComplete?:    () => void
  eventTitle?:    string
  eventDate?:     string
  eventLocation?: string
  coupleName?:    string
  skip?:          boolean
  accentColor?:   string
}

export function WeddingEnvelopeExperience({
  onComplete,
  eventTitle,
  eventDate,
  eventLocation,
  coupleName,
  skip        = false,
  accentColor = '#C8A96E',
}: Props) {
  const preset                    = WEDDING_PRESET
  const [state, setState]         = useState<EnvelopeState>(skip ? 'revealed' : 'idle')
  const hintTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Show tap-hint after 2.5 s of idle
  useEffect(() => {
    if (state !== 'idle') return
    hintTimer.current = setTimeout(() => setState('hinted'), 2500)
    return () => { if (hintTimer.current) clearTimeout(hintTimer.current) }
  }, [state])

  const handleEnvelopeClick = useCallback(() => {
    if (state !== 'idle' && state !== 'hinted') return
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setState('opening')
  }, [state])

  const handleOpenComplete = useCallback(() => {
    setState('revealing')
    setTimeout(() => {
      setState('revealed')
      onComplete?.()
    }, 7000)
  }, [onComplete])

  const handleSkip = useCallback(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current)
    setState('revealed')
    onComplete?.()
  }, [onComplete])

  const isRevealing    = state === 'revealing' || state === 'revealed'
  const showEnvelope   = !isRevealing
  const showDecorations = state === 'idle' || state === 'hinted' || state === 'opening'

  if (state === 'revealed') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        overflow: 'hidden',
      }}
    >
      {/* ── Rich premium background ── */}
      <PremiumBackground />

      {/* ── Blue watercolor floral scene decorations ── */}
      <SceneDecorations visible={showDecorations} />

      {/* ── Large CSS/GSAP envelope ── */}
      {showEnvelope && (
        <EnvelopeScene
          state={state}
          onEnvelopeClick={handleEnvelopeClick}
          onOpenComplete={handleOpenComplete}
          paperColor  ="#EDE8D8"
          flapColor   ="#E4DDCA"
          accentColor={accentColor}
        />
      )}

      {/* ── Butterflies — idle/hinted only ── */}
      <ButterflySystem
        config={{ ...preset.butterflies, count: 6 }}
        visible={state === 'idle' || state === 'hinted'}
      />

      {/* ── Gold corner ornaments — reveal phase ── */}
      <FloralSystem
        config={preset.floral}
        visible={isRevealing}
      />

      {/* ── Soft clouds — reveal phase ── */}
      <CloudSystem
        config={preset.clouds}
        visible={isRevealing}
      />

      {/* ── Blue Floral invitation card ── */}
      <InvitationReveal
        visible={isRevealing}
        eventTitle={eventTitle}
        eventDate={eventDate}
        eventLocation={eventLocation}
        coupleName={coupleName}
        onContinue={handleSkip}
      />

      {/* ── Skip button ── */}
      {!isRevealing && <SkipButton onClick={handleSkip} />}
    </div>
  )
}

// ── Scene decorations — blue watercolor florals framing the envelope ──────────

function SceneDecorations({ visible }: { visible: boolean }) {
  const opacity = visible ? 1 : 0
  const transition = 'opacity 1.4s ease'

  const base: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    transition,
    zIndex: 15,
  }

  return (
    <>
      {/* Atmospheric ink wash — soft centered blue wash behind all florals */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-ink-wash.webp"
        draggable={false}
        style={{
          ...base,
          top: '50%', left: '50%',
          width: 'clamp(300px, 58vw, 640px)',
          transform: 'translate(-50%, -50%)',
          opacity: opacity * 0.18,
          transitionDelay: visible ? '0.2s' : '0s',
          zIndex: 14,
        }}
      />

      {/* Top-right — rich blue watercolor bouquet (flipped horizontally) */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp"
        draggable={false}
        style={{
          ...base,
          top: '-1%', right: '-1%',
          width: 'clamp(220px, 36vw, 440px)',
          transform: 'scaleX(-1)',
          opacity: opacity * 0.93,
          transitionDelay: visible ? '0.6s' : '0s',
        }}
      />

      {/* Top-left — watercolor ink splash with gold speckles */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-ink-splash.webp"
        draggable={false}
        style={{
          ...base,
          top: '-3%', left: '-2%',
          width: 'clamp(200px, 32vw, 400px)',
          opacity: opacity * 0.78,
          transitionDelay: visible ? '0.9s' : '0s',
        }}
      />

      {/* Bottom-left — bouquet rotated 180° */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-bouquet.webp"
        draggable={false}
        style={{
          ...base,
          bottom: '-1%', left: '-1%',
          width: 'clamp(200px, 32vw, 400px)',
          transform: 'scale(-1, -1)',
          opacity: opacity * 0.88,
          transitionDelay: visible ? '1.1s' : '0s',
        }}
      />

      {/* Bottom-right — delicate light-blue botanical stem */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp"
        draggable={false}
        style={{
          ...base,
          bottom: '-2%', right: '-1%',
          width: 'clamp(160px, 24vw, 300px)',
          transform: 'scaleX(-1) rotate(180deg)',
          opacity: opacity * 0.82,
          transitionDelay: visible ? '1.3s' : '0s',
        }}
      />

      {/* Extra: top-left botanical stem for layered depth */}
      <img
        src="/assets/themes/wedding/floral-blue/decorations/svgx-botanical.webp"
        draggable={false}
        style={{
          ...base,
          top: '2%', left: '2%',
          width: 'clamp(120px, 18vw, 220px)',
          transform: 'rotate(180deg)',
          opacity: opacity * 0.45,
          transitionDelay: visible ? '1.5s' : '0s',
        }}
      />
    </>
  )
}

// ── Premium background — warm ivory with bokeh ────────────────────────────────

function PremiumBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
      {/* Warm ivory base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 150% 130% at 50% 36%,',
          '  #FFFDF8 0%,',
          '  #F8F0DC 32%,',
          '  #F0E5C8 62%,',
          '  #E8D8B0 100%',
          ')',
        ].join(''),
      }} />

      {/* Cinematic vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 80% 80% at 50% 50%,',
          '  transparent 38%,',
          '  rgba(90,58,16,0.12) 100%',
          ')',
        ].join(''),
      }} />

      {/* Bokeh glows */}
      {BOKEH.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: b.x, top: b.y,
          width: b.size, height: b.size,
          borderRadius: '50%',
          background: b.color,
          filter: `blur(${b.blur}px)`,
          transform: 'translate(-50%,-50%)',
          animation: `bg-bokeh ${b.dur}s ${i * 0.8}s ease-in-out infinite alternate`,
          pointerEvents: 'none',
        }} />
      ))}

      <style>{`
        @keyframes bg-bokeh {
          from { opacity: 0.30; transform: translate(-50%,-50%) scale(0.86); }
          to   { opacity: 0.95; transform: translate(-50%,-50%) scale(1.20); }
        }
      `}</style>
    </div>
  )
}

const BOKEH = [
  { x: '12%',  y: '14%',  size: 300, blur: 75,  color: 'rgba(210,165,100,0.08)', dur: 5.2 },
  { x: '84%',  y: '10%',  size: 240, blur: 65,  color: 'rgba(200,135,85,0.07)',  dur: 4.4 },
  { x: '50%',  y: '85%',  size: 360, blur: 85,  color: 'rgba(210,165,100,0.06)', dur: 6.2 },
  { x: '6%',   y: '72%',  size: 200, blur: 55,  color: 'rgba(200,135,85,0.06)',  dur: 4.9 },
  { x: '90%',  y: '68%',  size: 260, blur: 70,  color: 'rgba(210,165,100,0.05)', dur: 5.7 },
  { x: '30%',  y: '4%',   size: 180, blur: 50,  color: 'rgba(205,185,140,0.07)', dur: 4.0 },
  { x: '70%',  y: '94%',  size: 220, blur: 60,  color: 'rgba(200,135,85,0.06)',  dur: 4.3 },
  { x: '22%',  y: '50%',  size: 160, blur: 45,  color: 'rgba(215,180,120,0.04)', dur: 6.8 },
  { x: '78%',  y: '44%',  size: 180, blur: 48,  color: 'rgba(210,160,100,0.04)', dur: 5.1 },
]

// ── Skip button ───────────────────────────────────────────────────────────────

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: 24,
        right:  24,
        background: 'transparent',
        border: '1px solid rgba(160,120,70,0.28)',
        color:  'rgba(130,92,45,0.60)',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 12,
        letterSpacing: '0.22em',
        padding: '7px 24px',
        borderRadius: 3,
        cursor: 'pointer',
        zIndex: 9600,
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(160,120,70,0.65)'
        e.currentTarget.style.color       = 'rgba(110,72,20,0.90)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(160,120,70,0.28)'
        e.currentTarget.style.color       = 'rgba(130,92,45,0.60)'
      }}
    >
      Skip
    </button>
  )
}
