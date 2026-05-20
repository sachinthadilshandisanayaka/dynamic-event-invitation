import { useState, useEffect, useRef } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import type { WidgetDefinition } from '../../types'
import { mediaApi } from '../../api'
import { useQuery } from '@tanstack/react-query'
import { Upload, X, Loader2, Image, Type, Move, ChevronDown, ChevronUp, Plus, GripVertical, AlignLeft, AlignCenter, AlignRight, List, Sparkles } from 'lucide-react'
import { ensureGoogleFont } from '../../lib/googleFonts'
import { SECTION_PARTICLES } from '../animations/SectionParticleLayer'

interface Props {
  widgets: WidgetDefinition[]
  slug: string
}

const FONT_OPTIONS = [
  { label: 'Default (Theme)',    value: '' },
  // ── Classic / Neutral ──────────────────────────────────────────────────────
  { label: 'Inter',              value: 'Inter, sans-serif' },
  { label: 'Lato',               value: 'Lato, sans-serif' },
  { label: 'Poppins',            value: 'Poppins, sans-serif' },
  { label: 'Montserrat',         value: 'Montserrat, sans-serif' },
  { label: 'Roboto',             value: 'Roboto, sans-serif' },
  { label: 'Open Sans',          value: "'Open Sans', sans-serif" },
  // ── Elegant Serif ──────────────────────────────────────────────────────────
  { label: 'Playfair Display',   value: "'Playfair Display', serif" },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Merriweather',       value: 'Merriweather, serif' },
  { label: 'EB Garamond',        value: "'EB Garamond', serif" },
  { label: 'Bodoni Moda',        value: "'Bodoni Moda', serif" },
  { label: 'Italiana',           value: 'Italiana, serif' },
  // ── Formal / Architectural ─────────────────────────────────────────────────
  { label: 'Cinzel',             value: 'Cinzel, serif' },
  { label: 'Josefin Sans',       value: "'Josefin Sans', sans-serif" },
  { label: 'Raleway',            value: 'Raleway, sans-serif' },
  // ── Script / Calligraphy ───────────────────────────────────────────────────
  { label: 'Great Vibes',        value: "'Great Vibes', cursive" },
  { label: 'Dancing Script',     value: "'Dancing Script', cursive" },
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
  const [sectionOpen, setSectionOpen]   = useState(true)
  const [typoOpen, setTypoOpen]         = useState(false)
  const [particleOpen, setParticleOpen] = useState(false)
  const [posOpen, setPosOpen]           = useState(false)
  const [posTab, setPosTab]             = useState<'desktop' | 'mobile'>('desktop')
  const [contentOpen, setContentOpen]   = useState(true)
  const [galleryOpen, setGalleryOpen]   = useState(true)

  // Media assets for storage-aware deletion
  const { data: mediaAssets = [] } = useQuery({
    queryKey: ['media', slug],
    queryFn: () => mediaApi.listByEvent(slug),
  })

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

  // ── Storage-aware asset removal ───────────────────────────────────────────

  const findAssetId = (url: string): string | null => {
    const asset = (mediaAssets as { cdnUrl: string; id: string }[]).find((a) => a.cdnUrl === url)
    return asset?.id ?? null
  }

  const handleMediaRemove = async (key: string, url: string) => {
    update(key, '')  // remove from section props immediately
    const assetId = findAssetId(url)
    if (assetId) {
      try {
        await mediaApi.delete(assetId)
      } catch (e) {
        console.warn('Storage delete failed:', e)
      }
    }
  }

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
          <RichTextEditor
            value={(value as string) || ''}
            onChange={(v) => update(fieldKey, v)}
          />
        )

      case 'agenda-list':
        return <AgendaEditor value={value as AgendaItem[] || []} onChange={(v) => update(fieldKey, v)} />

      case 'agenda-style':
        return (
          <div className="flex gap-1.5">
            {AGENDA_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update(fieldKey, opt.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  (value || 'timeline') === opt.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

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
                <button
                  onClick={() => handleMediaRemove('bgImage', section.props.bgImage as string)}
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

      {/* ── Background Particles ──────────────────────────────────────────── */}
      <Accordion
        label="Background Particles"
        icon={<Sparkles size={13} />}
        open={particleOpen}
        onToggle={() => setParticleOpen((v) => !v)}
      >
        <div className="space-y-3">
          {/* Particle type grid */}
          <div>
            <label className="prop-label mb-1.5 block">Particle Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SECTION_PARTICLES.map((opt) => {
                const selected = (section.props.bgParticle as string || 'none') === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => update('bgParticle', opt.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sub-controls when a particle is selected */}
          {!!(section.props.bgParticle) && section.props.bgParticle !== 'none' && (
            <>
              {/* Count */}
              <div>
                <label className="prop-label flex justify-between">
                  <span>Count</span>
                  <span className="font-mono text-indigo-600">{(section.props.bgParticleCount as number) || 12}</span>
                </label>
                <input
                  type="range" min="5" max="25" step="1"
                  value={(section.props.bgParticleCount as number) || 12}
                  onChange={(e) => update('bgParticleCount', parseInt(e.target.value))}
                  className="w-full h-1.5 accent-indigo-600"
                />
              </div>

              {/* Opacity */}
              <div>
                <label className="prop-label flex justify-between">
                  <span>Opacity</span>
                  <span className="font-mono text-indigo-600">
                    {Math.round(((section.props.bgParticleOpacity as number) ?? 0.7) * 100)}%
                  </span>
                </label>
                <input
                  type="range" min="0.1" max="1.0" step="0.05"
                  value={(section.props.bgParticleOpacity as number) ?? 0.7}
                  onChange={(e) => update('bgParticleOpacity', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-indigo-600"
                />
              </div>

              {/* Speed */}
              <div>
                <label className="prop-label">Speed</label>
                <div className="flex gap-1.5">
                  {(['slow', 'normal', 'fast'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update('bgParticleSpeed', s)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        ((section.props.bgParticleSpeed as string) || 'normal') === s
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="prop-label">Size</label>
                <div className="flex gap-1.5">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => update('bgParticleSize', sz)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors ${
                        ((section.props.bgParticleSize as string) || 'medium') === sz
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {sz.charAt(0).toUpperCase() + sz.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Accordion>

      {/* ── Text Position (hero only) ─────────────────────────────────────── */}
      {isHero && (
        <Accordion
          label="Text Position"
          icon={<Move size={13} />}
          open={posOpen}
          onToggle={() => setPosOpen((v) => !v)}
        >
          <div className="space-y-3">
            {/* Enable / disable custom positioning */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Custom position</span>
              <button
                onClick={() => {
                  const enabled = section.props.titleX !== undefined
                  if (enabled) {
                    updateSection(section.id, {
                      titleX: undefined, titleY: undefined,
                      subtitleX: undefined, subtitleY: undefined,
                      titleXMobile: undefined, titleYMobile: undefined,
                      subtitleXMobile: undefined, subtitleYMobile: undefined,
                    })
                  } else {
                    updateSection(section.id, {
                      titleX: 50, titleY: 40,
                      subtitleX: 50, subtitleY: 62,
                    })
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${section.props.titleX !== undefined ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${section.props.titleX !== undefined ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {section.props.titleX !== undefined && (
              <>
                {/* Desktop / Mobile tabs */}
                <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                  <button
                    className={`flex-1 py-1 rounded-md font-medium transition-all ${posTab === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setPosTab('desktop')}
                  >
                    Desktop
                  </button>
                  <button
                    className={`flex-1 py-1 rounded-md font-medium transition-all ${posTab === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                    onClick={() => setPosTab('mobile')}
                  >
                    Mobile
                  </button>
                </div>

                {posTab === 'desktop' ? (
                  <>
                    <PositionSliders
                      label="Title"
                      x={(section.props.titleX as number) ?? 50}
                      y={(section.props.titleY as number) ?? 40}
                      onX={(v) => update('titleX', v)}
                      onY={(v) => update('titleY', v)}
                    />
                    <PositionSliders
                      label="Subtitle"
                      x={(section.props.subtitleX as number) ?? 50}
                      y={(section.props.subtitleY as number) ?? 62}
                      onX={(v) => update('subtitleX', v)}
                      onY={(v) => update('subtitleY', v)}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      Defaults to desktop values. Adjust only if mobile needs a different position.
                    </p>
                    <PositionSliders
                      label="Title"
                      x={(section.props.titleXMobile as number) ?? (section.props.titleX as number) ?? 50}
                      y={(section.props.titleYMobile as number) ?? (section.props.titleY as number) ?? 40}
                      onX={(v) => update('titleXMobile', v)}
                      onY={(v) => update('titleYMobile', v)}
                    />
                    <PositionSliders
                      label="Subtitle"
                      x={(section.props.subtitleXMobile as number) ?? (section.props.subtitleX as number) ?? 50}
                      y={(section.props.subtitleYMobile as number) ?? (section.props.subtitleY as number) ?? 62}
                      onX={(v) => update('subtitleXMobile', v)}
                      onY={(v) => update('subtitleYMobile', v)}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </Accordion>
      )}

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
            mediaAssets={mediaAssets as { cdnUrl: string; id: string }[]}
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
  mediaAssets = [],
}: {
  images: string[]
  onChange: (imgs: string[]) => void
  slug: string
  mediaAssets?: { cdnUrl: string; id: string }[]
}) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput]   = useState('')

  const removeWithStorageCleanup = async (i: number) => {
    const url = images[i]
    onChange(images.filter((_, idx) => idx !== i))
    const asset = mediaAssets.find((a) => a.cdnUrl === url)
    if (asset?.id) {
      try {
        await mediaApi.delete(asset.id)
      } catch (e) {
        console.warn('Gallery storage delete failed:', e)
      }
    }
  }

  const remove = (i: number) => { void removeWithStorageCleanup(i) }

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

// ── Rich text WYSIWYG editor ──────────────────────────────────────────────────

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Sync content when value changes externally (e.g. user selects a different section).
  // Skipped when equal so that normal typing doesn't reset the cursor.
  useEffect(() => {
    const el = editorRef.current
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
  }, [value])

  // onMouseDown + preventDefault keeps editor focus (and text selection) during toolbar clicks.
  const exec = (cmd: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, undefined)
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.12)]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        <RteButton onClick={() => exec('bold')} title="Bold">
          <span className="font-bold text-[11px] leading-none w-4 text-center">B</span>
        </RteButton>
        <RteButton onClick={() => exec('italic')} title="Italic">
          <span className="italic text-[11px] leading-none w-4 text-center">I</span>
        </RteButton>
        <RteButton onClick={() => exec('underline')} title="Underline">
          <span className="underline text-[11px] leading-none w-4 text-center">U</span>
        </RteButton>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <RteButton onClick={() => exec('justifyLeft')} title="Align left">
          <AlignLeft size={12} />
        </RteButton>
        <RteButton onClick={() => exec('justifyCenter')} title="Align center">
          <AlignCenter size={12} />
        </RteButton>
        <RteButton onClick={() => exec('justifyRight')} title="Align right">
          <AlignRight size={12} />
        </RteButton>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <RteButton onClick={() => exec('insertUnorderedList')} title="Bullet list">
          <List size={12} />
        </RteButton>
      </div>

      {/* Editable content area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[120px] p-3 text-sm leading-relaxed focus:outline-none"
        style={{ wordBreak: 'break-word' }}
        onInput={() => {
          if (editorRef.current) onChange(editorRef.current.innerHTML)
        }}
      />
    </div>
  )
}

function RteButton({ onClick, title, children }: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
    >
      {children}
    </button>
  )
}

// ── Position sliders (X / Y percentage) ──────────────────────────────────────

function PositionSliders({ label, x, y, onX, onY }: {
  label: string
  x: number
  y: number
  onX: (v: number) => void
  onY: (v: number) => void
}) {
  return (
    <div className="space-y-2 p-2.5 bg-gray-50 rounded-lg">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div>
        <label className="prop-label flex justify-between">
          <span>X — left / right</span>
          <span className="font-mono text-indigo-600">{x}%</span>
        </label>
        <input
          type="range" min="0" max="100" step="1"
          value={x}
          onChange={(e) => onX(Number(e.target.value))}
          className="w-full h-1.5 accent-indigo-600"
        />
      </div>
      <div>
        <label className="prop-label flex justify-between">
          <span>Y — top / bottom</span>
          <span className="font-mono text-indigo-600">{y}%</span>
        </label>
        <input
          type="range" min="0" max="100" step="1"
          value={y}
          onChange={(e) => onY(Number(e.target.value))}
          className="w-full h-1.5 accent-indigo-600"
        />
      </div>
    </div>
  )
}

// ── Agenda editor ─────────────────────────────────────────────────────────────

interface AgendaItem {
  time: string
  endTime?: string
  title: string
  description?: string
  speaker?: string
  location?: string
  category?: string
  emoji?: string
}

const AGENDA_STYLE_OPTIONS = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'cards',    label: 'Cards' },
  { value: 'compact',  label: 'Compact' },
]

function AgendaEditor({ value, onChange }: { value: AgendaItem[]; onChange: (v: AgendaItem[]) => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const add = () => {
    const next = [...value, { time: '', title: 'New Item', category: '' }]
    onChange(next)
    setExpandedIdx(next.length - 1)
  }

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
    if (expandedIdx === i) setExpandedIdx(null)
  }

  const upd = (i: number, field: keyof AgendaItem, v: string) => {
    const updated = [...value]
    updated[i] = { ...updated[i], [field]: v }
    onChange(updated)
  }

  const moveUp = (i: number) => {
    if (i === 0) return
    const updated = [...value]
    ;[updated[i - 1], updated[i]] = [updated[i], updated[i - 1]]
    onChange(updated)
    setExpandedIdx(i - 1)
  }

  const moveDown = (i: number) => {
    if (i === value.length - 1) return
    const updated = [...value]
    ;[updated[i], updated[i + 1]] = [updated[i + 1], updated[i]]
    onChange(updated)
    setExpandedIdx(i + 1)
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => {
        const isOpen = expandedIdx === i
        return (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Item header — always visible */}
            <div
              className="flex items-center gap-1.5 px-2 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedIdx(isOpen ? null : i)}
            >
              {item.emoji && <span className="text-sm shrink-0">{item.emoji}</span>}
              <span className="text-xs font-medium text-gray-500 shrink-0 w-16 truncate">{item.time || '—'}</span>
              <span className="text-xs font-semibold text-gray-800 flex-1 truncate">
                {item.title || 'Untitled'}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveUp(i) }}
                  className="p-0.5 text-gray-400 hover:text-gray-700 rounded disabled:opacity-20"
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveDown(i) }}
                  className="p-0.5 text-gray-400 hover:text-gray-700 rounded disabled:opacity-20"
                  disabled={i === value.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(i) }}
                  className="p-1 text-red-400 hover:bg-red-50 rounded ml-0.5"
                >
                  <X size={11} />
                </button>
                <ChevronDown
                  size={12}
                  className="text-gray-400 ml-0.5 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>
            </div>

            {/* Expanded fields */}
            {isOpen && (
              <div className="p-2 space-y-1.5 border-t border-gray-100">
                {/* Time row */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="prop-label">Start Time</label>
                    <input className="prop-input" placeholder="9:00 AM" value={item.time}
                      onChange={(e) => upd(i, 'time', e.target.value)} />
                  </div>
                  <div>
                    <label className="prop-label">End Time</label>
                    <input className="prop-input" placeholder="10:00 AM" value={item.endTime || ''}
                      onChange={(e) => upd(i, 'endTime', e.target.value)} />
                  </div>
                </div>

                {/* Title + emoji */}
                <div className="grid grid-cols-[1fr_56px] gap-1.5">
                  <div>
                    <label className="prop-label">Title *</label>
                    <input className="prop-input" placeholder="Item title" value={item.title}
                      onChange={(e) => upd(i, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className="prop-label">Emoji</label>
                    <input className="prop-input text-center" placeholder="🎤" value={item.emoji || ''}
                      onChange={(e) => upd(i, 'emoji', e.target.value)} />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="prop-label">Category / Tag</label>
                  <input className="prop-input" placeholder="e.g. Keynote, Break, Workshop" value={item.category || ''}
                    onChange={(e) => upd(i, 'category', e.target.value)} />
                </div>

                {/* Speaker */}
                <div>
                  <label className="prop-label">Speaker / Host</label>
                  <input className="prop-input" placeholder="Name of speaker or host" value={item.speaker || ''}
                    onChange={(e) => upd(i, 'speaker', e.target.value)} />
                </div>

                {/* Location */}
                <div>
                  <label className="prop-label">Location / Room</label>
                  <input className="prop-input" placeholder="e.g. Main Stage, Room A" value={item.location || ''}
                    onChange={(e) => upd(i, 'location', e.target.value)} />
                </div>

                {/* Description */}
                <div>
                  <label className="prop-label">Description</label>
                  <textarea className="prop-input resize-none" rows={2}
                    placeholder="Short description of this session…"
                    value={item.description || ''}
                    onChange={(e) => upd(i, 'description', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={add}
        className="w-full py-2 text-xs font-medium text-indigo-600 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus size={12} />
        Add agenda item
      </button>

      {value.length > 0 && (
        <p className="text-center text-[10px] text-gray-400">{value.length} item{value.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
