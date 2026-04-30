interface Props {
  title?: string
  subtitle?: string
  bgImage?: string
  bgColor?: string
  textColor?: string
  height?: 'small' | 'medium' | 'large' | 'full'
}

const HEIGHTS = {
  small: 'min-h-[200px]',
  medium: 'min-h-[320px]',
  large: 'min-h-[480px]',
  full: 'min-h-screen',
}

export function HeroBanner({
  title = 'Welcome!',
  subtitle,
  bgImage,
  bgColor = '#6366f1',
  textColor = '#ffffff',
  height = 'large',
}: Props) {
  return (
    <div
      className={`relative flex items-center justify-center ${HEIGHTS[height] || HEIGHTS.large} px-6`}
      style={{
        backgroundColor: bgImage ? undefined : bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay when image is set */}
      {bgImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div className="relative z-10 text-center max-w-3xl">
        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-4"
          style={{ color: textColor, fontFamily: 'var(--font-heading, inherit)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-lg md:text-2xl opacity-90 leading-relaxed"
            style={{ color: textColor, fontFamily: 'var(--font-body, inherit)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
