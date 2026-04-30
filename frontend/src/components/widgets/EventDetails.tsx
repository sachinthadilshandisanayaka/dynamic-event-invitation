import { Calendar, MapPin, Navigation } from 'lucide-react'

interface Props {
  dateLabel?: string
  locationLabel?: string
  venueName?: string
  address?: string
  showMap?: boolean
  bgColor?: string
  textColor?: string
  // These come from parent event data when rendered on public page
  eventDate?: string
  timezone?: string
}

export function EventDetails({
  dateLabel = 'Date & Time',
  locationLabel = 'Venue',
  venueName,
  address,
  showMap = true,
  bgColor = '#f9fafb',
  textColor = '#111827',
  eventDate,
  timezone,
}: Props) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null
  const formattedTime = eventDate
    ? new Date(eventDate).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      })
    : null

  const mapsQuery = encodeURIComponent([venueName, address].filter(Boolean).join(', '))
  const googleMapsUrl = `https://maps.google.com/?q=${mapsQuery}`
  const osmUrl = `https://www.openstreetmap.org/search?query=${mapsQuery}`

  return (
    <div className="py-12 px-6" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Date */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary, #6366f1)', opacity: 0.12 }}>
            <Calendar size={24} style={{ color: 'var(--color-primary, #6366f1)', opacity: 1 / 0.12 }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{dateLabel}</p>
            {formattedDate ? (
              <>
                <p className="font-semibold text-lg leading-tight">{formattedDate}</p>
                <p className="opacity-70 mt-0.5">{formattedTime}{timezone && ` · ${timezone}`}</p>
              </>
            ) : (
              <p className="opacity-50 italic text-sm">Date not set</p>
            )}
          </div>
        </div>

        {/* Location */}
        {(venueName || address) && (
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-accent, #f59e0b)', opacity: 0.12 }}>
              <MapPin size={24} style={{ color: 'var(--color-accent, #f59e0b)', opacity: 1 / 0.12 }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 mb-1">{locationLabel}</p>
              {venueName && <p className="font-semibold text-lg leading-tight">{venueName}</p>}
              {address && <p className="opacity-70 mt-0.5 text-sm">{address}</p>}
              {showMap && mapsQuery && (
                <div className="flex gap-3 mt-3">
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium hover:bg-white/50 transition-colors"
                    style={{ borderColor: 'currentColor', opacity: 0.7 }}>
                    <Navigation size={12} /> Google Maps
                  </a>
                  <a href={osmUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium hover:bg-white/50 transition-colors"
                    style={{ borderColor: 'currentColor', opacity: 0.7 }}>
                    <MapPin size={12} /> OpenStreetMap
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
