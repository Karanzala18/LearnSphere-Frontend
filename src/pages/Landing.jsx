import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Calendar, BookOpen, Award, Zap, ChevronRight, Menu, X, Check } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
   navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup'); 
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Smart note summaries, flashcard generation, and personalized quizzes powered by advanced AI algorithms."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative Platform",
      description: "Faculty and students work together seamlessly with shared resources, assignments, and real-time feedback."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Calendar",
      description: "Never miss a deadline with integrated calendar showing quizzes, assignments, and important academic events."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Auto-Grading System",
      description: "AI evaluates assignments for grammar, structure, and content quality with instant feedback generation."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track learning progress with detailed analytics and insights for both students and faculty."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Get immediate AI-generated feedback on assignments and quizzes to accelerate learning."
    }
  ];

  const roles = [
    {
      title: "Faculty",
      description: "Create subjects, manage quizzes, auto-grade assignments, and track student performance with powerful analytics.",
      benefits: [
        "Subject & quiz management",
        "Automated grading",
        "Performance dashboards",
        "Resource sharing"
      ]
    },
    {
      title: "Students",
      description: "Join courses, access AI study tools, submit assignments, and get instant feedback on your academic progress.",
      benefits: [
        "AI study companions",
        "Smart flashcards",
        "Progress tracking",
        "Instant feedback"
      ]
    },
    {
      title: "Admin",
      description: "Institution-wide access, comprehensive analytics, and approval workflows for complete academic management.",
      benefits: [
        "Institution analytics",
        "User management",
        "Approval workflows",
        "System oversight"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                LearnSphere AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Features</a>
              <a href="#roles" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Roles</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">About</a>
              <div className="flex items-center space-x-3 ml-4">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={handleSignup}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white rounded-lg mt-2 p-4 border border-gray-200 shadow-lg mb-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Features</a>
                <a href="#roles" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Roles</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">About</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    Log in
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Academic Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 tracking-tight">
              The Smart Academic
              <span className="block text-blue-600 mt-2">
                Companion
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-gray-600 leading-relaxed">
              An all-in-one AI-powered platform where faculty manage subjects and assignments 
              while students access smart study tools — all under one collaborative ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-blue-600 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-600/20"
              >
                <span>Get Started</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">Join thousands of educators and students today</p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-gray-200 shadow-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-20 h-20 text-blue-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 font-medium">Platform Preview</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create an exceptional learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Built for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for faculty, students, and administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{role.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{role.description}</p>
                <ul className="space-y-3">
                  {role.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of educators and students already using LearnSphere AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Get Started</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                LearnSphere AI
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>&copy; 2024 LearnSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 