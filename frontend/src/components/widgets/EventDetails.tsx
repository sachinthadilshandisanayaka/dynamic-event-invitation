import { Calendar, MapPin, Navigation } from 'lucide-react'

interface Props {
  dateLabel?: string
  locationLabel?: string
  venueName?: string
  address?: string
  showMap?: boolean
  bgColor?: string
  textColor?: string
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
  const osmUrl        = `https://www.openstreetmap.org/search?query=${mapsQuery}`

  return (
    <div
      className="px-fluid flex flex-col justify-center"
      style={{
        fontFamily: 'var(--font-heading, inherit)',
        backgroundColor: bgColor,
        color: textColor,
        paddingTop: 'clamp(4rem, 10vw, 6rem)',
        paddingBottom: 'clamp(4rem, 10vw, 6rem)',
      }}
    >
      <div className="container-fluid max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">

          {/* ── Date ── */}
          <div className="flex gap-4">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent, #6366f1) 14%, transparent)' }}
            >
              <Calendar size={22} style={{ color: 'var(--color-accent, #6366f1)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-fluid-xs uppercase tracking-widest opacity-60 mb-1">{dateLabel}</p>
              {formattedDate ? (
                <>
                  <p className="text-fluid-base font-semibold leading-snug">{formattedDate}</p>
                  <p className="text-fluid-sm opacity-70 mt-0.5">
                    {formattedTime}{timezone && ` · ${timezone}`}
                  </p>
                </>
              ) : (
                <p className="text-fluid-sm opacity-50 italic">Date not set</p>
              )}
            </div>
          </div>

          {/* ── Location ── */}
          {(venueName || address) && (
            <div className="flex gap-4">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent, #f59e0b) 14%, transparent)' }}
              >
                <MapPin size={22} style={{ color: 'var(--color-accent, #f59e0b)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-fluid-xs uppercase tracking-widest opacity-60 mb-1">{locationLabel}</p>
                {venueName && (
                  <p className="text-fluid-base font-semibold leading-snug">{venueName}</p>
                )}
                {address && (
                  <p className="text-fluid-sm opacity-70 mt-0.5 break-words">{address}</p>
                )}
                {showMap && mapsQuery && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-fluid-xs px-3 py-1.5 rounded-full border font-medium hover:bg-white/50 transition-colors"
                      style={{ borderColor: 'currentColor', opacity: 0.72 }}
                    >
                      <Navigation size={11} /> Google Maps
                    </a>
                    <a
                      href={osmUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-fluid-xs px-3 py-1.5 rounded-full border font-medium hover:bg-white/50 transition-colors"
                      style={{ borderColor: 'currentColor', opacity: 0.72 }}
                    >
                      <MapPin size={11} /> OpenStreetMap
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
