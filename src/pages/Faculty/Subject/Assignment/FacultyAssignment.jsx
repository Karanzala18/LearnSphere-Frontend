import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  X,
  File,
  Edit,
  ToggleLeft,
  ToggleRight,
  Upload,
  BarChart2,
  Users,
  BookOpen,
  Download
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import facultyAssignmentService from '../../services/facultyAssignmentService';

const FacultyAssignment = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // AI Grading and Batch Operations
  const [gradingInProgress, setGradingInProgress] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState(null);
  const [showBatchGrade, setShowBatchGrade] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // Grading form state
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [gradingData, setGradingData] = useState({
    marks: '',
    feedback: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_marks: '',
    due_date: '',
    instructions: '',
    allowed_file_types: 'pdf,docx,doc,txt',
    max_file_size_mb: '10',
    max_files_count: '5',
    total_max_size_mb: '50',
    allow_late_submission: false,
    late_penalty_percent: ''
  });

  useEffect(() => {
    fetchAssignments();
  }, [subjectId]);

  useEffect(() => {
    if (viewingSubmissions) {
      fetchSubmissions(viewingSubmissions.id);
      fetchAssignmentStats(viewingSubmissions.id); // Initial fetch when viewing submissions
    }
  }, [viewingSubmissions]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await facultyAssignmentService.getAssignments(subjectId);
      setAssignments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      setSubmissionsLoading(true);
      const data = await facultyAssignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(data);
      if (viewingSubmissions) fetchAssignmentStats(assignmentId); // Update stats when submissions change
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchStudentSubmission = async (assignmentId, studentId) => {
    try {
      const data = await facultyAssignmentService.getStudentSubmission(assignmentId, studentId);
      setSelectedSubmission(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAssignmentStats = async (assignmentId) => {
    try {
      const mockStats = {
        total_students: submissions.length || 0,
        submitted: submissions.filter(s => s.status === 'submitted').length || 0,
        graded: submissions.filter(s => s.marks !== null && s.marks !== undefined).length || 0,
        average_marks: submissions.reduce((acc, s) => acc + (s.marks || 0), 0) / (submissions.length || 1),
        late_submissions: submissions.filter(s => s.is_late).length || 0
      };
      setAssignmentStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAIGrade = async (assignmentId, studentId) => {
    try {
      setGradingInProgress(true);
      const result = await facultyAssignmentService.gradeWithAI(assignmentId, studentId);
      setGradingResults(result);
      await fetchSubmissions(assignmentId); // Refresh submissions and stats
      setSuccess('AI Grading completed successfully!');
    } catch (error) {
      setError('AI Grading failed: ' + error.message);
    } finally {
      setGradingInProgress(false);
    }
  };

  const handleBatchAIGrade = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student for batch grading.');
      return;
    }

    try {
      setGradingInProgress(true);
      const results = [];
      for (const studentId of selectedStudents) {
        const result = await facultyAssignmentService.gradeWithAI(viewingSubmissions.id, studentId);
        results.push(result);
      }
      setGradingResults(results);
      await fetchSubmissions(viewingSubmissions.id); // Refresh submissions and stats
      setSelectedStudents([]);
      setShowBatchGrade(false);
      setSuccess(`Batch AI Grading completed for ${results.length} students!`);
    } catch (error) {
      setError('Batch AI Grading failed: ' + error.message);
    } finally {
      setGradingInProgress(false);
    }
  };

  const handleManualGrade = async (assignmentId, studentId, marks, feedback) => {
    try {
      const gradeData = {
        marks: parseInt(marks, 10),
        feedback: feedback || null
      };
      await facultyAssignmentService.gradeSubmission(assignmentId, studentId, gradeData);
      await fetchSubmissions(assignmentId); // Refresh submissions and stats
      setShowGradingForm(false);
      setGradingData({ marks: '', feedback: '' });
      setSelectedSubmission(null);
      setSuccess('Manual grading saved successfully!');
    } catch (error) {
      setError('Manual grading failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStudentSelection = (studentId, isSelected) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllStudents = (selectAll) => {
    if (selectAll) {
      setSelectedStudents(submissions.map(s => s.student_id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGradingInputChange = (e) => {
    const { name, value } = e.target;
    setGradingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await facultyAssignmentService.updateAssignment(editingAssignment.id, formData);
        setSuccess('Assignment updated successfully!');
      } else {
        await facultyAssignmentService.createAssignment(subjectId, formData);
        setSuccess('Assignment created successfully!');
      }
      await fetchAssignments();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      total_marks: assignment.total_marks,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
      instructions: assignment.instructions || '',
      allowed_file_types: assignment.allowed_file_types || 'pdf,docx,doc,txt',
      max_file_size_mb: assignment.max_file_size_mb || '10',
      max_files_count: assignment.max_files_count || '5',
      total_max_size_mb: assignment.total_max_size_mb || '50',
      allow_late_submission: assignment.allow_late_submission || false,
      late_penalty_percent: assignment.late_penalty_percent || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await facultyAssignmentService.deleteAssignment(assignmentId);
        setSuccess('Assignment deleted successfully!');
        await fetchAssignments();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleToggleStatus = async (assignmentId, currentStatus) => {
    try {
      await facultyAssignmentService.toggleAssignmentStatus(assignmentId, !currentStatus);
      setSuccess(`Assignment ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      await fetchAssignments();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setViewingSubmissions(assignment);
    await fetchSubmissions(assignment.id);
  };

  const handleViewSubmission = async (assignmentId, studentId) => {
    await fetchStudentSubmission(assignmentId, studentId);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      total_marks: '',
      due_date: '',
      instructions: '',
      allowed_file_types: 'pdf,docx,doc,txt',
      max_file_size_mb: '10',
      max_files_count: '5',
      total_max_size_mb: '50',
      allow_late_submission: false,
      late_penalty_percent: ''
    });
    setShowCreateForm(false);
    setEditingAssignment(null);
  };

  const resetSubmissionsView = () => {
    setViewingSubmissions(null);
    setSubmissions([]);
    setSelectedSubmission(null);
    setAssignmentStats(null);
    setSelectedStudents([]);
    setShowBatchGrade(false);
    setShowStats(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  const AssignmentCard = ({ assignment }) => (
    <div 
      className={`bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer ${
        viewingSubmissions?.id === assignment.id ? 'border-blue-500 shadow-lg' : ''
      }`}
      onClick={() => handleViewSubmissions(assignment)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          assignment.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {assignment.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {assignment.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
      )}
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Due: {formatDate(assignment.due_date)}</span>
        </div>
        <div className="flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          <span>File Types: {assignment.allowed_file_types || 'Any'}</span>
        </div>
        <div className="flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          <span>Max: {assignment.max_file_size_mb}MB</span>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(assignment);
          }}
          className="px-3 py-1 text-sm bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Edit className="w-4 h-4 inline mr-1" /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(assignment.id, assignment.is_active);
          }}
          className={`px-3 py-1 text-sm rounded-lg text-white ${
            assignment.is_active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {assignment.is_active ? (
            <ToggleLeft className="w-4 h-4 inline mr-1" />
          ) : (
            <ToggleRight className="w-4 h-4 inline mr-1" />
          )}
          {assignment.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(assignment.id);
          }}
          className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4 inline mr-1" /> Delete
        </button>
      </div>
    </div>
  );

  const GradingModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Grade Submission: {selectedSubmission?.student_name || `ID: ${selectedSubmission?.student_id}`}
          </h2>
          <button
            onClick={() => {
              setShowGradingForm(false);
              setGradingData({ marks: '', feedback: '' });
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleManualGrade(
            viewingSubmissions.id,
            selectedSubmission.student_id,
            gradingData.marks,
            gradingData.feedback
          );
        }}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks (out of {viewingSubmissions.total_marks})
              </label>
              <input
                type="number"
                name="marks"
                value={gradingData.marks}
                onChange={handleGradingInputChange}
                min="0"
                max={viewingSubmissions.total_marks}
                step="0.01"
                required
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                  gradingData.marks && (parseFloat(gradingData.marks) > viewingSubmissions.total_marks)
                    ? 'border-red-500'
                    : 'border-gray-300'
                } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {gradingData.marks && (parseFloat(gradingData.marks) > viewingSubmissions.total_marks) && (
                <p className="text-red-600 text-sm mt-2">
                  Marks cannot exceed {viewingSubmissions.total_marks}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                name="feedback"
                value={gradingData.feedback}
                onChange={handleGradingInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add feedback for the student..."
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Save Grade
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGradingForm(false);
                setGradingData({ marks: '', feedback: '' });
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-15">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Subject</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Subject Assignments</h1>
          <p className="text-gray-600 mt-2">Manage assignments and grade submissions</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start justify-between mx-auto max-w-2xl">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-start justify-between mx-auto max-w-2xl">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {gradingInProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-start mx-auto max-w-2xl">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <p className="text-blue-700">🤖 AI Grading in progress... Please wait.</p>
          </div>
        )}

        {gradingResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-start justify-between mx-auto max-w-2xl">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <p className="text-green-700">
                {Array.isArray(gradingResults) 
                  ? `${gradingResults.length} submissions graded successfully!`
                  : 'Submission graded successfully!'
                }
              </p>
            </div>
            <button onClick={() => setGradingResults(null)} className="text-green-500 hover:text-green-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {!viewingSubmissions && (
              <div className="mb-6 text-center">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full max-w-xs mx-auto px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Create New Assignment
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading assignments...</p>
              </div>
            )}

            {!loading && !viewingSubmissions && assignments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300 mx-auto max-w-xl">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assignments created yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                >
                  Create First Assignment
                </button>
              </div>
            )}

            {!viewingSubmissions && (
              <div className="space-y-4">
                {!loading && assignments.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {viewingSubmissions ? (
  <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Submissions for: {viewingSubmissions.title}
                  </h2>
                  <button
                    onClick={resetSubmissionsView}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                  >
                    Close Submissions
                  </button>
                </div>

                {showStats && assignmentStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard 
                      icon={Users} 
                      title="Total Students" 
                      value={assignmentStats.total_students} 
                      color="from-blue-500 to-blue-600" 
                    />
                    <StatCard 
                      icon={FileText} 
                      title="Submitted" 
                      value={assignmentStats.submitted} 
                      color="from-green-500 to-green-600" 
                    />
                    <StatCard 
                      icon={CheckCircle} 
                      title="Graded" 
                      value={assignmentStats.graded} 
                      color="from-purple-500 to-purple-600" 
                    />
                    <StatCard 
                      icon={AlertCircle} 
                      title="Late Submissions" 
                      value={assignmentStats.late_submissions} 
                      color="from-red-500 to-red-600" 
                    />
                    <StatCard 
                      icon={BarChart2} 
                      title="Average Marks" 
                      value={assignmentStats.average_marks ? assignmentStats.average_marks.toFixed(1) : '0'} 
                      color="from-yellow-500 to-yellow-600" 
                    />
                  </div>
                )}

                <div className="mb-6 flex gap-3 justify-center">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                  >
                    <BarChart2 className="w-4 h-4 inline mr-2" />
                    {showStats ? 'Hide Stats' : 'Show Stats'}
                  </button>
                  <button
                    onClick={() => setShowBatchGrade(!showBatchGrade)}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium"
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Batch Grade
                  </button>
                </div>

                {showBatchGrade && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch AI Grading</h3>
                    <div className="mb-4">
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === submissions.length && submissions.length > 0}
                          onChange={(e) => handleSelectAllStudents(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Select All ({submissions.length} students)
                        </span>
                      </label>
                      <p className="text-sm text-gray-600">Selected: {selectedStudents.length} students</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleBatchAIGrade}
                        disabled={gradingInProgress || selectedStudents.length === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedStudents.length === 0 || gradingInProgress
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Start Batch AI Grading
                      </button>
                      <button
                        onClick={() => setShowBatchGrade(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {submissionsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No submissions yet for this assignment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start gap-3">
                            {showBatchGrade && (
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(submission.student_id)}
                                onChange={(e) => handleStudentSelection(submission.student_id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                              />
                            )}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {submission.student_name || `Student ID: ${submission.student_id}`}
                              </h4>
                              <p className="text-sm text-gray-600">Submitted: {formatDateTime(submission.submitted_at)}</p>
                              {submission.is_late && (
                                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-600">
                                  Late Submission
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewSubmission(viewingSubmissions.id, submission.student_id)}
                              className="px-3 py-1 text-sm bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="w-4 h-4 inline mr-1" /> View Details
                            </button>
                            <button
                              onClick={() => handleAIGrade(viewingSubmissions.id, submission.student_id)}
                              disabled={gradingInProgress}
                              className={`px-3 py-1 text-sm rounded-lg text-white ${
                                gradingInProgress
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1" /> AI Grade
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setGradingData({
                                  marks: submission.marks_obtained || submission.marks || '',
                                  feedback: submission.feedback || ''
                                });
                                setShowGradingForm(true);
                              }}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Edit className="w-4 h-4 inline mr-1" />
                              {submission.marks ? 'Edit Grade' : 'Manual Grade'}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Files:</span> {submission.files_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">Total Size:</span> {submission.total_size_mb || 0}MB
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {submission.status || 'Submitted'}
                          </div>
                          {submission.marks && (
                            <div>
                              <span className="font-medium">Marks:</span> {submission.marks}/{viewingSubmissions.total_marks}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSubmission && !showGradingForm && (
                  <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Submission Details</h3>
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start justify-center">
                        <Users className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Student</p>
                          <p className="text-gray-900">{selectedSubmission.student_name || `ID: ${selectedSubmission.student_id}`}</p>
                        </div>
                      </div>
                      <div className="flex items-start justify-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Submitted</p>
                          <p className="text-gray-900">{formatDateTime(selectedSubmission.submitted_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start justify-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Status</p>
                          <p className="text-gray-900">{selectedSubmission.status}</p>
                        </div>
                      </div>
                      {selectedSubmission.is_late && (
                        <p className="text-red-600 font-medium">⚠️ Late Submission</p>
                      )}
                    </div>

                    {selectedSubmission.submission_text && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 font-medium mb-2">Submission Text</p>
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                          {selectedSubmission.submission_text}
                        </div>
                      </div>
                    )}

                    {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 font-medium mb-2">Submitted Files</p>
                        <div className="space-y-2">
                          {selectedSubmission.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                              <div className="flex items-center">
                                <File className="w-4 h-4 text-blue-600 mr-3" />
                                <span className="text-sm text-gray-900">{file.original_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {file.size_mb}MB | {file.file_type}
                                </span>
                                <button
                                  onClick={() => window.open(file.download_url, '_blank')}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSubmission.feedback && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 font-medium mb-2">Feedback</p>
                        <div className="bg-blue-50 rounded-lg p-4 text-gray-900">
                          {selectedSubmission.feedback}
                        </div>
                      </div>
                    )}

                    {selectedSubmission.marks && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Grade</p>
                        <div className="bg-green-50 rounded-lg p-4 text-gray-900 font-semibold">
                          {selectedSubmission.marks} / {viewingSubmissions.total_marks}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : showCreateForm ? (
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Marks *
                      </label>
                      <input
                        type="number"
                        name="total_marks"
                        value={formData.total_marks}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed File Types
                      </label>
                      <input
                        type="text"
                        name="allowed_file_types"
                        value={formData.allowed_file_types}
                        onChange={handleInputChange}
                        placeholder="pdf,docx,doc,txt"
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        name="max_file_size_mb"
                        value={formData.max_file_size_mb}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Files Count
                      </label>
                      <input
                        type="number"
                        name="max_files_count"
                        value={formData.max_files_count}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Max Size (MB)
                      </label>
                      <input
                        type="number"
                        name="total_max_size_mb"
                        value={formData.total_max_size_mb}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="allow_late_submission"
                          checked={formData.allow_late_submission}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Allow Late Submission</span>
                      </label>
                    </div>
                    {formData.allow_late_submission && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Late Penalty (%)
                        </label>
                        <input
                          type="number"
                          name="late_penalty_percent"
                          value={formData.late_penalty_percent}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      type="submit"
                      className="flex-1 max-w-xs px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                    >
                      {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignment Selected</h3>
                <p className="text-gray-600">Select an assignment from the list to view submissions or create a new one</p>
              </div>
            )}
          </div>
        </div>

        {showGradingForm && <GradingModal />}
      </div>
    </div>
  );
};

export default FacultyAssignment;