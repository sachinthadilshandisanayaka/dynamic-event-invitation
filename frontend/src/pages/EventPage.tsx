import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi, layoutApi, themeApi } from '../api'
import { analyticsApi } from '../api'
import { ThemeInjector } from '../theme/ThemeInjector'
import { WidgetRenderer } from '../components/widgets/WidgetRenderer'
import { LoadingScreen } from '../components/animations/LoadingScreen'
import { ParticleSystem } from '../components/animations/ParticleSystem'
import { ScrollReveal } from '../components/animations/ScrollReveal'
import { getAnimationIdFromTokens, getAnimationCollection } from '../data/animationCollections'
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

  const { data: themeData } = useQuery({
    queryKey: ['public-theme', slug],
    queryFn: () => themeApi.getPublic(slug!),
    enabled: !!slug,
  })

  // Determine animation collection from saved theme tokens
  const animationId = getAnimationIdFromTokens(themeData?.tokens)
  const collection = getAnimationCollection(animationId)
  const hasAnimation = !!animationId

  // Skip loading animation if none configured or already shown this session
  useEffect(() => {
    if (!hasAnimation) setAnimDone(true)
  }, [hasAnimation])

  // Track page view
  useEffect(() => {
    if (slug && event) {
      analyticsApi.track(slug, inviteToken ? 'invite_opened' : 'page_view', inviteToken)
    }
  }, [slug, event, inviteToken])

  // Set meta tags for SEO / social sharing
  useEffect(() => {
    if (event) {
      document.title = event.ogTitle || event.title || 'Event Invitation'
      setMeta('description', event.ogDescription || event.description || '')
      setMeta('og:title', event.ogTitle || event.title || '')
      setMeta('og:description', event.ogDescription || '')
      if (event.ogImageUrl) setMeta('og:image', event.ogImageUrl)
    }
  }, [event])

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-500">This event link is either invalid or the event has not been published yet.</p>
        </div>
      </div>
    )
  }

  let sections: Section[] = []
  if (layoutData?.sections) {
    try {
      sections = typeof layoutData.sections === 'string'
        ? JSON.parse(layoutData.sections)
        : layoutData.sections
    } catch { sections = [] }
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg, #ffffff)' }}>
      {themeData && <ThemeInjector theme={themeData} />}

      {/* Cinematic loading screen — shown before content if animation configured */}
      {hasAnimation && !animDone && themeData && (
        <LoadingScreen
          collectionId={animationId}
          eventTitle={event.title}
          onComplete={() => setAnimDone(true)}
        />
      )}

      {/* Ambient particle system — always visible once animation done */}
      {hasAnimation && animDone && (
        <ParticleSystem collection={collection} />
      )}

      {/* Main content — hidden behind loading screen until animation finishes */}
      <div style={{
        opacity: animDone ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}>
        {sections.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{event.title}</h1>
              <p className="mt-4 text-gray-500">Event page is being set up. Check back soon!</p>
            </div>
          </div>
        ) : (
          sortedSections.map((section, index) => (
            <ScrollReveal
              key={section.id}
              scrollAnim={collection.scrollAnim}
              delay={index === 0 ? 0 : Math.min(index * 80, 300)}
            >
              <WidgetRenderer
                section={
                  section.type === 'event-details'
                    ? { ...section, props: { ...section.props, eventDate: event.eventDate, timezone: event.timezone } }
                    : section
                }
                eventSlug={slug}
                inviteToken={inviteToken}
              />
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  )
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    const attr = name.startsWith('og:') ? 'property' : 'name'
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
