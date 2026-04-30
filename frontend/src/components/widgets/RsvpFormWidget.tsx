import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { rsvpApi, analyticsApi } from '../../api'
import type { CustomField } from '../../types'
import { CheckCircle, XCircle, Users, MessageSquare } from 'lucide-react'

interface Props {
  title?: string
  maxPlusOnes?: number
  showMessage?: boolean
  bgColor?: string
  buttonColor?: string
  preview?: boolean
  eventSlug?: string
  inviteToken?: string
}

export function RsvpFormWidget({
  title = 'Will you attend?',
  maxPlusOnes = 0,
  showMessage = false,
  bgColor = '#f0fdf4',
  buttonColor = '#16a34a',
  preview = false,
  eventSlug,
  inviteToken,
}: Props) {
  const [attending, setAttending] = useState<boolean | null>(null)
  const [plusOnes, setPlusOnes] = useState(0)
  const [message, setMessage] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Track RSVP started
  useEffect(() => {
    if (attending !== null && eventSlug) {
      analyticsApi.track(eventSlug, 'rsvp_started', inviteToken)
    }
  }, [attending, eventSlug, inviteToken])

  const { data: customFields = [] } = useQuery<CustomField[]>({
    queryKey: ['custom-fields', eventSlug],
    queryFn: () => rsvpApi.getCustomFields(eventSlug!),
    enabled: !!eventSlug && !preview,
  })

  const mutation = useMutation({
    mutationFn: () => rsvpApi.submit(inviteToken!, {
      attending,
      plusOnes,
      message,
      fieldValues,
    }),
    onSuccess: () => {
      setSubmitted(true)
      if (eventSlug) analyticsApi.track(eventSlug, 'rsvp_submitted', inviteToken)
    },
  })

  if (preview) {
    return (
      <div className="py-12 px-6" style={{ backgroundColor: bgColor }}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading, inherit)' }}>{title}</h2>
          <div className="flex gap-3 justify-center mb-6">
            <button className="px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
              style={{ backgroundColor: buttonColor }}>
              <CheckCircle size={18} /> Yes, I'll attend!
            </button>
            <button className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 border border-gray-300 bg-white text-gray-600">
              <XCircle size={18} /> Can't make it
            </button>
          </div>
          <p className="text-xs text-gray-400 italic">RSVP form (preview mode)</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="py-16 px-6" style={{ backgroundColor: bgColor }}>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">{attending ? '🎉' : '😢'}</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
            {attending ? "You're on the list!" : 'Thanks for letting us know'}
          </h2>
          <p className="text-gray-600">
            {attending
              ? `We can't wait to see you!${plusOnes > 0 ? ` (+${plusOnes} guest${plusOnes > 1 ? 's' : ''})` : ''}`
              : "We'll miss you, but thanks for responding."}
          </p>
        </div>
      </div>
    )
  }

  if (!inviteToken) {
    return (
      <div className="py-12 px-6 text-center" style={{ backgroundColor: bgColor }}>
        <p className="text-gray-500">Open your personal invitation link to RSVP</p>
      </div>
    )
  }

  return (
    <div className="py-12 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
          {title}
        </h2>

        {/* Attending buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setAttending(true)}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
              attending === true
                ? 'border-green-500 text-white shadow-lg scale-[1.02]'
                : 'border-transparent bg-white text-gray-600 shadow-sm hover:shadow-md'
            }`}
            style={attending === true ? { backgroundColor: buttonColor } : {}}
          >
            <CheckCircle size={20} /> Yes, I'll attend!
          </button>
          <button
            onClick={() => setAttending(false)}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
              attending === false
                ? 'border-red-400 bg-red-50 text-red-600 scale-[1.02]'
                : 'border-transparent bg-white text-gray-600 shadow-sm hover:shadow-md'
            }`}
          >
            <XCircle size={20} /> Can't make it
          </button>
        </div>

        {/* More options when attending = yes */}
        {attending && (
          <div className="space-y-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* Plus ones */}
            {maxPlusOnes > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users size={16} /> Plus-ones (max {maxPlusOnes})
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                  <span className="text-xl font-semibold w-8 text-center">{plusOnes}</span>
                  <button onClick={() => setPlusOnes(Math.min(maxPlusOnes, plusOnes + 1))}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">+</button>
                </div>
              </div>
            )}

            {/* Custom fields */}
            {customFields.map((field) => (
              <div key={field.id || field.fieldKey}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.fieldLabel}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.fieldType === 'select' ? (
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                    value={fieldValues[field.id || field.fieldKey] || ''}
                    onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {(typeof field.options === 'string'
                      ? JSON.parse(field.options || '[]')
                      : field.options || []
                    ).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={fieldValues[field.id || field.fieldKey] === 'true'}
                      onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: String(e.target.checked) })}
                      className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-gray-600">Yes</span>
                  </label>
                ) : (
                  <input
                    type={field.fieldType === 'date' ? 'date' : 'text'}
                    required={field.required}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                    value={fieldValues[field.id || field.fieldKey] || ''}
                    onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: e.target.value })}
                  />
                )}
              </div>
            ))}

            {/* Personal message */}
            {showMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <MessageSquare size={16} /> Message (optional)
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none"
                  rows={3}
                  placeholder="Leave a message for the host..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        {attending !== null && (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full mt-5 py-4 rounded-2xl text-white font-semibold transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: attending ? buttonColor : '#ef4444' }}
          >
            {mutation.isPending ? 'Submitting...' : 'Confirm RSVP'}
          </button>
        )}

        {mutation.isError && (
          <p className="text-red-500 text-sm text-center mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  )
}
