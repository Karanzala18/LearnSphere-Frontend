import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import facultyDashboardService from '../../services/facultyDashboardService';
import { subjectService } from '../../services/subjectService';
import FacultyNavbar from '../../components/Navbar/FacultyNavbar';
import { 
  Brain, 
  Plus, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock,
  FileText,
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  X
} from 'lucide-react';

// Helper function for semester text
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
      const dashboardResult = await facultyDashboardService.getDashboardData();
      
      if (dashboardResult.success) {
        const { subjects: subjectsData, total_subjects } = dashboardResult.data;
        setSubjects(subjectsData || []);
        const totalStudents = subjectsData?.reduce((sum, subject) => sum + (subject.student_count || 0), 0) || 0;
        const totalQuizzes = subjectsData?.reduce((sum, subject) => sum + (subject.quiz_count || 0), 0) || 0;
        const totalAssignments = subjectsData?.reduce((sum, subject) => sum + (subject.assignment_count || 0), 0) || 0;
        
        setAnalytics({
          totalSubjects: total_subjects || 0,
          totalStudents,
          activeQuizzes: totalQuizzes,
          pendingGrading: 0,
          avgPerformance: 0,
          totalQuizzes,
          totalAssignments
        });
      } else {
        console.error('Dashboard data fetch failed:', dashboardResult.message);
        showNotification(dashboardResult.message || 'Failed to fetch dashboard data', 'error');
        setSubjects([]);
        setAnalytics({
          totalSubjects: 0,
          totalStudents: 0,
          activeQuizzes: 0,
          pendingGrading: 0,
          avgPerformance: 0,
          totalQuizzes: 0,
          totalAssignments: 0
        });
      }
      
      setQuizzes([]);
      setAssignments([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('An unexpected error occurred while fetching data', 'error');
      setSubjects([]);
      setQuizzes([]);
      setAssignments([]);
      setAnalytics({
        totalSubjects: 0,
        totalStudents: 0,
        activeQuizzes: 0,
        pendingGrading: 0,
        avgPerformance: 0,
        totalQuizzes: 0,
        totalAssignments: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      await subjectService.createSubject(subjectData);
      showNotification('Subject created successfully!');
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error creating subject:', error);
      showNotification('Error creating subject: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await subjectService.deleteSubject(subjectId);
        showNotification('Subject deleted successfully!');
        await fetchDashboardData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        showNotification('Error deleting subject: ' + (error.message || 'Unknown error'), 'error');
      }
    }
  };

  const handleViewSubjectDetails = (subjectId) => {
    navigate(`/faculty/subjects/${subjectId}`);
  };

  const handleCopyTeamCode = async (teamCode) => {
    try {
      await navigator.clipboard.writeText(teamCode);
      showNotification('Team code copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy team code:', error);
      const textArea = document.createElement('textarea');
      textArea.value = teamCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('Team code copied to clipboard!', 'success');
    }
  };

  const handleEditSubject = async (subjectId, updatedData) => {
    try {
      await subjectService.updateSubject(subjectId, updatedData);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating subject:', error);
      showNotification('Error updating subject: ' + (error.message || 'Unknown error'), 'error');
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
      showNotification('Error creating quiz: ' + (error.message || 'Unknown error'), 'error');
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
      showNotification('Error creating assignment: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const openCreateModal = (type) => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  const handleRefreshDashboard = async () => {
    try {
      setLoading(true);
      await fetchDashboardData();
      showNotification('Dashboard refreshed successfully!');
    } catch (error) {
      showNotification('Failed to refresh dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
          notification.type === 'success' 
            ? 'bg-blue-50 text-blue-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      <FacultyNavbar 
        onRefresh={handleRefreshDashboard} 
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Subjects</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalSubjects}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600/50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600/50" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Quizzes</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalQuizzes}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600/50" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Assignments</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalAssignments}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600/50" />
            </div>
          </div>
        </div>

       

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {/* Tab Content */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h3>
              <div className="space-y-4">
                <p className="text-gray-600">No recent activity available</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => openCreateModal('subject')}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Create Subject</h4>
                </div>
                <p className="text-gray-600 text-sm">Add a new subject for the semester</p>
              </button>
              
              <button
                onClick={() => openCreateModal('quiz')}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Create Quiz</h4>
                </div>
                <p className="text-gray-600 text-sm">Design a new quiz for your students</p>
              </button>
              
              <button
                onClick={() => openCreateModal('assignment')}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Create Assignment</h4>
                </div>
                <p className="text-gray-600 text-sm">Add a new assignment with auto-grading</p>
              </button>
            </div>
          </div>
        )}

        {!loading && activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Subjects</h2>
              <button
                onClick={() => openCreateModal('subject')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">No subjects available</p>
                  <p className="text-gray-500 text-sm">Create your first subject to get started</p>
                </div>
              ) : (
                subjects.map((subject) => (
                  <div key={subject.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-blue-600 font-mono text-sm">{subject.code}</p>
                        {subject.team_code && (
                          <p className="text-blue-600 text-sm mt-1">Team Code: {subject.team_code}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {getSemesterText(subject.semester)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <Users className="w-4 h-4 inline mr-1" />
                        {subject.student_count || 0} Students
                      </p>
                      <p className="text-gray-600 text-sm">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {subject.quiz_count || 0} Quizzes • {subject.assignment_count || 0} Assignments
                      </p>
                      {subject.department && (
                        <p className="text-gray-600 text-sm">
                          Department: {subject.department}
                        </p>
                      )}
                      {subject.credits && (
                        <p className="text-gray-600 text-sm">
                          Credits: {subject.credits}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewSubjectDetails(subject.id)}
                        className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-all"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleCopyTeamCode(subject.team_code)}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-all"
                        disabled={!subject.team_code}
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
              <button
                onClick={() => openCreateModal('quiz')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quiz</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Quiz Title</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Subject</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Due Date</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Submissions</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                          No quizzes available
                        </td>
                      </tr>
                    ) : (
                      quizzes.map((quiz) => (
                        <tr key={quiz.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{quiz.title}</td>
                          <td className="px-6 py-4 text-gray-600">{quiz.subject}</td>
                          <td className="px-6 py-4 text-gray-600">{quiz.dueDate}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              quiz.status === 'active' ? 'bg-blue-100 text-blue-600' :
                              quiz.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {quiz.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{quiz.submissions}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-red-600">
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

        {!loading && activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
              <button
                onClick={() => openCreateModal('assignment')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Assignment Title</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Subject</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Due Date</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Submissions</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Graded</th>
                      <th className="px-6 py-4 text-left text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                          No assignments available
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-900">{assignment.title}</td>
                          <td className="px-6 py-4 text-gray-600">{assignment.subject}</td>
                          <td className="px-6 py-4 text-gray-600">{assignment.dueDate}</td>
                          <td className="px-6 py-4 text-gray-600">{assignment.submissions}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              assignment.graded === assignment.submissions 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {assignment.graded}/{assignment.submissions}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-red-600">
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

        {!loading && activeTab === 'calendar' && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Calendar</h2>
            <div className="text-center text-gray-600">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
              <p>Calendar component will be implemented here</p>
              <p className="text-sm mt-2 text-gray-500">
                Show upcoming quizzes, assignment deadlines, and other important dates
              </p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
                <div className="text-center text-gray-600">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
                  <p>Performance charts will be implemented here</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Analytics</h3>
                <div className="text-center text-gray-600">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-600/50" />
                  <p>Subject analytics will be implemented here</p>
                </div>
              </div>
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Subjects by Semester</h4>
                <div className="space-y-2">
                  {Object.entries(
                    subjects.reduce((semesters, subject) => {
                      const sem = subject.semester;
                      semesters[sem] = (semesters[sem] || 0) + 1;
                      return semesters;
                    }, {})
                  ).map(([semester, count]) => (
                    <div key={semester} className="flex justify-between items-center">
                      <span className="text-gray-600">{getSemesterText(parseInt(semester))}</span>
                      <span className="text-blue-600 font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Students per Subject</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {subjects.length > 0 ? Math.round(analytics.totalStudents / subjects.length) : 0}
                  </p>
                  <p className="text-gray-500 text-sm">students per subject</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Content Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quizzes</span>
                    <span className="text-blue-600 font-semibold">{analytics.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assignments</span>
                    <span className="text-blue-600 font-semibold">{analytics.totalAssignments}</span>
                  </div>
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Create {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'subject' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Subject Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Subject Code</label>
                <input
                  type="text"
                  name="code"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Credits</label>
                <input
                  type="number"
                  name="credits"
                  min="1"
                  max="6"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Semester</label>
                <select
                  name="semester"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject description"
                />
              </div>
            </>
          )}
          {type === 'quiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Quiz Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
                <select
                  name="subject_id"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Instructions</label>
                <textarea
                  name="instructions"
                  rows="3"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quiz instructions"
                />
              </div>
            </>
          )}

          {type === 'assignment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Assignment Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
                <select
                  name="subject_id"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Max Points</label>
                <input
                  type="number"
                  name="max_points"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">AI Grading Criteria</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="check_grammar"
                      onChange={(e) => setFormData({...formData, check_grammar: e.target.checked})}
                      className="rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Check Grammar</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="check_structure"
                      onChange={(e) => setFormData({...formData, check_structure: e.target.checked})}
                      className="rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Check Structure</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="check_plagiarism"
                      onChange={(e) => setFormData({...formData, check_plagiarism: e.target.checked})}
                      className="rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Check Plagiarism</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="check_content"
                      onChange={(e) => setFormData({...formData, check_content: e.target.checked})}
                      className="rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Check Content Quality</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
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