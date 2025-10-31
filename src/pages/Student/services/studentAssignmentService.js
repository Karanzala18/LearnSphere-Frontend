import api from '../../../services/api.js';

const studentAssignmentService = {
  // Get all assignments for enrolled subjects
  getAllAssignments: async () => {
    try {
      const response = await api.get('/student/assignments');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get upcoming assignments
  getUpcomingAssignments: async () => {
    try {
      const response = await api.get('/student/assignments/upcoming');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get past due assignments
  getPastDueAssignments: async () => {
    try {
      const response = await api.get('/student/assignments/past-due');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific assignment details
  getAssignment: async (assignmentId) => {
    try {
      const response = await api.get(`/student/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get assignment submission
  getAssignmentSubmission: async (assignmentId) => {
    try {
      const response = await api.get(`/student/assignments/${assignmentId}/submission`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add submission notes if provided
      if (submissionData.submission_notes) {
        formData.append('submission_notes', submissionData.submission_notes);
      }
      
      // Add files if provided
      if (submissionData.files && submissionData.files.length > 0) {
        submissionData.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      }

      const response = await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete assignment submission
  deleteAssignmentSubmission: async (assignmentId, submissionId) => {
    try {
      const response = await api.delete(`/student/assignments/${assignmentId}/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to format assignment data for display
  formatAssignmentData: (assignment) => {
    return {
      ...assignment,
      due_date_formatted: new Date(assignment.due_date).toLocaleDateString(),
      due_time_formatted: new Date(assignment.due_date).toLocaleTimeString(),
      is_overdue: new Date(assignment.due_date) < new Date(),
      days_until_due: Math.ceil((new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
    };
  },

  // Helper function to validate file before upload
  validateFile: (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }
    
    return {
      isValid: true,
      error: null,
    };
  },

  // Helper function to validate multiple files
  validateFiles: (files, maxSizeMB = 10) => {
    const errors = [];
    
    files.forEach((file, index) => {
      const validation = studentAssignmentService.validateFile(file, maxSizeMB);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Helper function to get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  // Helper function to format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to check if assignment is submittable
  isSubmittable: (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    
    // Since the assignment is coming from active() scope in Laravel, 
    // it's already filtered as active. Check other conditions.
    const isActive = assignment.is_active !== false && assignment.status !== 'inactive';
    const isBeforeDueDate = now <= dueDate;
    const allowLateSubmissions = assignment.allow_late_submissions === true || assignment.allow_late_submissions === 1;
    
    return {
      canSubmit: isActive && (allowLateSubmissions || isBeforeDueDate),
      isLate: now > dueDate,
      reason: !isActive 
        ? 'Assignment is not active' 
        : (!allowLateSubmissions && now > dueDate)
        ? 'Assignment is past due and late submissions are not allowed'
        : null,
    };
  },

  // Get assignment statistics for student dashboard
  getAssignmentStats: async () => {
    try {
      const [all, upcoming, pastDue] = await Promise.all([
        studentAssignmentService.getAllAssignments(),
        studentAssignmentService.getUpcomingAssignments(),
        studentAssignmentService.getPastDueAssignments(),
      ]);

      return {
        total: all.length,
        upcoming: upcoming.length,
        pastDue: pastDue.length,
        completed: all.filter(assignment => assignment.submission_status === 'submitted').length,
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete assignment submission (all files + submission record)
  deleteAssignmentSubmission: async (assignmentId, submissionId) => {
    try {
      const response = await api.delete(`/student/assignments/${assignmentId}/submission/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download assignment file
  downloadAssignmentFile: async (assignmentId, fileId) => {
    try {
      const response = await api.get(`/student/assignments/${assignmentId}/files/${fileId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete single assignment file
  deleteAssignmentFile: async (assignmentId, fileId) => {
    try {
      const response = await api.delete(`/student/assignments/${assignmentId}/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to handle file download

   handleFileDownload: (response, defaultFileName = 'download') => {
    // Get the content type from response headers
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    // Create blob with correct content type
    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    const link = document.createElement('a');
    link.href = url;
    
    // Try to get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let fileName = defaultFileName;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default studentAssignmentService;