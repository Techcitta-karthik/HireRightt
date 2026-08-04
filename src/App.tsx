import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/useAuth'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { ProfileWizard } from './pages/ProfileWizard'

function ProtectedOnboarding() {
  const { user, loading } = useAuth()

  if (loading) return <div role="status">Loading your profile…</div>
  if (!user) return <Navigate to="/login" replace />
  return <ProfileWizard />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/onboarding" element={<ProtectedOnboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
