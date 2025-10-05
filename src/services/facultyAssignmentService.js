import api from './api.js';

class FacultyAssignmentService {
  // Get all assignments for a specific subject
  async getAssignments(subjectId) {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/assignments`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new assignment for a subject
  async createAssignment(subjectId, assignmentData) {
    try {
      // Clean the data before sending
      const cleanedData = this.cleanAssignmentData(assignmentData);
      const response = await api.post(`/faculty/subjects/${subjectId}/assignments`, cleanedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a specific assignment by ID
  async getAssignment(assignmentId) {
    try {
      const response = await api.get(`/faculty/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an existing assignment
  async updateAssignment(assignmentId, assignmentData) {
    try {
      // Clean the data before sending
      const cleanedData = this.cleanAssignmentData(assignmentData);
      const response = await api.put(`/faculty/assignments/${assignmentId}`, cleanedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete an assignment
  async deleteAssignment(assignmentId) {
    try {
      const response = await api.delete(`/faculty/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Toggle assignment active status
  async toggleAssignmentStatus(assignmentId, isActive) {
    try {
      const response = await api.put(`/faculty/assignments/${assignmentId}`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all submissions for a specific assignment
  async getAssignmentSubmissions(assignmentId) {
    try {
      const response = await api.get(`/faculty/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a specific student's submission for an assignment
  async getStudentSubmission(assignmentId, studentId) {
    try {
      const response = await api.get(`/faculty/assignments/${assignmentId}/students/${studentId}/submission`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download assignment submission file
  async downloadSubmissionFile(assignmentId, studentId, fileId) {
    try {
      const response = await api.get(`/faculty/assignments/${assignmentId}/submissions/${studentId}/files/${fileId}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Grade assignment submission with AI
  async gradeWithAI(assignmentId, studentId) {
    try {
      const response = await api.post(`/faculty/assignments/${assignmentId}/submissions/${studentId}/ai-grade`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add these methods to your service class:

// Manual grading
async gradeSubmission(assignmentId, studentId, gradeData) {
  try {
    const response = await api.post(
      `/faculty/assignments/${assignmentId}/submissions/${studentId}/manual-grade`, 
      gradeData
    );
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}
// Get assignment statistics
async getAssignmentStats(assignmentId) {
  try {
    const response = await api.get(`/faculty/assignments/${assignmentId}/stats`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

  // Helper method to clean assignment data before sending
  cleanAssignmentData(data) {
    const cleaned = { ...data };
    
    // If late submission is not allowed, remove or set late_penalty_percent to null
    if (!cleaned.allow_late_submission) {
      cleaned.late_penalty_percent = null;
    } else {
      // If late submission is allowed but no penalty is set, default to 0
      if (!cleaned.late_penalty_percent || cleaned.late_penalty_percent === '') {
        cleaned.late_penalty_percent = 0;
      } else {
        // Convert to integer
        cleaned.late_penalty_percent = parseInt(cleaned.late_penalty_percent, 10);
      }
    }
    
    // Convert other numeric fields
    if (cleaned.total_marks) cleaned.total_marks = parseInt(cleaned.total_marks, 10);
    if (cleaned.max_file_size_mb) cleaned.max_file_size_mb = parseInt(cleaned.max_file_size_mb, 10);
    if (cleaned.max_files_count) cleaned.max_files_count = parseInt(cleaned.max_files_count, 10);
    if (cleaned.total_max_size_mb) cleaned.total_max_size_mb = parseInt(cleaned.total_max_size_mb, 10);
    
    // Remove empty strings and convert to null for optional fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '') {
        if (['description', 'instructions', 'allowed_file_types'].includes(key)) {
          cleaned[key] = null;
        }
      }
    });
    
    return cleaned;
  }

  // Helper method to handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || {};
      return {
        message,
        errors,
        status: error.response.status
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error. Please check your connection.',
        errors: {},
        status: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        errors: {},
        status: null
      };
    }
  }
}

export default new FacultyAssignmentService();