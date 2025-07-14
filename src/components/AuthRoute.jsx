// components/AuthRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

// This component prevents authenticated users from accessing login/signup pages
const AuthRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (isAuthenticated && currentUser) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoute = authService.getDashboardRoute(currentUser.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default AuthRoute;