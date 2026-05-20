import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import type { EventResponse } from '../../types'
import {
  Plus, Calendar, Globe, Edit, LogOut, BarChart2, Share2, Copy,
  Trash2, History, AlertTriangle, Clock,
} from 'lucide-react'
import { CreateEventModal } from '../../components/builder/CreateEventModal'
import { ShareModal } from '../../components/builder/ShareModal'

type Tab = 'events' | 'history'

function daysUntilPurge(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime()
  const purgeAt = deleted + 10 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((purgeAt - Date.now()) / (24 * 60 * 60 * 1000)))
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [shareEvent, setShareEvent] = useState<EventResponse | null>(null)
  const [tab, setTab] = useState<Tab>('events')
  const [confirmDelete, setConfirmDelete] = useState<EventResponse | null>(null)
  const [confirmPermanent, setConfirmPermanent] = useState<EventResponse | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['events-history'],
    queryFn: () => eventsApi.listDeleted(),
    enabled: tab === 'history',
  })

  const publishMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.publish(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events-history'] })
      setConfirmDelete(null)
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.permanentDelete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-history'] })
      setConfirmPermanent(null)
    },
  })

  const copyMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.copy(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const events: EventResponse[] = data?.content || []
  const deletedEvents: EventResponse[] = historyData?.content || []

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    LIVE: 'bg-blue-100 text-blue-700',
    ENDED: 'bg-yellow-100 text-yellow-700',
    ARCHIVED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Event Invite</h1>
              <p className="text-xs text-gray-500">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> New Event
            </button>
            <button
              onClick={() => { clearAuth(); navigate('/admin/login') }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'events' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar size={15} /> My Events
            {data?.totalElements != null && (
              <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                {data.totalElements}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'history' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={15} /> History
            {historyData?.totalElements != null && historyData.totalElements > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {historyData.totalElements}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-6">

        {/* ── My Events ── */}
        {tab === 'events' && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">Create your first event to get started</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                          {event.displayTitle || event.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${statusColor[event.status] || ''}`}>
                          {event.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar size={14} />
                        <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
                        <Globe size={14} />
                        <span className="font-mono">/{event.slug}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/events/${event.slug}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit size={14} /> Edit
                        </button>

                        {event.status === 'PUBLISHED' && (
                          <button
                            onClick={() => window.open(`/${event.slug}`, '_blank')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Globe size={14} /> View
                          </button>
                        )}

                        {event.status === 'DRAFT' && (
                          <button
                            onClick={() => publishMutation.mutate(event.slug)}
                            disabled={publishMutation.isPending}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() => copyMutation.mutate(event.slug)}
                          disabled={copyMutation.isPending}
                          className="p-2 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Duplicate event"
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          onClick={() => setShareEvent(event)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/admin/events/${event.slug}?tab=analytics`)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                          title="Analytics"
                        >
                          <BarChart2 size={16} />
                        </button>

                        <button
                          onClick={() => setConfirmDelete(event)}
                          className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── History ── */}
        {tab === 'history' && (
          <>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <Clock size={15} className="shrink-0" />
              Events in history are permanently deleted after 10 days. All uploaded images and videos are removed from storage.
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
                ))}
              </div>
            ) : deletedEvents.length === 0 ? (
              <div className="text-center py-24">
                <History size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">History is empty</h3>
                <p className="text-gray-400">Deleted events will appear here for 10 days before permanent removal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedEvents.map((event) => {
                  const days = event.deletedAt ? daysUntilPurge(event.deletedAt) : 0
                  return (
                    <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{event.displayTitle || event.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                          <span className="font-mono">/{event.slug}</span>
                          <span>·</span>
                          <span>{new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        days <= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Clock size={11} />
                        {days === 0 ? 'Deletes today' : `${days}d left`}
                      </div>

                      <button
                        onClick={() => setConfirmPermanent(event)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors shrink-0"
                      >
                        <Trash2 size={14} /> Delete permanently
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Soft Delete Confirm ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">This will move the event to history</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">"{confirmDelete.displayTitle || confirmDelete.title}"</span> will be moved to History.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can view it in History for 10 days before it is permanently deleted along with all uploaded files.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete.slug)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Move to History'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permanent Delete Confirm ── */}
      {confirmPermanent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmPermanent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Permanently Delete</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">"{confirmPermanent.displayTitle || confirmPermanent.title}"</span> will be permanently deleted.
            </p>
            <p className="text-sm text-red-600 font-medium mb-6">
              All uploaded images and videos will be removed from storage and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPermanent(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => permanentDeleteMutation.mutate(confirmPermanent.slug)}
                disabled={permanentDeleteMutation.isPending}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {permanentDeleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}

      {shareEvent && (
        <ShareModal
          slug={shareEvent.slug}
          title={shareEvent.title}
          isPublished={shareEvent.status === 'PUBLISHED'}
          onClose={() => setShareEvent(null)}
          onGoToEditor={() => { setShareEvent(null); navigate(`/admin/events/${shareEvent.slug}`) }}
        />
      )}
    </div>
  )
}
