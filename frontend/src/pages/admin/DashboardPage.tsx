import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import type { EventResponse } from '../../types'
import { Plus, Calendar, Globe, Archive, Edit, LogOut, BarChart2, Share2 } from 'lucide-react'
import { CreateEventModal } from '../../components/builder/CreateEventModal'
import { ShareModal } from '../../components/builder/ShareModal'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [shareEvent, setShareEvent] = useState<EventResponse | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  })

  const publishMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.publish(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const archiveMutation = useMutation({
    mutationFn: (slug: string) => eventsApi.archive(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const events: EventResponse[] = data?.content || []

  const statusColor = {
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
          <span className="text-sm text-gray-500">{data?.totalElements || 0} events</span>
        </div>

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
                      {event.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${statusColor[event.status]}`}>
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

                    {event.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => { if (confirm('Archive this event?')) archiveMutation.mutate(event.slug) }}
                        className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
