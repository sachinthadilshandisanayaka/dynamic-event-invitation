/**
 * ThemeDecorationLayer
 *
 * Renders corner/overlay decorative images defined in a ThemeDefinition.
 * Sits as a fixed layer (pointer-events: none) above the page background
 * but below content (z-index: 5 by default).
 *
 * Features:
 *   • Respects hideOnMobile flag (hidden below 768px)
 *   • Lazy-loads images (loading="lazy")
 *   • Fade-in on load to avoid flash
 *   • Zero layout impact (position: fixed)
 *   • Fully driven by ThemeDefinition.decorations — no hardcoding
 */

import { useMemo } from 'react'
import type { ThemeDecoration } from '../../data/themeRegistry'

interface Props {
  decorations: ThemeDecoration[]
  className?: string
}

// Base position styles — no transform on these; extra transforms come from decoration.transform
const POSITION_STYLES: Record<ThemeDecoration['position'], React.CSSProperties> = {
  'top-left':      { top: 0, left: 0, transformOrigin: 'top left' },
  'top-right':     { top: 0, right: 0, transformOrigin: 'top right' },
  'bottom-left':   { bottom: 0, left: 0, transformOrigin: 'bottom left' },
  'bottom-right':  { bottom: 0, right: 0, transformOrigin: 'bottom right' },
  'top-center':    { top: 0, left: '50%', transform: 'translateX(-50%)', transformOrigin: 'top center' },
  'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)', transformOrigin: 'bottom center' },
}

export function ThemeDecorationLayer({ decorations, className }: Props) {
  const items = useMemo(() => decorations, [decorations])
  if (!items.length) return null

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .theme-deco-mobile-hidden { display: none !important; }
        }
        @keyframes theme-deco-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className={className}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
          overflow: 'hidden',
        }}
      >
        {items.map((deco, i) => {
          const posStyle = POSITION_STYLES[deco.position]

          // Merge position's base transform (only top/bottom-center have one) with decoration transform
          const baseTransform  = posStyle.transform ?? ''
          const decoTransform  = deco.transform ?? ''
          const finalTransform = [baseTransform, decoTransform].filter(Boolean).join(' ') || undefined

          return (
            <img
              key={i}
              src={deco.src}
              alt=""
              loading="lazy"
              draggable={false}
              className={deco.hideOnMobile ? 'theme-deco-mobile-hidden' : undefined}
              style={{
                position: 'absolute',
                top:    posStyle.top,
                right:  posStyle.right,
                bottom: posStyle.bottom,
                left:   posStyle.left,
                transformOrigin: posStyle.transformOrigin,
                transform: finalTransform,
                width: deco.width,
                height: 'auto',
                opacity: deco.opacity,
                zIndex: deco.zIndex ?? 5,
                display: 'block',
                animation: 'theme-deco-fadein 0.8s ease forwards',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
