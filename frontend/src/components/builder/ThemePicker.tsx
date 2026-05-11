import { THEME_REGISTRY, getThemesByCategory } from '../../data/themeRegistry'
import type { ThemeDefinition } from '../../data/themeRegistry'
import { Check, Sparkles } from 'lucide-react'

interface Props {
  selectedId: string
  onChange: (themeId: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  wedding:     'Wedding',
  birthday:    'Birthday',
  engagement:  'Engagement',
  party:       'Party',
  corporate:   'Corporate',
  gala:        'Gala',
}

function ThemeCard({ theme, selected, onSelect }: {
  theme: ThemeDefinition
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl overflow-hidden border-2 transition-all group ${
        selected
          ? 'border-indigo-500 shadow-lg shadow-indigo-100 scale-[1.02]'
          : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {/* Gradient preview swatch */}
      <div
        className="h-20 w-full"
        style={{ background: theme.previewGradient }}
      />

      {/* Info */}
      <div className="p-3 bg-white">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{theme.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{theme.tagline}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {theme.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Selected badge */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow">
          <Check size={13} strokeWidth={3} className="text-white" />
        </div>
      )}
    </button>
  )
}

export function ThemePicker({ selectedId, onChange }: Props) {
  const byCategory = getThemesByCategory()
  const categories = Object.keys(byCategory).sort()

  return (
    <div>
      {/* None/Custom option */}
      <button
        onClick={() => onChange('')}
        className={`w-full mb-5 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
          !selectedId
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <Sparkles size={14} />
        Custom / No Theme — use individual color &amp; font settings below
        {!selectedId && <Check size={14} className="ml-auto text-indigo-500" strokeWidth={3} />}
      </button>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {CATEGORY_LABELS[category] ?? category}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {byCategory[category].map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selectedId === theme.id}
                onSelect={() => onChange(theme.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
