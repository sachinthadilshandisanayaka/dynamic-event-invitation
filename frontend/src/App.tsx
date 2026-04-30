import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { EventEditorPage } from './pages/admin/EventEditorPage'
import { EventPage } from './pages/EventPage'
import { RsvpPage } from './pages/rsvp/RsvpPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated() ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/events" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/:slug"
          element={
            <ProtectedRoute>
              <EventEditorPage />
            </ProtectedRoute>
          }
        />

        {/* Public RSVP */}
        <Route path="/rsvp/:token" element={<RsvpPage />} />

        {/* Public Event Viewer (catch-all slug) */}
        <Route path="/:slug" element={<EventPage />} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
