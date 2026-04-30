import { useBuilderStore } from '../../store/builderStore'

const FONTS = ['Inter', 'Playfair Display', 'Lato', 'Poppins', 'Merriweather', 'Roboto', 'Open Sans', 'Montserrat']
const RADIUS = ['0px', '4px', '8px', '12px', '16px', '24px', '9999px']

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0.5 bg-transparent" />
        <div>
          <p className="text-xs text-gray-500">Hex</p>
          <input type="text" value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-mono border-0 p-0 outline-none w-24 text-gray-900" />
        </div>
      </div>
    </div>
  )
}

export function ThemeEditor({ slug }: { slug: string }) {
  const { theme, setTheme } = useBuilderStore()

  const t = theme as {
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    fontHeading?: string
    fontBody?: string
    borderRadius?: string
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Theme Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorField label="Primary Color" value={t.primaryColor || '#6366f1'}
            onChange={(v) => setTheme({ primaryColor: v })} />
          <ColorField label="Secondary Color" value={t.secondaryColor || '#8b5cf6'}
            onChange={(v) => setTheme({ secondaryColor: v })} />
          <ColorField label="Background Color" value={t.backgroundColor || '#ffffff'}
            onChange={(v) => setTheme({ backgroundColor: v })} />
          <ColorField label="Text Color" value={t.textColor || '#111827'}
            onChange={(v) => setTheme({ textColor: v })} />
          <ColorField label="Accent Color" value={t.accentColor || '#f59e0b'}
            onChange={(v) => setTheme({ accentColor: v })} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Typography</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              value={t.fontHeading || 'Inter'}
              onChange={(e) => setTheme({ fontHeading: e.target.value })}>
              {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <p className="mt-2 text-sm text-gray-400" style={{ fontFamily: t.fontHeading || 'Inter' }}>
              The quick brown fox
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              value={t.fontBody || 'Inter'}
              onChange={(e) => setTheme({ fontBody: e.target.value })}>
              {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
            <p className="mt-2 text-sm text-gray-400" style={{ fontFamily: t.fontBody || 'Inter' }}>
              The quick brown fox
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Border Radius</h3>
        <div className="flex flex-wrap gap-2">
          {RADIUS.map((r) => (
            <button
              key={r}
              onClick={() => setTheme({ borderRadius: r })}
              className={`px-4 py-2 border text-sm font-medium transition-all ${
                t.borderRadius === r
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
              style={{ borderRadius: r }}
            >
              {r === '9999px' ? 'Pill' : r || 'None'}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-xl bg-gray-50">
          <p className="text-xs text-gray-500 mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 text-white text-sm font-medium"
              style={{
                backgroundColor: t.primaryColor || '#6366f1',
                borderRadius: t.borderRadius || '8px',
                fontFamily: t.fontBody || 'Inter',
              }}
            >
              Button
            </button>
            <span
              className="text-lg font-bold"
              style={{
                color: t.textColor || '#111827',
                fontFamily: t.fontHeading || 'Inter',
              }}
            >
              Heading text
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
