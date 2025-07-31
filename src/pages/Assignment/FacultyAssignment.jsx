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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

      {/* Create Assignment Button */}
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

      {/* Create/Edit Form */}
      {showCreateForm && (
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
                  <div style={{ display: 'flex', gap: '10px' }}>
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
    </div>
  );
};

export default FacultyAssignment;