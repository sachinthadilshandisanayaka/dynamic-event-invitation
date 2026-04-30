import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi, layoutApi, themeApi } from '../../api'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { TEMPLATES, buildSections, type Template } from '../../data/templates'

const TIMEZONES = [
  'UTC', 'Asia/Colombo', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore',
  'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles',
  'Australia/Sydney', 'Pacific/Auckland',
]

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
      {/* Visual preview strip */}
      <div
        className="h-24 relative flex flex-col items-center justify-center gap-1.5 px-4"
        style={{ backgroundColor: template.colors[0] }}
      >
        {/* Simulated hero block */}
        <div
          className="w-full rounded py-2 text-center"
          style={{ backgroundColor: template.colors[1] }}
        >
          <div className="text-white text-xs font-semibold opacity-90 truncate px-2">
            {template.emoji} {template.name}
          </div>
        </div>
        {/* Simulated content rows */}
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

      {/* Info */}
      <div className="p-3 bg-white">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-gray-900 text-sm">{template.name}</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">{template.tagline}</p>
        <div className="flex flex-wrap gap-1">
          {template.includes.slice(0, 3).map((item) => (
            <span key={item} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
              {item}
            </span>
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

export function CreateEventModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    eventDate: '',
    timezone: 'UTC',
    description: '',
  })
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0])
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const isoDate = new Date(data.eventDate).toISOString()
      const event = await eventsApi.create({ ...data, eventDate: isoDate })
      const sections = buildSections(selectedTemplate, isoDate, data.timezone)
      await layoutApi.save(event.slug, sections)
      await themeApi.save(event.slug, selectedTemplate.theme)
      return event
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate(`/admin/events/${event.slug}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to create event')
      setStep(1)
    },
  })

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setForm({ ...form, title, slug: slug.slice(0, 60) })
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.eventDate) return
    setError('')
    setStep(2)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col" style={{ maxWidth: step === 2 ? 760 : 520, maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === n ? 'bg-indigo-600 text-white' : step > n ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > n ? <Check size={12} /> : n}
                  </div>
                  <span className={`text-sm font-medium ${step === n ? 'text-gray-900' : 'text-gray-400'}`}>
                    {n === 1 ? 'Event Details' : 'Choose Template'}
                  </span>
                  {n < 2 && <ChevronRight size={14} className="text-gray-300" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step 1 — Event Details */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="label">Event Title *</label>
              <input
                className="input"
                required
                autoFocus
                placeholder="e.g. Wedding of Alex & Jordan"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div>
              <label className="label">URL Slug</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r whitespace-nowrap">yourdomain.com/</span>
                <input
                  className="flex-1 px-3 py-2.5 text-sm outline-none font-mono"
                  placeholder="my-event-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Event Date & Time *</label>
                <input
                  className="input"
                  type="datetime-local"
                  required
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="input" value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Brief description shown in search results and social previews"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Template Picker */}
        {step === 2 && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-3 shrink-0">
              <p className="text-sm text-gray-500">
                Select a starting template for <strong className="text-gray-800">"{form.title}"</strong>.
                You can customise everything in the editor.
              </p>
            </div>

            <div className="overflow-y-auto px-6 pb-2 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    selected={selectedTemplate.id === t.id}
                    onSelect={() => setSelectedTemplate(t)}
                  />
                ))}
              </div>

              {/* Selected template includes */}
              {selectedTemplate && (
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-700 mb-1.5">
                    {selectedTemplate.emoji} {selectedTemplate.name} includes:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.includes.map((item) => (
                      <span key={item} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mx-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Creating Event...' : `Create with ${selectedTemplate.name} Template`}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.35rem; }
        .input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; outline: none; transition: border-color 0.15s, box-shadow 0.15s; background: white; }
        .input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  )
}
