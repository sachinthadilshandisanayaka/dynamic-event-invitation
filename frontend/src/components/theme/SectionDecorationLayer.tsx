/**
 * SectionDecorationLayer
 *
 * Renders per-section decorations defined by SectionDecorationRule[].
 * Uses position: absolute (not fixed) so decorations scroll with their section.
 *
 * Each rule declares which section roles it applies to. This component
 * resolves the current section's roles and renders only matching rules.
 *
 * Section roles computed from (sectionIndex, totalSections):
 *   first  — index 0
 *   last   — index totalSections-1
 *   middle — any section that is neither first nor last
 *   odd    — odd-indexed (1, 3, 5…)
 *   even   — even-indexed (0, 2, 4…)
 *   any    — every section
 */

import { useMemo } from 'react'
import type { SectionDecorationRule, SectionRole } from '../../data/themeRegistry'

interface Props {
  rules: SectionDecorationRule[]
  sectionIndex: number
  totalSections: number
}

function getSectionRoles(index: number, total: number): SectionRole[] {
  const roles: SectionRole[] = ['any']
  if (index === 0) roles.push('first')
  if (index === total - 1) roles.push('last')
  if (index > 0 && index < total - 1) roles.push('middle')
  if (index % 2 === 0) roles.push('even')
  else roles.push('odd')
  return roles
}

const POSITION_STYLES: Record<SectionDecorationRule['position'], React.CSSProperties> = {
  'top-left':      { top: 0,    left: 0,     transformOrigin: 'top left' },
  'top-right':     { top: 0,    right: 0,    transformOrigin: 'top right' },
  'bottom-left':   { bottom: 0, left: 0,     transformOrigin: 'bottom left' },
  'bottom-right':  { bottom: 0, right: 0,    transformOrigin: 'bottom right' },
  'top-center':    { top: 0,    left: '50%', transformOrigin: 'top center',    transform: 'translateX(-50%)' },
  'bottom-center': { bottom: 0, left: '50%', transformOrigin: 'bottom center', transform: 'translateX(-50%)' },
}

export function SectionDecorationLayer({ rules, sectionIndex, totalSections }: Props) {
  const sectionRoles = useMemo(
    () => getSectionRoles(sectionIndex, totalSections),
    [sectionIndex, totalSections],
  )

  const matching = useMemo(
    () => rules.filter(r => r.roles.some(role => sectionRoles.includes(role))),
    [rules, sectionRoles],
  )

  if (!matching.length) return null

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .sdeco-mobile-hidden { display: none !important; }
        }
        @keyframes sdeco-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {matching.map((rule) => {
          const posStyle = POSITION_STYLES[rule.position]
          const baseTransform = (posStyle as { transform?: string }).transform ?? ''
          const ruleTransform = rule.transform ?? ''
          const finalTransform = [baseTransform, ruleTransform].filter(Boolean).join(' ') || undefined

          const sharedStyle: React.CSSProperties = {
            position: 'absolute',
            top:    posStyle.top,
            right:  posStyle.right,
            bottom: posStyle.bottom,
            left:   posStyle.left,
            transformOrigin: posStyle.transformOrigin as string,
            transform: finalTransform,
            width:   rule.width,
            height:  'auto',
            opacity: rule.opacity,
            zIndex:  rule.zIndex ?? 2,
            display: 'block',
            animation: 'sdeco-fadein 1s ease forwards',
            pointerEvents: 'none',
          }

          if (rule.svgContent) {
            return (
              <div
                key={rule.id}
                className={rule.hideOnMobile ? 'sdeco-mobile-hidden' : undefined}
                style={sharedStyle}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: rule.svgContent }}
              />
            )
          }

          return (
            <img
              key={rule.id}
              src={rule.src}
              alt=""
              loading="lazy"
              draggable={false}
              className={rule.hideOnMobile ? 'sdeco-mobile-hidden' : undefined}
              style={sharedStyle}
            />
          )
        })}
      </div>
    </>
  )
}
