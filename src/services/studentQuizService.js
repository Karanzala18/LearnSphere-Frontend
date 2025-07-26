import api from './api.js';

/**
 * Student Quiz Service
 * Handles all quiz-related operations for students
 */
class StudentQuizService {
  /**
   * Get list of available quizzes for a subject
   * @param {number} subjectId - The subject ID
   * @returns {Promise} API response with quizzes data
   */
  async getQuizzes(subjectId) {
    try {
      const response = await api.get(`/student/subjects/${subjectId}/quizzes`);
      console.log('getQuizzes API response:', response);
      
      return {
        success: true,
        data: response.data,
        quizzes: response.data.quizzes || response.data || []
      };
    } catch (error) {
      console.error('getQuizzes error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quizzes',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Start a quiz attempt
   * @param {number} quizId - The quiz ID
   * @returns {Promise} API response with attempt data
   */
  async startQuiz(quizId) {
    try {
      console.log('Starting quiz with ID:', quizId);
      const response = await api.post(`/student/quizzes/${quizId}/start`);
      console.log('startQuiz API response:', response);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Try to extract attempt data from different possible structures
      let attemptData = response.data.attempt || response.data.data || response.data;
      console.log('Extracted attempt data:', attemptData);
      
      return {
        success: true,
        data: response.data,
        attempt: attemptData
      };
    } catch (error) {
      console.error('startQuiz error:', error);
      let message = 'Failed to start quiz';
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        message = error.response.data.message || 'Quiz not available';
      } else if (error.response?.status === 409) {
        message = error.response.data.message || 'Quiz already attempted';
      }

      return {
        success: false,
        message,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Fetch quiz questions for an attempt
   * @param {number} attemptId - The quiz attempt ID
   * @returns {Promise} API response with quiz questions
   */
  async fetchQuiz(attemptId) {
    try {
      const response = await api.get(`/student/quiz-attempts/${attemptId}/questions`);
      console.log('fetchQuiz API response:', response);
      
      // Handle different possible response structures
      let quizData;
      if (response.data) {
        quizData = response.data.quiz || response.data.data || response.data;
      } else {
        quizData = response;
      }
      
      console.log('Processed quiz data:', quizData);
      
      return {
        success: true,
        data: {
          quiz: quizData
        },
        quiz: quizData
      };
    } catch (error) {
      console.error('fetchQuiz error:', error);
      let message = 'Failed to fetch quiz';
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        const errorMsg = error.response.data.message;
        if (errorMsg === 'Quiz already submitted') {
          message = 'This quiz has already been submitted';
        } else if (errorMsg === 'Quiz time has expired') {
          message = 'Quiz time has expired';
        } else {
          message = errorMsg || 'Access denied';
        }
      } else if (error.response?.status === 404) {
        message = 'Quiz attempt not found';
      }

      return {
        success: false,
        message,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Submit quiz answers
   * @param {number} attemptId - The quiz attempt ID
   * @param {Array} answers - Array of answer objects
   * @returns {Promise} API response
   */
  async submitQuiz(attemptId, answers) {
    try {
      console.log('Submitting quiz with answers:', answers);
      const response = await api.post(`/student/quiz-attempts/${attemptId}/submit`, {
        answers: answers
      });
      console.log('submitQuiz API response:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Quiz submitted successfully'
      };
    } catch (error) {
      console.error('submitQuiz error:', error);
      let message = 'Failed to submit quiz';
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        message = error.response.data.message || 'Quiz already submitted';
      } else if (error.response?.status === 422) {
        message = 'Invalid answer format';
      } else if (error.response?.status === 400) {
        message = error.response.data.message || 'Bad request';
      }

      return {
        success: false,
        message,
        error: error.response?.data || error.message,
        validationErrors: error.response?.data?.errors || null
      };
    }
  }

  /**
   * Get quiz results
   * @param {number} attemptId - The quiz attempt ID
   * @returns {Promise} API response with results
   */
  async getQuizResult(attemptId) {
    try {
      const response = await api.get(`/student/quiz-attempts/${attemptId}/result`);
      console.log('getQuizResult API response:', response);
      
      return {
        success: true,
        data: response.data,
        result: {
          totalMarks: response.data.total_marks,
          marksObtained: response.data.marks_obtained,
          percentage: response.data.percentage,
          answers: response.data.answers
        }
      };
    } catch (error) {
      console.error('getQuizResult error:', error);
      let message = 'Failed to fetch results';
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        message = error.response.data.message || 'Results not available yet';
      }

      return {
        success: false,
        message,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Helper method to format answers for submission
   * @param {Array} questionsWithAnswers - Array of questions with user answers
   * @returns {Array} Formatted answers array
   */
  formatAnswersForSubmission(questionsWithAnswers) {
    console.log('Formatting answers for submission:', questionsWithAnswers);
    
    const formattedAnswers = questionsWithAnswers.map(q => {
      const answer = {
        question_id: q.id
      };

      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
        answer.selected_option_id = q.selectedOptionId || null;
      } else if (q.question_type === 'short_answer') {
        answer.answer_text = q.answerText || null;
      }

      return answer;
    });
    
    console.log('Formatted answers:', formattedAnswers);
    return formattedAnswers;
  }

  /**
   * Helper method to check if quiz time is expired
   * @param {string} endTime - End time in ISO string format
   * @returns {boolean} True if expired
   */
  isQuizExpired(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const isExpired = now > end;
    console.log('Checking if quiz expired:', { now, end, isExpired });
    return isExpired;
  }

  /**
   * Helper method to calculate remaining time
   * @param {string} endTime - End time in ISO string format
   * @returns {object} Remaining time object with minutes and seconds
   */
  getRemainingTime(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    console.log('Calculating remaining time:', { now, end, diff });

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { minutes, seconds, expired: false };
  }

  /**
   * Helper method to format time display
   * @param {number} minutes - Minutes
   * @param {number} seconds - Seconds
   * @returns {string} Formatted time string
   */
  formatTime(minutes, seconds) {
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /**
   * Helper method to validate answers before submission
   * @param {Array} answers - Array of answers to validate
   * @returns {object} Validation result
   */
  validateAnswers(answers) {
    const errors = [];

    if (!Array.isArray(answers) || answers.length === 0) {
      errors.push('No answers provided');
      return { isValid: false, errors };
    }

    answers.forEach((answer, index) => {
      if (!answer.question_id) {
        errors.push(`Answer ${index + 1}: Question ID is required`);
      }

      // For multiple choice/true_false, selected_option_id should be present
      // For short answer, answer_text should be present
      if (!answer.selected_option_id && !answer.answer_text) {
        // This is not always an error - user might skip questions
        console.log(`Answer ${index + 1}: No response provided (question_id: ${answer.question_id})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const studentQuizService = new StudentQuizService();
export default studentQuizService;