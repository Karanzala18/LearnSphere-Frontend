import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Eye, EyeOff, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { authService } from '../../services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || null;

  // Memoize benefits data
  const benefits = useMemo(() => [
    {
      title: 'AI-Powered Learning',
      description: 'Smart summaries and personalized study tools'
    },
    {
      title: 'Real-Time Collaboration',
      description: 'Connect with faculty and peers instantly'
    },
    {
      title: 'Performance Analytics',
      description: 'Track progress with detailed insights'
    }
  ], []);

  // Memoize trust indicators
  const trustIndicators = useMemo(() => [
    { value: '10k+', label: 'Active Users' },
    { value: '500+', label: 'Institutions' },
    { value: '98%', label: 'Satisfaction' }
  ], []);

  // Memoize role permissions
  const rolePermissions = useMemo(() => ({
    '/admin/dashboard': ['admin'],
    '/faculty/dashboard': ['faculty'],
    '/student/dashboard': ['student']
  }), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      // Check if user was trying to access a specific page before login
      if (from) {
        // Check if the user has permission to access that page
        const userRole = response.user.role;
        const rolePermissions = {
          '/admin/dashboard': ['admin'],
          '/faculty/dashboard': ['faculty'],
          '/student/dashboard': ['student']
        };

        const requiredRoles = rolePermissions[from];
        if (requiredRoles && requiredRoles.includes(userRole)) {
          navigate(from, { replace: true });
        } else {
          // User doesn't have permission, redirect to their dashboard
          const dashboardRoute = authService.getDashboardRoute(userRole);
          navigate(dashboardRoute, { replace: true });
        }
      } else {
        // Normal login, redirect to appropriate dashboard
        const dashboardRoute = authService.getDashboardRoute(response.user.role);
        navigate(dashboardRoute, { replace: true });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ 
          submit: error.message || 'Login failed. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center min-h-[calc(100vh-6rem)] space-x-12">
          
          {/* Right Side - Form */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign In</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={handleSignupRedirect}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;