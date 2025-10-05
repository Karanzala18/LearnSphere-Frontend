import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import facultyAssignmentService from '../../services/facultyAssignmentService';

const FacultyAssignment = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      fetchAssignmentStats(viewingSubmissions.id);
    }
  }, [viewingSubmissions]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
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
      // Mock stats - replace with actual API call
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

  // AI Grading Functions
  const handleAIGrade = async (assignmentId, studentId) => {
    try {
      setGradingInProgress(true);
      const result = await facultyAssignmentService.gradeWithAI(assignmentId, studentId);
      setGradingResults(result);
      
      // Refresh submissions to show updated grades
      await fetchSubmissions(assignmentId);
      
      alert('AI Grading completed successfully!');
    } catch (error) {
      setError('AI Grading failed: ' + error.message);
    } finally {
      setGradingInProgress(false);
    }
  };

  const handleBatchAIGrade = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student for batch grading.');
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
      await fetchSubmissions(viewingSubmissions.id);
      setSelectedStudents([]);
      setShowBatchGrade(false);
      
      alert(`Batch AI Grading completed for ${results.length} students!`);
    } catch (error) {
      setError('Batch AI Grading failed: ' + error.message);
    } finally {
      setGradingInProgress(false);
    }
  };

  // Manual Grading Functions
const handleManualGrade = async (assignmentId, studentId, marks, feedback) => {
  try {
    const gradeData = {
      marks: parseInt(marks, 10),
      feedback: feedback || null
    };
    
    await facultyAssignmentService.gradeSubmission(assignmentId, studentId, gradeData);
    
    // Refresh submissions to show updated grade
    await fetchSubmissions(assignmentId);
    
    // Close the form and reset
    setShowGradingForm(false);
    setGradingData({ marks: '', feedback: '' });
    setSelectedSubmission(null);
    
    alert('Manual grading saved successfully!');
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

  // Original functions
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
      } else {
        await facultyAssignmentService.createAssignment(subjectId, formData);
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
        await fetchAssignments();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleToggleStatus = async (assignmentId, currentStatus) => {
    try {
      await facultyAssignmentService.toggleAssignmentStatus(assignmentId, !currentStatus);
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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            padding: '8px 16px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
          Subject Assignments
        </h1>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* AI Grading Progress */}
      {gradingInProgress && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <p>🤖 AI Grading in progress... Please wait.</p>
        </div>
      )}

      {/* Submissions View */}
      {viewingSubmissions && (
        <div style={{
          background: '#f9f9f9',
          border: '1px solid #ddd',
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0' }}>
              Submissions for: {viewingSubmissions.title}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowStats(!showStats)}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              <button
                onClick={() => setShowBatchGrade(!showBatchGrade)}
                style={{
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                Batch Grade
              </button>
              <button
                onClick={resetSubmissionsView}
                style={{
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                Close Submissions
              </button>
            </div>
          </div>

          {/* Assignment Statistics */}
          {showStats && assignmentStats && (
            <div style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: '0' }}>Assignment Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assignmentStats.total_students}</div>
                  <div>Total Students</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assignmentStats.submitted}</div>
                  <div>Submitted</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assignmentStats.graded}</div>
                  <div>Graded</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{assignmentStats.late_submissions}</div>
                  <div>Late Submissions</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: '#d1ecf1', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {assignmentStats.average_marks ? assignmentStats.average_marks.toFixed(1) : '0'}
                  </div>
                  <div>Average Marks</div>
                </div>
              </div>
            </div>
          )}

          {/* Batch Grading Panel */}
          {showBatchGrade && (
            <div style={{
              background: '#fff',
              border: '2px solid #ffc107',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: '0' }}>Batch AI Grading</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === submissions.length && submissions.length > 0}
                    onChange={(e) => handleSelectAllStudents(e.target.checked)}
                  />
                  <span>Select All ({submissions.length} students)</span>
                </label>
                <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
                  Selected: {selectedStudents.length} students
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleBatchAIGrade}
                  disabled={gradingInProgress || selectedStudents.length === 0}
                  style={{
                    background: selectedStudents.length === 0 ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  🤖 Start Batch AI Grading
                </button>
                <button
                  onClick={() => setShowBatchGrade(false)}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {submissionsLoading ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff'
            }}>
              <p>No submissions yet for this assignment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '15px',
                    background: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                      {showBatchGrade && (
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(submission.student_id)}
                          onChange={(e) => handleStudentSelection(submission.student_id, e.target.checked)}
                          style={{ marginTop: '5px' }}
                        />
                      )}
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>
                          {submission.student_name || `Student ID: ${submission.student_id}`}
                        </h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                          Submitted: {formatDateTime(submission.submitted_at)}
                        </p>
                        {submission.is_late && (
                          <span style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '2px 8px',
                            fontSize: '12px',
                            borderRadius: '12px',
                            marginTop: '5px',
                            display: 'inline-block'
                          }}>
                            Late Submission
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleViewSubmission(viewingSubmissions.id, submission.student_id)}
                        style={{
                          background: '#000',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleAIGrade(viewingSubmissions.id, submission.student_id)}
                        disabled={gradingInProgress}
                        style={{
                          background: gradingInProgress ? '#ccc' : '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: gradingInProgress ? 'not-allowed' : 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        🤖 AI Grade
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
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {submission.marks ? 'Edit Grade' : 'Manual Grade'}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    <div>
                      <strong>Files:</strong> {submission.files_count || 0}
                    </div>
                    <div>
                      <strong>Total Size:</strong> {submission.total_size_mb || 0}MB
                    </div>
                    <div>
                      <strong>Status:</strong> {submission.status || 'Submitted'}
                    </div>
                    {submission.marks && (
                      <div>
                        <strong>Marks:</strong> {submission.marks}/{viewingSubmissions.total_marks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Grading Form */}
          {showGradingForm && selectedSubmission && (
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%'
              }}>
                <h3 style={{ marginTop: '0' }}>
                  Grade Submission: {selectedSubmission.student_name || `ID: ${selectedSubmission.student_id}`}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleManualGrade(
                    viewingSubmissions.id,
                    selectedSubmission.student_id,
                    gradingData.marks,
                    gradingData.feedback
                  );
                }}>
                  <div style={{ marginBottom: '15px' }}>
  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
    style={{
      width: '100%',
      padding: '8px',
      border: gradingData.marks && (parseFloat(gradingData.marks) > viewingSubmissions.total_marks) ? '1px solid #dc3545' : '1px solid #ccc',
      borderRadius: '4px'
    }}
  />
  {gradingData.marks && (parseFloat(gradingData.marks) > viewingSubmissions.total_marks) && (
    <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
      Marks cannot exceed {viewingSubmissions.total_marks}
    </div>
  )}
</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Save Grade
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGradingForm(false);
                        setGradingData({ marks: '', feedback: '' });
                      }}
                      style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Selected Submission Details */}
          {selectedSubmission && !showGradingForm && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              border: '2px solid #000',
              borderRadius: '4px',
              background: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: '0' }}>Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    background: 'none',
                    border: '1px solid #ccc',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  Close
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <p><strong>Student:</strong> {selectedSubmission.student_name || `ID: ${selectedSubmission.student_id}`}</p>
                  <p><strong>Submitted:</strong> {formatDateTime(selectedSubmission.submitted_at)}</p>
                  <p><strong>Status:</strong> {selectedSubmission.status}</p>
                </div>
                <div>
                  <p><strong>Files Count:</strong> {selectedSubmission.files?.length || 0}</p>
                  <p><strong>Total Size:</strong> {selectedSubmission.total_size_mb || 0}MB</p>
                  {selectedSubmission.is_late && <p style={{ color: '#ff9800' }}><strong>Late Submission</strong></p>}
                </div>
              </div>

              {selectedSubmission.submission_text && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Submission Text:</strong>
                  <div style={{ 
                    background: '#f9f9f9', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginTop: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedSubmission.submission_text}
                  </div>
                </div>
              )}

              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div>
                  <strong>Submitted Files:</strong>
                  <div style={{ marginTop: '10px' }}>
                    {selectedSubmission.files.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          border: '1px solid #ddd',
                          padding: '10px',
                          marginBottom: '10px',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div><strong>{file.original_name}</strong></div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Size: {file.size_mb}MB | Type: {file.file_type}
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(file.download_url, '_blank')}
                          style={{
                            background: '#000',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.feedback && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Feedback:</strong>
                  <div style={{ 
                    background: '#e3f2fd', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginTop: '5px'
                  }}>
                    {selectedSubmission.feedback}
                  </div>
                </div>
              )}

              {selectedSubmission.marks && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Grade:</strong>
                  <div style={{ 
                    background: '#e8f5e8', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginTop: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {selectedSubmission.marks} / {viewingSubmissions.total_marks}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Assignment Button */}
      {!viewingSubmissions && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              background: '#000',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            Create New Assignment
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && !viewingSubmissions && (
        <div style={{
          background: '#f9f9f9',
          border: '1px solid #ddd',
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '4px'
        }}>
          <h2 style={{ marginTop: '0' }}>
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    name="allowed_file_types"
                    value={formData.allowed_file_types}
                    onChange={handleInputChange}
                    placeholder="pdf,docx,doc,txt"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    name="max_file_size_mb"
                    value={formData.max_file_size_mb}
                    onChange={handleInputChange}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Max Files Count
                  </label>
                  <input
                    type="number"
                    name="max_files_count"
                    value={formData.max_files_count}
                    onChange={handleInputChange}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Total Max Size (MB)
                  </label>
                  <input
                    type="number"
                    name="total_max_size_mb"
                    value={formData.total_max_size_mb}
                    onChange={handleInputChange}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="allow_late_submission"
                      checked={formData.allow_late_submission}
                      onChange={handleInputChange}
                    />
                    <span style={{ fontWeight: 'bold' }}>Allow Late Submission</span>
                  </label>
                </div>

                {formData.allow_late_submission && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Late Penalty (%)
                    </label>
                    <input
                      type="number"
                      name="late_penalty_percent"
                      value={formData.late_penalty_percent}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Full Width Fields */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Form Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: '#fff',
                  color: '#000',
                  border: '1px solid #ccc',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      {!viewingSubmissions && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Assignments ({assignments.length})</h2>
          
          {assignments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#f9f9f9'
            }}>
              <p>No assignments created yet.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '20px',
                    background: assignment.is_active ? '#fff' : '#f5f5f5'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                        {assignment.title}
                        {!assignment.is_active && (
                          <span style={{
                            background: '#666',
                            color: 'white',
                            padding: '2px 8px',
                            fontSize: '12px',
                            borderRadius: '12px',
                            marginLeft: '10px'
                          }}>
                            Inactive
                          </span>
                        )}
                      </h3>
                      {assignment.description && (
                        <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                          {assignment.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        View Submissions
                      </button>
                      <button
                        onClick={() => handleEdit(assignment)}
                        style={{
                          background: 'none',
                          border: '1px solid #ccc',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(assignment.id, assignment.is_active)}
                        style={{
                          background: assignment.is_active ? '#666' : '#000',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {assignment.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px' }}>
                    <div>
                      <strong>Total Marks:</strong> {assignment.total_marks}
                    </div>
                    <div>
                      <strong>Due Date:</strong> {formatDate(assignment.due_date)}
                    </div>
                    <div>
                      <strong>File Types:</strong> {assignment.allowed_file_types || 'Any'}
                    </div>
                    <div>
                      <strong>Max Files:</strong> {assignment.max_files_count || 'Unlimited'}
                    </div>
                    <div>
                      <strong>Max Size:</strong> {assignment.max_file_size_mb}MB per file
                    </div>
                    <div>
                      <strong>Late Submission:</strong> {assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}
                    </div>
                  </div>

                  {assignment.instructions && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                      <strong>Instructions:</strong>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{assignment.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grading Results Display */}
      {gradingResults && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '15px',
          borderRadius: '4px',
          maxWidth: '300px',
          zIndex: 1001
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>🤖 AI Grading Complete</strong>
            <button
              onClick={() => setGradingResults(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            {Array.isArray(gradingResults) 
              ? `${gradingResults.length} submissions graded successfully!`
              : 'Submission graded successfully!'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignment;