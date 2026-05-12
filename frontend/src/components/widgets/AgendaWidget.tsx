interface AgendaItem { time: string; title: string; description?: string }

interface Props {
  title?: string
  items?: AgendaItem[]
  bgColor?: string
  textColor?: string
}

export function AgendaWidget({ title = 'Schedule', items = [], bgColor = '#ffffff', textColor = '#111827' }: Props) {
  const sampleItems: AgendaItem[] = [
    { time: '10:00 AM', title: 'Welcome & Registration' },
    { time: '11:00 AM', title: 'Keynote', description: 'Opening remarks' },
    { time: '1:00 PM', title: 'Lunch Break' },
    { time: '2:00 PM', title: 'Closing Ceremony' },
  ]
  const displayItems = items.length > 0 ? items : sampleItems

  return (
    <div
      className="px-fluid flex flex-col justify-center"
      style={{
        fontFamily: 'var(--font-heading, inherit)',
        backgroundColor: bgColor,
        color: textColor,
        paddingTop: 'clamp(4rem, 10vw, 6rem)',
        paddingBottom: 'clamp(4rem, 10vw, 6rem)',
      }}
    >
      <div className="container-fluid max-w-2xl">
        <h3 className="section-heading text-center mb-8">{title}</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[5.5rem] top-0 bottom-0 w-0.5 bg-current opacity-10" />

          <div className="space-y-6">
            {displayItems.map((item, i) => (
              <div key={i} className="flex gap-6 items-start relative">
                <div className="w-20 text-right shrink-0">
                  <span className="text-sm font-semibold opacity-60">{item.time}</span>
                </div>
                {/* Dot */}
                <div className="absolute left-[5rem] top-1 w-3 h-3 rounded-full border-2 border-current"
                  style={{ backgroundColor: bgColor }} />
                <div className="flex-1 pl-6">
                  <p className="font-semibold text-base">{item.title}</p>
                  {item.description && (
                    <p className="text-sm opacity-60 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
