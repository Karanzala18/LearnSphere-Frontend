import api from './api.js';

const timezoneUtils = {
  // Get IST offset in minutes (5 hours 30 minutes = 330 minutes)
  IST_OFFSET_MINUTES: 330,
  
  // Convert datetime-local input to UTC string for API
  localToUTC: (localDateTimeString) => {
    if (!localDateTimeString) return null;
    
    console.log('Converting local to UTC:', localDateTimeString);
    
    // Create date object from local input (browser assumes local timezone)
    const localDate = new Date(localDateTimeString);
    console.log('Local date object:', localDate);
    console.log('Local date ISO (UTC):', localDate.toISOString());
    
    // Return ISO string (automatically in UTC)
    return localDate.toISOString();
  },

  // Convert UTC datetime from API to local datetime-local format for forms
  utcToLocal: (utcDateTimeString) => {
    if (!utcDateTimeString) return '';
    
    console.log('Converting UTC to local:', utcDateTimeString);
    
    // Create date object from UTC string
    const utcDate = new Date(utcDateTimeString);
    console.log('UTC date object:', utcDate);
    
    // Get local time components (browser handles timezone conversion automatically)
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    
    const localString = `${year}-${month}-${day}T${hours}:${minutes}`;
    console.log('Converted to local string:', localString);
    
    return localString;
  },

  // NEW: Convert UTC datetime to local datetime-local input format
  utcToLocalInput: (utcDateTimeString) => {
    if (!utcDateTimeString) return '';
    
    console.log('Converting UTC to local input format:', utcDateTimeString);
    
    // Create date object from UTC string
    const utcDate = new Date(utcDateTimeString);
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.warn('Invalid date:', utcDateTimeString);
      return '';
    }
    
    // The key here is that when we use getFullYear(), getMonth(), etc. on a Date object,
    // JavaScript automatically converts to the user's local timezone
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    const hours = String(utcDate.getHours()).padStart(2, '0');
    const minutes = String(utcDate.getMinutes()).padStart(2, '0');
    
    const localInputString = `${year}-${month}-${day}T${hours}:${minutes}`;
    console.log('UTC to local input conversion:', {
      utc: utcDateTimeString,
      localInput: localInputString,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    return localInputString;
  },

  // Format UTC datetime for display in user's local timezone
  formatDateTimeForDisplay: (utcDateTimeString, options = {}) => {
    if (!utcDateTimeString) return 'Not set';
    
    try {
      const date = new Date(utcDateTimeString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Use Intl.DateTimeFormat with user's local timezone
      const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      
      // Use user's local timezone instead of forcing IST
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...defaultOptions,
        ...options
      });
      
      return formatter.format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },

  // NEW: Format date only for display
  formatDateForDisplay: (utcDateTimeString, options = {}) => {
    if (!utcDateTimeString) return 'Not set';
    
    try {
      const date = new Date(utcDateTimeString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...defaultOptions,
        ...options
      });
      
      return formatter.format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  },

  // NEW: Format time only for display
  formatTimeForDisplay: (utcDateTimeString, options = {}) => {
    if (!utcDateTimeString) return 'Not set';
    
    try {
      const date = new Date(utcDateTimeString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...defaultOptions,
        ...options
      });
      
      return formatter.format(date);
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Invalid time';
    }
  },

  // Check if quiz is currently available
  isQuizAvailable: (quiz) => {
    if (!quiz || !quiz.is_active || !quiz.start_time || !quiz.end_time) {
      return false;
    }
    
    const now = new Date(); // Current time in UTC
    const startTime = new Date(quiz.start_time); // UTC from database
    const endTime = new Date(quiz.end_time); // UTC from database
    
    console.log('Quiz availability check:', {
      now: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isAvailable: now >= startTime && now <= endTime
    });
    
    return now >= startTime && now <= endTime;
  },

  // Calculate remaining time for a quiz
  getQuizTimeRemaining: (quiz) => {
    if (!quiz || !quiz.end_time) {
      return { expired: true, remaining: 0, formatted: '0s' };
    }

    const now = new Date(); // Current time in UTC
    const endTime = new Date(quiz.end_time); // UTC from database
    const timeDiff = endTime - now;

    console.log('Time remaining calculation:', {
      now: now.toISOString(),
      endTime: endTime.toISOString(),
      timeDiff: timeDiff
    });

    if (timeDiff <= 0) {
      return { expired: true, remaining: 0, formatted: '0s' };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      expired: false,
      remaining: timeDiff,
      formatted: `${hours}h ${minutes}m ${seconds}s`,
      hours,
      minutes,
      seconds
    };
  },

  // NEW: Get user's timezone
  getUserTimezone: () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // NEW: Get timezone display name
  getTimezoneDisplayName: () => {
    const timezone = timezoneUtils.getUserTimezone();
    const now = new Date();
    
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'long'
      });
      
      const parts = formatter.formatToParts(now);
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');
      
      return timeZonePart ? timeZonePart.value : timezone;
    } catch (error) {
      return timezone;
    }
  }
};

const quizService = {
  // Faculty Quiz Management
  
  /**
   * Get all quizzes for a specific subject
   * @param {number} subjectId - The subject ID
   * @returns {Promise} API response with quizzes array
   */
  getQuizzes: async (subjectId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/quizzes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new quiz for a subject
   * @param {number} subjectId - The subject ID
   * @param {Object} quizData - Quiz data object
   * @returns {Promise} API response with created quiz
   */
  createQuiz: async (subjectId, quizData) => {
    try {
      console.log('Creating quiz with data:', quizData);
      console.log('Subject ID:', subjectId);
      
      // Convert local datetime to UTC before sending to API
      const processedQuizData = {
        ...quizData,
        start_time: timezoneUtils.localToUTC(quizData.start_time),
        end_time: timezoneUtils.localToUTC(quizData.end_time)
      };
      
      console.log('Processed quiz data with UTC times:', processedQuizData);
      
      const response = await api.post(`/faculty/subjects/${subjectId}/quizzes`, processedQuizData);
      
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // More flexible response handling - check different possible response structures
      let quizId = null;
      
      if (response.data) {
        // Check various possible response structures
        if (response.data.quiz && response.data.quiz.id) {
          quizId = response.data.quiz.id;
        } else if (response.data.id) {
          quizId = response.data.id;
        } else if (response.data.data && response.data.data.id) {
          quizId = response.data.data.id;
        } else if (response.data.quiz_id) {
          quizId = response.data.quiz_id;
        }
      }
      
      console.log('Extracted quiz ID:', quizId);
      
      // If we still don't have a quiz ID, but got a successful response, return what we have
      if (!quizId) {
        console.warn('Quiz ID not found in response, but request was successful');
        // Return response data as-is and let the calling code handle it
        return response.data;
      }
      
      // Ensure the response has the expected structure
      return {
        quiz: {
          id: quizId,
          ...response.data.quiz || response.data
        },
        ...response.data
      };
      
    } catch (error) {
      console.error('Quiz creation error details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Better error message extraction
      let errorMessage = 'Failed to create quiz';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
          }
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Update a quiz
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {Object} quizData - Updated quiz data
   * @returns {Promise} API response with updated quiz
   */
  updateQuiz: async (subjectId, quizId, quizData) => {
    try {
      // Convert local datetime to UTC before sending to API
      const processedQuizData = {
        ...quizData,
        start_time: quizData.start_time ? timezoneUtils.localToUTC(quizData.start_time) : quizData.start_time,
        end_time: quizData.end_time ? timezoneUtils.localToUTC(quizData.end_time) : quizData.end_time
      };
      
      console.log('Updating quiz with UTC times:', processedQuizData);
      
      const response = await api.put(`/faculty/subjects/${subjectId}/quizzes/${quizId}`, processedQuizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create multiple questions for a quiz in bulk
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {Array} questionsData - Array of question objects
   * @returns {Promise} API response with created questions
   */
  createQuizQuestionsBulk: async (subjectId, quizId, questionsData) => {
    try {
      console.log('Creating questions for quiz:', quizId);
      console.log('Questions data:', questionsData);
      
      if (!quizId) {
        throw new Error('Quiz ID is required to create questions');
      }
      
      const response = await api.post(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/bulk`, {
        questions: questionsData
      });
      
      console.log('Questions creation response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Questions creation error details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to create questions';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a specific quiz with questions and options
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with quiz details
   */
  getQuiz: async (subjectId, quizId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a quiz
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response
   */
  deleteQuiz: async (subjectId, quizId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Quiz Questions Management

  /**
   * Get all questions for a quiz
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with questions array
   */
  getQuizQuestions: async (subjectId, quizId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a single question for a quiz
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {Object} questionData - Question data with options
   * @returns {Promise} API response with created question
   */
  createQuizQuestion: async (subjectId, quizId, questionData) => {
    try {
      const response = await api.post(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update a quiz question
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {number} questionId - The question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise} API response with updated question
   */
  updateQuizQuestion: async (subjectId, quizId, questionId, questionData) => {
    try {
      const response = await api.put(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a quiz question
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {number} questionId - The question ID
   * @returns {Promise} API response
   */
  deleteQuizQuestion: async (subjectId, quizId, questionId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get scorecard for a quiz - shows all enrolled students and their performance
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with scorecard data
   */
  getQuizScorecard: async (quizId) => {
    try {
      const response = await api.get(`/faculty/quizzes/${quizId}/scorecard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get detailed quiz attempt information for a specific student
   * @param {number} quizId - The quiz ID
   * @param {string} studentId - The student ID
   * @returns {Promise} API response with student's detailed quiz attempt
   */
  getStudentQuizDetails: async (quizId, studentId) => {
    try {
      const response = await api.get(`/faculty/quizzes/${quizId}/students/${studentId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Calculate grade based on percentage
   * @param {number} percentage - The percentage score
   * @returns {Object} Grade information
   */
  calculateGrade: (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-400' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-400' };
    if (percentage >= 40) return { grade: 'C', color: 'text-yellow-400' };
    if (percentage >= 33) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  },

  /**
   * Get statistics from scorecard data
   * @param {Array} scorecardData - Array of student scorecard entries
   * @returns {Object} Statistics object
   */
  getQuizStatistics: (scorecardData) => {
    const attempted = scorecardData.filter(student => student.attempted);
    const notAttempted = scorecardData.filter(student => !student.attempted);
    
    if (attempted.length === 0) {
      return {
        totalStudents: scorecardData.length,
        attemptedCount: 0,
        notAttemptedCount: notAttempted.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      };
    }
    
    const scores = attempted.map(student => student.percentage || 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passedStudents = attempted.filter(student => (student.percentage || 0) >= 40);
    const passRate = (passedStudents.length / attempted.length) * 100;
    
    return {
      totalStudents: scorecardData.length,
      attemptedCount: attempted.length,
      notAttemptedCount: notAttempted.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      passRate: Math.round(passRate * 100) / 100
    };
  },

  // Utility Functions

  /**
   * Validate quiz data before submission
   * @param {Object} quizData - Quiz data to validate
   * @returns {Object} Validation result
   */
  validateQuizData: (quizData) => {
    const errors = [];

    if (!quizData.title?.trim()) {
      errors.push('Quiz title is required');
    }

    if (!quizData.total_marks || isNaN(quizData.total_marks) || parseInt(quizData.total_marks) <= 0) {
      errors.push('Total marks must be a valid number greater than 0');
    }

    if (!quizData.duration_minutes || isNaN(quizData.duration_minutes) || parseInt(quizData.duration_minutes) <= 0) {
      errors.push('Duration must be a valid number greater than 0');
    }

    if (!quizData.start_time) {
      errors.push('Start time is required');
    }

    if (!quizData.end_time) {
      errors.push('End time is required');
    }

    // Validate datetime format - check both local format and UTC format
    if (quizData.start_time) {
      const startDate = new Date(quizData.start_time);
      if (isNaN(startDate.getTime())) {
        errors.push('Start time has invalid format');
      }
    }

    if (quizData.end_time) {
      const endDate = new Date(quizData.end_time);
      if (isNaN(endDate.getTime())) {
        errors.push('End time has invalid format');
      }
    }

    // Compare times in UTC
    if (quizData.start_time && quizData.end_time) {
      const startUTC = timezoneUtils.localToUTC(quizData.start_time);
      const endUTC = timezoneUtils.localToUTC(quizData.end_time);
      
      if (startUTC && endUTC && new Date(startUTC) >= new Date(endUTC)) {
        errors.push('End time must be after start time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate question data before submission
   * @param {Object} questionData - Question data to validate
   * @returns {Object} Validation result
   */
  validateQuestionData: (questionData) => {
    const errors = [];

    if (!questionData.question_text?.trim()) {
      errors.push('Question text is required');
    }

    if (!['multiple_choice', 'true_false', 'short_answer'].includes(questionData.question_type)) {
      errors.push('Valid question type is required');
    }

    if (!questionData.marks || isNaN(questionData.marks) || parseInt(questionData.marks) <= 0) {
      errors.push('Marks must be a valid number greater than 0');
    }

    // Validate options for multiple choice and true/false questions
    if (['multiple_choice', 'true_false'].includes(questionData.question_type)) {
      if (!questionData.options || questionData.options.length === 0) {
        errors.push('Options are required for this question type');
      } else {
        const hasCorrectAnswer = questionData.options.some(option => option.is_correct === true);
        if (!hasCorrectAnswer) {
          errors.push('At least one correct answer must be specified');
        }

        let validOptionsCount = 0;
        questionData.options.forEach((option, index) => {
          if (option.option_text?.trim()) {
            validOptionsCount++;
          } else {
            errors.push(`Option ${index + 1} text is required`);
          }
        });

        if (questionData.question_type === 'multiple_choice' && validOptionsCount < 2) {
          errors.push('Multiple choice questions need at least 2 valid options');
        }

        if (questionData.question_type === 'true_false' && validOptionsCount !== 2) {
          errors.push('True/False questions need exactly 2 options');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Check if quiz is currently active and available for students
   * @param {Object} quiz - Quiz object
   * @returns {Boolean} Whether quiz is currently available
   */
  isQuizAvailable: timezoneUtils.isQuizAvailable,

  /**
   * Calculate remaining time for a quiz with timezone adjustment
   * @param {Object} quiz - Quiz object
   * @returns {Object} Remaining time information
   */
  getQuizTimeRemaining: timezoneUtils.getQuizTimeRemaining,

  // Helper methods for timezone conversion
  timezoneUtils: timezoneUtils
};

export { timezoneUtils };
export default quizService;