import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  X,
  File,
  User,
  BookOpen
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock service - replace with your actual studentAssignmentService import
const studentAssignmentService = {
  getAllAssignments: async () => [],
  getUpcomingAssignments: async () => [],
  getPastDueAssignments: async () => [],
  getAssignmentStats: async () => ({ total: 0, upcoming: 0, pastDue: 0, completed: 0 }),
  getAssignment: async (id) => ({}),
  getAssignmentSubmission: async (id) => null,
  submitAssignment: async (id, data) => ({}),
  deleteAssignmentSubmission: async (assignmentId, submissionId) => {},
  formatAssignmentData: (assignment) => ({
    ...assignment,
    due_date_formatted: assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A',
    due_time_formatted: assignment.due_date ? new Date(assignment.due_date).toLocaleTimeString() : 'N/A',
    days_until_due: assignment.due_date ? Math.ceil((new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0
  }),
  validateFiles: (files, maxSize) => ({ isValid: true, errors: [] }),
  isSubmittable: (assignment) => ({ canSubmit: true, reason: '', isLate: false }),
  formatFileSize: (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
};

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [pastDueAssignments, setPastDueAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    submission_notes: '',
    files: []
  });
  const navigate = useNavigate();
  const { courseId } = useParams(); // Replace with actual courseId from route params or context

  useEffect(() => {
    if (!courseId)  console.error('No courseId provided');
    loadAssignments();
    loadStats();
  }, [courseId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const [all, upcoming, pastDue] = await Promise.all([
        studentAssignmentService.getAllAssignments(),
        studentAssignmentService.getUpcomingAssignments(),
        studentAssignmentService.getPastDueAssignments()
      ]);
      
      setAssignments(all.map(studentAssignmentService.formatAssignmentData));
      setUpcomingAssignments(upcoming.map(studentAssignmentService.formatAssignmentData));
      setPastDueAssignments(pastDue.map(studentAssignmentService.formatAssignmentData));
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await studentAssignmentService.getAssignmentStats();
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const handleAssignmentClick = async (assignment) => {
    setLoading(true);
    try {
      const details = await studentAssignmentService.getAssignment(assignment.id);
      setSelectedAssignment(details);
      
      try {
        const submission = await studentAssignmentService.getAssignmentSubmission(assignment.id);
        setCurrentSubmission(submission);
      } catch (submissionErr) {
        setCurrentSubmission(null);
      }
    } catch (err) {
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validation = studentAssignmentService.validateFiles(files, selectedAssignment?.max_file_size_mb || 10);
    
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    setSubmissionData(prev => ({ ...prev, files }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    setLoading(true);
    try {
      const submission = await studentAssignmentService.submitAssignment(
        selectedAssignment.id,
        submissionData
      );
      setCurrentSubmission(submission);
      setShowSubmissionModal(false);
      setSubmissionData({ submission_notes: '', files: [] });
      setSuccess('Assignment submitted successfully');
      loadAssignments();
    } catch (err) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!selectedAssignment || !window.confirm('Are you sure you want to delete this submission?')) return;
    
    setLoading(true);
    try {
      await studentAssignmentService.deleteAssignmentSubmission(selectedAssignment.id, submissionId);
      setCurrentSubmission(null);
      setSuccess('Submission deleted successfully');
      loadAssignments();
    } catch (err) {
      setError('Failed to delete submission');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentsByTab = () => {
    switch (activeTab) {
      case 'upcoming': return upcomingAssignments;
      case 'pastDue': return pastDueAssignments;
      default: return assignments;
    }
  };

  const isSubmittable = (assignment) => {
    return studentAssignmentService.isSubmittable(assignment);
  };

  const handleBackNavigation = () => {
    navigate(`/student/subjects/${courseId}`  );
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

  const AssignmentCard = ({ assignment }) => {
    const submittable = isSubmittable(assignment);
    const isActive = assignment.is_active !== false && assignment.status !== 'inactive';
    
    return (
      <div 
        className={`bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer ${
          selectedAssignment?.id === assignment.id ? 'border-blue-500 shadow-lg' : ''
        }`}
        onClick={() => handleAssignmentClick(assignment)}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            !isActive
              ? 'bg-gray-100 text-gray-600'
              : assignment.is_overdue 
              ? 'bg-red-50 text-red-600' 
              : 'bg-green-50 text-green-600'
          }`}>
            {!isActive ? 'Inactive' : assignment.is_overdue ? 'Overdue' : 'Active'}
          </span>
        </div>
        
        <p className="text-blue-600 text-sm font-medium mb-2">{assignment.subject?.name}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{assignment.due_date_formatted} at {assignment.due_time_formatted}</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <span>Max: {assignment.max_file_size_mb}MB</span>
          </div>
          {assignment.days_until_due > 0 && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium text-blue-600">{assignment.days_until_due} days left</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SubmissionModal = () => {
    const submittable = selectedAssignment ? isSubmittable(selectedAssignment) : { canSubmit: false };
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {submittable.canSubmit ? 'Submit Assignment' : 'Assignment Submission'}
            </h2>
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSubmissionData({ submission_notes: '', files: [] });
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {!submittable.canSubmit && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <p className="text-red-700 text-sm">{submittable.reason}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                value={submissionData.submission_notes}
                onChange={(e) => setSubmissionData(prev => ({
                  ...prev,
                  submission_notes: e.target.value
                }))}
                placeholder="Add any notes about your submission..."
                disabled={!submittable.canSubmit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                  disabled={!submittable.canSubmit}
                />
                <label 
                  htmlFor="file-upload" 
                  className={`${submittable.canSubmit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span className="text-blue-600 font-medium hover:text-blue-700">Choose files</span>
                  <span className="text-gray-600"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Max file size: {selectedAssignment?.max_file_size_mb || 10}MB per file
                </p>
              </div>
              
              {submissionData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  {submissionData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                      <div className="flex items-center">
                        <File className="w-4 h-4 text-blue-600 mr-3" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {studentAssignmentService.formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            {submittable.canSubmit ? (
              <button
                onClick={handleSubmit}
                disabled={loading || submissionData.files.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
              >
                Cannot Submit
              </button>
            )}
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSubmissionData({ submission_notes: '', files: [] });
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackNavigation}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Course</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-2">View and submit your assignments</p>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FileText} title="Total" value={stats.total || 0} color="from-blue-500 to-blue-600" />
          <StatCard icon={Clock} title="Upcoming" value={stats.upcoming || 0} color="from-purple-500 to-purple-600" />
          <StatCard icon={AlertCircle} title="Past Due" value={stats.pastDue || 0} color="from-red-500 to-red-600" />
          <StatCard icon={CheckCircle} title="Completed" value={stats.completed || 0} color="from-green-500 to-green-600" />
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 flex items-start justify-between">
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
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-start justify-between">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment List */}
          <div className="lg:col-span-1">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {[
                { key: 'all', label: 'All' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'pastDue', label: 'Past Due' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading assignments...</p>
              </div>
            )}
            
            {!loading && getAssignmentsByTab().length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No assignments found</p>
              </div>
            )}
            
            <div className="space-y-4">
              {!loading && getAssignmentsByTab().map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          </div>

          {/* Assignment Details */}
          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedAssignment.title}
                </h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Subject</p>
                      <p className="text-gray-900">{selectedAssignment.subject?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Faculty</p>
                      <p className="text-gray-900">{selectedAssignment.faculty?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Description</p>
                      <p className="text-gray-900">{selectedAssignment.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Due Date</p>
                      <p className="text-gray-900">
                        {studentAssignmentService.formatAssignmentData(selectedAssignment).due_date_formatted} at{' '}
                        {studentAssignmentService.formatAssignmentData(selectedAssignment).due_time_formatted}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Upload className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Max File Size</p>
                      <p className="text-gray-900">{selectedAssignment.max_file_size_mb}MB per file</p>
                    </div>
                  </div>
                </div>

                {/* Current Submission */}
                {currentSubmission ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="font-semibold text-gray-900 text-lg">Your Submission</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Status: </span>
                        <span className="text-gray-900">{currentSubmission.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Submitted: </span>
                        <span className="text-gray-900">
                          {new Date(currentSubmission.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      {currentSubmission.is_late && (
                        <p className="text-red-600 font-medium">⚠️ Late Submission</p>
                      )}
                      {currentSubmission.submission_notes && (
                        <div>
                          <p className="text-gray-600 font-medium mb-1">Notes:</p>
                          <p className="text-gray-900">{currentSubmission.submission_notes}</p>
                        </div>
                      )}
                      {currentSubmission.files && currentSubmission.files.length > 0 && (
                        <div>
                          <p className="text-gray-600 font-medium mb-2">Files:</p>
                          <div className="space-y-2">
                            {currentSubmission.files.map((file, index) => (
                              <div key={index} className="flex items-center bg-white rounded-lg px-3 py-2">
                                <File className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-gray-900">{file.original_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteSubmission(currentSubmission.id)}
                      className="mt-4 flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Submission
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No submission yet</p>
                  </div>
                )}

                {/* Submit Button */}
                {(() => {
                  const submittable = isSubmittable(selectedAssignment);
                  return (
                    <div>
                      <button
                        onClick={() => setShowSubmissionModal(true)}
                        disabled={!submittable.canSubmit}
                        className={`w-full px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                          submittable.canSubmit
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {currentSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                        {submittable.isLate && submittable.canSubmit && ' (Late)'}
                      </button>
                      
                      {!submittable.canSubmit && (
                        <div className="mt-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">
                            <p className="text-sm text-red-700 flex items-start">
                              <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
                              {submittable.reason}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSubmissionModal(true)}
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                          >
                            View Upload Form (Read Only)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignment Selected</h3>
                <p className="text-gray-600">Select an assignment from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && <SubmissionModal />}
    </div>
  );
};

export default StudentAssignment;