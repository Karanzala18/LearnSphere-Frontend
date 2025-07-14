// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles specified, just check authentication
  if     (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return children;
  }

  // If user doesn't have required role, redirect to their appropriate dashboard
  const userDashboard = authService.getDashboardRoute(currentUser?.role);
  return <Navigate to={userDashboard} replace />;
};

export default ProtectedRoute;

