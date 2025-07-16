// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Landing from './pages/Landing';
import LoginPage from './pages/Authentication/Login';
import SignUpPage from './pages/Authentication/SignUp';
import ForgotPassword from './pages/Authentication/ForgotPassword';

// Dashboard components
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import FacultyDashboard from './pages/Dashboard/FacultyDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

// Profile components
import StudentProfile from './pages/Profile/StudentProfile';
import FacultyProfile from './pages/Profile/FacultyProfile';

// Protection components
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          {/* Authentication Routes - Only accessible when not logged in */}
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <AuthRoute>
                <SignUpPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            } 
          />
          
          {/* Protected Dashboard Routes - Role-based access */}
          <Route path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          <Route path="/faculty/*" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <Routes>
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="profile" element={<FacultyProfile />} />
                  {/* Add other faculty routes */}
                </Routes>
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  
                  {/* Add other admin routes */}
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;