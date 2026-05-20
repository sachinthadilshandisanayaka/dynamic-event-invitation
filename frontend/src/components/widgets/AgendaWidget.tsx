import { useState, useRef, useEffect } from 'react'
import { MapPin, User, ChevronDown } from 'lucide-react'
import { gsap, ScrollTrigger } from '../../lib/gsap-init'
import { AnimatedText } from '../animations/AnimatedText'
import { useAnimationDisabled } from '../../contexts/AnimationContext'

export interface AgendaItem {
  time: string
  endTime?: string
  title: string
  description?: string
  speaker?: string
  location?: string
  category?: string
  emoji?: string
}

interface Props {
  title?: string
  subtitle?: string
  items?: AgendaItem[]
  style?: 'timeline' | 'cards' | 'compact'
  bgColor?: string
  textColor?: string
  accentColor?: string
}

// Palette cycles for category badges
const CATEGORY_PALETTES: { bg: string; text: string; border: string }[] = [
  { bg: 'rgba(99,102,241,0.12)',  text: '#6366f1', border: 'rgba(99,102,241,0.3)'  },
  { bg: 'rgba(236,72,153,0.12)',  text: '#ec4899', border: 'rgba(236,72,153,0.3)'  },
  { bg: 'rgba(245,158,11,0.12)',  text: '#d97706', border: 'rgba(245,158,11,0.3)'  },
  { bg: 'rgba(16,185,129,0.12)',  text: '#059669', border: 'rgba(16,185,129,0.3)'  },
  { bg: 'rgba(14,165,233,0.12)',  text: '#0ea5e9', border: 'rgba(14,165,233,0.3)'  },
  { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
  { bg: 'rgba(168,85,247,0.12)',  text: '#a855f7', border: 'rgba(168,85,247,0.3)'  },
]

function getCategoryPalette(category: string, allCategories: string[]) {
  const idx = allCategories.indexOf(category)
  return CATEGORY_PALETTES[(idx < 0 ? 0 : idx) % CATEGORY_PALETTES.length]
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Sample data shown when no items exist ────────────────────────────────────

const SAMPLE_ITEMS: AgendaItem[] = [
  { time: '9:00 AM',  endTime: '9:30 AM',  title: 'Registration & Welcome',    category: 'Arrival',   location: 'Lobby',       emoji: '👋' },
  { time: '9:30 AM',  endTime: '10:30 AM', title: 'Opening Keynote',           category: 'Keynote',   location: 'Main Stage',  speaker: 'Dr. Sarah Chen',  description: 'An inspiring talk on the future of innovation and community.' },
  { time: '10:45 AM', endTime: '12:00 PM', title: 'Interactive Workshop',      category: 'Workshop',  location: 'Room A',      speaker: 'Alex Rivera',     description: 'Hands-on session with collaborative activities.' },
  { time: '12:00 PM', endTime: '1:00 PM',  title: 'Networking Lunch',          category: 'Break',     location: 'Garden',      emoji: '🍽️' },
  { time: '1:00 PM',  endTime: '2:30 PM',  title: 'Panel Discussion',          category: 'Talk',      location: 'Main Stage',  speaker: 'Multiple Speakers', description: 'Open discussion with industry leaders.' },
  { time: '2:45 PM',  endTime: '3:00 PM',  title: 'Closing Ceremony',          category: 'Ceremony',  location: 'Main Stage',  emoji: '🎉' },
]

// ── Hook: stagger-animate direct [data-agenda-item] children on scroll ───────
// direction: 'y' = slide up (timeline/compact), 'x' = slide from right (cards)

function useItemStagger(
  containerRef: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  direction: 'x' | 'y' = 'y',
) {
  const disabled = useAnimationDisabled()
  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-agenda-item]'))
    if (!items.length) return

    const reset = () =>
      direction === 'x'
        ? gsap.set(items, { opacity: 0, x: 40 })
        : gsap.set(items, { opacity: 0, y: 28 })
    reset()

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 86%',
      onEnter: () => {
        if (direction === 'x') {
          gsap.to(items, {
            opacity: 1,
            x: 0,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.08,
          })
        } else {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.1,
          })
        }
      },
      onLeaveBack: reset,
    })

    return () => {
      trigger.kill()
      gsap.set(items, { clearProps: 'all' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, disabled, direction])
}

// ── Timeline Style ─────────────────────────────────────────────────────────────

function TimelineItem({
  item,
  accentColor,
  textColor,
  bgColor,
  categoryPalette,
  isLast,
}: {
  item: AgendaItem
  accentColor: string
  textColor: string
  bgColor: string
  categoryPalette?: { bg: string; text: string; border: string }
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const hasMeta = item.speaker || item.location
  const hasDescription = !!item.description

  return (
    <div data-agenda-item className="relative flex gap-0">
      {/* Time column */}
      <div className="w-24 sm:w-28 shrink-0 pt-0.5 text-right pr-4">
        <span
          className="text-xs font-semibold leading-tight block"
          style={{ color: textColor, opacity: 0.55 }}
        >
          {item.time}
        </span>
        {item.endTime && (
          <span
            className="text-[10px] leading-tight block mt-0.5"
            style={{ color: textColor, opacity: 0.35 }}
          >
            {item.endTime}
          </span>
        )}
      </div>

      {/* Dot + line column */}
      <div className="relative flex flex-col items-center">
        <div
          className="relative z-10 w-3 h-3 rounded-full mt-1 shrink-0"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 0 2px ${bgColor}, 0 0 0 4px ${hexToRgba(accentColor, 0.25)}`,
          }}
        />
        {!isLast && (
          <div
            className="flex-1 w-px mt-1 min-h-[2rem]"
            style={{ backgroundColor: textColor, opacity: 0.1 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pl-4 pb-8">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          {item.emoji && <span className="text-base leading-none mt-0.5">{item.emoji}</span>}
          <h4
            className="font-semibold text-sm sm:text-[15px] leading-snug flex-1 min-w-0"
            style={{ color: textColor }}
          >
            {item.title}
          </h4>
          {item.category && categoryPalette && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border"
              style={{
                backgroundColor: categoryPalette.bg,
                color: categoryPalette.text,
                borderColor: categoryPalette.border,
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        {hasMeta && (
          <div className="flex flex-wrap gap-3 mb-1.5">
            {item.speaker && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: textColor, opacity: 0.55 }}>
                <User size={10} />
                {item.speaker}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: textColor, opacity: 0.55 }}>
                <MapPin size={10} />
                {item.location}
              </span>
            )}
          </div>
        )}

        {hasDescription && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[11px] mb-1 transition-opacity hover:opacity-80"
              style={{ color: textColor, opacity: 0.45 }}
            >
              <ChevronDown
                size={12}
                className="transition-transform duration-200"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
              {expanded ? 'Hide details' : 'Show details'}
            </button>
            {expanded && (
              <p
                className="text-xs leading-relaxed"
                style={{ color: textColor, opacity: 0.6 }}
              >
                {item.description}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TimelineView({
  items,
  accentColor,
  textColor,
  bgColor,
  allCategories,
}: {
  items: AgendaItem[]
  accentColor: string
  textColor: string
  bgColor: string
  allCategories: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  useItemStagger(containerRef, [items])

  return (
    <div ref={containerRef} className="mt-8">
      {items.map((item, i) => (
        <TimelineItem
          key={i}
          item={item}
          accentColor={accentColor}
          textColor={textColor}
          bgColor={bgColor}
          categoryPalette={item.category ? getCategoryPalette(item.category, allCategories) : undefined}
          isLast={i === items.length - 1}
        />
      ))}
    </div>
  )
}

// ── Cards Style — horizontal row layout ───────────────────────────────────────

function CardItem({
  item,
  accentColor,
  textColor,
  categoryPalette,
}: {
  item: AgendaItem
  accentColor: string
  textColor: string
  bgColor: string
  categoryPalette?: { bg: string; text: string; border: string }
}) {
  return (
    <div
      data-agenda-item
      className="flex items-stretch rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        borderColor: hexToRgba(accentColor, 0.15),
        backgroundColor: hexToRgba(accentColor, 0.03),
      }}
    >
      {/* Left: accent bar + time block */}
      <div
        className="flex flex-col items-center justify-center gap-1 shrink-0"
        style={{
          width: 72,
          backgroundColor: hexToRgba(accentColor, 0.1),
          borderRight: `3px solid ${accentColor}`,
        }}
      >
        <span
          className="text-[11px] font-bold text-center leading-tight px-1"
          style={{ color: accentColor }}
        >
          {item.time}
        </span>
        {item.endTime && (
          <span
            className="text-[9px] text-center leading-tight opacity-60"
            style={{ color: accentColor }}
          >
            {item.endTime}
          </span>
        )}
        {item.emoji && <span className="text-base mt-0.5">{item.emoji}</span>}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h4
            className="font-semibold text-sm leading-snug flex-1"
            style={{ color: textColor }}
          >
            {item.title}
          </h4>
          {item.category && categoryPalette && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0"
              style={{
                backgroundColor: categoryPalette.bg,
                color: categoryPalette.text,
                borderColor: categoryPalette.border,
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        {item.description && (
          <p
            className="text-[12px] leading-relaxed mb-1.5"
            style={{ color: textColor, opacity: 0.6 }}
          >
            {item.description}
          </p>
        )}

        {(item.speaker || item.location) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {item.speaker && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: textColor, opacity: 0.5 }}
              >
                <User size={10} />
                {item.speaker}
              </span>
            )}
            {item.location && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: textColor, opacity: 0.5 }}
              >
                <MapPin size={10} />
                {item.location}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CardsView({
  items,
  accentColor,
  textColor,
  bgColor,
  allCategories,
}: {
  items: AgendaItem[]
  accentColor: string
  textColor: string
  bgColor: string
  allCategories: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  useItemStagger(containerRef, [items], 'x')

  return (
    <div ref={containerRef} className="mt-8 flex flex-col gap-3">
      {items.map((item, i) => (
        <CardItem
          key={i}
          item={item}
          accentColor={accentColor}
          textColor={textColor}
          bgColor={bgColor}
          categoryPalette={item.category ? getCategoryPalette(item.category, allCategories) : undefined}
        />
      ))}
    </div>
  )
}

// ── Compact / Table Style ──────────────────────────────────────────────────────

function CompactView({
  items,
  accentColor,
  textColor,
  allCategories,
}: {
  items: AgendaItem[]
  accentColor: string
  textColor: string
  allCategories: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  useItemStagger(containerRef, [items])

  return (
    <div ref={containerRef} className="mt-8 overflow-hidden rounded-xl border" style={{ borderColor: hexToRgba(textColor, 0.1) }}>
      {items.map((item, i) => {
        const palette = item.category ? getCategoryPalette(item.category, allCategories) : undefined
        const isEven  = i % 2 === 0

        return (
          <div
            key={i}
            data-agenda-item
            className="flex items-start gap-4 px-5 py-3.5 border-b last:border-b-0"
            style={{
              borderColor: hexToRgba(textColor, 0.07),
              backgroundColor: isEven ? 'transparent' : hexToRgba(textColor, 0.02),
            }}
          >
            <div className="w-20 sm:w-24 shrink-0 pt-0.5">
              <span className="text-xs font-semibold block" style={{ color: textColor, opacity: 0.5 }}>
                {item.time}
              </span>
              {item.endTime && (
                <span className="text-[10px] block mt-0.5" style={{ color: textColor, opacity: 0.35 }}>
                  {item.endTime}
                </span>
              )}
            </div>

            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: accentColor }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {item.emoji && <span className="text-sm">{item.emoji}</span>}
                <span className="text-sm font-semibold" style={{ color: textColor }}>
                  {item.title}
                </span>
                {item.category && palette && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: palette.bg,
                      color: palette.text,
                      borderColor: palette.border,
                    }}
                  >
                    {item.category}
                  </span>
                )}
              </div>
              {(item.speaker || item.location || item.description) && (
                <div className="flex flex-wrap gap-3 mt-0.5">
                  {item.description && (
                    <span className="text-[11px] w-full" style={{ color: textColor, opacity: 0.55 }}>
                      {item.description}
                    </span>
                  )}
                  {item.speaker && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: textColor, opacity: 0.45 }}>
                      <User size={10} /> {item.speaker}
                    </span>
                  )}
                  {item.location && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: textColor, opacity: 0.45 }}>
                      <MapPin size={10} /> {item.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Widget ────────────────────────────────────────────────────────────────

export function AgendaWidget({
  title = 'Schedule',
  subtitle,
  items = [],
  style = 'timeline',
  bgColor = '#ffffff',
  textColor = '#111827',
  accentColor = '#6366f1',
}: Props) {
  const displayItems    = items.length > 0 ? items : SAMPLE_ITEMS
  const allCategories   = [...new Set(displayItems.map((i) => i.category).filter(Boolean) as string[])]
  const resolvedAccent  = accentColor || '#6366f1'

  return (
    <div
      style={{
        fontFamily: 'var(--font-body, inherit)',
        backgroundColor: bgColor,
        color: textColor,
        paddingTop: 'clamp(3.5rem, 9vw, 5.5rem)',
        paddingBottom: 'clamp(3.5rem, 9vw, 5.5rem)',
      }}
    >
      <div
        className="mx-auto px-5 sm:px-8"
        style={{ maxWidth: style === 'cards' ? '820px' : '680px' }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase mb-3"
            style={{ color: resolvedAccent, opacity: 0.8 }}
          >
            <span className="h-px w-6 inline-block" style={{ backgroundColor: resolvedAccent, opacity: 0.5 }} />
            Program
            <span className="h-px w-6 inline-block" style={{ backgroundColor: resolvedAccent, opacity: 0.5 }} />
          </div>

          <AnimatedText
            as="h3"
            text={title}
            split="words"
            className="font-bold leading-tight block"
            style={{
              fontFamily: 'var(--font-heading, inherit)',
              color: textColor,
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            }}
          />

          {subtitle && (
            <AnimatedText
              as="p"
              text={subtitle}
              split="words"
              delay={200}
              className="mt-2 text-sm leading-relaxed max-w-lg mx-auto block"
              style={{ color: textColor, opacity: 0.55 }}
            />
          )}

          <div
            className="mx-auto mt-4 h-0.5 rounded-full"
            style={{
              width: '3rem',
              background: `linear-gradient(90deg, transparent, ${resolvedAccent}, transparent)`,
            }}
          />
        </div>

        {/* Category legend */}
        {allCategories.length >= 2 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {allCategories.map((cat) => {
              const p = getCategoryPalette(cat, allCategories)
              return (
                <span
                  key={cat}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{ backgroundColor: p.bg, color: p.text, borderColor: p.border }}
                >
                  {cat}
                </span>
              )
            })}
          </div>
        )}

        {/* Content */}
        {style === 'timeline' && (
          <TimelineView
            items={displayItems}
            accentColor={resolvedAccent}
            textColor={textColor}
            bgColor={bgColor}
            allCategories={allCategories}
          />
        )}
        {style === 'cards' && (
          <CardsView
            items={displayItems}
            accentColor={resolvedAccent}
            textColor={textColor}
            bgColor={bgColor}
            allCategories={allCategories}
          />
        )}
        {style === 'compact' && (
          <CompactView
            items={displayItems}
            accentColor={resolvedAccent}
            textColor={textColor}
            allCategories={allCategories}
          />
        )}

        {displayItems.length > 0 && (
          <p
            className="text-center text-[11px] mt-8"
            style={{ color: textColor, opacity: 0.3 }}
          >
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} on the program
          </p>
        )}
      </div>
    </div>
  )
}
