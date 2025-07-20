// components/Dashboard/SubjectDetailsView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService } from '../../services/subjectService';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  BookOpen, 
  Copy, 
  FileText, 
  Award,
  User,
  Mail,
  Clock,
  Trash2,
  AlertTriangle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const SubjectDetailsView = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log('SubjectDetailsView mounted with subjectId:', subjectId);
    fetchSubjectDetails();
  }, [subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Fetching subject details for ID:', subjectId);
      
      // Add validation for subjectId
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }
      
      const details = await subjectService.getFacultySubjectDetails(subjectId);
      console.log('Subject details received:', details);
      setSubjectDetails(details);
    } catch (error) {
      console.error('Error fetching subject details:', error);
      
      // Enhanced error handling with debug info
      const errorMessage = error.message || 'Failed to fetch subject details';
      const isNotFoundError = errorMessage.includes('No query results') || 
                             error.status === 404 || 
                             errorMessage.includes('not found');
      
      setError(errorMessage);
      setDebugInfo({
        subjectId: subjectId,
        errorType: isNotFoundError ? 'NOT_FOUND' : 'GENERAL_ERROR',
        timestamp: new Date().toISOString(),
        fullError: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTeamCode = async (teamCode) => {
    try {
      await navigator.clipboard.writeText(teamCode);
      // Replace alert with a more user-friendly notification
      // You might want to implement a toast notification system
      console.log('Team code copied:', teamCode);
      alert('Team code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy team code:', error);
      alert('Failed to copy team code');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    try {
      setDeleteLoading(studentId);
      console.log('Removing student:', studentId, 'from subject:', subjectId);
      
      await subjectService.removeStudentFromSubject(subjectId, studentId);
      
      // Update local state to remove the student
      setSubjectDetails(prev => ({
        ...prev,
        students: prev.students.filter(student => student.id !== studentId)
      }));
      
      console.log(`Successfully removed ${studentName} from the subject`);
      alert(`Successfully removed ${studentName} from the subject`);
    } catch (error) {
      console.error('Error removing student:', error);
      alert(error.message || 'Failed to remove student');
    } finally {
      setDeleteLoading(null);
      setShowDeleteConfirm(null);
    }
  };

  const confirmDeleteStudent = (student) => {
    setShowDeleteConfirm(student);
  };

  const handleGoBack = () => {
    navigate('/faculty/dashboard');
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading subject details...</p>
          <p className="text-gray-500 text-sm mt-2">Subject ID: {subjectId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isNotFoundError = debugInfo?.errorType === 'NOT_FOUND';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-gray-400">|</div>
            <h1 className="text-xl font-semibold">Subject Details</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <div className="flex justify-center mb-4">
              {isNotFoundError ? (
                <AlertCircle className="w-16 h-16 text-orange-400" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-400" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              {isNotFoundError ? 'Subject Not Found' : 'Error Loading Subject'}
            </h2>
            
            <p className="text-gray-300 mb-6">
              {isNotFoundError 
                ? 'The requested subject could not be found. It may have been deleted or you may not have permission to access it.'
                : 'An error occurred while loading the subject details. Please try again.'
              }
            </p>
            
            {/* Debug Information */}
            {debugInfo && (
              <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-cyan-400 font-semibold mb-2">Debug Information:</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p><strong>Subject ID:</strong> {debugInfo.subjectId}</p>
                  <p><strong>Error Type:</strong> {debugInfo.errorType}</p>
                  <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                  <p><strong>Error Message:</strong> {error}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={fetchSubjectDetails}
                disabled={loading}
                className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 px-6 py-3 rounded-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
              
              <button 
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button 
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="text-gray-400">|</div>
          <h1 className="text-xl font-semibold">Subject Details</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Info Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{subjectDetails?.name || 'Subject Name'}</h2>
              <p className="text-cyan-400 font-mono text-lg">{subjectDetails?.code || 'SUBJECT_CODE'}</p>
              {subjectDetails?.description && (
                <p className="text-gray-300 mt-2">{subjectDetails.description}</p>
              )}
            </div>
            <div className="text-right">
              {subjectDetails?.team_code && (
                <button
                  onClick={() => handleCopyTeamCode(subjectDetails.team_code)}
                  className="flex items-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Team Code: {subjectDetails.team_code}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Semester</span>
              </div>
              <p className="text-white font-semibold">{subjectDetails?.semester || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Credits</span>
              </div>
              <p className="text-white font-semibold">{subjectDetails?.credits || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Students</span>
              </div>
              <p className="text-white font-semibold">{subjectDetails?.students?.length || 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-orange-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Created</span>
              </div>
              <p className="text-white font-semibold">
                {subjectDetails?.created_at ? 
                  new Date(subjectDetails.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Enrolled Students ({subjectDetails?.students?.length || 0})</span>
          </h3>
          
          {subjectDetails?.students && subjectDetails.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectDetails.students.map((student, index) => (
                <div key={student.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{student.name || 'Student Name'}</h4>
                        <p className="text-gray-400 text-sm flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{student.email || 'email@example.com'}</span>
                        </p>
                        {student.enrollment_date && (
                          <p className="text-gray-400 text-xs mt-1">
                            Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => confirmDeleteStudent(student)}
                      disabled={deleteLoading === student.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove student from subject"
                    >
                      {deleteLoading === student.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No students enrolled yet</p>
              <p className="text-sm mt-1">Share the team code with students to get them enrolled</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Quizzes</span>
            </h3>
            <p className="text-gray-400 mb-4">Create and manage quizzes for this subject</p>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-all">
              Create Quiz
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Assignments</span>
            </h3>
            <p className="text-gray-400 mb-4">Create and manage assignments for this subject</p>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg transition-all">
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Remove Student</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove <span className="font-semibold text-white">{showDeleteConfirm.name}</span> from this subject? 
              This action cannot be undone and the student will lose access to all subject materials.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm.id, showDeleteConfirm.name)}
                disabled={deleteLoading === showDeleteConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === showDeleteConfirm.id ? 'Removing...' : 'Remove Student'}
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetailsView;