/**
 * EnvelopeView — CSS/PNG envelope opening experience.
 *
 * Replaces the Three.js WeddingScene with a lightweight CSS approach:
 *   • envelope-cream.png as the envelope body
 *   • wax-seal-gold.png overlaid on the flap
 *   • GSAP animation: seal breaks → envelope glows → fades to reveal card
 *
 * Matches state machine:
 *   idle/hinted → show envelope normally
 *   opening     → run opening animation, then call onOpenComplete
 *   revealing/revealed → not rendered (parent removes this component)
 */

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from '../../lib/gsap-init'

type EnvelopeState = 'idle' | 'hinted' | 'opening' | 'revealing' | 'revealed'

interface Props {
  state: EnvelopeState
  onEnvelopeClick: () => void
  onOpenComplete: () => void
}

export function EnvelopeView({ state, onEnvelopeClick, onOpenComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const envelopeRef  = useRef<HTMLDivElement>(null)
  const sealRef      = useRef<HTMLImageElement>(null)
  const glowRef      = useRef<HTMLDivElement>(null)
  const animRunRef   = useRef(false)

  // Run opening animation when state transitions to 'opening'
  useEffect(() => {
    if (state !== 'opening' || animRunRef.current) return
    animRunRef.current = true

    const tl = gsap.timeline()

    // 1. Seal cracks and breaks apart
    tl.to(sealRef.current, {
      scale: 1.25,
      rotation: 20,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
    })

    // 2. Envelope gently lifts and breathes
    tl.to(envelopeRef.current, {
      y: -16,
      scale: 1.04,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.25')

    // 3. Warm glow expands
    tl.to(glowRef.current, {
      opacity: 1,
      scale: 2.5,
      duration: 0.6,
      ease: 'power2.in',
    }, '-=0.2')

    // 4. Fade the entire container to white
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    }, '-=0.15')

    tl.call(() => onOpenComplete())
  }, [state, onOpenComplete])

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'hinted') {
      onEnvelopeClick()
    }
  }, [state, onEnvelopeClick])

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: state === 'idle' || state === 'hinted' ? 'pointer' : 'default',
        zIndex: 20,
      }}
    >
      {/* Warm glow that expands on open */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: 'clamp(200px, 40vw, 400px)',
          height: 'clamp(200px, 40vw, 400px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,248,235,0.95) 0%, rgba(255,235,200,0.6) 50%, transparent 80%)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Envelope + seal */}
      <div
        ref={envelopeRef}
        style={{
          position: 'relative',
          width: 'clamp(240px, 52vw, 440px)',
          zIndex: 5,
          filter: 'drop-shadow(0 20px 48px rgba(120,80,40,0.22))',
          transition: 'filter 0.3s ease',
        }}
      >
        <img
          src="/assets/themes/wedding/envelope/envelope-body.webp"
          alt="Envelope"
          draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* Wax seal — centered on the flap (top ~14% of envelope) */}
        <img
          ref={sealRef}
          src="/assets/themes/wedding/envelope/wax-seal-gold.webp"
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24%',
            height: 'auto',
            filter: 'drop-shadow(0 4px 12px rgba(160,100,20,0.35))',
            zIndex: 6,
          }}
        />
      </div>

      {/* "Open" label — fades out when hinted prompt shows */}
      {(state === 'idle') && (
        <p
          style={{
            marginTop: 28,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(13px, 2.2vw, 17px)',
            color: 'rgba(160,120,80,0.7)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            animation: 'env-pulse 2s ease-in-out infinite',
            userSelect: 'none',
          }}
        >
          tap to open
        </p>
      )}

      <style>{`
        @keyframes env-pulse {
          0%, 100% { opacity: 0.5; transform: translateY(0); }
          50%       { opacity: 1.0; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  )
}
