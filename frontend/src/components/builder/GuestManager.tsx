import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rsvpApi } from '../../api'
import type { Guest, GuestStats } from '../../types'
import { UserPlus, Upload, Trash2, Copy, CheckCircle, XCircle, Clock, Mail } from 'lucide-react'

export function GuestManager({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })

  const { data: guestsPage } = useQuery({
    queryKey: ['guests', slug],
    queryFn: () => rsvpApi.listGuests(slug),
  })

  const { data: stats } = useQuery<GuestStats>({
    queryKey: ['guests-stats', slug],
    queryFn: () => rsvpApi.getStats(slug),
  })

  const addMutation = useMutation({
    mutationFn: () => rsvpApi.addGuest(slug, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', slug] })
      queryClient.invalidateQueries({ queryKey: ['guests-stats', slug] })
      setForm({ name: '', email: '', phone: '', notes: '' })
      setShowAdd(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => rsvpApi.deleteGuest(slug, guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', slug] })
      queryClient.invalidateQueries({ queryKey: ['guests-stats', slug] })
    },
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => rsvpApi.importCsv(slug, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', slug] })
      queryClient.invalidateQueries({ queryKey: ['guests-stats', slug] })
    },
  })

  const guests: Guest[] = guestsPage?.content || []

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/rsvp/${token}`)
  }

  const statusIcon = {
    INVITED: <Clock size={14} className="text-gray-400" />,
    OPENED: <Mail size={14} className="text-blue-500" />,
    RSVP_YES: <CheckCircle size={14} className="text-green-500" />,
    RSVP_NO: <XCircle size={14} className="text-red-400" />,
  }

  const statusLabel = {
    INVITED: 'bg-gray-100 text-gray-600',
    OPENED: 'bg-blue-50 text-blue-600',
    RSVP_YES: 'bg-green-50 text-green-700',
    RSVP_NO: 'bg-red-50 text-red-600',
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Attending', value: stats.attending, color: 'text-green-600' },
            { label: 'Declined', value: stats.declined, color: 'text-red-500' },
            { label: 'Opened', value: stats.opened, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex-1">Guests</h2>
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
          <Upload size={15} /> Import CSV
          <input type="file" accept=".csv" className="hidden"
            onChange={(e) => e.target.files?.[0] && importMutation.mutate(e.target.files[0])} />
        </label>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={15} /> Add Guest
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h3 className="font-semibold text-gray-800 mb-4">Add Guest</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input className="input" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Phone (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Notes (optional)" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {addMutation.isPending ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </div>
      )}

      {/* CSV hint */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
        CSV format: <code className="font-mono bg-amber-100 px-1 rounded">name,email,phone</code> — first row as header
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {guests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No guests yet. Add some above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">RSVP</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{guest.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{guest.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusLabel[guest.status]}`}>
                      {statusIcon[guest.status]} {guest.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {guest.rsvp ? (
                      <span className={`text-xs font-medium ${guest.rsvp.attending ? 'text-green-600' : 'text-red-500'}`}>
                        {guest.rsvp.attending ? `Yes (+${guest.rsvp.plusOnes})` : 'No'}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyInviteLink(guest.inviteToken)}
                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Copy invite link">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Remove guest?')) deleteMutation.mutate(guest.id) }}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; outline: none; }
        .input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
      `}</style>
    </div>
  )
}
