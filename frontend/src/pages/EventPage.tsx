import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi, layoutApi, themeApi } from '../api'
import { analyticsApi } from '../api'
import { ensureGoogleFontsForSections } from '../lib/googleFonts'
import { ThemeInjector } from '../theme/ThemeInjector'
import { SectionDecorationLayer } from '../components/theme/SectionDecorationLayer'
import { SectionParticleLayer } from '../components/animations/SectionParticleLayer'
import { WidgetRenderer } from '../components/widgets/WidgetRenderer'
import { LoadingScreen } from '../components/animations/LoadingScreen'
import { ParticleSystem } from '../components/animations/ParticleSystem'
import { WeddingEnvelopeExperience } from '../components/wedding-envelope/WeddingEnvelopeExperience'
import { getThemeIdFromTokens, getTheme } from '../data/themeRegistry'
import { getAnimationIdFromTokens, getAnimationCollection } from '../data/animationCollections'
import { PageRevealContext } from '../contexts/PageRevealContext'
import type { Section } from '../types'

export function EventPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('t') || undefined

  const [animDone, setAnimDone] = useState(false)

  const { data: event, isLoading: eventLoading, error } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => eventsApi.getPublic(slug!),
    enabled: !!slug,
    retry: false,
  })

  const { data: layoutData } = useQuery({
    queryKey: ['public-layout', slug],
    queryFn: () => layoutApi.getPublic(slug!),
    enabled: !!slug,
  })

  const { data: themeData, isLoading: themeLoading } = useQuery({
    queryKey: ['public-theme', slug],
    queryFn: () => themeApi.getPublic(slug!),
    enabled: !!slug,
  })

  // ── Theme resolution (new registry-first approach) ───────────────────────
  // Priority: __themeId from registry → __animation legacy fallback → none
  const registryThemeId = getThemeIdFromTokens(themeData?.tokens)
  const registryTheme   = registryThemeId ? getTheme(registryThemeId) : null

  // Resolve animationId: explicit __animation token (user override) wins over theme default
  const legacyAnimId  = getAnimationIdFromTokens(themeData?.tokens)
  const animationId   = legacyAnimId || registryTheme?.animationId
  const collection    = getAnimationCollection(animationId)
  const hasAnimation  = !!animationId

  // Whether the entrance uses the envelope experience or a loading screen.
  // If the user explicitly overrode the animation via the __animation token,
  // that choice controls the entrance type (only butterfly-garden → envelope).
  // Otherwise, fall back to the theme registry's entranceType.
  const useEnvelopeEntrance = legacyAnimId
    ? legacyAnimId === 'butterfly-garden'
    : registryTheme
      ? registryTheme.entranceType === 'envelope'
      : false

  // Per-section decoration rules from the registry theme
  const sectionDecorations = registryTheme?.sectionDecorations ?? []

  // Parse sections early so all effects below can reference sortedSections
  const sortedSections = (() => {
    if (!layoutData?.sections) return []
    try {
      const raw = typeof layoutData.sections === 'string'
        ? JSON.parse(layoutData.sections)
        : layoutData.sections
      return ([...raw] as Section[]).sort((a, b) => a.order - b.order)
    } catch { return [] }
  })()

  // Skip animation only after theme finishes loading
  useEffect(() => {
    if (!themeLoading && !hasAnimation) setAnimDone(true)
  }, [hasAnimation, themeLoading])

  // Safety net: never leave the user stuck on the entrance screen
  useEffect(() => {
    const timer = setTimeout(() => setAnimDone(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Load any Google Fonts referenced in section props
  useEffect(() => {
    if (sortedSections.length > 0) ensureGoogleFontsForSections(sortedSections)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutData])

  // Scroll-snap: only the hero snaps; all other sections scroll freely.
  useEffect(() => {
    if (!animDone) return
    const hasHero = sortedSections.some((s) => s.type === 'hero')
    if (!hasHero) return
    const html = document.documentElement
    html.style.scrollSnapType = 'y proximity'
    return () => { html.style.scrollSnapType = '' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animDone, layoutData])

  // Track page view
  useEffect(() => {
    if (slug && event) {
      analyticsApi.track(slug, inviteToken ? 'invite_opened' : 'page_view', inviteToken)
    }
  }, [slug, event, inviteToken])

  // SEO / social meta tags
  useEffect(() => {
    if (event) {
      document.title = event.ogTitle || event.title || 'Event Invitation'
      setMeta('description', event.ogDescription || event.description || '')
      setMeta('og:title', event.ogTitle || event.title || '')
      setMeta('og:description', event.ogDescription || '')
      if (event.ogImageUrl) setMeta('og:image', event.ogImageUrl)
    }
  }, [event])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm tracking-wide">Loading invitation…</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">📮</div>
          <h1 className="text-xl font-semibold text-stone-800 mb-2">Invitation Not Found</h1>
          <p className="text-stone-500 text-sm">This link may be invalid or the event is not yet published.</p>
        </div>
      </div>
    )
  }

  // ── Event date formatted for entrance experience ──────────────────────────
  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : undefined

  // ── Envelope card data: pulled from section props ────────────────────────
  const heroProps        = sortedSections.find(s => s.type === 'hero')?.props
  const eventDetailsProps = sortedSections.find(s => s.type === 'event-details')?.props
  const envelopeTitle   = (heroProps?.title as string | undefined) || event.title
  const envelopeLocation = [
    eventDetailsProps?.venueName as string | undefined,
    eventDetailsProps?.address   as string | undefined,
  ].filter(Boolean).join(', ') || undefined

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: 'var(--color-bg, #ffffff)' }}
    >
      {/* ── Theme CSS vars injection ── */}
      {themeData && <ThemeInjector theme={themeData} />}

      {/* ── Entrance: envelope experience (wedding themes) ── */}
      {hasAnimation && !animDone && useEnvelopeEntrance && (
        <WeddingEnvelopeExperience
          onComplete={() => setAnimDone(true)}
          eventDate={formattedDate}
          eventLocation={envelopeLocation}
          coupleName={envelopeTitle}
        />
      )}

      {/* ── Entrance: cinematic loading screen (all other animations) ── */}
      {hasAnimation && !animDone && !useEnvelopeEntrance && themeData && (
        <LoadingScreen
          collectionId={animationId}
          eventTitle={event.title}
          onComplete={() => setAnimDone(true)}
        />
      )}

      {/* ── Ambient particle system — after animation done ── */}
      {hasAnimation && animDone && (
        <ParticleSystem collection={collection} />
      )}

      {/* ── Main invitation content ── */}
      <PageRevealContext.Provider value={animDone}>
      <div
        style={{
          opacity: animDone ? 1 : 0,
          transition: 'opacity 0.6s ease',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {sortedSections.length === 0 ? (
          <div
            style={{
              minHeight: '100dvh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold"
                style={{ color: 'var(--color-text, #1a1a1a)' }}
              >
                {event.title}
              </h1>
              <p className="mt-4 text-stone-400 text-sm">
                Event page is being set up. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          sortedSections.map((section, index) => {
            const isHero     = section.type === 'hero'
            const isSpacer   = section.type === 'spacer'
            const bgImage    = section.props.bgImage    as string | undefined
            const bgColor    = section.props.bgColor    as string | undefined
            const fontFamily = section.props.fontFamily as string | undefined
            const textColor  = section.props.textColor  as string | undefined
            const bgOpacity  = (section.props.bgOverlay as number) ?? 1.0
            const bgParticle = section.props.bgParticle as string | undefined
            const hasParticles = !!bgParticle && bgParticle !== 'none'

            // Per-type max-widths tuned for readability and visual balance
            const CONTENT_MAX: Record<string, string> = {
              'event-details': '800px',
              countdown:       '760px',
              agenda:          '740px',
              'rsvp-form':     '540px',
              gallery:         '1140px',
              'rich-text':     '740px',
              video:           '900px',
              map:             '860px',
              spacer:          '100%',
            }
            const maxWidth = isHero ? '100%' : (CONTENT_MAX[section.type] ?? '820px')

            const widgetSection = (() => {
              let s = section
              if (section.type === 'event-details') {
                s = { ...s, props: { ...s.props, eventDate: event.eventDate, timezone: event.timezone } }
              }
              // When bgImage or particles are active, make the widget background
              // transparent so the absolute background layer (z=0) and particles (z=1)
              // show through instead of being covered by the widget's own background.
              if ((bgImage || hasParticles) && !isHero) {
                s = { ...s, props: { ...s.props, bgColor: 'transparent' } }
              }
              return s
            })()

            return (
              <div
                key={section.id}
                style={{
                  // ── Hero: immersive full-screen slide that snaps into view ──
                  // ── All others: natural height, scroll freely ──────────────
                  ...(isHero ? {
                    minHeight: '100dvh',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'normal',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  } : isSpacer ? {} : {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }),
                  position: 'relative',
                  overflow: 'hidden',
                  // Background color on the section itself only when there are no
                  // particles — when particles are active, bgColor moves to an absolute
                  // z=0 div so particles (z=1) can appear above it.
                  ...(!isHero && bgColor && !bgImage && !hasParticles ? { backgroundColor: bgColor } : {}),
                  // Per-section font — set both as direct CSS property (for inheritance)
                  // and as CSS vars (for widgets that read them explicitly)
                  ...(fontFamily ? {
                    fontFamily,
                    '--font-heading': fontFamily,
                    '--font-body':    fontFamily,
                  } as React.CSSProperties : {}),
                  ...(textColor  ? { '--color-text': textColor } as React.CSSProperties : {}),
                }}
              >
                {/* Background color as absolute layer when particles are active,
                    so particles (z=1) can render above it instead of being covered */}
                {!isHero && bgColor && !bgImage && hasParticles && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundColor: bgColor,
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Background image — opacity-controlled layer behind the widget */}
                {bgImage && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: bgOpacity,
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Section background particles */}
                {animDone && !!(section.props.bgParticle) && section.props.bgParticle !== 'none' && (
                  <SectionParticleLayer
                    particleId={section.props.bgParticle as string}
                    count={(section.props.bgParticleCount as number) || 12}
                    opacity={(section.props.bgParticleOpacity as number) || 0.7}
                    speed={(section.props.bgParticleSpeed as 'slow' | 'normal' | 'fast') || 'normal'}
                    size={(section.props.bgParticleSize as 'small' | 'medium' | 'large') || 'medium'}
                  />
                )}

                {/* Theme decorations (wedding floral corners etc.) */}
                {animDone && sectionDecorations.length > 0 && (
                  <SectionDecorationLayer
                    rules={sectionDecorations}
                    sectionIndex={index}
                    totalSections={sortedSections.length}
                  />
                )}

                {/* Content — constrained width, horizontally centered */}
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '100%',
                  maxWidth,
                  margin: '0 auto',
                }}>
                  <WidgetRenderer
                    section={widgetSection}
                    eventSlug={slug}
                    inviteToken={inviteToken}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
      </PageRevealContext.Provider>
    </div>
  )
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
