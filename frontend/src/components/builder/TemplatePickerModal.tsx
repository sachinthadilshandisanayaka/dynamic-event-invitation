import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { TEMPLATES, buildSections, type Template } from '../../data/templates'
import { useBuilderStore } from '../../store/builderStore'

function TemplateCard({ template, selected, onSelect }: {
  template: Template
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all focus:outline-none ${
        selected
          ? 'border-indigo-500 shadow-lg shadow-indigo-100 scale-[1.02]'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div
        className="h-24 relative flex flex-col items-center justify-center gap-1.5 px-4"
        style={{ backgroundColor: template.colors[0] }}
      >
        <div className="w-full rounded py-2 text-center" style={{ backgroundColor: template.colors[1] }}>
          <div className="text-white text-xs font-semibold opacity-90 truncate px-2">
            {template.emoji} {template.name}
          </div>
        </div>
        <div className="flex gap-1 w-3/4">
          <div className="h-1.5 rounded-full flex-1 opacity-30" style={{ backgroundColor: template.colors[1] }} />
          <div className="h-1.5 rounded-full w-1/2 opacity-20" style={{ backgroundColor: template.colors[1] }} />
        </div>
        <div className="flex gap-1 w-2/3">
          <div className="h-1.5 rounded-full flex-1 opacity-20" style={{ backgroundColor: template.colors[1] }} />
          <div className="h-1.5 rounded-full w-1/3 opacity-15" style={{ backgroundColor: template.colors[1] }} />
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <Check size={13} className="text-white" />
          </div>
        )}
      </div>
      <div className="p-3 bg-white">
        <p className="font-semibold text-gray-900 text-sm mb-0.5">{template.name}</p>
        <p className="text-xs text-gray-400 mb-2">{template.tagline}</p>
        <div className="flex flex-wrap gap-1">
          {template.includes.slice(0, 3).map((item) => (
            <span key={item} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item}</span>
          ))}
          {template.includes.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              +{template.includes.length - 3} more
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

interface Props {
  onClose: () => void
  eventDate?: string
  timezone?: string
}

export function TemplatePickerModal({ onClose, eventDate, timezone }: Props) {
  const { setSections, setTheme } = useBuilderStore()
  const [selected, setSelected] = useState<Template>(TEMPLATES[0])

  const applyTemplate = () => {
    setSections(buildSections(selected, eventDate, timezone))
    setTheme(selected.theme)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col" style={{ width: 720, maxHeight: '88vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Apply a Template</h2>
            <p className="text-sm text-gray-400">Replace all sections with a pre-built template</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selected.id === t.id}
                onSelect={() => setSelected(t)}
              />
            ))}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs font-semibold text-indigo-700 mb-1.5">
              {selected.emoji} {selected.name} — includes:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.includes.map((item) => (
                <span key={item} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={applyTemplate}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Apply {selected.name} Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
