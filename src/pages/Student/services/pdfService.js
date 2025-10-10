import api from '../../../services/api';

const pdfService = {
  // ========================================
  // PDF Upload & Management
  // ========================================

  /**
   * Upload a PDF file for AI processing
   * @param {File} pdfFile - The PDF file to upload
   * @returns {Promise} Response with uploaded PDF data
   */
  uploadPdf: async (pdfFile) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const response = await api.post('/student/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get all uploaded PDFs for the authenticated student
   * @returns {Promise} Response with list of PDFs
   */
  getPdfs: async () => {
    try {
      const response = await api.get('/student/pdfs');
      console.log('Raw Axios Response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getPdfs service:', error);
      throw error;
    }
  },

  /**
   * Get details of a specific PDF including summary, flashcards, and quizzes
   * @param {number} pdfId - The PDF ID
   * @returns {Promise} Response with PDF details
   */
  getPdfById: async (pdfId) => {
    const response = await api.get(`/student/pdfs/${pdfId}`);
    return response.data;
  },

  // ========================================
  // PDF Quiz Attempts
  // ========================================

  /**
   * Start or continue a PDF-generated quiz
   * @param {number} quizId - The quiz ID
   * @returns {Promise} Response with quiz data and attempt info
   */
  startPdfQuiz: async (quizId) => {
    const response = await api.get(`/student/pdf-quizzes/${quizId}/start`);
    return response.data;
  },

  /**
   * Submit a PDF quiz attempt with answers
   * @param {number} quizId - The quiz ID
   * @param {Object} answers - Object with question IDs as keys and selected option IDs as values
   * @returns {Promise} Response with score and attempt details
   * @example
   * submitPdfQuiz(1, { 
   *   5: 20,  // question_id: option_id
   *   6: 24,
   *   7: 28
   * })
   */
  submitPdfQuiz: async (quizId, answers) => {
    const response = await api.post(`/student/pdf-quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  },

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Check if PDF processing is complete
   * @param {number} pdfId - The PDF ID
   * @returns {Promise<Object>} Object with status, isComplete, isFailed, isPending, isProcessing, and error
   */
  checkPdfStatus: async (pdfId) => {
    try {
      const response = await api.get(`/student/pdfs/${pdfId}`);
      const pdf = response.data.data;
      const status = pdf.processing_status;
      
      return {
        status: status,
        isPending: status === 'pending',
        isProcessing: status === 'processing',
        isComplete: status === 'completed',
        isFailed: status === 'failed',
        error: pdf.error_message || null,
        data: pdf,
      };
    } catch (error) {
      console.error('Error checking PDF status:', error);
      return {
        status: 'error',
        isPending: false,
        isProcessing: false,
        isComplete: false,
        isFailed: true,
        error: error.message,
        data: null,
      };
    }
  },

  /**
   * Poll PDF processing status until complete
   * @param {number} pdfId - The PDF ID
   * @param {number} maxAttempts - Maximum polling attempts (default: 30)
   * @param {number} interval - Interval between polls in ms (default: 2000)
   * @param {Function} onProgress - Optional callback for progress updates
   * @returns {Promise} Response with completed PDF data or error
   */
  waitForPdfProcessing: async (pdfId, maxAttempts = 30, interval = 2000, onProgress = null) => {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await api.get(`/student/pdfs/${pdfId}`);
          const pdf = response.data.data;

          // Call progress callback if provided
          if (onProgress) {
            onProgress({
              attempt: attempts + 1,
              maxAttempts,
              status: pdf.processing_status,
            });
          }

          if (pdf.processing_status === 'completed') {
            resolve(response.data);
          } else if (pdf.processing_status === 'failed') {
            reject(new Error(pdf.error_message || 'PDF processing failed'));
          } else if (attempts >= maxAttempts) {
            reject(new Error('PDF processing timeout. Please try again later.'));
          } else {
            attempts++;
            setTimeout(checkStatus, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  },

  /**
   * Get flashcards from a PDF
   * @param {number} pdfId - The PDF ID
   * @returns {Promise} Response with flashcards array
   */
  getFlashcards: async (pdfId) => {
    const response = await api.get(`/student/pdfs/${pdfId}`);
    return response.data.data.flashcards || [];
  },

  /**
   * Get summary from a PDF
   * @param {number} pdfId - The PDF ID
   * @returns {Promise} Response with summary data
   */
  getSummary: async (pdfId) => {
    const response = await api.get(`/student/pdfs/${pdfId}`);
    return response.data.data.summary || null;
  },

  /**
   * Get generated quizzes from a PDF
   * @param {number} pdfId - The PDF ID
   * @returns {Promise} Response with quizzes array
   */
  getGeneratedQuizzes: async (pdfId) => {
    const response = await api.get(`/student/pdfs/${pdfId}`);
    return response.data.data.generated_quizzes || [];
  },

  /**
   * Calculate quiz percentage
   * @param {number} obtained - Marks obtained
   * @param {number} total - Total marks
   * @returns {number} Percentage rounded to 2 decimals
   */
  calculatePercentage: (obtained, total) => {
    if (total === 0) return 0;
    return Math.round((obtained / total) * 100 * 100) / 100;
  },

  /**
   * Format file size from KB
   * @param {number} sizeKb - Size in kilobytes
   * @returns {string} Formatted size string
   */
  formatFileSize: (sizeKb) => {
    if (sizeKb < 1024) {
      return `${sizeKb.toFixed(2)} KB`;
    }
    return `${(sizeKb / 1024).toFixed(2)} MB`;
  },

  /**
   * Validate PDF file before upload
   * @param {File} file - The file to validate
   * @param {number} maxSizeMB - Maximum size in MB (default: 10)
   * @returns {Object} Validation result with isValid and error message
   */
  validatePdfFile: (file, maxSizeMB = 10) => {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'File must be a PDF' };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        isValid: false, 
        error: `File size must be less than ${maxSizeMB}MB` 
      };
    }

    return { isValid: true, error: null };
  },

  /**
   * Get status badge info for UI display
   * @param {string} status - Processing status
   * @returns {Object} Badge configuration with color, text, and icon
   */
  getStatusBadge: (status) => {
    const badges = {
      pending: {
        color: 'gray',
        text: 'Pending',
        icon: '⏳',
        description: 'Waiting to be processed'
      },
      processing: {
        color: 'blue',
        text: 'Processing',
        icon: '⚙️',
        description: 'AI is analyzing the document'
      },
      completed: {
        color: 'green',
        text: 'Completed',
        icon: '✅',
        description: 'Ready to use'
      },
      failed: {
        color: 'red',
        text: 'Failed',
        icon: '❌',
        description: 'Processing failed'
      }
    };

    return badges[status] || badges.pending;
  },
};

export default pdfService;