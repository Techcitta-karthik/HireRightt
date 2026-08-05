import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HomePage } from './pages/HomePage'
import { ProfileWizard } from './pages/ProfileWizard'
import { JobSeekersPage } from './pages/JobSeekersPage'
import { WhyPage } from './pages/WhyPage'
import { SolutionsPage } from './pages/SolutionsPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { AboutPage } from './pages/AboutPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { LoginPage, SettingsPage, SignupPage } from './pages/AuthPages'
import { DashboardPage, JobsPage, ProfilePage } from './pages/AppPages'
import { InterviewPage } from './pages/InterviewPage'
import { RequireAuth } from './components/RequireAuth'
import { pageTransition } from './motion/variants'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/job-seekers" element={<JobSeekersPage />} />
          <Route path="/why" element={<WhyPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <ProfileWizard />
              </RequireAuth>
            }
          />
          <Route
            path="/interview"
            element={
              <RequireAuth>
                <InterviewPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/jobs"
            element={
              <RequireAuth>
                <JobsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
