import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  title?: string
  images?: string[]
  columns?: '2' | '3' | '4'
  rounded?: boolean
}

export function GalleryWidget({ title, images = [], columns = '3', rounded = true }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const cols = { '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' }[columns] || 'grid-cols-3'
  const radius = rounded ? 'var(--border-radius, 8px)' : '0'

  const prev = () => setLightbox((i) => (i !== null ? Math.max(0, i - 1) : null))
  const next = () => setLightbox((i) => (i !== null ? Math.min(images.length - 1, i + 1) : null))

  if (images.length === 0) {
    return (
      <div className="py-12 px-6">
        {title && <h3 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>}
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse" style={{ borderRadius: radius }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-6">
      {title && <h3 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>}
      <div className={`grid ${cols} gap-3 max-w-5xl mx-auto`}>
        {images.map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden cursor-pointer group"
            style={{ borderRadius: radius }}
            onClick={() => setLightbox(i)}>
            <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button onClick={(e) => { e.stopPropagation(); prev() }}
            disabled={lightbox === 0}
            className="absolute left-4 p-2 text-white/70 hover:text-white disabled:opacity-20 transition-colors">
            <ChevronLeft size={36} />
          </button>
          <img src={images[lightbox]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); next() }}
            disabled={lightbox === images.length - 1}
            className="absolute right-4 p-2 text-white/70 hover:text-white disabled:opacity-20 transition-colors">
            <ChevronRight size={36} />
          </button>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <p className="absolute bottom-4 text-white/50 text-sm">{lightbox + 1} / {images.length}</p>
        </div>
      )}
    </div>
  )
}
