import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Calendar, BookOpen, Award, Zap, ChevronRight, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // TODO: Replace with actual navigation to login/signup pages
  const handleLogin = () => {
    navigate('/login');
    // window.location.href = '/login';
  };

  const handleSignup = () => {
    navigate('/signup');
    // window.location.href = '/signup';
  };

  const handleGetStarted = () => {
    navigate('/signup');
    // window.location.href = '/signup';
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Smart note summaries, flashcard generation, and personalized quizzes powered by advanced AI algorithms."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Platform",
      description: "Faculty and students work together seamlessly with shared resources, assignments, and real-time feedback."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Calendar",
      description: "Never miss a deadline with integrated calendar showing quizzes, assignments, and important academic events."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Auto-Grading System",
      description: "AI evaluates assignments for grammar, structure, and content quality with instant feedback generation."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track learning progress with detailed analytics and insights for both students and faculty."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Feedback",
      description: "Get immediate AI-generated feedback on assignments and quizzes to accelerate learning."
    }
  ];

  const roles = [
    {
      icon: "👩‍🏫",
      title: "Faculty",
      description: "Create subjects, manage quizzes, auto-grade assignments, and track student performance with powerful analytics."
    },
    {
      icon: "👨‍🎓",
      title: "Students",
      description: "Join courses, access AI study tools, submit assignments, and get instant feedback on your academic progress."
    },
    {
      icon: "🧑‍💼",
      title: "Admin",
      description: "Institution-wide access, comprehensive analytics, and approval workflows for complete academic management."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>

      {/* Header */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/20 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                LearnSphere AI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              <a href="#roles" className="hover:text-cyan-400 transition-colors">Roles</a>
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={handleSignup}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/20 backdrop-blur-md rounded-lg mt-2 p-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
                <a href="#roles" className="hover:text-cyan-400 transition-colors">Roles</a>
                <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              The Smart Academic
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300 leading-relaxed">
              An all-in-one AI-powered platform where faculty manage subjects and assignments 
              while students access smart study tools — all under one collaborative ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-500/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-blue-500/20 rounded-full animate-pulse delay-500"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of education with our AI-powered tools designed for modern learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're a faculty member, student, or administrator, LearnSphere AI has you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {role.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-cyan-400">{role.title}</h3>
                <p className="text-gray-300 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Academic Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students who are already using LearnSphere AI to enhance their learning journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                LearnSphere AI
              </span>
            </div>
            <div className="flex space-x-6 text-gray-300">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 LearnSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;