import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api'
import { Eye, MousePointer, CheckCircle, TrendingUp } from 'lucide-react'

export function AnalyticsDashboard({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', slug],
    queryFn: () => analyticsApi.getSummary(slug),
    refetchInterval: 30_000,
  })

  if (isLoading) return <div className="flex items-center justify-center py-24 text-gray-400">Loading analytics...</div>

  const stats = [
    { label: 'Total Views', value: data?.totalViews || 0, icon: <Eye size={20} />, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'RSVP Started', value: data?.rsvpStarted || 0, icon: <MousePointer size={20} />, color: 'text-amber-600 bg-amber-50' },
    { label: 'RSVPs Submitted', value: data?.rsvpSubmitted || 0, icon: <CheckCircle size={20} />, color: 'text-green-600 bg-green-50' },
    {
      label: 'Conversion Rate',
      value: `${((data?.conversionRate || 0) * 100).toFixed(1)}%`,
      icon: <TrendingUp size={20} />,
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Daily views */}
      {data?.dailyViews?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Views (Last 30 Days)</h3>
          <div className="space-y-2">
            {(data.dailyViews as { day: string; views: number }[]).slice(0, 14).map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">{new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((d.views / Math.max(...data.dailyViews.map((x: { views: number }) => x.views), 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8 text-right">{d.views}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
