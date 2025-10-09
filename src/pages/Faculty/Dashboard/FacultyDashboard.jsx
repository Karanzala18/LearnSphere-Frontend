import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import facultyDashboardService from '../services/facultyDashboardService';
import { subjectService } from '../services/subjectService';
import FacultyNavbar from './components/FacultyNavbar';
import StatsCards from './components/StatsCards';
import SubjectsTab from './components/SubjectsTab';
import QuizzesTab from './components/QuizzesTab';
import AssignmentsTab from './components/AssignmentsTab';
import CalendarTab from './components/CalendarTab';
import AnalyticsTab from './components/AnalyticsTab';
import OverviewTab from './components/OverviewTab';
import CreateModal from './components/CreateModal';
import Notification from './common/Notification';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState('');
  const [notification, setNotification] = useState(null);

  // Memoized analytics calculation
  const analytics = useMemo(() => {
    const totalStudents = subjects.reduce((sum, subject) => sum + (subject.student_count || 0), 0);
    const totalQuizzes = subjects.reduce((sum, subject) => sum + (subject.quiz_count || 0), 0);
    const totalAssignments = subjects.reduce((sum, subject) => sum + (subject.assignment_count || 0), 0);
    
    return {
      totalSubjects: subjects.length,
      totalStudents,
      activeQuizzes: totalQuizzes,
      pendingGrading: 0,
      avgPerformance: 0,
      totalQuizzes,
      totalAssignments
    };
  }, [subjects]);

  // Memoized notification handler
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardResult = await facultyDashboardService.getDashboardData();
      
      if (dashboardResult.success) {
        setSubjects(dashboardResult.data.subjects || []);
      } else {
        showNotification(dashboardResult.message || 'Failed to fetch dashboard data', 'error');
        setSubjects([]);
      }
      
      setQuizzes([]);
      setAssignments([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('An unexpected error occurred while fetching data', 'error');
      setSubjects([]);
      setQuizzes([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Subject handlers
  const handleCreateSubject = useCallback(async (subjectData) => {
    try {
      await subjectService.createSubject(subjectData);
      showNotification('Subject created successfully!');
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error creating subject:', error);
      showNotification('Error creating subject: ' + (error.message || 'Unknown error'), 'error');
    }
  }, [showNotification, fetchDashboardData]);

  const handleDeleteSubject = useCallback(async (subjectId) => {
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
  }, [showNotification, fetchDashboardData]);

  const handleViewSubjectDetails = useCallback((subjectId) => {
    navigate(`/faculty/subjects/${subjectId}`);
  }, [navigate]);

  const handleCopyTeamCode = useCallback(async (teamCode) => {
    try {
      await navigator.clipboard.writeText(teamCode);
      showNotification('Team code copied to clipboard!', 'success');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = teamCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('Team code copied to clipboard!', 'success');
    }
  }, [showNotification]);

  // Quiz handler
  const handleCreateQuiz = useCallback(async (quizData) => {
    try {
      const response = await fetch('/api/faculty/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });
      
      if (!response.ok) throw new Error('Failed to create quiz');
      
      showNotification('Quiz created successfully!');
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      showNotification('Error creating quiz: ' + (error.message || 'Unknown error'), 'error');
    }
  }, [showNotification, fetchDashboardData]);

  // Assignment handler
  const handleCreateAssignment = useCallback(async (assignmentData) => {
    try {
      const response = await fetch('/api/faculty/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });
      
      if (!response.ok) throw new Error('Failed to create assignment');
      
      showNotification('Assignment created successfully!');
      setShowCreateModal(false);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      showNotification('Error creating assignment: ' + (error.message || 'Unknown error'), 'error');
    }
  }, [showNotification, fetchDashboardData]);

  const openCreateModal = useCallback((type) => {
    setCreateModalType(type);
    setShowCreateModal(true);
  }, []);

  const handleRefreshDashboard = useCallback(async () => {
    await fetchDashboardData();
    showNotification('Dashboard refreshed successfully!');
  }, [fetchDashboardData, showNotification]);

  // Memoized create handler
  const createHandler = useMemo(() => ({
    subject: handleCreateSubject,
    quiz: handleCreateQuiz,
    assignment: handleCreateAssignment
  }[createModalType]), [createModalType, handleCreateSubject, handleCreateQuiz, handleCreateAssignment]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <Notification notification={notification} />

      <FacultyNavbar 
        onRefresh={handleRefreshDashboard} 
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-8">
        <StatsCards analytics={analytics} />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <OverviewTab openCreateModal={openCreateModal} />
        )}

        {!loading && activeTab === 'subjects' && (
          <SubjectsTab
            subjects={subjects}
            onCreateSubject={() => openCreateModal('subject')}
            onDeleteSubject={handleDeleteSubject}
            onViewDetails={handleViewSubjectDetails}
            onCopyTeamCode={handleCopyTeamCode}
          />
        )}

        {!loading && activeTab === 'quizzes' && (
          <QuizzesTab
            quizzes={quizzes}
            onCreateQuiz={() => openCreateModal('quiz')}
          />
        )}

        {!loading && activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            onCreateAssignment={() => openCreateModal('assignment')}
          />
        )}

        {!loading && activeTab === 'calendar' && <CalendarTab />}

        {!loading && activeTab === 'analytics' && (
          <AnalyticsTab subjects={subjects} analytics={analytics} />
        )}
      </div>

      {showCreateModal && (
        <CreateModal
          type={createModalType}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createHandler}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
