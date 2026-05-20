import { useId } from 'react'
import { AnimatedText } from '../animations/AnimatedText'

interface Props {
  title?: string
  subtitle?: string
  bgImage?: string
  bgColor?: string
  textColor?: string
  height?: 'small' | 'medium' | 'large' | 'full'
  bgOverlay?: number
  fontFamily?: string
  // Custom text position (percentage 0–100). Undefined = default centered layout.
  titleX?: number
  titleY?: number
  subtitleX?: number
  subtitleY?: number
  // Mobile overrides — fall back to desktop values when not set
  titleXMobile?: number
  titleYMobile?: number
  subtitleXMobile?: number
  subtitleYMobile?: number
}

const HEIGHTS: Record<string, string> = {
  small:  'min-h-[clamp(300px,40vh,440px)]',
  medium: 'min-h-[clamp(400px,60vh,640px)]',
  large:  'min-h-[100dvh]',
  full:   'min-h-[100dvh]',
}

export function HeroBanner({
  title = 'Welcome!',
  subtitle,
  bgImage,
  bgColor = '#6366f1',
  textColor = '#ffffff',
  height = 'large',
  bgOverlay = 0.4,
  fontFamily,
  titleX,
  titleY,
  subtitleX,
  subtitleY,
  titleXMobile,
  titleYMobile,
  subtitleXMobile,
  subtitleYMobile,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const heightClass = HEIGHTS[height] ?? HEIGHTS.large
  const overlayOpacity = typeof bgOverlay === 'number' ? bgOverlay : 0.4

  const customPos = titleX !== undefined

  // Resolved desktop values (with sensible defaults)
  const tx = titleX ?? 50
  const ty = titleY ?? 40
  const sx = subtitleX ?? 50
  const sy = subtitleY ?? 60

  // Resolved mobile values (fall back to desktop if not explicitly set)
  const txm = titleXMobile ?? tx
  const tym = titleYMobile ?? ty
  const sxm = subtitleXMobile ?? sx
  const sym = subtitleYMobile ?? sy

  const font = fontFamily || 'var(--font-heading, inherit)'
  const bodyFont = fontFamily || 'var(--font-body, inherit)'

  return (
    <div
      className={`relative flex items-center justify-center ${heightClass} px-fluid`}
      style={{
        backgroundColor: bgImage ? undefined : bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {bgImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      {customPos ? (
        // ── Custom position mode: each text element is independently placed ──
        <>
          <style>{`
            .hero-${uid}-title {
              position: absolute;
              left: ${tx}%;
              top: ${ty}%;
              transform: translate(-50%, -50%);
              text-align: center;
              width: 90%;
              max-width: 100%;
              z-index: 10;
            }
            .hero-${uid}-subtitle {
              position: absolute;
              left: ${sx}%;
              top: ${sy}%;
              transform: translate(-50%, -50%);
              text-align: center;
              width: 90%;
              max-width: 100%;
              z-index: 10;
            }
            @media (max-width: 640px) {
              .hero-${uid}-title {
                left: ${txm}%;
                top: ${tym}%;
              }
              .hero-${uid}-subtitle {
                left: ${sxm}%;
                top: ${sym}%;
              }
            }
          `}</style>

          <AnimatedText
            as="h1"
            text={title}
            split="chars"
            heroMode
            className={`hero-${uid}-title text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl font-bold leading-tight`}
            style={{ color: textColor, fontFamily: font }}
          />

          {subtitle && (
            <AnimatedText
              as="p"
              text={subtitle}
              split="words"
              heroMode
              delay={650}
              className={`hero-${uid}-subtitle text-fluid-lg sm:text-fluid-xl md:text-fluid-2xl opacity-90 leading-relaxed`}
              style={{ color: textColor, fontFamily: bodyFont }}
            />
          )}
        </>
      ) : (
        // ── Default centered layout ───────────────────────────────────────────
        <div className="relative z-10 text-center container-fluid">
          <AnimatedText
            as="h1"
            text={title}
            split="chars"
            heroMode
            className="text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl font-bold leading-tight mb-3 sm:mb-5 block"
            style={{ color: textColor, fontFamily: font }}
          />

          {subtitle && (
            <AnimatedText
              as="p"
              text={subtitle}
              split="words"
              heroMode
              delay={650}
              className="text-fluid-lg sm:text-fluid-xl md:text-fluid-2xl opacity-90 leading-relaxed max-w-prose mx-auto block"
              style={{ color: textColor, fontFamily: bodyFont }}
            />
          )}
        </div>
      )}
    </div>
  )
}
