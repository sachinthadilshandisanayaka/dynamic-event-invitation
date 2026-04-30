import type { WidgetDefinition } from '../../types'
import { useBuilderStore } from '../../store/builderStore'
import { Image, Clock, Info, MapPin, CheckCircle, Grid, List, Type, Play, Minus } from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  image: <Image size={18} />,
  clock: <Clock size={18} />,
  info: <Info size={18} />,
  'map-pin': <MapPin size={18} />,
  'check-circle': <CheckCircle size={18} />,
  grid: <Grid size={18} />,
  list: <List size={18} />,
  type: <Type size={18} />,
  play: <Play size={18} />,
  minus: <Minus size={18} />,
}

const DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  hero: { title: 'Welcome!', subtitle: 'Join us for this special event', bgColor: '#6366f1', textColor: '#ffffff', height: 'large' },
  countdown: { targetDate: '', timezone: 'UTC', endedMessage: 'The event has started!' },
  'event-details': { dateLabel: 'Date & Time', locationLabel: 'Venue', venueName: '', address: '', showMap: true },
  map: { venueName: 'Event Venue', address: '', latitude: null, longitude: null, googleMapsUrl: '', zoom: 15, height: 400 },
  'rsvp-form': { title: 'Will you attend?', maxPlusOnes: 0, showMessage: false, bgColor: '#f0fdf4', buttonColor: '#16a34a' },
  gallery: { title: 'Gallery', images: [], columns: '3', rounded: true },
  agenda: { title: 'Schedule', items: [], bgColor: '#ffffff', textColor: '#111827' },
  'rich-text': { content: '<p>Add your text here...</p>', align: 'center', bgColor: '#ffffff', textColor: '#111827', padding: 'medium' },
  video: { title: '', embedUrl: '', autoplay: false },
  spacer: { height: 40, bgColor: 'transparent' },
}

const CATEGORIES = ['layout', 'content', 'interactive', 'media']

export function SectionPalette({ widgets }: { widgets: WidgetDefinition[] }) {
  const { addSection } = useBuilderStore()

  const handleAdd = (widget: WidgetDefinition) => {
    addSection({
      id: crypto.randomUUID(),
      type: widget.type,
      order: 0,
      props: { ...(DEFAULT_PROPS[widget.type] || {}) },
    })
  }

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    items: widgets.filter((w) => w.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Widgets</h3>
      </div>
      <div className="p-2 space-y-4">
        {byCategory.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-1 font-medium">{cat}</p>
            <div className="space-y-1">
              {items.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => handleAdd(widget)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                >
                  <span className="text-gray-400 group-hover:text-indigo-500 shrink-0">
                    {ICONS[widget.icon] || <Type size={18} />}
                  </span>
                  <span className="font-medium truncate">{widget.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
