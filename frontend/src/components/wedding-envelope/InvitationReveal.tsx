/**
 * InvitationReveal — Full-bleed invitation card that appears after the
 * envelope opens.
 *
 * The card background (card-background.webp, 54 KB) is composed pixel-for-pixel
 * from the "sample_ui_1.svg" reference, matching every image transform in the SVG.
 * Text and action buttons are overlaid in the clear center zone (y≈30-70% of card).
 *
 * Layer stack:
 *   [0] card-background.webp — composed from SVG assets (bouquet×3, botanical×2,
 *       ink-wash×2, double border lines)
 *   [10] text content — couple name · headline · date / location
 *   [10] action buttons — "View Invitation" (gold) · secondary dismiss
 *
 * GSAP: backdrop → card rise → headline chars → details stagger → buttons
 */

import { useEffect, useRef, useCallback } from 'react'
import { gsap, SplitText } from '../../lib/gsap-init'

// ── Card background (composed from sample_ui_1.svg at exact SVG transforms) ──
const CARD_BG = '/assets/themes/wedding/floral-blue/card-background.webp'

// ── Colours matched from SVG source ──────────────────────────────────────────
const C_NAME   = '#2C4A6E'   // deep navy  — couple name / primary text
const C_DETAIL = '#6995ad'   // blue-grey  — matched from SVG fill path values
const C_GOLD   = '#C8A96E'   // warm gold  — ornaments and CTA button
const C_GOLD_D = '#B8966A'   // darker gold for button hover

interface Props {
  visible: boolean
  eventTitle?: string
  eventDate?: string
  eventLocation?: string
  coupleName?: string
  onContinue?: () => void   // called when user clicks "View Invitation"
}

export function InvitationReveal({
  visible,
  eventTitle = "You're Cordially Invited",
  eventDate,
  eventLocation,
  coupleName,
  onContinue,
}: Props) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const cardRef     = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const detailsRef  = useRef<HTMLDivElement>(null)
  const btnRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const card    = cardRef.current
    if (!overlay) return

    if (!visible) {
      gsap.to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.in', pointerEvents: 'none' })
      return
    }

    gsap.set(overlay, { opacity: 0, pointerEvents: 'auto' })
    gsap.set(card,    { scale: 0.86, opacity: 0, y: 32 })
    if (btnRef.current) gsap.set(btnRef.current, { opacity: 0, y: 20 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // 1. Soft backdrop wash
      tl.to(overlay, { opacity: 1, duration: 0.55, ease: 'power2.out' })

      // 2. Card rises and scales in
      tl.to(card, { scale: 1, opacity: 1, y: 0, duration: 0.75, ease: 'back.out(1.5)' }, '-=0.12')

      // 3. Headline char-by-char
      if (headlineRef.current) {
        document.fonts.ready.then(() => {
          try {
            const split = new SplitText(headlineRef.current!, { type: 'chars,words' })
            tl.fromTo(
              split.chars,
              { opacity: 0, y: 16, rotationX: -30, filter: 'blur(3px)' },
              { opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', duration: 0.52, ease: 'power3.out', stagger: 0.024 },
              '-=0.35',
            )
          } catch { /* SplitText unavailable */ }
        })
      }

      // 4. Details stagger up
      if (detailsRef.current) {
        tl.fromTo(
          detailsRef.current.children,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out', stagger: 0.10 },
          '-=0.18',
        )
      }

      // 5. Buttons fade up
      tl.to(btnRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.10')
    }, overlay)

    return () => ctx.revert()
  }, [visible])

  const handleContinue = useCallback(() => {
    gsap.to(overlayRef.current, {
      opacity: 0, scale: 0.97, duration: 0.55, ease: 'power2.in',
      onComplete: () => onContinue?.(),
    })
  }, [onContinue])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: [
          'radial-gradient(ellipse 90% 80% at 50% 44%,',
          '  rgba(245,238,228,0.92) 0%,',
          '  rgba(220,210,194,0.97) 100%)',
        ].join(''),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 200,
        opacity: 0,
        pointerEvents: 'none',
        padding: 'clamp(0.75rem, 2.5vw, 1.5rem)',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════════
          INVITATION CARD
          Background: card-background.webp (composed 1:1 from sample_ui_1.svg)
          Aspect ratio: 297.75 : 419.25 matching the reference SVG viewBox
          ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={cardRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(370px, 84vw)',
          aspectRatio: '297.75 / 419.25',
          backgroundImage: `url(${CARD_BG})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: [
            '0 50px 140px rgba(14,8,2,0.26)',
            '0 18px 48px rgba(14,8,2,0.14)',
            '0 4px 14px rgba(14,8,2,0.07)',
            'inset 0 1px 0 rgba(255,255,255,0.70)',
          ].join(', '),
        }}
      >
        {/* ── Text content — safe zone (SVG y≈30%-70%) ────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '29%',
            bottom: '24%',
            left: '12%',
            right: '12%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            zIndex: 10,
          }}
        >
          {/* Top ornament rule */}
          <GoldRule />

          <Spacer h="clamp(8px, 2vw, 14px)" />

          {/* Couple / event name — large italic, Cormorant Garamond */}
          {coupleName && (
            <div
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(19px, 4.8vw, 32px)',
                color: C_NAME,
                letterSpacing: '0.04em',
                lineHeight: 1.16,
                textAlign: 'center',
                marginBottom: 'clamp(6px, 1.5vw, 12px)',
              }}
            >
              {coupleName}
            </div>
          )}

          {/* Main headline — uppercase small-caps, wide tracking */}
          <div
            ref={headlineRef}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(8px, 1.75vw, 12px)',
              fontWeight: 400,
              color: C_DETAIL,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              lineHeight: 1.7,
              textAlign: 'center',
              marginBottom: 'clamp(8px, 2vw, 14px)',
            }}
          >
            {eventTitle}
          </div>

          {/* Middle divider */}
          <GoldRule />

          {/* Date & location details */}
          <div
            ref={detailsRef}
            style={{
              marginTop: 'clamp(8px, 2vw, 14px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(3px, 1vw, 7px)',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              textAlign: 'center',
            }}
          >
            {eventDate && (
              <div
                style={{
                  fontSize: 'clamp(8px, 1.7vw, 11.5px)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: C_DETAIL,
                  lineHeight: 1.8,
                }}
              >
                {eventDate}
              </div>
            )}
            {eventLocation && (
              <div
                style={{
                  fontStyle: 'italic',
                  fontSize: 'clamp(10px, 2.1vw, 14px)',
                  color: '#4e7494',
                  letterSpacing: '0.05em',
                  lineHeight: 1.5,
                }}
              >
                {eventLocation}
              </div>
            )}
          </div>

          <Spacer h="clamp(8px, 2vw, 14px)" />

          {/* Bottom ornament rule */}
          <GoldRule />
        </div>

        {/* ── Action buttons — lower portion of card (below floral) ──────── */}
        <div
          ref={btnRef}
          style={{
            position: 'absolute',
            bottom: '5%',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 10,
            opacity: 0,
          }}
        >
          {/* Primary CTA — gold button */}
          {onContinue && (
            <PremiumButton
              label="View Invitation"
              onClick={handleContinue}
              variant="gold"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function GoldRule() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        width: '82%',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, height: 0.75, background: `linear-gradient(to right, transparent, ${C_GOLD}99)` }} />
      <Diamond size={3.5} opacity={0.55} />
      <Diamond size={5.5} opacity={0.90} />
      <Diamond size={3.5} opacity={0.55} />
      <div style={{ flex: 1, height: 0.75, background: `linear-gradient(to left, transparent, ${C_GOLD}99)` }} />
    </div>
  )
}

function Diamond({ size, opacity }: { size: number; opacity: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: C_GOLD,
        transform: 'rotate(45deg)',
        opacity,
        flexShrink: 0,
      }}
    />
  )
}

function Spacer({ h }: { h: string }) {
  return <div style={{ height: h, flexShrink: 0 }} />
}

function PremiumButton({
  label,
  onClick,
  variant = 'gold',
}: {
  label: string
  onClick: () => void
  variant?: 'gold' | 'ghost'
}) {
  const isGold = variant === 'gold'

  return (
    <button
      onClick={onClick}
      onMouseEnter={e => {
        if (isGold) {
          e.currentTarget.style.background = C_GOLD_D
          e.currentTarget.style.boxShadow = `0 6px 22px ${C_GOLD}55, 0 2px 8px ${C_GOLD}30`
          e.currentTarget.style.letterSpacing = '0.32em'
        } else {
          e.currentTarget.style.borderColor = `${C_GOLD}88`
          e.currentTarget.style.color = C_NAME
        }
      }}
      onMouseLeave={e => {
        if (isGold) {
          e.currentTarget.style.background = C_GOLD
          e.currentTarget.style.boxShadow = `0 4px 16px ${C_GOLD}44, 0 1px 4px ${C_GOLD}22`
          e.currentTarget.style.letterSpacing = '0.28em'
        } else {
          e.currentTarget.style.borderColor = `${C_GOLD}44`
          e.currentTarget.style.color = C_DETAIL
        }
      }}
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(8px, 1.6vw, 10.5px)',
        fontWeight: 500,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: isGold ? '#FEFCF4' : C_DETAIL,
        background: isGold ? C_GOLD : 'transparent',
        border: isGold ? 'none' : `1px solid ${C_GOLD}44`,
        borderRadius: 1,
        padding: isGold ? '9px 28px' : '7px 20px',
        cursor: 'pointer',
        boxShadow: isGold
          ? `0 4px 16px ${C_GOLD}44, 0 1px 4px ${C_GOLD}22`
          : 'none',
        transition: 'background 0.22s, box-shadow 0.22s, letter-spacing 0.22s, color 0.22s, border-color 0.22s',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  )
}
