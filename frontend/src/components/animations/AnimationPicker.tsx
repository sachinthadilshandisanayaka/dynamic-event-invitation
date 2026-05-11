import { useState } from 'react'
import { ANIMATION_COLLECTIONS, type AnimationCollection } from '../../data/animationCollections'
import { Play, Check } from 'lucide-react'
import { LoadingScreen } from './LoadingScreen'

interface Props {
  selected: string
  onChange: (id: string) => void
  eventTitle?: string
}

export function AnimationPicker({ selected, onChange, eventTitle }: Props) {
  const [previewing, setPreviewing] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'wedding' | 'universal'>('all')

  const filtered = ANIMATION_COLLECTIONS.filter(
    (c) => tab === 'all' || c.category === tab,
  )

  return (
    <div>
      {/* Preview modal */}
      {previewing && (
        <LoadingScreen
          collectionId={previewing}
          eventTitle={eventTitle || 'Your Event'}
          onComplete={() => setPreviewing(null)}
        />
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-4">
        {(['all', 'wedding', 'universal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t === 'all' ? 'All Collections' : t === 'wedding' ? '💍 Wedding' : '✨ Universal'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* No animation option */}
        <button
          onClick={() => onChange('')}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
            selected === '' || !selected
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-lg">🚫</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">No Animation</p>
            <p className="text-xs text-gray-400">Plain load, no effects</p>
          </div>
          {(!selected || selected === '') && (
            <Check size={16} className="text-indigo-600 shrink-0" />
          )}
        </button>

        {filtered.map((c) => (
          <AnimCollectionCard
            key={c.id}
            collection={c}
            isSelected={selected === c.id}
            onSelect={() => onChange(c.id)}
            onPreview={() => setPreviewing(c.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <Check size={14} className="text-green-600 shrink-0" />
          <p className="text-xs text-green-800">
            <strong>{ANIMATION_COLLECTIONS.find((c) => c.id === selected)?.name}</strong> will play
            when guests open this event page.
          </p>
        </div>
      )}
    </div>
  )
}

function AnimCollectionCard({
  collection, isSelected, onSelect, onPreview,
}: {
  collection: AnimationCollection
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
}) {
  const [bg, accent] = collection.previewColors

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 bg-white'
      }`}
      onClick={onSelect}
    >
      {/* Mini animated preview swatch */}
      <div
        className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bg}, ${accent}33)`, border: `1.5px solid ${accent}66` }}
      >
        <span className="text-2xl">{collection.emoji}</span>
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
          backgroundSize: '200%',
          animation: 'shimmer-text 2.5s ease infinite',
        }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-semibold text-gray-900">{collection.name}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize
            ${collection.category === 'wedding' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
            {collection.category}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">{collection.tagline}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex gap-1">
            {collection.previewColors.map((color, i) => (
              <div key={i} className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            {(collection.loadingDuration / 1000).toFixed(1)}s intro
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 shrink-0">
        {isSelected && <Check size={16} className="text-indigo-600" />}
        <button
          onClick={(e) => { e.stopPropagation(); onPreview() }}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          title="Preview animation"
        >
          <Play size={12} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}
