import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Calendar, 
  FileText, 
  Plus,
  Bell,
  User,
  LogOut,
  BarChart3,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { authService } from '../../../../services/authService';

const StudentNavbar = ({ activeTab, setActiveTab, onJoinCourse }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentUser = authService.getCurrentUser();

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <header className="fixed w-full z-50 bg-black border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-semibold text-white">LearnSphere AI</span>
              </div>
              <span className="text-sm font-medium text-gray-400 ml-10">Student Dashboard</span>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-blue-500 hover:bg-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Navigation Icons */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Join Course Button */}
            <button 
              onClick={onJoinCourse}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Join Course</span>
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-900"
              >
                <User className="w-5 h-5" />
                <span>{currentUser?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50">
                  <button 
                    onClick={() => {
                      navigate('/student/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-2 text-gray-300 hover:text-blue-500 rounded-t-lg"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      authService.logout();
                      navigate('/');
                    }} 
                    className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-2 text-gray-300 hover:text-blue-500 rounded-b-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 rounded-lg mt-2 p-4 border border-gray-800 shadow-lg mb-4">
            {/* Mobile Navigation Tabs */}
            <div className="flex flex-col space-y-2 mb-4 pb-4 border-b border-gray-800">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-blue-500 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Options */}
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => {
                  onJoinCourse();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Join Course</span>
              </button>
              <button 
                onClick={() => {
                  navigate('/student/profile');
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => {
                  authService.logout();
                  navigate('/');
                }} 
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentNavbar;