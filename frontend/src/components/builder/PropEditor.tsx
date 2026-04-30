import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import type { WidgetDefinition } from '../../types'
import { mediaApi } from '../../api'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  widgets: WidgetDefinition[]
  slug: string
}

export function PropEditor({ widgets, slug }: Props) {
  const { sections, selectedId, updateSection } = useBuilderStore()
  const [uploading, setUploading] = useState<string | null>(null)

  const section = sections.find((s) => s.id === selectedId)
  const widgetDef = widgets.find((w) => w.type === section?.type)

  if (!section || !widgetDef) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-400 px-6">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-sm">Click a section to edit its properties</p>
        </div>
      </div>
    )
  }

  const update = (key: string, value: unknown) => updateSection(section.id, { [key]: value })

  const handleMediaUpload = async (key: string, file: File) => {
    setUploading(key)
    try {
      const cdnUrl = await mediaApi.upload(slug, file)
      update(key, cdnUrl)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(null)
    }
  }

  const renderField = (fieldKey: string, schema: WidgetDefinition['schema'][string]) => {
    const value = section.props[fieldKey]

    switch (schema.type) {
      case 'text':
        return (
          <input
            className="prop-input"
            type="text"
            value={(value as string) || ''}
            placeholder={schema.default as string || ''}
            onChange={(e) => update(fieldKey, e.target.value)}
          />
        )

      case 'number':
        return (
          <input
            className="prop-input"
            type="number"
            value={(value as number) ?? (schema.default as number) ?? ''}
            onChange={(e) => update(fieldKey, parseFloat(e.target.value))}
          />
        )

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={(value as string) || (schema.default as string) || '#000000'}
              onChange={(e) => update(fieldKey, e.target.value)}
              className="w-10 h-8 rounded border border-gray-200 cursor-pointer p-0.5"
            />
            <input
              className="prop-input flex-1"
              type="text"
              value={(value as string) || ''}
              onChange={(e) => update(fieldKey, e.target.value)}
            />
          </div>
        )

      case 'boolean':
        return (
          <button
            onClick={() => update(fieldKey, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        )

      case 'select':
        return (
          <select
            className="prop-input"
            value={(value as string) || (schema.default as string) || ''}
            onChange={(e) => update(fieldKey, e.target.value)}
          >
            {(schema.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'datetime':
        return (
          <input
            className="prop-input"
            type="datetime-local"
            value={value ? new Date(value as string).toISOString().slice(0, 16) : ''}
            onChange={(e) => update(fieldKey, e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        )

      case 'media':
        return (
          <div className="space-y-2">
            {value && (
              <div className="relative">
                <img src={value as string} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button
                  onClick={() => update(fieldKey, '')}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-50"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              {uploading === fieldKey ? (
                <><Loader2 size={14} className="animate-spin text-indigo-500" /><span className="text-xs text-indigo-600">Uploading...</span></>
              ) : (
                <><Upload size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Upload image</span></>
              )}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleMediaUpload(fieldKey, e.target.files[0])} />
            </label>
            {value && (
              <input className="prop-input text-xs" type="text" value={value as string}
                onChange={(e) => update(fieldKey, e.target.value)} placeholder="or paste URL" />
            )}
          </div>
        )

      case 'richtext':
        return (
          <textarea
            className="prop-input resize-none"
            rows={6}
            value={(value as string) || ''}
            onChange={(e) => update(fieldKey, e.target.value)}
            placeholder="Enter HTML or plain text..."
          />
        )

      case 'agenda-list':
        return <AgendaEditor value={value as AgendaItem[] || []} onChange={(v) => update(fieldKey, v)} />

      default:
        return (
          <input className="prop-input" type="text"
            value={(value as string) || ''}
            onChange={(e) => update(fieldKey, e.target.value)} />
        )
    }
  }

  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{widgetDef.label}</h3>
      </div>
      <div className="p-3 space-y-3">
        {Object.entries(widgetDef.schema).map(([key, field]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {renderField(key, field)}
          </div>
        ))}
      </div>

      <style>{`
        .prop-input { width: 100%; padding: 0.375rem 0.625rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; font-size: 0.8125rem; outline: none; }
        .prop-input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  )
}

interface AgendaItem { time: string; title: string; description?: string }

function AgendaEditor({ value, onChange }: { value: AgendaItem[]; onChange: (v: AgendaItem[]) => void }) {
  const add = () => onChange([...value, { time: '', title: 'New item' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof AgendaItem, v: string) => {
    const updated = [...value]
    updated[i] = { ...updated[i], [field]: v }
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-2 space-y-1.5">
          <div className="flex gap-1.5">
            <input className="prop-input w-24 shrink-0" placeholder="9:00 AM" value={item.time}
              onChange={(e) => update(i, 'time', e.target.value)} />
            <input className="prop-input flex-1" placeholder="Title" value={item.title}
              onChange={(e) => update(i, 'title', e.target.value)} />
            <button onClick={() => remove(i)} className="p-1 text-red-400 hover:bg-red-50 rounded">
              <X size={12} />
            </button>
          </div>
          <input className="prop-input" placeholder="Description (optional)" value={item.description || ''}
            onChange={(e) => update(i, 'description', e.target.value)} />
        </div>
      ))}
      <button onClick={add}
        className="w-full py-1.5 text-xs text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors">
        + Add item
      </button>
    </div>
  )
}
