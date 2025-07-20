  import React, { useState, useEffect } from 'react';
  import { authService } from '../../services/authService';
  import FacultyProfile from '../Profile/FacultyProfile';
  // Add this import after the authService import
  import { subjectService } from '../../services/subjectService';
  import { 
    Brain, 
    Plus, 
    BookOpen, 
    Users, 
    Calendar, 
    BarChart3, 
    Settings, 
    Search,
    Filter,
    Clock,
    FileText,
    Award,
    TrendingUp,
    Eye,
    Edit,
    Trash2,
    Copy,
    Download,
    Bell,
    ChevronDown,
    ChevronRight,
    User,
    LogOut,
    Menu,
    X
  } from 'lucide-react';

  // Add this helper function at the top of your component, after the imports:
  const getSemesterText = (semester) => {
    const semesterMap = {
      1: '1st Semester',
      2: '2nd Semester', 
      3: '3rd Semester',
      4: '4th Semester',
      5: '5th Semester',
      6: '6th Semester',
      7: '7th Semester',
      8: '8th Semester'
    };
    return semesterMap[semester] || `Semester ${semester}`;
  };


  const FacultyDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalType, setCreateModalType] = useState('');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
      fetchDashboardData();
    }, []);

    const showNotification = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    };

    const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects using the subject service
      const subjectsData = await subjectService.getFacultySubjects();
      setSubjects(subjectsData.subjects || []);
      
      // For now, mock quizzes and assignments data
      // You can later replace these with actual API calls
      setQuizzes([]);
      setAssignments([]);
      
      // Calculate analytics based on subjects
      const totalStudents = subjectsData.subjects?.reduce((sum, subject) => sum + (subject.students || 0), 0) || 0;
      
      setAnalytics({
        totalStudents,
        activeQuizzes: 0,
        pendingGrading: 0,
        avgPerformance: 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setSubjects([]);
      setQuizzes([]);
      setAssignments([]);
      setAnalytics({
        totalStudents: 0,
        activeQuizzes: 0,
        pendingGrading: 0,
        avgPerformance: 0
      });
    } finally {
      setLoading(false);
    }
  };

    const handleCreateSubject = async (subjectData) => {
    try {
      const response = await subjectService.createSubject(subjectData);
      
      showNotification('Subject created successfully!');
      
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error creating subject:', error);
      // You can add error handling UI here
      alert('Error creating subject: ' + (error.message || 'Unknown error'));
    }
  };

  // Add this function after handleCreateAssignment
  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await subjectService.deleteSubject(subjectId);
        showNotification('Subject deleted successfully!');
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // ADD these new functions:
const handleViewSubjectDetails = async (subjectId) => {
  try {
    const details = await subjectService.getFacultySubjectDetails(subjectId);
    // Handle showing details (you can create a modal or navigate to details page)
    console.log('Subject details:', details);
  } catch (error) {
    console.error('Error fetching subject details:', error);
    alert('Error fetching subject details: ' + (error.message || 'Unknown error'));
  }
};

  const handleEditSubject = async (subjectId, updatedData) => {
    try {
      // You'll need to add updateSubject method to subjectService
      await subjectService.updateSubject(subjectId, updatedData);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Error updating subject: ' + (error.message || 'Unknown error'));
    }
  };

    const handleCreateQuiz = async (quizData) => {
      try {
        const response = await fetch('/api/faculty/quizzes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(quizData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create quiz');
        }
        
        setShowCreateModal(false);
        await fetchDashboardData();
      } catch (error) {
        console.error('Error creating quiz:', error);
      }
    };

    const handleCreateAssignment = async (assignmentData) => {
      try {
        const response = await fetch('/api/faculty/assignments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignmentData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create assignment');
        }
        
        setShowCreateModal(false);
        await fetchDashboardData();
      } catch (error) {
        console.error('Error creating assignment:', error);
      }
    };

    const openCreateModal = (type) => {
      setCreateModalType(type);
      setShowCreateModal(true);
    };

    

    if (showProfile) {
      return <FacultyProfile onBack={() => setShowProfile(false)} />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 z-40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Brain className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  LearnSphere AI
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-lg font-medium">Faculty Dashboard</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Bell className="w-6 h-6 text-gray-300 hover:text-cyan-400 cursor-pointer" />
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 hover:bg-white/20 transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>{authService.getCurrentUser()?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 z-50">
                      <button 
                        onClick={() => setShowProfile(true)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <a href="/settings" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-white/20">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </a>
                      <button onClick={authService.logout} className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:bg-white/20">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Active Quizzes</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.activeQuizzes}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400/60" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Pending Grading</p>
                  <p className="text-3xl font-bold text-orange-400">{analytics.pendingGrading}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-400/60" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'quizzes', label: 'Quizzes', icon: FileText },
              { id: 'assignments', label: 'Assignments', icon: Award },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Recent Activity</h3>
                <div className="space-y-4">
                  {/* Dynamic recent activity would be fetched from API */}
                  <p className="text-gray-300">No recent activity available</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => openCreateModal('subject')}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Plus className="w-6 h-6 text-cyan-400" />
                    <h4 className="text-lg font-semibold">Create Subject</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Add a new subject for the semester</p>
                </button>
                
                <button
                  onClick={() => openCreateModal('quiz')}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Plus className="w-6 h-6 text-purple-400" />
                    <h4 className="text-lg font-semibold">Create Quiz</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Design a new quiz for your students</p>
                </button>
                
                <button
                  onClick={() => openCreateModal('assignment')}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Plus className="w-6 h-6 text-orange-400" />
                    <h4 className="text-lg font-semibold">Create Assignment</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Add a new assignment with auto-grading</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-cyan-400">My Subjects</h2>
                <button
                  onClick={() => openCreateModal('subject')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subject</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                  <p className="text-gray-300">No subjects available</p>
                ) : (
                  // Replace the subject card mapping in the subjects tab with this:
  subjects.map((subject) => (
    <div key={subject.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
          <p className="text-cyan-400 font-mono">{subject.code}</p>
          {subject.team_code && (
            <p className="text-purple-400 text-sm mt-1">Team Code: {subject.team_code}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-cyan-400">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteSubject(subject.id)}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 text-sm">
          <Users className="w-4 h-4 inline mr-1" />
          {subject.students_count || 0} students
        </p>
  <p className="text-gray-300 text-sm">
    <Calendar className="w-4 h-4 inline mr-1" />
    {getSemesterText(subject.semester)}
  </p>
        {subject.department && (
          <p className="text-gray-300 text-sm">
            Department: {subject.department}
          </p>
        )}
        {subject.credits && (
          <p className="text-gray-300 text-sm">
            Credits: {subject.credits}
          </p>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => handleViewSubjectDetails(subject.id)}
          className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm transition-all"
        >
          View Details
        </button>
        <button 
          onClick={() => navigator.clipboard.writeText(subject.team_code)}
          className="flex items-center space-x-1 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-2 rounded-lg text-sm transition-all"
        >
          <Copy className="w-3 h-3" />
          <span>Code</span>
        </button>
      </div>
    </div>
  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-cyan-400">Quizzes</h2>
                <button
                  onClick={() => openCreateModal('quiz')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Quiz Title</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Subject</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Due Date</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Submissions</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-300">
                            No quizzes available
                          </td>
                        </tr>
                      ) : (
                        quizzes.map((quiz) => (
                          <tr key={quiz.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-6 py-4 text-white">{quiz.title}</td>
                            <td className="px-6 py-4 text-gray-300">{quiz.subject}</td>
                            <td className="px-6 py-4 text-gray-300">{quiz.dueDate}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                quiz.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                quiz.status === 'draft' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {quiz.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{quiz.submissions}</td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button className="text-cyan-400 hover:text-cyan-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEditSubject(subject.id)}
                                  className="text-gray-400 hover:text-cyan-400"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-cyan-400">Assignments</h2>
                <button
                  onClick={() => openCreateModal('assignment')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Assignment Title</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Subject</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Due Date</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Submissions</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Graded</th>
                        <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-300">
                            No assignments available
                          </td>
                        </tr>
                      ) : (
                        assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-6 py-4 text-white">{assignment.title}</td>
                            <td className="px-6 py-4 text-gray-300">{assignment.subject}</td>
                            <td className="px-6 py-4 text-gray-300">{assignment.dueDate}</td>
                            <td className="px-6 py-4 text-gray-300">{assignment.submissions}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                assignment.graded === assignment.submissions 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {assignment.graded}/{assignment.submissions}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button className="text-cyan-400 hover:text-cyan-300">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-white">
                                  <Download className="w-4 h-4" />
                                </button>
                                <button className="text-gray-400 hover:text-red-400">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">Academic Calendar</h2>
              <div className="text-center text-gray-300">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                <p>Calendar component will be implemented here</p>
                <p className="text-sm mt-2">
                  Show upcoming quizzes, assignment deadlines, and other important dates
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cyan-400">Performance Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Student Performance</h3>
                  <div className="text-center text-gray-300">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                    <p>Performance charts will be implemented here</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Subject Analytics</h3>
                  <div className="text-center text-gray-300">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
                    <p>Subject analytics will be implemented here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateModal
            type={createModalType}
            onClose={() => setShowCreateModal(false)}
            onSubmit={
              createModalType === 'subject' ? handleCreateSubject :
              createModalType === 'quiz' ? handleCreateQuiz :
              handleCreateAssignment
            }
            subjects={subjects}
          />
        )}
      </div>
    );
  };

  // Create Modal Component
  const CreateModal = ({ type, onClose, onSubmit, subjects }) => {
    const [formData, setFormData] = useState({});

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">
              Create {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
  {type === 'subject' && (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subject Name</label>
        <input
          type="text"
          name="name"
          required
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter subject name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subject Code</label>
        <input
          type="text"
          name="code"
          required
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="e.g., CS301"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
        <input
          type="text"
          name="department"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="e.g., Computer Science"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Credits</label>
        <input
          type="number"
          name="credits"
          min="1"
          max="6"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="3"
        />
      </div>
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
    <select
      name="semester"
      required
      onChange={handleChange}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <option value="">Select semester</option>
      <option value="1">1st Semester</option>
      <option value="2">2nd Semester</option>
      <option value="3">3rd Semester</option>
      <option value="4">4th Semester</option>
      <option value="5">5th Semester</option>
      <option value="6">6th Semester</option>
      <option value="7">7th Semester</option>
      <option value="8">8th Semester</option>
    </select>
  </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          rows="3"
          onChange={handleChange}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter subject description"
        />
      </div>
    </>
  )}
            {type === 'quiz' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <select
                    name="subject_id"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
                  <textarea
                    name="instructions"
                    rows="3"
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter quiz instructions"
                  />
                </div>
              </>
            )}

            {type === 'assignment' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <select
                    name="subject_id"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Points</label>
                  <input
                    type="number"
                    name="max_points"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    required
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter assignment description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">AI Grading Criteria</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="check_grammar"
                        onChange={(e) => setFormData({...formData, check_grammar: e.target.checked})}
                        className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-300">Check Grammar</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="check_structure"
                        onChange={(e) => setFormData({...formData, check_structure: e.target.checked})}
                        className="rounde
  d border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-300">Check Structure</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="check_plagiarism"
                        onChange={(e) => setFormData({...formData, check_plagiarism: e.target.checked})}
                        className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-300">Check Plagiarism</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="check_content"
                        onChange={(e) => setFormData({...formData, check_content: e.target.checked})}
                        className="rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-300">Check Content Quality</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Create {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default FacultyDashboard;