export interface User {
  id: string
  name: string
  email: string
  role: string
  orgId: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

export interface EventResponse {
  id: string
  slug: string
  title: string
  status: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'ENDED' | 'ARCHIVED'
  eventDate: string
  eventEndDate?: string
  timezone: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImageUrl?: string
  orgId: string
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  type: string
  order: number
  props: Record<string, unknown>
}

export interface Theme {
  id: string
  eventId: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  borderRadius: string
  tokens: Record<string, string> | string
}

export interface WidgetDefinition {
  type: string
  label: string
  category: string
  icon: string
  schema: Record<string, SchemaField>
}

export interface SchemaField {
  type: string
  label: string
  required?: boolean
  default?: unknown
  options?: string[]
}

export interface Guest {
  id: string
  name?: string
  email?: string
  phone?: string
  inviteToken: string
  status: 'INVITED' | 'OPENED' | 'RSVP_YES' | 'RSVP_NO'
  notes?: string
  invitedAt: string
  rsvp?: RsvpDto
}

export interface RsvpDto {
  id: string
  guestId: string
  attending: boolean
  plusOnes: number
  message?: string
  respondedAt: string
}

export interface GuestStats {
  total: number
  attending: number
  declined: number
  opened: number
  pending: number
}

export interface CustomField {
  id?: string
  fieldKey: string
  fieldLabel: string
  fieldType: 'text' | 'select' | 'checkbox' | 'date' | 'textarea'
  options?: string
  required: boolean
  displayOrder: number
}

export interface MediaAsset {
  id: string
  eventId: string
  filename: string
  contentType: string
  sizeBytes: number
  cdnUrl: string
  objectKey: string
  uploadedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
