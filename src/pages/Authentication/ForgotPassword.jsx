import React, { useState, useMemo, useCallback } from 'react';
import { Brain, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  // Memoized email validation function
  const validateEmail = useCallback(() => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);


  const backtologin = () => {
    navigate('/login');
  };

  const backtohome = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setErrors({});
      } else {
        setErrors({ submit: data.message || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [errors.email]);

  const handleResendEmail = useCallback(() => {
    setEmailSent(false);
    setEmail('');
    setErrors({});
  }, []);

  // Memoized success message
  const successMessage = useMemo(() => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-300 mb-4">
          If an account with email <span className="text-cyan-400 font-semibold">{email}</span> exists, you will receive a password reset link shortly.
        </p>
        <p className="text-sm text-gray-400">
          Didn't receive the email? Check your spam folder or try again.
        </p>
      </div>

      <button
        onClick={handleResendEmail}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <span>Try Another Email</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  ), [email, handleResendEmail]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            {!emailSent ? (
              <>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <Mail className="w-4 h-4 mr-2" />
                  Password Recovery
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Check Your Email
                </h1>
                <p className="text-gray-600">
                  We've sent a password reset link to your email address.
                </p>
              </>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            {!emailSent ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              successMessage
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button onClick={backtologin} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button onClick={backtohome} className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;