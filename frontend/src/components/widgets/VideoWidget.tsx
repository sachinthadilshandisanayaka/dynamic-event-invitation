interface Props {
  title?: string
  embedUrl?: string
  autoplay?: boolean
}

function toEmbedUrl(url: string): string {
  if (!url) return ''
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  // Direct embed URL
  return url
}

export function VideoWidget({ title, embedUrl = '', autoplay = false }: Props) {
  const embed = toEmbedUrl(embedUrl)

  return (
    <div className="py-10 px-6 bg-gray-900" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
      <div className="max-w-4xl mx-auto">
        {title && (
          <h3 className="text-xl font-bold text-white text-center mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h3>
        )}
        {embed ? (
          <div className="relative pt-[56.25%] rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`${embed}${autoplay ? '?autoplay=1&mute=1' : ''}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-800 rounded-2xl aspect-video text-gray-500">
            Paste a YouTube or Vimeo URL in the editor
          </div>
        )}
      </div>
    </div>
  )
}
