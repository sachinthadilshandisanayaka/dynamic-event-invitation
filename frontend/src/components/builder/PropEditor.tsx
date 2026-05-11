import { useState, useEffect } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import type { WidgetDefinition } from '../../types'
import { mediaApi } from '../../api'
import { Upload, X, Loader2, Image, Type, ChevronDown, ChevronUp, Plus, GripVertical } from 'lucide-react'
import { ensureGoogleFont } from '../../lib/googleFonts'

interface Props {
  widgets: WidgetDefinition[]
  slug: string
}

const FONT_OPTIONS = [
  { label: 'Default (Theme)', value: '' },
  { label: 'Inter',            value: 'Inter, sans-serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Lato',             value: 'Lato, sans-serif' },
  { label: 'Poppins',          value: 'Poppins, sans-serif' },
  { label: 'Merriweather',     value: 'Merriweather, serif' },
  { label: 'Montserrat',       value: 'Montserrat, sans-serif' },
  { label: 'Roboto',           value: 'Roboto, sans-serif' },
  { label: 'Open Sans',        value: "'Open Sans', sans-serif" },
]

const TEXT_SIZE_OPTIONS = [
  { label: 'Small',   value: 'sm' },
  { label: 'Default', value: 'md' },
  { label: 'Large',   value: 'lg' },
  { label: 'X-Large', value: 'xl' },
]

const LAYOUT_OPTIONS = [
  { label: 'Grid',     value: 'grid' },
  { label: 'Masonry',  value: 'masonry' },
  { label: 'Spotlight', value: 'spotlight' },
]

const ASPECT_OPTIONS = [
  { label: 'Square',    value: 'square' },
  { label: 'Landscape', value: 'landscape' },
  { label: 'Portrait',  value: 'portrait' },
  { label: 'Natural',   value: 'auto' },
]

const GAP_OPTIONS = [
  { label: 'Tight',  value: 'tight' },
  { label: 'Normal', value: 'normal' },
  { label: 'Wide',   value: 'wide' },
]

export function PropEditor({ widgets, slug }: Props) {
  const { sections, selectedId, updateSection } = useBuilderStore()
  const [uploading, setUploading] = useState<string | null>(null)
  const [sectionOpen, setSectionOpen] = useState(true)
  const [typoOpen, setTypoOpen]       = useState(false)
  const [contentOpen, setContentOpen] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(true)

  const section    = sections.find((s) => s.id === selectedId)
  const widgetDef  = widgets.find((w) => w.type === section?.type)

  // Load Google Font for the currently-selected section on mount / section change
  useEffect(() => {
    if (section?.props.fontFamily) ensureGoogleFont(section.props.fontFamily as string)
  }, [section?.id, section?.props.fontFamily])

  if (!section || !widgetDef) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 flex items-center justify-center">
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

  const isHero    = section.type === 'hero'
  const isGallery = section.type === 'gallery'

  // ── Schema field renderer ─────────────────────────────────────────────────
  const renderField = (fieldKey: string, schema: WidgetDefinition['schema'][string]) => {
    const value = section.props[fieldKey]

    switch (schema.type) {
      case 'text':
        return (
          <input className="prop-input" type="text"
            value={(value as string) || ''}
            placeholder={schema.default as string || ''}
            onChange={(e) => update(fieldKey, e.target.value)} />
        )

      case 'number':
        return (
          <input className="prop-input" type="number"
            value={(value as number) ?? (schema.default as number) ?? ''}
            onChange={(e) => update(fieldKey, parseFloat(e.target.value))} />
        )

      case 'color':
        return <ColorField value={(value as string) || (schema.default as string) || '#000000'} onChange={(v) => update(fieldKey, v)} />

      case 'boolean':
        return (
          <button onClick={() => update(fieldKey, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        )

      case 'select':
        return (
          <select className="prop-input"
            value={(value as string) || (schema.default as string) || ''}
            onChange={(e) => update(fieldKey, e.target.value)}>
            {(schema.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'datetime':
        return (
          <input className="prop-input" type="datetime-local"
            value={value ? new Date(value as string).toISOString().slice(0, 16) : ''}
            onChange={(e) => update(fieldKey, e.target.value ? new Date(e.target.value).toISOString() : '')} />
        )

      case 'media':
        return (
          <div className="space-y-2">
            {!!value && (
              <div className="relative">
                <img src={value as string} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button onClick={() => update(fieldKey, '')}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-50">
                  <X size={12} />
                </button>
              </div>
            )}
            <MediaUploadButton
              uploading={uploading === fieldKey}
              onFile={(f) => handleMediaUpload(fieldKey, f)}
            />
            {!!value && (
              <input className="prop-input text-xs" type="text" value={value as string}
                onChange={(e) => update(fieldKey, e.target.value)} placeholder="or paste URL" />
            )}
          </div>
        )

      case 'richtext':
        return (
          <textarea className="prop-input resize-none" rows={6}
            value={(value as string) || ''}
            onChange={(e) => update(fieldKey, e.target.value)}
            placeholder="Enter HTML or plain text..." />
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
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 text-[13px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{widgetDef.label}</h3>
      </div>

      {/* ── Section Background ─────────────────────────────────────────────── */}
      <Accordion
        label="Section Background"
        icon={<Image size={13} />}
        open={sectionOpen}
        onToggle={() => setSectionOpen((v) => !v)}
      >
        <div className="space-y-3">
          {/* Background Color */}
          <div>
            <label className="prop-label">Background Color</label>
            <ColorField
              value={(section.props.bgColor as string) || '#ffffff'}
              onChange={(v) => update('bgColor', v)}
            />
          </div>

          {/* Background Image */}
          <div>
            <label className="prop-label">Background Image</label>
            {!!section.props.bgImage && (
              <div className="relative mb-2">
                <img src={section.props.bgImage as string} alt="" className="w-full h-28 object-cover rounded-lg" />
                <button onClick={() => update('bgImage', '')}
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-50">
                  <X size={12} />
                </button>
              </div>
            )}
            <MediaUploadButton
              uploading={uploading === 'bgImage'}
              onFile={(f) => handleMediaUpload('bgImage', f)}
              label="Upload background image"
            />
            {!section.props.bgImage && (
              <input className="prop-input mt-1.5 text-xs" type="text"
                value={''}
                placeholder="or paste image URL"
                onChange={(e) => update('bgImage', e.target.value)} />
            )}
          </div>

          {/* Image opacity — only when bgImage is set */}
          {!!section.props.bgImage && (
            <div>
              <label className="prop-label">
                Image Opacity — {Math.round(((section.props.bgOverlay as number) ?? 1) * 100)}%
              </label>
              <input type="range" min="0" max="1" step="0.05"
                value={(section.props.bgOverlay as number) ?? 1}
                onChange={(e) => update('bgOverlay', parseFloat(e.target.value))}
                className="w-full h-1.5 accent-indigo-600" />
            </div>
          )}
        </div>
      </Accordion>

      {/* ── Typography ────────────────────────────────────────────────────── */}
      <Accordion
        label="Typography"
        icon={<Type size={13} />}
        open={typoOpen}
        onToggle={() => setTypoOpen((v) => !v)}
      >
        <div className="space-y-3">
          {/* Text Color */}
          <div>
            <label className="prop-label">Text Color</label>
            <ColorField
              value={(section.props.textColor as string) || '#111827'}
              onChange={(v) => update('textColor', v)}
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="prop-label">Font Family</label>
            <select className="prop-input"
              value={(section.props.fontFamily as string) || ''}
              onChange={(e) => {
                const v = e.target.value
                ensureGoogleFont(v)
                update('fontFamily', v)
              }}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
                  {f.label}
                </option>
              ))}
            </select>
            {/* Live font preview */}
            {!!section.props.fontFamily && (
              <p className="mt-1 text-xs text-gray-400 truncate"
                style={{ fontFamily: section.props.fontFamily as string }}>
                The quick brown fox jumps over the lazy dog
              </p>
            )}
          </div>

          {/* Heading / Title Size */}
          {(isHero || isGallery) && (
            <div>
              <label className="prop-label">Title Size</label>
              <select className="prop-input"
                value={(section.props.titleSize as string) || 'md'}
                onChange={(e) => update('titleSize', e.target.value)}>
                {TEXT_SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Accordion>

      {/* ── Gallery Image Manager ─────────────────────────────────────────── */}
      {isGallery && (
        <Accordion
          label={`Gallery Images (${((section.props.images as string[]) || []).length})`}
          icon={<Image size={13} />}
          open={galleryOpen}
          onToggle={() => setGalleryOpen((v) => !v)}
        >
          <GalleryImageManager
            images={(section.props.images as string[]) || []}
            onChange={(imgs) => update('images', imgs)}
            slug={slug}
          />

          {/* Gallery layout controls */}
          <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
            <div>
              <label className="prop-label">Layout</label>
              <select className="prop-input"
                value={(section.props.layout as string) || 'grid'}
                onChange={(e) => update('layout', e.target.value)}>
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="prop-label">Columns</label>
                <select className="prop-input"
                  value={(section.props.columns as string) || '3'}
                  onChange={(e) => update('columns', e.target.value)}>
                  {['2', '3', '4'].map((c) => (
                    <option key={c} value={c}>{c} cols</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="prop-label">Gap</label>
                <select className="prop-input"
                  value={(section.props.gap as string) || 'normal'}
                  onChange={(e) => update('gap', e.target.value)}>
                  {GAP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="prop-label">Aspect Ratio</label>
                <select className="prop-input"
                  value={(section.props.aspectRatio as string) || 'square'}
                  onChange={(e) => update('aspectRatio', e.target.value)}>
                  {ASPECT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="prop-label">Rounded</label>
                <button
                  onClick={() => update('rounded', !section.props.rounded)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${section.props.rounded ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${section.props.rounded ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </Accordion>
      )}

      {/* ── Widget-specific schema fields ─────────────────────────────────── */}
      {Object.keys(widgetDef.schema).length > 0 && (
        <Accordion
          label="Content"
          open={contentOpen}
          onToggle={() => setContentOpen((v) => !v)}
        >
          <div className="space-y-3">
            {Object.entries(widgetDef.schema).map(([key, field]) => (
              <div key={key}>
                <label className="prop-label">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {renderField(key, field)}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      <style>{`
        .prop-input {
          width: 100%;
          padding: 0.35rem 0.6rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          outline: none;
          background: #fff;
          color: #111;
        }
        .prop-input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.12); }
        .prop-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  )
}

// ── Accordion section ─────────────────────────────────────────────────────────

function Accordion({ label, icon, open, onToggle, children }: {
  label: string
  icon?: React.ReactNode
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  )
}

// ── Color field with picker + hex input ──────────────────────────────────────

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-8 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
      <input className="prop-input flex-1" type="text" value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#ffffff" />
    </div>
  )
}

// ── Media upload button ───────────────────────────────────────────────────────

function MediaUploadButton({ uploading, onFile, label = 'Upload image' }: {
  uploading: boolean
  onFile: (f: File) => void
  label?: string
}) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
      {uploading ? (
        <><Loader2 size={14} className="animate-spin text-indigo-500" /><span className="text-xs text-indigo-600">Uploading…</span></>
      ) : (
        <><Upload size={14} className="text-gray-400" /><span className="text-xs text-gray-500">{label}</span></>
      )}
      <input type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </label>
  )
}

// ── Gallery Image Manager ─────────────────────────────────────────────────────

function GalleryImageManager({
  images,
  onChange,
  slug,
}: {
  images: string[]
  onChange: (imgs: string[]) => void
  slug: string
}) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput]   = useState('')

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i))

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    onChange([...images, url])
    setUrlInput('')
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const cdnUrl = await mediaApi.upload(slug, file)
      onChange([...images, cdnUrl])
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }

  const handleMultiple = async (files: FileList) => {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      try {
        const url = await mediaApi.upload(slug, file)
        urls.push(url)
      } catch { /* skip failed */ }
    }
    onChange([...images, ...urls])
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {images.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded overflow-hidden bg-gray-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  onClick={() => remove(i)}
                  className="opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow transition-opacity"
                >
                  <X size={11} className="text-red-500" />
                </button>
              </div>
              <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100">
                <GripVertical size={12} className="text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload multiple */}
      <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
        {uploading ? (
          <><Loader2 size={14} className="animate-spin text-indigo-500" /><span className="text-xs text-indigo-600">Uploading…</span></>
        ) : (
          <>
            <Upload size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Upload images (multi-select)</span>
          </>
        )}
        <input type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files && handleMultiple(e.target.files)} />
      </label>

      {/* Add by URL */}
      <div className="flex gap-1.5">
        <input
          className="prop-input flex-1 text-xs"
          type="text"
          placeholder="Paste image URL…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
        />
        <button
          onClick={addUrl}
          disabled={!urlInput.trim()}
          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          <Plus size={13} />
        </button>
      </div>

      {images.length > 0 && (
        <p className="text-xs text-gray-400 text-center">{images.length} image{images.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}

// ── Agenda editor ─────────────────────────────────────────────────────────────

interface AgendaItem { time: string; title: string; description?: string }

function AgendaEditor({ value, onChange }: { value: AgendaItem[]; onChange: (v: AgendaItem[]) => void }) {
  const add    = () => onChange([...value, { time: '', title: 'New item' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const upd    = (i: number, field: keyof AgendaItem, v: string) => {
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
              onChange={(e) => upd(i, 'time', e.target.value)} />
            <input className="prop-input flex-1" placeholder="Title" value={item.title}
              onChange={(e) => upd(i, 'title', e.target.value)} />
            <button onClick={() => remove(i)} className="p-1 text-red-400 hover:bg-red-50 rounded">
              <X size={12} />
            </button>
          </div>
          <input className="prop-input" placeholder="Description (optional)" value={item.description || ''}
            onChange={(e) => upd(i, 'description', e.target.value)} />
        </div>
      ))}
      <button onClick={add}
        className="w-full py-1.5 text-xs text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors">
        + Add item
      </button>
    </div>
  )
}
