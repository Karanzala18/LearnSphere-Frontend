import api from './api.js';

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
    
    const response = await api.post(`/faculty/subjects/${subjectId}/quizzes`, quizData);
    
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
   * Update a quiz
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {Object} quizData - Updated quiz data
   * @returns {Promise} API response with updated quiz
   */
  updateQuiz: async (subjectId, quizId, quizData) => {
    try {
      const response = await api.put(`/faculty/subjects/${subjectId}/quizzes/${quizId}`, quizData);
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
   * Create multiple questions for a quiz in bulk
   * @param {number} subjectId - The subject ID
   * @param {number} quizId - The quiz ID
   * @param {Array} questionsData - Array of question objects
   * @returns {Promise} API response with created questions
   */
  createQuizQuestionsBulk: async (subjectId, quizId, questionsData) => {
    try {
      const response = await api.post(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/bulk`, {
        questions: questionsData
      });
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

  // Student Quiz Functions

  /**
 * Get available quizzes for a student in a subject - Enhanced version
 * @param {number} subjectId - The subject ID
 * @returns {Promise} API response with available quizzes and attempts
 */
/**
   * Get available quizzes for a student in a subject - Enhanced version
   * @param {number} subjectId - The subject ID
   * @returns {Promise} API response with available quizzes and attempts
   */
  // quizService.js (partial)
getStudentQuizzes: async (subjectId) => {
  try {
    console.log('Fetching student quizzes for subject:', subjectId);
    const response = await api.get(`/student/subjects/${subjectId}/quizzes`);
    console.log('Student quizzes response:', response.data);
    let quizzes = [];
    let attempts = [];
    if (response.data) {
      if (response.data.quizzes) quizzes = response.data.quizzes;
      else if (Array.isArray(response.data)) quizzes = response.data;
      if (response.data.attempts) attempts = response.data.attempts;
    }
    return { quizzes, attempts, data: response.data };
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    throw error.response?.data || error.message;
  }
},


  /**
   * Enhanced start quiz attempt with better error handling and end_time
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with quiz attempt data including end_time
   */
  // quizService.js (partial update to startQuizAttempt)
startQuizAttempt: async (quizId) => {
  try {
    console.log('Starting quiz attempt for quiz ID:', quizId);
    
    const response = await api.post(`/student/quizzes/${quizId}/start`, {}, {
      headers: { 'Accept': 'application/json' }
    });
    
    console.log('Start quiz attempt response:', response);
    console.log('Response data:', response.data);
    
    let attemptData = null;
    
    if (response.data) {
      if (response.data.attempt) {
        attemptData = {
          attempt_id: response.data.attempt.id,
          end_time: response.data.attempt.end_time,
          ...response.data.attempt
        };
      } else if (response.data.attempt_id || response.data.id) {
        attemptData = {
          attempt_id: response.data.attempt_id || response.data.id,
          end_time: response.data.end_time,
          ...response.data
        };
      } else if (response.data.data && (response.data.data.attempt_id || response.data.data.id)) {
        attemptData = {
          attempt_id: response.data.data.attempt_id || response.data.data.id,
          end_time: response.data.data.end_time,
          ...response.data.data
        };
      } else {
        console.warn('Unexpected response structure:', response.data);
        attemptData = response.data;
      }
    }
    
    if (!attemptData || !attemptData.attempt_id) {
      throw new Error('Invalid response structure from server');
    }
    
    if (!attemptData.end_time) {
      console.warn('End time not found in response, using fallback duration');
      const now = new Date();
      const durationMinutes = response.data.duration_minutes || 60;
      attemptData.end_time = new Date(now.getTime() + durationMinutes * 60000).toISOString();
    }
    
    console.log('Processed attempt data:', attemptData);
    
    return attemptData;
    
  } catch (error) {
    console.error('Start quiz attempt error details:', {
      message: error.message,
      response: error.response,
      responseData: error.response?.data,
      status: error.response?.status,
      details: error.response?.data?.message || 'No additional details'
    });
    
    let errorMessage = 'Failed to start quiz attempt';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 409:
          errorMessage = 'You have already attempted this quiz';
          break;
        case 403:
          errorMessage = data.message || 'Quiz not available or access denied';
          break;
        case 404:
          errorMessage = 'Quiz not found';
          break;
        case 422:
          errorMessage = 'Invalid quiz data';
          break;
        case 500:
          errorMessage = `Server error: ${data.message || 'Internal server error'}`;
          break;
        default:
          errorMessage = data.message || `Server error: ${status}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
},

  /**
   * Fetch quiz questions for an active attempt
   * @param {number} attemptId - The quiz attempt ID
   * @returns {Promise} API response with quiz questions and details
   */
  fetchQuizQuestions: async (attemptId) => {
    try {
      console.log('Fetching quiz questions for attemptId:', attemptId);
      const response = await api.get(`/student/quiz-attempts/${attemptId}/questions`);
      console.log('Fetch quiz questions response:', response.data);
      
      // Validate and log end_time
      if (response.data.end_time) {
        const endTime = new Date(response.data.end_time);
        console.log('Received end_time:', endTime.toISOString());
        if (isNaN(endTime.getTime())) {
          console.warn('Invalid end_time format, using fallback');
          response.data.end_time = new Date().toISOString(); // Fallback
        }
      } else {
        console.warn('No end_time in response, using fallback');
        response.data.end_time = new Date(Date.now() + 3600000).toISOString(); // Default 1 hour
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Submit a quiz attempt with answers
   * @param {number} attemptId - The quiz attempt ID
   * @param {Array} answers - Array of student's answers
   * @param {Object} headers - Additional headers (e.g., X-Timer-Expired)
   * @returns {Promise} API response with submission result
   */
  submitQuizAttempt: async (attemptId, answers, headers = {}) => {
    try {
      console.log('Submitting quiz attempt for attemptId:', attemptId, 'with answers:', answers, 'headers:', headers);
      const response = await api.post(`/student/quiz-attempts/${attemptId}/submit`, { answers }, { headers });
      console.log('Submit quiz attempt response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Submit quiz attempt error details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get quiz attempt result
   * @param {number} attemptId - The quiz attempt ID
   * @returns {Promise} API response with quiz result and answers
   */
  getQuizResult: async (attemptId) => {
    try {
      const response = await api.get(`/student/quiz-attempts/${attemptId}/result`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
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

  // Validate datetime format
  if (quizData.start_time && isNaN(Date.parse(quizData.start_time))) {
    errors.push('Start time has invalid format');
  }

  if (quizData.end_time && isNaN(Date.parse(quizData.end_time))) {
    errors.push('End time has invalid format');
  }

  if (quizData.start_time && quizData.end_time && new Date(quizData.start_time) >= new Date(quizData.end_time)) {
    errors.push('End time must be after start time');
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
   * Format quiz data for display
   * @param {Object} quiz - Raw quiz data from API
   * @returns {Object} Formatted quiz data
   */
  formatQuizForDisplay: (quiz) => {
    return {
      ...quiz,
      start_time: new Date(quiz.start_time),
      end_time: new Date(quiz.end_time),
      duration_formatted: `${quiz.duration_minutes} minutes`,
      status: quiz.is_active ? 'Active' : 'Inactive',
      questions_count: quiz.question_count || quiz.questions?.length || 0
    };
  },

  /**
   * Validate student answers before submission
   * @param {Array} answers - Array of student answers
   * @returns {Object} Validation result
   */
  validateStudentAnswers: (answers) => {
    const errors = [];

    if (!Array.isArray(answers) || answers.length === 0) {
      errors.push('Answers array is required and cannot be empty');
      return { isValid: false, errors };
    }

    answers.forEach((answer, index) => {
      if (!answer.question_id) {
        errors.push(`Answer ${index + 1}: Question ID is required`);
      }

      // For multiple choice and true/false questions, selected_option_id should be provided
      if (answer.question_type === 'multiple_choice' || answer.question_type === 'true_false') {
        if (!answer.selected_option_id) {
          errors.push(`Answer ${index + 1}: Selected option is required for this question type`);
        }
      }

      // For short answer questions, answer_text should be provided
      if (answer.question_type === 'short_answer') {
        if (!answer.answer_text || !answer.answer_text.trim()) {
          errors.push(`Answer ${index + 1}: Answer text is required for short answer questions`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format student answers for submission
   * @param {Array} answers - Raw answers from form
   * @returns {Array} Formatted answers for API submission
   */
  formatAnswersForSubmission: (answers) => {
    return answers.map(answer => {
      const formatted = {
        question_id: answer.question_id
      };

      // Add selected_option_id for multiple choice and true/false
      if (answer.selected_option_id) {
        formatted.selected_option_id = answer.selected_option_id;
      }

      // Add answer_text for short answer or if provided
      if (answer.answer_text && answer.answer_text.trim()) {
        formatted.answer_text = answer.answer_text.trim();
      }

      return formatted;
    });
  },

  /**
   * Calculate quiz progress percentage
   * @param {number} answeredQuestions - Number of answered questions
   * @param {number} totalQuestions - Total number of questions
   * @returns {number} Progress percentage
   */
  calculateProgress: (answeredQuestions, totalQuestions) => {
    if (totalQuestions === 0) return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  },

  /**
   * Format quiz result for display
   * @param {Object} result - Raw result from API
   * @returns {Object} Formatted result data
   */
  formatQuizResult: (result) => {
    const percentage = result.percentage || 
      (result.total_marks > 0 ? Math.round((result.marks_obtained / result.total_marks) * 100) : 0);
    
    return {
      ...result,
      percentage,
      grade: getGrade(percentage),
      passed: percentage >= 50, // Assuming 50% is passing grade
      correctAnswers: result.answers?.filter(a => a.is_correct).length || 0,
      totalQuestions: result.answers?.length || 0
    };
  },

  /**
   * Check if quiz attempt is still valid (not expired)
   * @param {Object} attempt - Quiz attempt object
   * @param {number} durationMinutes - Quiz duration in minutes
   * @returns {Object} Validity status
   */
  /**
   * Check if quiz is currently active and available for students
   * @param {Object} quiz - Quiz object
   * @returns {Boolean} Whether quiz is currently available
   */
  isQuizAvailable: (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    return quiz.is_active && now >= startTime && now <= endTime;
  },

  // Add these functions to your quizService object

/**
 * Get quiz attempt history for a student
 * @param {number} subjectId - The subject ID
 * @returns {Promise} API response with quiz attempts
 */
/**
 * Get quiz attempt history for a student - Enhanced version
 * @param {number} subjectId - The subject ID
 * @returns {Promise} API response with quiz attempts
 */
/**
 * Get quiz attempt history for a student - Enhanced version with better error handling
 * @param {number} subjectId - The subject ID
 * @returns {Promise} API response with quiz attempts
 */
getStudentQuizAttempts: async (subjectId) => {
  try {
    console.log('Fetching quiz attempts for subject:', subjectId);
    const response = await api.get(`/student/subjects/${subjectId}/quiz-attempts`);
    
    console.log('Quiz attempts response:', response.data);
    
    // Handle different response structures
    let attempts = [];
    if (response.data) {
      if (response.data.attempts) {
        attempts = response.data.attempts;
      } else if (Array.isArray(response.data)) {
        attempts = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        attempts = response.data.data;
      }
    }
    
    console.log('Processed attempts:', attempts);
    return { attempts };
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    // Return empty array if endpoint doesn't exist or fails
    return { attempts: [] };
  }
},

/**
 * Enhanced calculate quiz statistics
 * @param {Array} quizzes - Array of quizzes
 * @param {Array} attempts - Array of quiz attempts
 * @returns {Object} Quiz statistics
 */
calculateQuizStats: (quizzes, attempts = []) => {
  const now = new Date();
  
  const stats = {
    total: quizzes.length,
    available: 0,
    completed: 0,
    missed: 0
  };
  
  quizzes.forEach(quiz => {
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);
    const isActive = quiz.is_active;
    
    // Check if student has attempted this quiz
    const hasAttempted = attempts.some(attempt => 
      attempt.quiz_id === quiz.id || attempt.quiz_id == quiz.id
    );
    
    if (hasAttempted) {
      stats.completed++;
    } else if (isActive && now >= startTime && now <= endTime) {
      stats.available++;
    } else if (now > endTime) {
      stats.missed++;
    }
  });
  
  return stats;
},

/**
 * Enhanced quiz status checker that considers attempts
 * @param {Object} quiz - Quiz object
 * @param {Array} attempts - Array of quiz attempts
 * @returns {Object} Quiz status information
 */
getQuizStatus: (quiz, attempts = []) => {
  const now = new Date();
  const startTime = new Date(quiz.start_time);
  const endTime = new Date(quiz.end_time);
  
  // Check if student has attempted this quiz - more robust checking
  const hasAttempted = attempts.some(attempt => {
    return (attempt.quiz_id === quiz.id || 
            attempt.quiz_id == quiz.id || 
            (attempt.quiz && (attempt.quiz.id === quiz.id || attempt.quiz.id == quiz.id)));
  });
  
  console.log(`Quiz ${quiz.id} status check:`, {
    hasAttempted,
    isActive: quiz.is_active,
    now: now.toISOString(),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    attempts: attempts.map(a => ({ id: a.id, quiz_id: a.quiz_id }))
  });
  
  if (hasAttempted) {
    return {
      status: 'Completed',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      icon: 'CheckCircle'
    };
  } else if (!quiz.is_active) {
    return {
      status: 'Inactive',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      icon: 'XCircle'
    };
  } else if (now < startTime) {
    return {
      status: 'Upcoming',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      icon: 'Clock'
    };
  } else if (now > endTime) {
    return {
      status: 'Missed',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      icon: 'XCircle'
    };
  } else {
    return {
      status: 'Available',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      icon: 'Play'
    };
  }
},


/**
 * Check if student has already attempted a quiz - Enhanced version
 * @param {number} quizId - Quiz ID
 * @param {Array} attempts - Array of quiz attempts
 * @returns {Boolean} Whether quiz has been attempted
 */
hasAttemptedQuiz: (quizId, attempts = []) => {
  const attempted = attempts.some(attempt => {
    return (attempt.quiz_id === quizId || 
            attempt.quiz_id == quizId || 
            (attempt.quiz && (attempt.quiz.id === quizId || attempt.quiz.id == quizId)));
  });
  
  console.log(`Checking if quiz ${quizId} has been attempted:`, {
    attempted,
    attempts: attempts.map(a => ({ id: a.id, quiz_id: a.quiz_id }))
  });
  
  return attempted;
},

/**
 * Get specific quiz attempt by quiz ID
 * @param {number} quizId - Quiz ID
 * @param {Array} attempts - Array of quiz attempts
 * @returns {Object|null} Quiz attempt object or null
 */
getQuizAttempt: (quizId, attempts = []) => {
  return attempts.find(attempt => 
    attempt.quiz_id === quizId || attempt.quiz_id == quizId
  ) || null;
},

  /**
   * Calculate remaining time for a quiz with timezone adjustment
   * @param {Object} quiz - Quiz object
   * @returns {Object} Remaining time information
   */
  getQuizTimeRemaining: (quiz) => {
    const now = new Date(); // Local time (IST if client is set to IST)
    const endTime = new Date(quiz.end_time);
    // Adjust for IST offset if server returns UTC
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const serverNow = new Date(Date.now() - istOffset); // Approximate server UTC time
    const adjustedEndTime = new Date(endTime.getTime() + istOffset); // Convert UTC end_time to IST

    console.log('Time calculation:', {
      clientNow: now.toISOString(),
      serverNow: serverNow.toISOString(),
      endTimeUTC: endTime.toISOString(),
      adjustedEndTime: adjustedEndTime.toISOString(),
      timeDiff: adjustedEndTime - now
    });

    const timeDiff = adjustedEndTime - now;

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
  }
};

// Helper function for grading
const getGrade = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  if (percentage >= 50) return 'E';
  return 'F';
};

export default quizService;