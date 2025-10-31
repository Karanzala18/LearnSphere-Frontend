import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Phone } from 'lucide-react';
import { authService } from '../../services/authService';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student',
    phone: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const { [name]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        phone: formData.phone || null
      });

      // Redirect based on user role
      const dashboardRoute = authService.getDashboardRoute(response.user.role);
      navigate(dashboardRoute);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ 
          submit: error.message || 'Registration failed. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate]);

  const handleLoginRedirect = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleRoleChange = useCallback((role) => {
    setFormData(prev => ({ ...prev, role }));
  }, []);

  const handleTermsToggle = useCallback(() => {
    setFormData(prev => ({ ...prev, agreeToTerms: !prev.agreeToTerms }));
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleHomeClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toggleTermsModal = useCallback(() => {
    setShowTermsModal(prev => !prev);
  }, []);

  const togglePrivacyModal = useCallback(() => {
    setShowPrivacyModal(prev => !prev);
  }, []);

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthMap = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-blue-500' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very Strong', color: 'bg-green-600' }
    };
    
    return { strength, ...strengthMap[strength] };
  }, [formData.password]);

  const roles = useMemo(() => ['student', 'faculty', 'admin'], []);

  const passwordWidthPercentage = useMemo(() => 
    (passwordStrength.strength / 5) * 100
  , [passwordStrength.strength]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <button 
              onClick={handleHomeClick}
              className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity mx-auto mb-4"
            >
              <Brain className="w-10 h-10 text-blue-600" />
              <span className="text-2xl font-semibold text-gray-900">
                LearnSphere AI
              </span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
            <p className="text-gray-600">Join LearnSphere AI to get started</p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            {/* Role Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.role === role
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Input (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
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
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordWidthPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{passwordStrength.text}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password_confirmation}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleTermsToggle}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    formData.agreeToTerms
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {formData.agreeToTerms && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="text-sm text-gray-600">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={toggleTermsModal}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button"
                    onClick={togglePrivacyModal}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={handleLoginRedirect}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={handleHomeClick}
              className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-2">Yet to be decided ;)</p>
                <p className="text-gray-400 text-sm">Our terms and conditions are currently being drafted.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={toggleTermsModal}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-2">Yet to be decided ;)</p>
                <p className="text-gray-400 text-sm">Our privacy policy is currently being drafted.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={togglePrivacyModal}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;