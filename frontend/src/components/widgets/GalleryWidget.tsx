import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface Props {
  title?: string
  images?: string[]
  layout?: 'grid' | 'masonry' | 'spotlight'
  columns?: '2' | '3' | '4'
  gap?: 'tight' | 'normal' | 'wide'
  rounded?: boolean
  bgColor?: string
  textColor?: string
  fontFamily?: string
  titleSize?: 'sm' | 'md' | 'lg' | 'xl'
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'
}

const GAP_PX: Record<string, number> = { tight: 4, normal: 12, wide: 24 }
const COL_COUNT: Record<string, number> = { '2': 2, '3': 3, '4': 4 }

const TITLE_SIZE: Record<string, string> = {
  sm: 'clamp(18px, 2.5vw, 24px)',
  md: 'clamp(22px, 3vw, 32px)',
  lg: 'clamp(26px, 3.5vw, 40px)',
  xl: 'clamp(30px, 4vw, 52px)',
}

const ASPECT: Record<string, string> = {
  square: '1/1',
  landscape: '16/9',
  portrait: '3/4',
  auto: 'auto',
}

export function GalleryWidget({
  title,
  images = [],
  layout = 'grid',
  columns = '3',
  gap = 'normal',
  rounded = true,
  bgColor = '#ffffff',
  textColor = '#111827',
  fontFamily,
  titleSize = 'md',
  aspectRatio = 'square',
}: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const gapPx    = GAP_PX[gap]    ?? 12
  const colCount = COL_COUNT[columns] ?? 3
  const radius   = rounded ? 'var(--border-radius, 8px)' : '0'

  const prev = useCallback(() =>
    setLightbox((i) => (i !== null ? Math.max(0, i - 1) : null)), [])
  const next = useCallback(() =>
    setLightbox((i) => (i !== null ? Math.min(images.length - 1, i + 1) : null)), [images.length])
  const close = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next, close])

  const titleStyle: React.CSSProperties = {
    color: textColor,
    fontFamily: fontFamily || 'var(--font-heading, inherit)',
    fontSize: TITLE_SIZE[titleSize] ?? TITLE_SIZE.md,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: gapPx * 2.5,
    letterSpacing: '-0.01em',
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: 'var(--font-heading, inherit)',
    backgroundColor: bgColor,
    paddingTop: 'clamp(4rem, 10vw, 6rem)',
    paddingBottom: 'clamp(4rem, 10vw, 6rem)',
    paddingLeft: 'clamp(1rem, 5vw, 3rem)',
    paddingRight: 'clamp(1rem, 5vw, 3rem)',
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (images.length === 0) {
    const cols = Array.from({ length: colCount })
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {title && <h3 style={titleStyle}>{title}</h3>}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            gap: gapPx,
          }}>
            {[...cols, ...cols].map((_, i) => (
              <div key={i} style={{
                aspectRatio: ASPECT[aspectRatio] === 'auto' ? '1/1' : ASPECT[aspectRatio],
                background: `linear-gradient(135deg, #f3f4f6, #e5e7eb)`,
                borderRadius: radius,
                animation: `gallery-pulse 1.8s ${(i * 0.12).toFixed(2)}s ease-in-out infinite`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#d1d5db' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
            Photo gallery — add images in the editor
          </p>
        </div>
        <style>{`
          @keyframes gallery-pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {title && <h3 style={titleStyle}>{title}</h3>}

        {/* ── Grid Layout ──────────────────────────────────────────────── */}
        {layout === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            gap: gapPx,
          }}>
            {images.map((src, i) => (
              <GalleryItem
                key={i}
                src={src}
                onClick={() => setLightbox(i)}
                radius={radius}
                aspectRatio={ASPECT[aspectRatio]}
              />
            ))}
          </div>
        )}

        {/* ── Masonry Layout ───────────────────────────────────────────── */}
        {layout === 'masonry' && (
          <div style={{
            columnCount: colCount,
            columnGap: gapPx,
          }}>
            {images.map((src, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: gapPx }}>
                <GalleryItem
                  src={src}
                  onClick={() => setLightbox(i)}
                  radius={radius}
                  aspectRatio="auto"
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Spotlight Layout ─────────────────────────────────────────── */}
        {layout === 'spotlight' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: gapPx }}>
            {/* First image — hero */}
            {images[0] && (
              <GalleryItem
                src={images[0]}
                onClick={() => setLightbox(0)}
                radius={radius}
                aspectRatio="16/9"
                style={{ width: '100%' }}
              />
            )}
            {/* Rest — row of thumbnails */}
            {images.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(images.length - 1, colCount)}, 1fr)`,
                gap: gapPx,
              }}>
                {images.slice(1).map((src, i) => (
                  <GalleryItem
                    key={i}
                    src={src}
                    onClick={() => setLightbox(i + 1)}
                    radius={radius}
                    aspectRatio={ASPECT[aspectRatio]}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'lb-in 0.22s ease',
          }}
          onClick={close}
        >
          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            disabled={lightbox === 0}
            style={{
              position: 'absolute', left: 16,
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'background 0.2s',
              opacity: lightbox === 0 ? 0.2 : 1,
            }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <img
            src={images[lightbox]}
            alt=""
            style={{
              maxHeight: '90vh', maxWidth: '90vw',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            disabled={lightbox === images.length - 1}
            style={{
              position: 'absolute', right: 16,
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'background 0.2s',
              opacity: lightbox === images.length - 1 ? 0.2 : 1,
            }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Close */}
          <button
            onClick={close}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}
          >
            <X size={18} />
          </button>

          {/* Counter */}
          <p style={{
            position: 'absolute', bottom: 18,
            color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: '0.05em',
          }}>
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}

      <style>{`
        @keyframes lb-in { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

// ── Single gallery item ───────────────────────────────────────────────────────

function GalleryItem({
  src, onClick, radius, aspectRatio, style,
}: {
  src: string
  onClick: () => void
  radius: string
  aspectRatio: string
  style?: React.CSSProperties
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        cursor: 'pointer',
        aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined,
        ...style,
      }}
      className="gallery-item"
    >
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: aspectRatio === 'auto' ? 'auto' : '100%',
          objectFit: aspectRatio === 'auto' ? 'cover' : 'cover',
          display: 'block',
          transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
        className="gallery-img"
      />
      <div className="gallery-overlay" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.3s ease',
      }}>
        <ZoomIn size={28} color="#fff" style={{ opacity: 0, transition: 'opacity 0.3s', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} className="gallery-zoom" />
      </div>
      <style>{`
        .gallery-item:hover .gallery-img { transform: scale(1.07); }
        .gallery-item:hover .gallery-overlay { background: rgba(0,0,0,0.28) !important; }
        .gallery-item:hover .gallery-zoom { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
