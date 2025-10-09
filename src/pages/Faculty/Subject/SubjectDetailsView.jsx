import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {subjectService} from '../services/subjectService';
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
  AlertCircle,
  ChevronRight,
  Brain,
  TrendingUp
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
  const [copySuccess, setCopySuccess] = useState(false);

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
      
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }
      
      const details = await subjectService.getFacultySubjectDetails(subjectId);
      console.log('Subject details received:', details);
      setSubjectDetails(details);
    } catch (error) {
      console.error('Error fetching subject details:', error);
      
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
      console.log('Team code copied:', teamCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy team code:', error);
      alert('Failed to copy team code');
    }
  };

  const handleGoBack = () => {
    navigate('/faculty/dashboard');
  };

  const handleViewQuizzes = () => {
    navigate(`/faculty/subjects/${subjectId}/quizzes`);
  };

  const handleViewAssignments = () => {
    navigate(`/faculty/subjects/${subjectId}/assignments`);
  };

  const handleViewStudents = () => {
    navigate(`/faculty/subjects/${subjectId}/students`);
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subject details...</p>
          <p className="text-gray-400 text-sm mt-2">Subject ID: {subjectId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isNotFoundError = debugInfo?.errorType === 'NOT_FOUND';
    
    return (
      <div className="min-h-screen bg-white">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
        <div className="fixed inset-0 opacity-[0.03] -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>

        {/* Back Button */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              {isNotFoundError ? (
                <AlertCircle className="w-16 h-16 text-orange-500" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isNotFoundError ? 'Subject Not Found' : 'Error Loading Subject'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isNotFoundError 
                ? 'The requested subject could not be found. It may have been deleted or you may not have permission to access it.'
                : 'An error occurred while loading the subject details. Please try again.'
              }
            </p>
            
            {debugInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-200">
                <h3 className="text-blue-600 font-semibold mb-2">Debug Information:</h3>
                <div className="text-sm text-gray-600 space-y-1">
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
              
              <button 
                onClick={handleGoBack}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Subject Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{subjectDetails?.name || 'Subject Name'}</h1>
                  <p className="text-gray-600">{subjectDetails?.code || 'SUBJECT_CODE'}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 max-w-3xl">
                {subjectDetails?.description || 'No description available'}
              </p>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              {subjectDetails?.team_code && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-100">
                  <Copy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Team Code</p>
                  <p className="font-mono font-bold text-gray-900 text-lg mb-3">{subjectDetails.team_code}</p>
                  <button
                    onClick={() => handleCopyTeamCode(subjectDetails.team_code)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    {copySuccess ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Semester"
            value={subjectDetails?.semester || 'N/A'}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Award}
            title="Credits"
            value={subjectDetails?.credits || 'N/A'}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Users}
            title="Enrolled Students"
            value={subjectDetails?.students?.length || 0}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Brain}
            title="Active Quizzes"
            value={subjectDetails?.active_quizzes || 0}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={handleViewStudents}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-4 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Students</h3>
              <p className="text-sm text-gray-600">View and manage enrolled students</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>

          <button 
            onClick={handleViewQuizzes}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-4 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Quizzes</h3>
              <p className="text-sm text-gray-600">Create and manage quizzes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>

          <button 
            onClick={handleViewAssignments}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-4 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Assignments</h3>
              <p className="text-sm text-gray-600">Create and manage assignments</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 border border-gray-200 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Student</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-900">{showDeleteConfirm.name}</span> from this subject? 
              This action cannot be undone and the student will lose access to all subject materials.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm.id, showDeleteConfirm.name)}
                disabled={deleteLoading === showDeleteConfirm.id}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleteLoading === showDeleteConfirm.id ? 'Removing...' : 'Remove Student'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium"
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