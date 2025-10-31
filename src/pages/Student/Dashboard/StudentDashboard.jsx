import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { 
  Brain, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Plus, 
  Award,
  TrendingUp,
  Zap,
  AlertCircle,
  RefreshCw,
  Trash2,
  History,
  X,
  TrendingDown,
} from 'lucide-react';
import { subjectService } from '../../Student/services/subjectService';
import pdfService from '../services/pdfService';
import StudentNavbar from './components/StudentNavbar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  // 🆕 Delete & Quiz History States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);
  const [showQuizHistoryModal, setShowQuizHistoryModal] = useState(false);
  const [quizHistoryData, setQuizHistoryData] = useState(null);
  const [loadingQuizHistory, setLoadingQuizHistory] = useState(false);

  const currentUser = useMemo(() => authService.getCurrentUser(), []);

  const fetchEnrolledSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getEnrolledSubjects();
      setEnrolledSubjects(response.data || response.subjects || []);
    } catch (error) {
      console.error('Error fetching enrolled subjects:', error);
      setEnrollmentError('Failed to load enrolled subjects');
    }
  }, []);

  const fetchUploadedNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pdfService.getPdfs();
      
      let notes = [];
      
      if (response.status === true || response.status === 'true') {
        notes = response.data?.data || response.data || [];
      } else if (response.data) {
        notes = Array.isArray(response.data) ? response.data : 
                response.data.data || [];
      }
      
      setUploadedNotes(Array.isArray(notes) ? notes : []);
    } catch (error) {
      console.error('Error fetching uploaded notes:', error);
      setUploadedNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([fetchEnrolledSubjects(), fetchUploadedNotes()]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchEnrolledSubjects, fetchUploadedNotes]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleJoinCourse = useCallback(async () => {
    if (!joinCode.trim()) {
      setEnrollmentError('Please enter a course code');
      return;
    }

    try {
      setEnrollmentLoading(true);
      setEnrollmentError('');
      
      const response = await subjectService.enrollInSubject(joinCode);
      
      alert(`Successfully enrolled in ${response.data?.subject?.name || response.subject?.name || 'the course'}!`);
      
      await fetchEnrolledSubjects();
      
      setShowJoinModal(false);
      setJoinCode('');
      
    } catch (error) {
      console.error('Error joining course:', error);
      setEnrollmentError(error.message || error.error || 'Failed to join course');
    } finally {
      setEnrollmentLoading(false);
    }
  }, [joinCode, fetchEnrolledSubjects]);

  const handleCloseModal = useCallback(() => {
    setShowJoinModal(false);
    setJoinCode('');
    setEnrollmentError('');
  }, []);

  const handleOpenModal = useCallback(() => {
    setShowJoinModal(true);
  }, []);

  const handleUploadNotes = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const validation = pdfService.validatePdfFile(file, 10);
    if (!validation.isValid) {
      alert(validation.error);
      event.target.value = '';
      return;
    }

    try {
      setUploadingPdf(true);
      
      const response = await pdfService.uploadPdf(file);
      
      if (response.status) {
        const uploadedPdf = response.data;
        alert(`Notes uploaded successfully! Processing status: ${uploadedPdf.processing_status}`);
        
        if (uploadedPdf.processing_status === 'pending' || uploadedPdf.processing_status === 'processing') {
          pollPdfProcessing(uploadedPdf.id);
        }
        
        await fetchUploadedNotes();
      } else {
        alert('Failed to upload notes: ' + response.message);
      }
      
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join('\n');
        alert(`Validation Error:\n${errors}`);
      } else {
        alert(`Failed to upload notes: ${error.response?.data?.message || error.message}`);
      }
      
      event.target.value = '';
    } finally {
      setUploadingPdf(false);
    }
  };

  const pollPdfProcessing = async (pdfId) => {
    try {
      await pdfService.waitForPdfProcessing(
        pdfId,
        30,
        3000,
        (progress) => {
          console.log(`Processing PDF ${pdfId}: ${progress.attempt}/${progress.maxAttempts} - Status: ${progress.status}`);
        }
      );
      
      await fetchUploadedNotes();
      
    } catch (error) {
      console.error(`PDF ${pdfId} processing failed:`, error.message);
    }
  };

  // 🆕 Delete Note Functions
  const handleOpenDeleteModal = useCallback((note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  }, []);

  const handleDeleteNote = useCallback(async () => {
    if (!noteToDelete) return;

    try {
      setDeletingNote(true);
      await pdfService.deletePdf(noteToDelete.id);
      
      alert('Note deleted successfully!');
      setShowDeleteModal(false);
      setNoteToDelete(null);
      
      await fetchUploadedNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(`Failed to delete note: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeletingNote(false);
    }
  }, [noteToDelete, fetchUploadedNotes]);

  // 🆕 Quiz History Functions
  const handleOpenQuizHistory = useCallback(async (note) => {
    setShowQuizHistoryModal(true);
    setLoadingQuizHistory(true);
    setQuizHistoryData(null);

    try {
      const response = await pdfService.getPdfQuizAttempts(note.id);
      setQuizHistoryData(response.data);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      alert(`Failed to load quiz history: ${error.response?.data?.message || error.message}`);
      setShowQuizHistoryModal(false);
    } finally {
      setLoadingQuizHistory(false);
    }
  }, []);

  const handleCloseQuizHistory = useCallback(() => {
    setShowQuizHistoryModal(false);
    setQuizHistoryData(null);
  }, []);

  const handleViewNotes = (pdfId) => {
    navigate(`/student/notes/${pdfId}`);
  };

  const handleGenerateFlashcards = (pdfId) => {
    navigate(`/student/notes/${pdfId}/flashcards`);
  };

  const handleAIQuiz = async (note) => {
    const quizzes = note.generated_quizzes || note.generatedQuizzes || [];
    
    if (!quizzes || quizzes.length === 0) {
      try {
        const response = await pdfService.getPdfById(note.id);
        
        const fullNote = response.data;
        const fullQuizzes = fullNote.generated_quizzes || fullNote.generatedQuizzes || [];
        
        if (!fullQuizzes || fullQuizzes.length === 0) {
          alert('No quiz available for this PDF yet. Please wait for AI processing to complete or try refreshing the page.');
          return;
        }
        
        const quizId = fullQuizzes[0].id;
        navigate(`/student/pdf-quizzes/${quizId}/start`);
        return;
        
      } catch (error) {
        console.error('Error fetching PDF details:', error);
        alert('Failed to load quiz. Please try again or refresh the page.');
        return;
      }
    }

    const quizId = quizzes[0].id;
    navigate(`/student/pdf-quizzes/${quizId}/start`);
  };

  const stats = useMemo(() => ({
    totalCourses: enrolledSubjects.length,
    completedQuizzes: 0,
    averageScore: '--',
    totalNotes: uploadedNotes.length
  }), [enrolledSubjects.length, uploadedNotes.length]);

  const displayedCourses = useMemo(() => 
    enrolledSubjects.slice(0, 4), 
    [enrolledSubjects]
  );

  const StatCard = useMemo(() => 
    ({ icon: Icon, title, value, change, color }) => (
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <p className={`text-sm mt-1 font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    ), []
  );

  const CourseCard = useCallback(({ course }) => {
    const handleViewDetails = () => {
      navigate(`/student/subjects/${course.id || course.subject_id}`);
    };

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{course.name || course.subject_name || 'Course Name'}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {course.code || course.subject_code || 'N/A'} • {course.faculty?.name || course.faculty_name || course.instructor || 'Unknown Faculty'}
            </p>
          </div>
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 text-sm flex items-center">
            <Calendar className="w-4 h-4 inline mr-2" />
            {course.semester || course.term || 'Current Semester'}
          </p>
          
          {course.department && (
            <p className="text-gray-600 text-sm">
              Dept: {course.department}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }, [navigate]);

  const getProcessingStatusBadge = (status) => {
    const badge = pdfService.getStatusBadge(status);
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[badge.color]}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const NotesCard = useCallback(({ note }) => {
    const isProcessingComplete = note.processing_status === 'completed';
    const fileSize = pdfService.formatFileSize(note.file_size_kb);

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {note.original_filename || 'Untitled Note'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {fileSize} • {new Date(note.created_at || note.upload_date).toLocaleDateString()}
            </p>
            <div className="mt-2">
              {getProcessingStatusBadge(note.processing_status)}
            </div>
          </div>
          <button
            onClick={() => handleOpenDeleteModal(note)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
            title="Delete note"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {note.processing_status === 'failed' && note.error_message && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{note.error_message}</p>
          </div>
        )}

        <div className="flex flex-col space-y-2 mt-4">
          <button
            onClick={() => handleViewNotes(note.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            View Summary
          </button>
          
          <button
            onClick={() => handleGenerateFlashcards(note.id)}
            disabled={!isProcessingComplete}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isProcessingComplete
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            View Flashcards ({note.flashcards?.length || 0})
          </button>

          <button
            onClick={() => handleAIQuiz(note)}
            disabled={!isProcessingComplete}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isProcessingComplete
                ? 'bg-pink-600 hover:bg-pink-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Take AI Quiz
          </button>

          <button
            onClick={() => handleOpenQuizHistory(note)}
            disabled={!isProcessingComplete}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              isProcessingComplete
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            Quiz Result
          </button>
        </div>
      </div>
    );
  }, [handleOpenDeleteModal, handleOpenQuizHistory]);

  const EmptyCoursesState = useMemo(() => (
    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Enrolled</h3>
      <p className="text-gray-600 mb-6">Join your first course to get started!</p>
      <button
        onClick={handleOpenModal}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
      >
        Join Course
      </button>
    </div>
  ), [handleOpenModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <StudentNavbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onJoinCourse={handleOpenModal}
        tabs={['overview', 'courses', 'notes']}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome back, {currentUser?.name || 'User'}!</h1>
              <p className="text-lg text-gray-600">Here's what's happening with your courses today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Courses"
                value={stats.totalCourses}
                color="from-blue-500 to-blue-600"
              />
              
              <StatCard
                icon={FileText}
                title="Total Notes"
                value={stats.totalNotes}
                color="from-orange-500 to-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Courses</h2>
                  {enrolledSubjects.length === 0 ? (
                    EmptyCoursesState
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayedCourses.map((course) => (
                        <CourseCard key={course.id || course.subject_id} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
              <button
                onClick={handleOpenModal}
                className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Join Course</span>
              </button>
            </div>

            {enrolledSubjects.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-6">Join your first course to get started!</p>
                <button
                  onClick={handleOpenModal}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
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

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                My Notes 
                <span className="text-lg text-gray-500 ml-2">({uploadedNotes.length})</span>
              </h2>
              <div className="flex space-x-3">
                <label className={`flex items-center space-x-2 px-5 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm cursor-pointer ${
                  uploadingPdf
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                  <Upload className="w-4 h-4" />
                  <span>{uploadingPdf ? 'Uploading...' : 'Upload Notes'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUploadNotes}
                    className="hidden"
                    disabled={uploadingPdf}
                  />
                </label>
                <button
                  onClick={fetchUploadedNotes}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading notes...</p>
              </div>
            ) : uploadedNotes.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notes Uploaded</h3>
                <p className="text-gray-600 mb-6">Upload your first note to get started with AI-powered learning!</p>
                <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUploadNotes}
                    className="hidden"
                  />
                  Upload Notes
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedNotes.map((note) => (
                  <NotesCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </div>
        )}

        {!['overview', 'courses', 'notes'].includes(activeTab) && (
          <div className="text-center py-20">
            <div className="mb-4">
              <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">The {activeTab} section is under development.</p>
            </div>
          </div>
        )}
      </main>

      {/* Join Course Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Join Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter course code (e.g., ABC123XY)"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {enrollmentError && (
                  <p className="text-red-600 text-sm mt-2">{enrollmentError}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  disabled={enrollmentLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCourse}
                  disabled={enrollmentLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {enrollmentLoading ? 'Joining...' : 'Join Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Delete Confirmation Modal */}
      {showDeleteModal && noteToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Delete Note</h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 text-center mb-2">
                Are you sure you want to delete this note?
              </p>
              <p className="text-sm text-gray-500 text-center font-medium">
                "{noteToDelete.original_filename}"
              </p>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ This will permanently delete the note, summary, flashcards, quizzes, and all attempt history.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCloseDeleteModal}
                disabled={deletingNote}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                disabled={deletingNote}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deletingNote ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Quiz History Modal */}
      {showQuizHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Quiz History</h3>
              </div>
              <button
                onClick={handleCloseQuizHistory}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingQuizHistory ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading quiz history...</p>
              </div>
            ) : quizHistoryData ? (
              <div className="space-y-6">
                {/* PDF Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Document</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {quizHistoryData.pdf.filename}
                  </p>
                </div>

                {/* Statistics Summary */}
                {quizHistoryData.attempts && quizHistoryData.attempts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Total Attempts</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {quizHistoryData.total_attempts}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Best Score</p>
                        <p className="text-2xl font-bold text-green-900">
                          {quizHistoryData.best_score?.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Average Score</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {quizHistoryData.average_score?.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">Improvement</p>
                        <p className={`text-2xl font-bold ${
                          (quizHistoryData.attempts[quizHistoryData.attempts.length - 1]?.percentage - 
                           quizHistoryData.attempts[0]?.percentage) >= 0 
                            ? 'text-green-900' 
                            : 'text-red-900'
                        }`}>
                          {quizHistoryData.attempts.length > 1 
                            ? `${(quizHistoryData.attempts[quizHistoryData.attempts.length - 1]?.percentage - 
                                 quizHistoryData.attempts[0]?.percentage).toFixed(1)}%`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Attempts List */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Attempt History ({quizHistoryData.attempts.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {quizHistoryData.attempts.map((attempt, index) => (
                          <div
                            key={attempt.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                  #{quizHistoryData.attempts.length - index}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {attempt.quiz_title || 'Quiz Attempt'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {pdfService.formatDate(attempt.submitted_at)}
                                  </p>
                                </div>
                              </div>
                              <div className={`text-right ${pdfService.getScoreColor(attempt.percentage)}`}>
                                <p className="text-2xl font-bold">
                                  {attempt.percentage.toFixed(1)}%
                                </p>
                                <p className="text-xs font-medium">
                                  {pdfService.getGradeLabel(attempt.percentage)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-500">Score</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {attempt.marks_obtained}/{attempt.total_marks}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Time Taken</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {pdfService.formatDuration(attempt.time_taken_minutes)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="text-sm font-semibold text-green-600">
                                  {attempt.is_completed ? 'Completed' : 'In Progress'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Quiz Attempts Yet
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Take the quiz to see your attempt history here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load quiz history</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseQuizHistory}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;