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
   * Get available quizzes for a student in a subject
   * @param {number} subjectId - The subject ID
   * @returns {Promise} API response with available quizzes
   */
  getStudentQuizzes: async (subjectId) => {
    try {
      const response = await api.get(`/student/subjects/${subjectId}/quizzes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Start a quiz attempt for a student
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with quiz attempt data
   */
  startQuizAttempt: async (quizId) => {
    try {
      const response = await api.post(`/student/quizzes/${quizId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Fetch quiz questions for an active attempt
   * @param {number} attemptId - The quiz attempt ID
   * @returns {Promise} API response with quiz questions and details
   */
  fetchQuizQuestions: async (attemptId) => {
    try {
      const response = await api.get(`/student/quiz-attempts/${attemptId}/questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Submit a quiz attempt with answers
   * @param {number} attemptId - The quiz attempt ID
   * @param {Array} answers - Array of student's answers
   * @returns {Promise} API response with submission result
   */
  submitQuizAttempt: async (attemptId, answers) => {
    try {
      const response = await api.post(`/student/quiz-attempts/${attemptId}/submit`, { answers });
      return response.data;
    } catch (error) {
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

  /**
   * Calculate remaining time for a quiz
   * @param {Object} quiz - Quiz object
   * @returns {Object} Remaining time information
   */
  getQuizTimeRemaining: (quiz) => {
    const now = new Date();
    const endTime = new Date(quiz.end_time);
    const timeDiff = endTime - now;

    if (timeDiff <= 0) {
      return { expired: true, remaining: 0 };
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