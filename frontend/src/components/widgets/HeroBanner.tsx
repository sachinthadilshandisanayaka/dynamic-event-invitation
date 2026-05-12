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
}: Props) {
  const heightClass = HEIGHTS[height] ?? HEIGHTS.large
  const overlayOpacity = typeof bgOverlay === 'number' ? bgOverlay : 0.4

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

      <div className="relative z-10 text-center container-fluid">
        {/* Title — chars cascade in on mount */}
        <AnimatedText
          as="h1"
          text={title}
          split="chars"
          heroMode
          className="text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl font-bold leading-tight mb-3 sm:mb-5 block"
          style={{ color: textColor, fontFamily: fontFamily || 'var(--font-heading, inherit)' }}
        />

        {/* Subtitle — words rise after title */}
        {subtitle && (
          <AnimatedText
            as="p"
            text={subtitle}
            split="words"
            heroMode
            delay={650}
            className="text-fluid-lg sm:text-fluid-xl md:text-fluid-2xl opacity-90 leading-relaxed max-w-prose mx-auto block"
            style={{ color: textColor, fontFamily: fontFamily || 'var(--font-body, inherit)' }}
          />
        )}
      </div>
    </div>
  )
}
