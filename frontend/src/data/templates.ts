import type { Theme } from '../types'

export interface TemplateSection {
  type: string
  props: Record<string, unknown>
}

export interface Template {
  id: string
  name: string
  tagline: string
  emoji: string
  colors: string[]   // [bg, accent] for card preview
  includes: string[]
  theme: Partial<Theme>
  sections: TemplateSection[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    tagline: 'Elegant & Romantic',
    emoji: '💍',
    colors: ['#fdf9f3', '#c8956c'],
    includes: ['Hero Banner', 'Ceremony Details', 'Countdown', 'Gallery', 'Venue Map', 'RSVP'],
    theme: {
      primaryColor: '#c8956c',
      secondaryColor: '#e8c4c4',
      backgroundColor: '#fdf9f3',
      textColor: '#3a2a1a',
      accentColor: '#d4a853',
      fontHeading: 'Playfair Display',
      fontBody: 'Lato',
      borderRadius: '4px',
    },
    sections: [
      {
        type: 'hero',
        props: {
          title: 'Alex & Jordan',
          subtitle: 'Are Getting Married — Join Us to Celebrate Our Love',
          bgColor: '#c8956c',
          textColor: '#fff5eb',
          height: 'large',
        },
      },
      {
        type: 'rich-text',
        props: {
          content:
            '<p style="font-size:1.1rem;line-height:1.9;max-width:640px;margin:0 auto">Together with their families, <strong>Alex &amp; Jordan</strong> joyfully request the honour of your presence at their wedding celebration — a day filled with love, laughter, and cherished memories.</p>',
          align: 'center',
          bgColor: '#fdf9f3',
          textColor: '#3a2a1a',
          padding: 'large',
        },
      },
      {
        type: 'countdown',
        props: {
          targetDate: '',
          timezone: 'UTC',
          label: 'Days Until We Say I Do',
          endedMessage: "We're married! Thank you for celebrating with us! 💍",
        },
      },
      {
        type: 'event-details',
        props: {
          dateLabel: 'Wedding Day',
          locationLabel: 'Our Venue',
          venueName: 'The Grand Ballroom',
          address: '123 Wedding Lane, City',
          showMap: false,
        },
      },
      {
        type: 'gallery',
        props: { title: 'Our Story', images: [], columns: '3', rounded: true },
      },
      {
        type: 'map',
        props: {
          venueName: 'The Grand Ballroom',
          address: '123 Wedding Lane, City',
          zoom: 15,
          height: 350,
        },
      },
      {
        type: 'spacer',
        props: { height: 24, bgColor: '#fdf9f3' },
      },
      {
        type: 'rsvp-form',
        props: {
          title: 'Will You Celebrate With Us?',
          maxPlusOnes: 1,
          showMessage: true,
          bgColor: '#fff5eb',
          buttonColor: '#c8956c',
        },
      },
    ],
  },

  {
    id: 'corporate',
    name: 'Conference',
    tagline: 'Professional & Impactful',
    emoji: '🏢',
    colors: ['#f8fafc', '#1e40af'],
    includes: ['Hero Banner', 'Event Details', 'About Section', 'Schedule / Agenda', 'Venue Map', 'RSVP'],
    theme: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#0ea5e9',
      fontHeading: 'Montserrat',
      fontBody: 'Open Sans',
      borderRadius: '4px',
    },
    sections: [
      {
        type: 'hero',
        props: {
          title: 'Annual Leadership Summit',
          subtitle: 'Join Industry Leaders — Register Today',
          bgColor: '#1e3a8a',
          textColor: '#f0f9ff',
          height: 'large',
        },
      },
      {
        type: 'event-details',
        props: {
          dateLabel: 'Date & Time',
          locationLabel: 'Venue',
          venueName: 'Convention Center',
          address: '456 Business Ave, City',
          showMap: false,
        },
      },
      {
        type: 'rich-text',
        props: {
          content:
            '<h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem">About the Event</h2><p style="line-height:1.8;color:#475569">Join us for a premier gathering of thought leaders, innovators, and industry professionals. Expect insightful keynotes, hands-on workshops, and unparalleled networking opportunities.</p>',
          align: 'left',
          bgColor: '#ffffff',
          textColor: '#1e293b',
          padding: 'large',
        },
      },
      {
        type: 'agenda',
        props: {
          title: 'Conference Schedule',
          items: [
            { time: '09:00 AM', title: 'Registration & Networking', description: 'Welcome coffee and badge collection' },
            { time: '10:00 AM', title: 'Opening Keynote', description: 'Setting the vision for the year ahead' },
            { time: '12:00 PM', title: 'Lunch Break', description: 'Catered lunch and networking' },
            { time: '02:00 PM', title: 'Breakout Sessions', description: 'Choose from 4 specialised tracks' },
            { time: '05:00 PM', title: 'Closing Remarks', description: 'Wrap-up and next steps' },
          ],
          bgColor: '#f8fafc',
          textColor: '#1e293b',
        },
      },
      {
        type: 'map',
        props: { venueName: 'Convention Center', address: '456 Business Ave, City', zoom: 15, height: 300 },
      },
      {
        type: 'rsvp-form',
        props: {
          title: 'Reserve Your Seat',
          maxPlusOnes: 0,
          showMessage: false,
          bgColor: '#eff6ff',
          buttonColor: '#1e40af',
        },
      },
    ],
  },

  {
    id: 'birthday',
    name: 'Birthday Party',
    tagline: 'Fun & Festive',
    emoji: '🎉',
    colors: ['#fdf4ff', '#ec4899'],
    includes: ['Hero Banner', 'Countdown', 'Event Details', 'Message', 'Gallery', 'RSVP'],
    theme: {
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#fdf4ff',
      textColor: '#1f2937',
      accentColor: '#f59e0b',
      fontHeading: 'Poppins',
      fontBody: 'Poppins',
      borderRadius: '16px',
    },
    sections: [
      {
        type: 'hero',
        props: {
          title: "Let's Party! 🎉",
          subtitle: "You're Invited to a Birthday Celebration!",
          bgColor: '#ec4899',
          textColor: '#ffffff',
          height: 'large',
        },
      },
      {
        type: 'countdown',
        props: {
          targetDate: '',
          timezone: 'UTC',
          label: 'Counting Down to the Fun!',
          endedMessage: "The party has started! Let's go! 🎉",
        },
      },
      {
        type: 'event-details',
        props: {
          dateLabel: "Party Time!",
          locationLabel: 'Party Venue',
          venueName: 'The Venue',
          address: '789 Party Lane, City',
          showMap: false,
        },
      },
      {
        type: 'rich-text',
        props: {
          content:
            '<p style="font-size:1.2rem;line-height:1.8">Come celebrate with us for a night of fun, laughter, great food, and unforgettable memories. Don\'t forget to wear your dancing shoes! 🕺💃</p>',
          align: 'center',
          bgColor: '#fdf4ff',
          textColor: '#1f2937',
          padding: 'large',
        },
      },
      {
        type: 'gallery',
        props: { title: 'Memories', images: [], columns: '3', rounded: true },
      },
      {
        type: 'rsvp-form',
        props: {
          title: 'Are You Coming to the Party?',
          maxPlusOnes: 2,
          showMessage: true,
          bgColor: '#fce7f3',
          buttonColor: '#ec4899',
        },
      },
    ],
  },

  {
    id: 'gala',
    name: 'Gala / Awards',
    tagline: 'Prestigious & Formal',
    emoji: '✨',
    colors: ['#1a1a1a', '#d4af37'],
    includes: ['Hero Banner', 'Formal Description', 'Event Details', 'Evening Programme', 'Venue Map', 'RSVP'],
    theme: {
      primaryColor: '#d4af37',
      secondaryColor: '#c8956c',
      backgroundColor: '#141414',
      textColor: '#f5f0e8',
      accentColor: '#d4af37',
      fontHeading: 'Playfair Display',
      fontBody: 'Lato',
      borderRadius: '0px',
    },
    sections: [
      {
        type: 'hero',
        props: {
          title: 'An Evening of Excellence',
          subtitle: 'You Are Cordially Invited to the Annual Gala',
          bgColor: '#0a0a0a',
          textColor: '#f5e6c8',
          height: 'large',
        },
      },
      {
        type: 'rich-text',
        props: {
          content:
            '<p style="font-size:1.05rem;line-height:1.9;letter-spacing:0.02em;max-width:640px;margin:0 auto">We are honoured to request your presence at our distinguished annual gala evening — an exquisite night of fine dining, recognition of excellence, and the celebration of remarkable achievements.</p>',
          align: 'center',
          bgColor: '#1a1a1a',
          textColor: '#e5d5b5',
          padding: 'large',
        },
      },
      {
        type: 'event-details',
        props: {
          dateLabel: 'Occasion',
          locationLabel: 'Venue',
          venueName: 'The Grand Hall',
          address: '1 Prestige Boulevard, City',
          showMap: false,
        },
      },
      {
        type: 'agenda',
        props: {
          title: 'Evening Programme',
          items: [
            { time: '6:30 PM', title: 'Champagne Reception', description: 'Welcome drinks and canapés' },
            { time: '7:30 PM', title: 'Gala Dinner', description: 'Three-course fine dining experience' },
            { time: '9:00 PM', title: 'Awards Ceremony', description: 'Celebrating outstanding achievements' },
            { time: '10:30 PM', title: 'After Party', description: 'Live music and dancing' },
          ],
          bgColor: '#1a1a1a',
          textColor: '#e5d5b5',
        },
      },
      {
        type: 'map',
        props: { venueName: 'The Grand Hall', address: '1 Prestige Boulevard, City', zoom: 15, height: 300 },
      },
      {
        type: 'rsvp-form',
        props: {
          title: 'Confirm Your Attendance',
          maxPlusOnes: 1,
          showMessage: false,
          bgColor: '#1a1a1a',
          buttonColor: '#d4af37',
        },
      },
    ],
  },

  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Clean & Versatile',
    emoji: '⚡',
    colors: ['#ffffff', '#6366f1'],
    includes: ['Hero Banner', 'Event Details', 'Countdown', 'RSVP'],
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      accentColor: '#f59e0b',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      borderRadius: '8px',
    },
    sections: [
      {
        type: 'hero',
        props: {
          title: 'Your Event Title',
          subtitle: 'A brief, compelling description of your event',
          bgColor: '#6366f1',
          textColor: '#ffffff',
          height: 'medium',
        },
      },
      {
        type: 'event-details',
        props: {
          dateLabel: 'Date & Time',
          locationLabel: 'Location',
          venueName: '',
          address: '',
          showMap: false,
        },
      },
      {
        type: 'countdown',
        props: { targetDate: '', timezone: 'UTC', endedMessage: 'The event has started!' },
      },
      {
        type: 'spacer',
        props: { height: 32, bgColor: '#ffffff' },
      },
      {
        type: 'rsvp-form',
        props: {
          title: 'Will you attend?',
          maxPlusOnes: 0,
          showMessage: false,
          bgColor: '#f5f3ff',
          buttonColor: '#6366f1',
        },
      },
    ],
  },
]

export function buildSections(template: Template, eventDate?: string, timezone?: string) {
  return template.sections.map((s, i) => {
    const props = { ...s.props }
    if (s.type === 'countdown' && eventDate) {
      props.targetDate = new Date(eventDate).toISOString()
      if (timezone) props.timezone = timezone
    }
    return {
      id: crypto.randomUUID(),
      type: s.type,
      order: i,
      props,
    }
  })
}
