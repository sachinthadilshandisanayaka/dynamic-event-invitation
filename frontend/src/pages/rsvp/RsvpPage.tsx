import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { rsvpApi } from '../../api'
import { eventsApi, themeApi } from '../../api'
import { ThemeInjector } from '../../theme/ThemeInjector'
import { RsvpFormWidget } from '../../components/widgets/RsvpFormWidget'

export function RsvpPage() {
  const { token } = useParams<{ token: string }>()

  const { data: guest, isLoading, error } = useQuery({
    queryKey: ['guest', token],
    queryFn: () => rsvpApi.getByToken(token!),
    enabled: !!token,
    retry: false,
  })

  // We'd need to get event slug from guest's eventId; for simplicity we show the RSVP form directly
  // The form handles submission via the token

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-500">This invitation link is not valid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-lg mx-auto pt-12 pb-24 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          {guest.name && (
            <p className="text-lg text-gray-600 mb-2">
              Hi <span className="font-semibold text-gray-900">{guest.name}</span>! 👋
            </p>
          )}
          <p className="text-gray-500">You're invited. Will you be joining us?</p>
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <RsvpFormWidget
            title="RSVP"
            inviteToken={token}
            maxPlusOnes={2}
            showMessage={true}
            bgColor="#ffffff"
            buttonColor="#6366f1"
          />
        </div>
      </div>
    </div>
  )
}
