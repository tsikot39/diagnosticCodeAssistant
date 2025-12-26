import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CodeDetailPage from './pages/CodeDetailPage'
import DashboardPage from './pages/DashboardPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import AuditLogPage from './pages/AuditLogPage'
import AdminPage from './pages/AdminPage'
import { VersionHistoryPage } from './pages/VersionHistoryPage'
import { WebhooksPage } from './pages/WebhooksPage'
import { OrganizationsPage } from './pages/OrganizationsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/audit" element={<AuditLogPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/webhooks" element={<WebhooksPage />} />
                    <Route path="/organizations" element={<OrganizationsPage />} />
                    <Route path="/code/:id" element={<CodeDetailPage />} />
                    <Route path="/code/:codeId/history" element={<VersionHistoryPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
