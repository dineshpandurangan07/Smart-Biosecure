import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Import all pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import AnimalManagement from './pages/AnimalManagement';
import VaccinationPage from './pages/VaccinationPage';
import VisitorManagementPage from './pages/VisitorManagementPage';
import DiseaseReportingPage from './pages/DiseaseReportingPage';
import FeedManagementPage from './pages/FeedManagementPage';
import SanitationPage from './pages/SanitationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Standard Dashboard Layout wrapper
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Collabsible Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto min-w-0">
        {/* Sticky Top Header */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Dynamic page mount */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Access Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Operators & Administrator Pages */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/farmer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <FarmerDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/animals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <AnimalManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vaccinations"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <VaccinationPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/visitors"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <VisitorManagementPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/diseases"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <DiseaseReportingPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/feed"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <FeedManagementPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sanitation"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <SanitationPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['admin', 'farmer']}>
                  <DashboardLayout>
                    <ProfileSettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
