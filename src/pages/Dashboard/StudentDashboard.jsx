import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  Brain, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Plus, 
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  TrendingUp,
  Zap,
  Users,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  BarChart3,
  Star,
  Filter,
  RefreshCw
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  // Get current user
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      await fetchEnrolledSubjects();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledSubjects = async () => {
    try {
        const response = await subjectService.getEnrolledSubjects();
        console.log('Enrolled subjects response:', response); // Debug log
        setEnrolledSubjects(response.data || response.subjects || []);
      } catch (error) {
        console.error('Error fetching enrolled subjects:', error);
        setEnrollmentError('Failed to load enrolled subjects');
    }
  };

  const handleJoinCourse = async () => {
    if (!joinCode.trim()) {
      setEnrollmentError('Please enter a course code');
      return;
    }

    try {
      setEnrollmentLoading(true);
      setEnrollmentError('');
      
      const response = await subjectService.enrollInSubject(joinCode);
      
      // Show success message
      alert(`Successfully enrolled in ${response.data?.subject?.name || response.subject?.name || 'the course'}!`);
      
      // Refresh enrolled subjects
      await fetchEnrolledSubjects();
      
      // Close modal and reset form
      setShowJoinModal(false);
      setJoinCode('');
      
    } catch (error) {
        console.error('Error joining course:', error);
        setEnrollmentError(error.message || error.error || 'Failed to join course');
      } finally {
          setEnrollmentLoading(false);
        }
  };

  const getRandomColor = () => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => {
    // Debug log for individual course data
    console.log('Course data for card:', course);
    
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{course.name || course.subject_name || 'Course Name'}</h3>
            <p className="text-gray-300 text-sm">
              {course.code || course.subject_code || 'N/A'} • {course.faculty?.name || course.faculty_name || course.instructor || 'Unknown Faculty'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRandomColor()}`}></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-300 text-sm">
            <Calendar className="w-4 h-4 inline mr-1" />
            {course.semester || course.term || 'Current Semester'}
          </p>
          <p className="text-gray-300 text-sm">
            Credits: {course.credits || course.credit_hours || course.units || 'N/A'}
          </p>
          {course.department && (
            <p className="text-gray-300 text-sm">
              Dept: {course.department}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => {
              console.log('Navigate to course:', course.id || course.subject_id);
              // Navigate to course details with course ID as URL parameter
              navigate(`/student/subjects/${course.id || course.subject_id}`);
            }}
            className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all"
          >
            View Details
          </button>
          <button className="flex items-center space-x-1 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-2 rounded-lg text-sm transition-all">
            <FileText className="w-3 h-3" />
            <span>Notes</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>

      {/* Header */}
      <header className="relative z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  LearnSphere AI
                </span>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="hidden md:flex space-x-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'calendar', label: 'Calendar', icon: Calendar },
                  { id: 'notes', label: 'Notes', icon: FileText },
                  { id: 'ai-tools', label: 'AI Tools', icon: Brain }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Join Course</span>
              </button>
              
              <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="hidden md:block">{currentUser?.name || 'User'}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{currentUser?.email || 'email'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/student/profile');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={authService.logout}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name || 'User'}!</h1>
              <p className="text-gray-300">Here's what's happening with your courses today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Courses"
                value={enrolledSubjects.length}
                color="from-purple-500 to-pink-500"
              />
              <StatCard
                icon={Award}
                title="Completed Quizzes"
                value="0"
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Average Score"
                value="--"
                color="from-green-500 to-teal-500"
              />
              <StatCard
                icon={FileText}
                title="Total Notes"
                value="0"
                color="from-yellow-500 to-orange-500"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Courses */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                  {enrolledSubjects.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Courses Enrolled</h3>
                      <p className="text-gray-400 mb-4">Join your first course to get started!</p>
                      <button
                        onClick={() => setShowJoinModal(true)}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                      >
                        Join Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enrolledSubjects.slice(0, 4).map((course) => (
                        <CourseCard key={course.id || course.subject_id} course={course} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity yet</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Upcoming Events */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No upcoming events</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center space-x-3">
                      <Upload className="w-5 h-5 text-cyan-400" />
                      <span>Upload Notes</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span>Generate Flashcards</span>
                    </button>
                    <button className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-pink-400" />
                      <span>AI Quiz</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Join Course</span>
              </button>
            </div>

            {enrolledSubjects.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
                <p className="text-gray-400 mb-6">Join your first course to get started!</p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Join Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledSubjects.map((subject) => (
                  <CourseCard key={subject.id || subject.subject_id} course={subject} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs - Coming Soon */}
        {!['overview', 'courses'].includes(activeTab) && (
          <div className="text-center py-20">
            <div className="mb-4">
              <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-300">The {activeTab} section is under development.</p>
            </div>
          </div>
        )}
      </main>

      {/* Join Course Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6 text-center">Join Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter course code (e.g., ABC123XY)"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                {enrollmentError && (
                  <p className="text-red-400 text-sm mt-2">{enrollmentError}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setEnrollmentError('');
                  }}
                  className="flex-1 px-4 py-3 border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={enrollmentLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCourse}
                  disabled={enrollmentLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50"
                >
                  {enrollmentLoading ? 'Joining...' : 'Join Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;