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
    mutationFn: () => rsvpApi.submit(inviteToken!, { attending, plusOnes, message, fieldValues }),
    onSuccess: () => {
      setSubmitted(true)
      if (eventSlug) analyticsApi.track(eventSlug, 'rsvp_submitted', inviteToken)
    },
  })

  // ── Preview mode ─────────────────────────────────────────────────────────────
  if (preview) {
    return (
      <div className="px-fluid flex flex-col justify-center" style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, paddingTop: 'clamp(4rem, 10vw, 6rem)', paddingBottom: 'clamp(4rem, 10vw, 6rem)' }}>
        <div className="container-fluid max-w-md text-center">
          <h2 className="section-heading mb-6">{title}</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button className="btn-primary flex items-center gap-2" style={{ background: buttonColor }}>
              <CheckCircle size={18} /> Yes, I'll attend!
            </button>
            <button className="btn-primary flex items-center gap-2"
              style={{ background: 'transparent', color: '#6b7280', boxShadow: 'inset 0 0 0 1.5px #d1d5db' }}>
              <XCircle size={18} /> Can't make it
            </button>
          </div>
          <p className="text-fluid-xs text-gray-400 italic">RSVP form (preview mode)</p>
        </div>
      </div>
    )
  }

  // ── Submitted state ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="px-fluid flex flex-col justify-center" style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, paddingTop: 'clamp(4rem, 10vw, 6rem)', paddingBottom: 'clamp(4rem, 10vw, 6rem)' }}>
        <div className="container-fluid max-w-md text-center">
          <div className="text-5xl sm:text-6xl mb-4">{attending ? '🎉' : '😢'}</div>
          <h2 className="section-heading mb-2">
            {attending ? "You're on the list!" : 'Thanks for letting us know'}
          </h2>
          <p className="text-fluid-base text-gray-600">
            {attending
              ? `We can't wait to see you!${plusOnes > 0 ? ` (+${plusOnes} guest${plusOnes > 1 ? 's' : ''})` : ''}`
              : "We'll miss you, but thanks for responding."}
          </p>
        </div>
      </div>
    )
  }

  // ── No token guard ────────────────────────────────────────────────────────────
  if (!inviteToken) {
    return (
      <div className="px-fluid flex flex-col justify-center text-center" style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, paddingTop: 'clamp(4rem, 10vw, 6rem)', paddingBottom: 'clamp(4rem, 10vw, 6rem)' }}>
        <p className="text-fluid-sm text-gray-500">Open your personal invitation link to RSVP</p>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-fluid flex flex-col justify-center" style={{ fontFamily: 'var(--font-heading, inherit)', backgroundColor: bgColor, paddingTop: 'clamp(4rem, 10vw, 6rem)', paddingBottom: 'clamp(4rem, 10vw, 6rem)' }}>
      <div className="container-fluid max-w-md">
        <h2 className="section-heading text-center mb-7 sm:mb-9">{title}</h2>

        {/* Attending buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setAttending(true)}
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border-2 text-fluid-base ${
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
            className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border-2 text-fluid-base ${
              attending === false
                ? 'border-red-400 bg-red-50 text-red-600 scale-[1.02]'
                : 'border-transparent bg-white text-gray-600 shadow-sm hover:shadow-md'
            }`}
          >
            <XCircle size={20} /> Can't make it
          </button>
        </div>

        {/* Extended options when attending */}
        {attending && (
          <div className="space-y-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

            {maxPlusOnes > 0 && (
              <div>
                <label className="block text-fluid-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users size={15} /> Plus-ones (max {maxPlusOnes})
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                  >−</button>
                  <span className="text-xl font-semibold w-8 text-center">{plusOnes}</span>
                  <button
                    onClick={() => setPlusOnes(Math.min(maxPlusOnes, plusOnes + 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                  >+</button>
                </div>
              </div>
            )}

            {customFields.map((field) => (
              <div key={field.id || field.fieldKey}>
                <label className="block text-fluid-sm font-medium text-gray-700 mb-1.5">
                  {field.fieldLabel}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.fieldType === 'select' ? (
                  <select
                    className="input-base"
                    value={fieldValues[field.id || field.fieldKey] || ''}
                    onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {(typeof field.options === 'string'
                      ? JSON.parse(field.options || '[]')
                      : field.options || []
                    ).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.fieldType === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldValues[field.id || field.fieldKey] === 'true'}
                      onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: String(e.target.checked) })}
                      className="w-5 h-5 rounded accent-indigo-600"
                    />
                    <span className="text-fluid-sm text-gray-600">Yes</span>
                  </label>
                ) : (
                  <input
                    type={field.fieldType === 'date' ? 'date' : 'text'}
                    required={field.required}
                    className="input-base"
                    value={fieldValues[field.id || field.fieldKey] || ''}
                    onChange={(e) => setFieldValues({ ...fieldValues, [field.id || field.fieldKey]: e.target.value })}
                  />
                )}
              </div>
            ))}

            {showMessage && (
              <div>
                <label className="block text-fluid-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <MessageSquare size={15} /> Message (optional)
                </label>
                <textarea
                  className="input-base resize-none"
                  rows={3}
                  placeholder="Leave a message for the host…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {attending !== null && (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full mt-5 py-4 rounded-2xl text-white font-semibold text-fluid-base transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: attending ? buttonColor : '#ef4444' }}
          >
            {mutation.isPending ? 'Submitting…' : 'Confirm RSVP'}
          </button>
        )}

        {mutation.isError && (
          <p className="text-red-500 text-fluid-sm text-center mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  )
}
