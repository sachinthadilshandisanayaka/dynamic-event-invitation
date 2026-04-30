import { useEffect, useState } from 'react'
import { MapPin, Navigation, ExternalLink, Search, Loader2 } from 'lucide-react'

interface Props {
  venueName?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  googleMapsUrl?: string
  zoom?: number
  height?: number
  preview?: boolean
}

interface Coords { lat: number; lng: number }

// Parse lat/lng from Google Maps URL
function parseGoogleMapsUrl(url: string): Coords | null {
  if (!url) return null
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  return null
}

// Geocode using Nominatim (free, OpenStreetMap)
async function geocode(query: string): Promise<Coords | null> {
  if (!query.trim()) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch { /* ignore */ }
  return null
}

function LeafletMap({ coords, venueName, zoom = 15, height = 400 }: {
  coords: Coords; venueName?: string; zoom?: number; height?: number
}) {
  const mapId = `map-${coords.lat}-${coords.lng}`.replace(/\./g, '_')

  useEffect(() => {
    // Leaflet needs a container; we defer to avoid SSR issues
    let map: unknown = null
    const init = async () => {
      const L = (await import('leaflet')).default

      // Custom marker icon (leaflet default icon fix)
      const icon = L.divIcon({
        html: `<div style="
          background: var(--color-primary, #6366f1);
          width: 32px; height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: '',
      })

      const container = document.getElementById(mapId)
      if (!container) return

      // Remove previous map instance
      if ((container as HTMLElement & { _leaflet_id?: unknown })._leaflet_id) {
        (container as HTMLElement & { _leaflet_id?: unknown })._leaflet_id = undefined
        container.innerHTML = ''
      }

      const m = L.map(mapId, { scrollWheelZoom: false }).setView([coords.lat, coords.lng], zoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(m)

      L.marker([coords.lat, coords.lng], { icon })
        .addTo(m)
        .bindPopup(venueName || 'Event Venue')
        .openPopup()

      map = m
    }

    init()
    return () => {
      if (map && typeof (map as { remove?: () => void }).remove === 'function') {
        (map as { remove: () => void }).remove()
      }
    }
  }, [coords.lat, coords.lng, venueName, zoom, mapId])

  return <div id={mapId} style={{ height, borderRadius: 'var(--border-radius, 8px)' }} className="w-full z-0" />
}

export function MapWidget({
  venueName,
  address,
  latitude,
  longitude,
  googleMapsUrl,
  zoom = 15,
  height = 400,
  preview = false,
}: Props) {
  const [coords, setCoords] = useState<Coords | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )
  const [loading, setLoading] = useState(false)
  const [geocodeQuery, setGeocodeQuery] = useState('')
  const [showGeocode, setShowGeocode] = useState(false)

  // Auto-resolve coords from Google Maps URL
  useEffect(() => {
    if (googleMapsUrl && !coords) {
      const parsed = parseGoogleMapsUrl(googleMapsUrl)
      if (parsed) setCoords(parsed)
    }
  }, [googleMapsUrl, coords])

  // Auto-geocode from address if no coords yet
  useEffect(() => {
    if (!coords && !preview && address) {
      setLoading(true)
      geocode(address).then((c) => {
        if (c) setCoords(c)
        setLoading(false)
      })
    }
  }, [address, coords, preview])

  const handleGeocode = async () => {
    if (!geocodeQuery.trim()) return
    setLoading(true)
    const result = await geocode(geocodeQuery)
    setLoading(false)
    if (result) {
      setCoords(result)
      setShowGeocode(false)
    } else {
      alert('Location not found. Try a more specific address.')
    }
  }

  const mapsQuery = encodeURIComponent([venueName, address].filter(Boolean).join(', '))
  const googleUrl = googleMapsUrl || `https://maps.google.com/?q=${mapsQuery}`
  const osmUrl = `https://www.openstreetmap.org/search?query=${mapsQuery}`

  return (
    <div className="py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Venue header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            {venueName && (
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                {venueName}
              </h3>
            )}
            {address && (
              <p className="text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0" /> {address}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a href={googleUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              <Navigation size={14} className="text-indigo-500" /> Directions
            </a>
            <a href={osmUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              <ExternalLink size={14} /> OpenStreetMap
            </a>
          </div>
        </div>

        {/* Map */}
        {loading ? (
          <div className="flex items-center justify-center bg-gray-100 rounded-2xl"
            style={{ height }}>
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading map...</span>
            </div>
          </div>
        ) : coords ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <LeafletMap coords={coords} venueName={venueName} zoom={zoom} height={height} />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center p-10"
            style={{ minHeight: Math.min(height, 250) }}>
            <MapPin size={40} className="text-indigo-300 mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              {address ? `Could not locate "${address}"` : 'No location set'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Enter an address in the editor, paste a Google Maps link, or search below
            </p>
            {!showGeocode ? (
              <button onClick={() => setShowGeocode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                <Search size={14} /> Find on Map
              </button>
            ) : (
              <div className="flex gap-2 w-full max-w-sm">
                <input
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder="Search for a place..."
                  value={geocodeQuery}
                  onChange={(e) => setGeocodeQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGeocode()}
                  autoFocus
                />
                <button onClick={handleGeocode} disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {loading ? '...' : 'Go'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Coordinates display (for preview/admin) */}
        {coords && (
          <p className="text-xs text-gray-400 mt-2 text-right">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} · <a href={osmUrl} target="_blank" rel="noreferrer" className="hover:underline">OpenStreetMap</a>
          </p>
        )}
      </div>
    </div>
  )
}
