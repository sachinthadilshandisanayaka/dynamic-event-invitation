interface Props {
  title?: string
  subtitle?: string
  bgImage?: string
  bgColor?: string
  textColor?: string
  height?: 'small' | 'medium' | 'large' | 'full'
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
}: Props) {
  const heightClass = HEIGHTS[height] ?? HEIGHTS.large

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
      {bgImage && <div className="absolute inset-0 bg-black/40" />}

      <div className="relative z-10 text-center container-fluid">
        <h1
          className="text-fluid-5xl sm:text-fluid-6xl md:text-fluid-7xl font-bold leading-tight mb-3 sm:mb-5"
          style={{ color: textColor, fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-fluid-lg sm:text-fluid-xl md:text-fluid-2xl opacity-90 leading-relaxed max-w-prose mx-auto"
            style={{ color: textColor, fontFamily: 'var(--font-body, inherit)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
