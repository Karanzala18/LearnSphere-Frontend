import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Calendar, 
  FileText, 
  Plus,
  Bell,
  User,
  Settings,
  LogOut,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { authService } from '../../services/authService';

const StudentNavbar = ({ activeTab, setActiveTab, onJoinCourse }) => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'ai-tools', label: 'AI Tools', icon: Brain }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleJoinCourseClick = () => {
    onJoinCourse();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrollY > 50 ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                LearnSphere AI
              </span>
            </div>
            
            {/* Navigation Tabs - Desktop */}
            <nav className="hidden lg:flex space-x-1">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Section - Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Join Course Button - Desktop */}
            <button
              onClick={handleJoinCourseClick}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Join Course</span>
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{currentUser?.name || 'User'}</span>
              </button>

              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                  ></div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email || 'email'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/student/profile');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/student/settings');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        authService.logout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-lg border border-gray-200 shadow-lg mb-4 p-4">
            <div className="flex flex-col space-y-2">
              {/* Navigation Tabs */}
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
              
              {/* Join Course Button */}
              <button
                onClick={handleJoinCourseClick}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Join Course</span>
              </button>

              {/* Profile Section - Mobile */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email || 'email'}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/student/profile');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700 text-sm rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/student/settings');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700 text-sm rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    authService.logout();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600 text-sm rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentNavbar;