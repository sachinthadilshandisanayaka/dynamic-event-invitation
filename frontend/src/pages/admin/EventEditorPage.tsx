import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi, layoutApi, themeApi, widgetsApi } from '../../api'
import { useBuilderStore } from '../../store/builderStore'
import type { Section, WidgetDefinition } from '../../types'
import { BuilderCanvas } from '../../components/builder/BuilderCanvas'
import { SectionPalette } from '../../components/builder/SectionPalette'
import { PropEditor } from '../../components/builder/PropEditor'
import { ThemeEditor } from '../../components/builder/ThemeEditor'
import { GuestManager } from '../../components/builder/GuestManager'
import { AnalyticsDashboard } from '../../components/builder/AnalyticsDashboard'
import { TemplatePickerModal } from '../../components/builder/TemplatePickerModal'
import { ShareModal } from '../../components/builder/ShareModal'
import {
  ArrowLeft, Save, Globe, EyeOff, Eye, Palette, Users, BarChart2, Layout, Sparkles, Share2,
} from 'lucide-react'

type Tab = 'builder' | 'theme' | 'guests' | 'analytics'

export function EventEditorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'builder')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [showSavePublishedWarn, setShowSavePublishedWarn] = useState(false)
  const initializedRef = useRef<string | null>(null)  // tracks which slug was initialized

  const {
    sections, theme, setSections, initTheme, isDirty, markClean, resetStore,
  } = useBuilderStore()

  // Reset store whenever we navigate to a different event
  useEffect(() => {
    resetStore()
    initializedRef.current = null
    return () => {
      // Clean up when leaving editor
      resetStore()
    }
  }, [slug])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!slug) {
    navigate('/admin', { replace: true })
    return null
  }

  const { data: event } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventsApi.get(slug),
    enabled: !!slug,
  })

  const { data: layoutData } = useQuery({
    queryKey: ['layout', slug],
    queryFn: () => layoutApi.get(slug),
    enabled: !!slug,
  })

  const { data: themeData } = useQuery({
    queryKey: ['theme', slug],
    queryFn: () => themeApi.get(slug),
    enabled: !!slug,
  })

  const { data: widgets = [] } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => widgetsApi.catalog(),
  })

  // Initialize sections from server data
  useEffect(() => {
    if (!layoutData || initializedRef.current === slug) return

    let parsed: Section[] = []
    if (layoutData.sections) {
      try {
        parsed = typeof layoutData.sections === 'string'
          ? JSON.parse(layoutData.sections)
          : layoutData.sections
        if (!Array.isArray(parsed)) parsed = []
      } catch {
        parsed = []
      }
    }

    setSections(parsed)
    initializedRef.current = slug

    // Auto-open template picker when event has no sections yet
    if (parsed.length === 0) {
      setShowTemplates(true)
    }
  }, [layoutData, slug])  // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize theme from server data — skip if user has unsaved edits
  useEffect(() => {
    if (themeData && !useBuilderStore.getState().isDirty) initTheme(themeData)
  }, [themeData])  // eslint-disable-line react-hooks/exhaustive-deps

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { sections: currentSections, theme: currentTheme } = useBuilderStore.getState()
      await layoutApi.save(slug, currentSections)
      await themeApi.save(slug, currentTheme)
    },
    onSuccess: () => {
      markClean()
      queryClient.invalidateQueries({ queryKey: ['layout', slug] })
      queryClient.invalidateQueries({ queryKey: ['theme', slug] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: () =>
      event?.status === 'PUBLISHED'
        ? eventsApi.unpublish(slug)
        : eventsApi.publish(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', slug] }),
  })

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'builder', label: 'Builder', icon: <Layout size={16} /> },
    { id: 'theme', label: 'Theme', icon: <Palette size={16} /> },
    { id: 'guests', label: 'Guests', icon: <Users size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">{event?.title ?? slug}</h1>
            <p className="text-xs text-gray-400 font-mono">/{slug}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Templates button — builder tab only */}
          {activeTab === 'builder' && (
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              title="Apply a template"
            >
              <Sparkles size={14} /> Templates
            </button>
          )}

          {/* Share button */}
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            title="Share event"
          >
            <Share2 size={14} /> Share
          </button>

          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              Unsaved
            </span>
          )}

          {event?.status === 'PUBLISHED' && (
            <button
              onClick={() => window.open(`/${slug}`, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Eye size={14} /> Live
            </button>
          )}

          <button
            onClick={() => {
              if (event?.status === 'PUBLISHED' && isDirty) {
                setShowSavePublishedWarn(true)
              } else {
                saveMutation.mutate()
              }
            }}
            disabled={saveMutation.isPending || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Save size={14} /> {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={() => setShowPublishConfirm(true)}
            disabled={publishMutation.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              event?.status === 'PUBLISHED'
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {event?.status === 'PUBLISHED'
              ? <><EyeOff size={14} /> Unpublish</>
              : <><Globe size={14} /> Publish</>}
          </button>
        </div>
      </header>

      {/* Content */}
      {activeTab === 'builder' && (
        <div className="flex-1 flex overflow-hidden">
          <SectionPalette widgets={widgets as WidgetDefinition[]} />
          <BuilderCanvas slug={slug} onOpenTemplates={() => setShowTemplates(true)} />
          <PropEditor widgets={widgets as WidgetDefinition[]} slug={slug} />
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="flex-1 overflow-auto p-6">
          <ThemeEditor slug={slug} />
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="flex-1 overflow-auto p-6">
          <GuestManager slug={slug} />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-auto p-6">
          <AnalyticsDashboard slug={slug} />
        </div>
      )}

      {showTemplates && (
        <TemplatePickerModal
          onClose={() => setShowTemplates(false)}
          eventDate={event?.eventDate}
          timezone={event?.timezone}
        />
      )}

      {showShare && (
        <ShareModal
          slug={slug}
          title={event?.title ?? slug}
          isPublished={event?.status === 'PUBLISHED'}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Publish / Unpublish confirmation */}
      {showPublishConfirm && (
        <ConfirmModal
          title={event?.status === 'PUBLISHED' ? 'Unpublish Event?' : 'Publish Event?'}
          message={
            event?.status === 'PUBLISHED'
              ? 'This will hide your event from guests. They will no longer be able to view the invitation.'
              : 'This will make your event live and visible to all guests. Ready to publish?'
          }
          confirmLabel={event?.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          confirmClass={event?.status === 'PUBLISHED' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'}
          onCancel={() => setShowPublishConfirm(false)}
          onConfirm={() => {
            setShowPublishConfirm(false)
            publishMutation.mutate()
          }}
        />
      )}

      {/* Save-while-published warning */}
      {showSavePublishedWarn && (
        <ConfirmModal
          title="Save Changes to Live Event?"
          message="Your event is currently published. Saving will apply your changes immediately and guests will see the updates right away."
          confirmLabel="Save Anyway"
          confirmClass="bg-indigo-600 hover:bg-indigo-700"
          onCancel={() => setShowSavePublishedWarn(false)}
          onConfirm={() => {
            setShowSavePublishedWarn(false)
            saveMutation.mutate()
          }}
        />
      )}
    </div>
  )
}

function ConfirmModal({
  title, message, confirmLabel, confirmClass, onCancel, onConfirm,
}: {
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
