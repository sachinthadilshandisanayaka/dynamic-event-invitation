/// <reference types="vite/client" />
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
          const newToken = data.data.accessToken
          localStorage.setItem('accessToken', newToken)
          err.config.headers.Authorization = `Bearer ${newToken}`
          return api(err.config)
        } catch {
          localStorage.clear()
          window.location.href = '/admin/login'
        }
      }
    }
    return Promise.reject(err)
  },
)

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data.data),
  register: (name: string, email: string, password: string, orgName?: string) =>
    api.post('/auth/register', { name, email, password, orgName }).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
}

// ---- Events ----
export const eventsApi = {
  list: (page = 0, size = 20) =>
    api.get(`/events?page=${page}&size=${size}`).then((r) => r.data.data),
  listDeleted: (page = 0, size = 20) =>
    api.get(`/events/history?page=${page}&size=${size}`).then((r) => r.data.data),
  get: (slug: string) => api.get(`/events/${slug}`).then((r) => r.data.data),
  getPublic: (slug: string) =>
    axios.get(`${API_URL}/api/events/${slug}`).then((r) => r.data.data),
  create: (data: object) => api.post('/events', data).then((r) => r.data.data),
  update: (slug: string, data: object) =>
    api.put(`/events/${slug}`, data).then((r) => r.data.data),
  publish: (slug: string) => api.put(`/events/${slug}/publish`).then((r) => r.data.data),
  unpublish: (slug: string) => api.put(`/events/${slug}/unpublish`).then((r) => r.data.data),
  delete: (slug: string) => api.delete(`/events/${slug}`).then((r) => r.data),
  permanentDelete: (slug: string) => api.delete(`/events/${slug}/permanent`).then((r) => r.data),
  copy: (slug: string) => api.post(`/events/${slug}/copy`).then((r) => r.data.data),
}

// ---- Layout ----
export const layoutApi = {
  get: (slug: string) => api.get(`/events/${slug}/layout`).then((r) => r.data.data),
  save: (slug: string, sections: unknown[]) =>
    api.put(`/events/${slug}/layout`, { sections: JSON.stringify(sections) }).then((r) => r.data.data),
  getPublic: (slug: string) =>
    axios.get(`${API_URL}/api/events/${slug}/layout`).then((r) => r.data.data),
}

// ---- Theme ----
export const themeApi = {
  get: (slug: string) => api.get(`/events/${slug}/theme`).then((r) => r.data.data),
  save: (slug: string, theme: object) => {
    // Serialize tokens object to JSON string so backend stores it correctly.
    // Java LinkedHashMap.toString() produces {key=value} format (not valid JSON),
    // so we must send tokens as a JSON string, not a nested object.
    const payload = { ...theme } as Record<string, unknown>
    if (payload.tokens && typeof payload.tokens === 'object') {
      payload.tokens = JSON.stringify(payload.tokens)
    }
    return api.put(`/events/${slug}/theme`, payload).then((r) => r.data.data)
  },
  getPublic: (slug: string) =>
    axios.get(`${API_URL}/api/events/${slug}/theme`).then((r) => r.data.data),
}

// ---- Widgets ----
export const widgetsApi = {
  catalog: () => axios.get(`${API_URL}/api/widgets`).then((r) => r.data.data),
}

// ---- RSVP ----
export const rsvpApi = {
  getByToken: (token: string) =>
    axios.get(`${API_URL}/api/rsvp/${token}`).then((r) => r.data.data),
  submit: (token: string, data: object) =>
    axios.post(`${API_URL}/api/rsvp/${token}`, data).then((r) => r.data.data),
  listGuests: (slug: string, page = 0, size = 50) =>
    api.get(`/events/${slug}/guests?page=${page}&size=${size}`).then((r) => r.data.data),
  getStats: (slug: string) =>
    api.get(`/events/${slug}/guests/stats`).then((r) => r.data.data),
  addGuest: (slug: string, data: object) =>
    api.post(`/events/${slug}/guests`, data).then((r) => r.data.data),
  importCsv: (slug: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/events/${slug}/guests/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data)
  },
  deleteGuest: (slug: string, guestId: string) =>
    api.delete(`/events/${slug}/guests/${guestId}`).then((r) => r.data),
  getCustomFields: (slug: string) =>
    axios.get(`${API_URL}/api/events/${slug}/custom-fields`).then((r) => r.data.data),
  saveCustomFields: (slug: string, fields: object[]) =>
    api.put(`/events/${slug}/custom-fields`, fields).then((r) => r.data.data),
}

// ---- Media ----
export const mediaApi = {
  presign: (eventSlug: string, filename: string, contentType: string) =>
    api.post('/media/presign', { eventSlug, filename, contentType }).then((r) => r.data.data),
  listByEvent: (slug: string) =>
    api.get(`/media/events/${slug}`).then((r) => r.data.data),
  upload: async (eventSlug: string, file: File): Promise<string> => {
    const form = new FormData()
    form.append('eventSlug', eventSlug)
    form.append('file', file)
    const { cdnUrl } = await api
      .post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data)
    return cdnUrl
  },
  delete: (assetId: string) => api.delete(`/media/${assetId}`).then((r) => r.data),
}

// ---- Analytics ----
export const analyticsApi = {
  track: (eventSlug: string, eventType: string, inviteToken?: string) =>
    axios.post(`${API_URL}/api/analytics/track`, { eventSlug, eventType, inviteToken })
      .catch(() => {}), // swallow errors silently
  getSummary: (slug: string) =>
    api.get(`/analytics/events/${slug}`).then((r) => r.data.data),
}
