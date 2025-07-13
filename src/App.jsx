import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Landing from './pages/Landing';
import LoginPage from './pages/Authentication/Login';
import SignUpPage from './pages/Authentication/SignUp';
import ForgotPassword from './pages/Authentication/ForgotPassword';

// You can add these components later as you build them
// import StudentDashboard from './pages/Student/Dashboard';
// import FacultyDashboard from './pages/Faculty/Dashboard';
// import AdminDashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Uncomment these routes as you create the components */}
          
          {/* Dashboard Routes */}
          {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
          {/* <Route path="/faculty/dashboard" element={<FacultyDashboard />} /> */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;