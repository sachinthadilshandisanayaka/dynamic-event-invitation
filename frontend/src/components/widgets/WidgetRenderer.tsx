import type { Section } from '../../types'
import { HeroBanner } from './HeroBanner'
import { CountdownTimer } from './CountdownTimer'
import { EventDetails } from './EventDetails'
import { MapWidget } from './MapWidget'
import { RsvpFormWidget } from './RsvpFormWidget'
import { GalleryWidget } from './GalleryWidget'
import { AgendaWidget } from './AgendaWidget'
import { RichTextWidget } from './RichTextWidget'
import { VideoWidget } from './VideoWidget'
import { SpacerWidget } from './SpacerWidget'

interface Props {
  section: Section
  preview?: boolean
  eventSlug?: string
  inviteToken?: string
}

export function WidgetRenderer({ section, preview = false, eventSlug, inviteToken }: Props) {
  const props = section.props

  switch (section.type) {
    case 'hero':
      return <HeroBanner {...props as Record<string, string>} />
    case 'countdown':
      return <CountdownTimer {...props as Record<string, string>} />
    case 'event-details':
      return <EventDetails {...props as Record<string, unknown>} />
    case 'map':
      return <MapWidget {...props as Record<string, unknown>} preview={preview} />
    case 'rsvp-form':
      return <RsvpFormWidget {...props as Record<string, unknown>} preview={preview} eventSlug={eventSlug} inviteToken={inviteToken} />
    case 'gallery':
      return <GalleryWidget {...props as Record<string, unknown>} />
    case 'agenda':
      return <AgendaWidget {...props as Record<string, unknown>} />
    case 'rich-text':
      return <RichTextWidget {...props as Record<string, string>} />
    case 'video':
      return <VideoWidget {...props as Record<string, unknown>} />
    case 'spacer':
      return <SpacerWidget {...props as Record<string, unknown>} />
    default:
      return (
        <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200">
          Unknown widget: {section.type}
        </div>
      )
  }
}
