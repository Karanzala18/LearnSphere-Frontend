import React, { useState, useEffect } from 'react';
import studentAssignmentService from '../../services/studentAssignmentService';

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

  useEffect(() => {
    loadAssignments();
    loadStats();
  }, []);

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
      
      // Try to load existing submission
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

  const AssignmentCard = ({ assignment }) => {
    const submittable = isSubmittable(assignment);
    const isActive = assignment.is_active !== false && assignment.status !== 'inactive';
    
    return (
      <div 
        className="border border-gray-300 p-4 mb-3 cursor-pointer hover:bg-gray-50"
        onClick={() => handleAssignmentClick(assignment)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-black">{assignment.title}</h3>
          <span className={`px-2 py-1 text-xs border ${
            !isActive
              ? 'border-gray-500 text-gray-500'
              : assignment.is_overdue 
              ? 'border-red-500 text-red-500' 
              : 'border-green-500 text-green-500'
          }`}>
            {!isActive ? 'Inactive' : assignment.is_overdue ? 'Overdue' : 'Active'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-2">{assignment.subject?.name}</p>
        <p className="text-gray-700 text-sm mb-3">{assignment.description}</p>
        
        <div className="text-sm text-gray-600">
          <p>Due: {assignment.due_date_formatted} at {assignment.due_time_formatted}</p>
          <p>Max File Size: {assignment.max_file_size_mb}MB</p>
          {assignment.days_until_due > 0 && (
            <p>Days remaining: {assignment.days_until_due}</p>
          )}
        </div>
      </div>
    );
  };

  const SubmissionModal = () => {
    const submittable = selectedAssignment ? isSubmittable(selectedAssignment) : { canSubmit: false };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 w-full max-w-md border border-gray-300">
          <h2 className="text-xl font-medium mb-4 text-black">
            {submittable.canSubmit ? 'Submit Assignment' : 'Assignment Submission (Read Only)'}
          </h2>
          
          {!submittable.canSubmit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm">
              {submittable.reason}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Submission Notes (Optional)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 text-black"
              rows="3"
              value={submissionData.submission_notes}
              onChange={(e) => setSubmissionData(prev => ({
                ...prev,
                submission_notes: e.target.value
              }))}
              placeholder="Add any notes about your submission..."
              disabled={!submittable.canSubmit}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Upload Files
            </label>
            <input
              type="file"
              multiple
              className="w-full p-2 border border-gray-300"
              onChange={handleFileChange}
              disabled={!submittable.canSubmit}
            />
            {submissionData.files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                {submissionData.files.map((file, index) => (
                  <div key={index} className="text-xs text-gray-700 flex justify-between">
                    <span>{file.name}</span>
                    <span>({studentAssignmentService.formatFileSize(file.size)})</span>
                  </div>
                ))}
              </div>
            )}
            
            {selectedAssignment && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Max file size: {selectedAssignment.max_file_size_mb}MB per file</p>
                <p>Allowed file types: All types accepted</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {submittable.canSubmit ? (
              <button
                onClick={handleSubmit}
                disabled={loading || submissionData.files.length === 0}
                className="flex-1 px-4 py-2 bg-black text-white disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Cannot Submit
              </button>
            )}
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSubmissionData({ submission_notes: '', files: [] });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-black"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-6">My Assignments</h1>
      
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-300 p-4 text-center">
          <div className="text-2xl font-bold text-black">{stats.total || 0}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="border border-gray-300 p-4 text-center">
          <div className="text-2xl font-bold text-black">{stats.upcoming || 0}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="border border-gray-300 p-4 text-center">
          <div className="text-2xl font-bold text-black">{stats.pastDue || 0}</div>
          <div className="text-sm text-gray-600">Past Due</div>
        </div>
        <div className="border border-gray-300 p-4 text-center">
          <div className="text-2xl font-bold text-black">{stats.completed || 0}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-4">
          {success}
          <button 
            onClick={() => setSuccess('')}
            className="float-right text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex">
        {/* Assignment List */}
        <div className="w-1/2 pr-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-300 mb-4">
            {[
              { key: 'all', label: 'All Assignments' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'pastDue', label: 'Past Due' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm ${
                  activeTab === tab.key
                    ? 'border-b-2 border-black text-black font-medium'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && <div className="text-center py-4 text-gray-600">Loading...</div>}
          
          {!loading && getAssignmentsByTab().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assignments found
            </div>
          )}
          
          {!loading && getAssignmentsByTab().map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>

        {/* Assignment Details */}
        <div className="w-1/2 pl-4 border-l border-gray-300">
          {selectedAssignment ? (
            <div>
              <h2 className="text-xl font-medium text-black mb-4">
                {selectedAssignment.title}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Subject</p>
                <p className="text-black">{selectedAssignment.subject?.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Faculty</p>
                <p className="text-black">{selectedAssignment.faculty?.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-black">{selectedAssignment.description}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="text-black">
                  {studentAssignmentService.formatAssignmentData(selectedAssignment).due_date_formatted} at{' '}
                  {studentAssignmentService.formatAssignmentData(selectedAssignment).due_time_formatted}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Max File Size</p>
                <p className="text-black">{selectedAssignment.max_file_size_mb}MB per file</p>
              </div>

              {/* Current Submission */}
              {currentSubmission ? (
                <div className="border border-gray-300 p-4 mb-4">
                  <h3 className="font-medium text-black mb-2">Your Submission</h3>
                  <p className="text-sm text-gray-600 mb-1">Status: {currentSubmission.status}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Submitted: {new Date(currentSubmission.submitted_at).toLocaleString()}
                  </p>
                  {currentSubmission.is_late && (
                    <p className="text-sm text-red-500 mb-1">Late Submission</p>
                  )}
                  {currentSubmission.submission_notes && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Notes:</p>
                      <p className="text-black text-sm">{currentSubmission.submission_notes}</p>
                    </div>
                  )}
                  {currentSubmission.files && currentSubmission.files.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Files:</p>
                      {currentSubmission.files.map((file, index) => (
                        <div key={index} className="text-sm text-black">
                          {file.original_name}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteSubmission(currentSubmission.id)}
                    className="text-sm px-3 py-1 border border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Delete Submission
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 border border-gray-300 mb-4">
                  No submission yet
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
                      className={`w-full px-4 py-2 ${
                        submittable.canSubmit
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {currentSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                      {submittable.isLate && submittable.canSubmit && ' (Late)'}
                    </button>
                    
                    {!submittable.canSubmit && (
                      <div className="mt-2">
                        <p className="text-sm text-red-500 text-center mb-2">
                          {submittable.reason}
                        </p>
                        <button
                          onClick={() => setShowSubmissionModal(true)}
                          className="w-full px-4 py-2 border border-gray-400 text-gray-600 hover:bg-gray-50"
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
            <div className="text-center py-8 text-gray-500">
              Select an assignment to view details
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && <SubmissionModal />}
    </div>
  );
};

export default StudentAssignment;