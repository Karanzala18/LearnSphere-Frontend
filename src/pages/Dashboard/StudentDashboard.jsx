import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import StudentProfile from '../Profile/studentProfile';
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

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
  const mockData = {
    user: {
      name: "Alex Johnson",
      email: "alex.johnson@university.edu",
      avatar: "/api/placeholder/40/40",
      studentId: "CS21B001"
    },
    stats: {
      totalCourses: 6,
      completedQuizzes: 24,
      averageScore: 87.5,
      totalNotes: 156
    },
    courses: [
      {
        id: 1,
        name: "Data Structures & Algorithms",
        code: "CS301",
        instructor: "Dr. Sarah Wilson",
        color: "from-purple-500 to-pink-500",
        progress: 75,
        nextQuiz: "2024-01-15",
        unreadNotes: 3
      },
      {
        id: 2,
        name: "Machine Learning",
        code: "CS401",
        instructor: "Prof. Michael Chen",
        color: "from-blue-500 to-cyan-500",
        progress: 60,
        nextQuiz: "2024-01-18",
        unreadNotes: 1
      },
      {
        id: 3,
        name: "Database Systems",
        code: "CS302",
        instructor: "Dr. Emily Rodriguez",
        color: "from-green-500 to-teal-500",
        progress: 90,
        nextQuiz: null,
        unreadNotes: 0
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: "DSA Quiz #3",
        course: "CS301",
        type: "quiz",
        date: "2024-01-15",
        time: "10:00 AM",
        duration: "60 min"
      },
      {
        id: 2,
        title: "ML Assignment Due",
        course: "CS401",
        type: "assignment",
        date: "2024-01-16",
        time: "11:59 PM",
        duration: null
      }
    ],
    recentActivity: [
      {
        id: 1,
        type: "quiz_completed",
        title: "Completed Quiz: Linear Algebra",
        score: 92,
        date: "2 hours ago",
        course: "CS301"
      },
      {
        id: 2,
        type: "note_added",
        title: "Added notes: Neural Networks",
        date: "1 day ago",
        course: "CS401"
      }
    ]
  };

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // API calls to fetch dashboard data
        // const userResponse = await fetch('/api/student/profile');
        // const coursesResponse = await fetch('/api/student/courses');
        // const eventsResponse = await fetch('/api/student/upcoming-events');
        // const activityResponse = await fetch('/api/student/recent-activity');
        // const statsResponse = await fetch('/api/student/stats');
        
        // For now, using mock data
        setCourses(mockData.courses);
        setUpcomingEvents(mockData.upcomingEvents);
        setRecentActivity(mockData.recentActivity);
        setUserStats(mockData.stats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleJoinCourse = async () => {
    // TODO: API call to join course
    try {
      // const response = await fetch('/api/student/join-course', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ joinCode })
      // });
      
      console.log('Joining course with code:', joinCode);
      setShowJoinModal(false);
      setJoinCode('');
      // Refresh courses list
    } catch (error) {
      console.error('Error joining course:', error);
    }
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

  const CourseCard = ({ course }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{course.name}</h3>
          <p className="text-gray-300 text-sm">{course.code} • {course.instructor}</p>
        </div>
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${course.color}`}></div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Progress</span>
          <span className="text-white">{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${course.color}`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          {course.nextQuiz && (
            <span className="text-yellow-400 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Next Quiz: {course.nextQuiz}
            </span>
          )}
          {course.unreadNotes > 0 && (
            <span className="text-blue-400 flex items-center">
              <Bell className="w-4 h-4 mr-1" />
              {course.unreadNotes} new notes
            </span>
          )}
        </div>
        <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const EventCard = ({ event }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-white font-medium">{event.title}</h4>
          <p className="text-gray-300 text-sm">{event.course}</p>
          <div className="flex items-center mt-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            {event.date} • {event.time}
            {event.duration && <span className="ml-2">({event.duration})</span>}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${
          event.type === 'quiz' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {event.type === 'quiz' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );

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

  if (showProfile) {
    return <StudentProfile onBack={() => setShowProfile(false)} />;
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
            <img
              src={mockData.user.avatar}
              alt={authService.getCurrentUser()?.name || 'User Avatar'}
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:block">{authService.getCurrentUser()?.name || 'User'}</span>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 py-2 z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-sm font-medium">{authService.getCurrentUser()?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{authService.getCurrentUser()?.email || 'email'}</p>
              </div>
              <button 
                onClick={() => setShowProfile(true)}
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
              <h1 className="text-3xl font-bold mb-2">Welcome back, {authService.getCurrentUser()?.name || 'User'}!</h1>
              <p className="text-gray-300">Here's what's happening with your courses today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Courses"
                value={mockData.stats.totalCourses}
                change={2}
                color="from-purple-500 to-pink-500"
              />
              <StatCard
                icon={Award}
                title="Completed Quizzes"
                value={mockData.stats.completedQuizzes}
                change={12}
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Average Score"
                value={`${mockData.stats.averageScore}%`}
                change={5}
                color="from-green-500 to-teal-500"
              />
              <StatCard
                icon={FileText}
                title="Total Notes"
                value={mockData.stats.totalNotes}
                change={8}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{activity.title}</p>
                            <p className="text-gray-300 text-sm">{activity.course}</p>
                          </div>
                          <div className="text-right">
                            {activity.score && (
                              <p className="text-green-400 font-semibold">{activity.score}%</p>
                            )}
                            <p className="text-gray-400 text-xs">{activity.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Upcoming Events */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
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

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
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
                  placeholder="Enter course code"
                  className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-3 border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCourse}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
                >
                  Join Course
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