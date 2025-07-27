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
    console.log('=== API REQUEST DEBUG ===');
    console.log('Subject ID:', subjectId);
    console.log('API URL will be:', `/student/subjects/${subjectId}/quizzes`);
    
    const response = await api.get(`/student/subjects/${subjectId}/quizzes`);
    
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Full response object:', response);
    console.log('Response data structure:', JSON.stringify(response.data, null, 2));
    
    // Handle different possible response structures
    let quizzesData = [];
    
    if (response.data) {
      console.log('Response data exists, checking structure...');
      
      if (response.data.quizzes && Array.isArray(response.data.quizzes)) {
        console.log('Found quizzes array in response.data.quizzes');
        quizzesData = response.data.quizzes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Found quizzes array in response.data.data');
        quizzesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('Response.data is directly an array');
        quizzesData = response.data;
      } else if (response.data.quiz) {
        console.log('Found single quiz in response.data.quiz');
        quizzesData = [response.data.quiz];
      } else {
        console.warn('Unexpected API response structure:', response.data);
        console.log('Available keys in response.data:', Object.keys(response.data));
        quizzesData = [];
      }
    }

    console.log('=== EXTRACTED DATA DEBUG ===');
    console.log('Extracted quizzes data:', quizzesData);
    console.log('Number of quizzes found:', quizzesData.length);
    
    if (quizzesData.length === 0) {
      console.error('❌ NO QUIZZES FOUND!');
      console.log('This indicates either:');
      console.log('1. No quizzes exist in database for subject_id =', subjectId);
      console.log('2. Student is not enrolled in this course');
      console.log('3. Backend API query has an issue');
      console.log('4. Wrong API endpoint or route');
      
      // Let's also check what the backend actually returned
      console.log('Backend response summary:');
      console.log('- Status:', response.status);
      console.log('- Data type:', typeof response.data);
      console.log('- Data:', response.data);
    }

    // Process the quizzes to ensure proper date handling and add computed properties
    const processedQuizzes = quizzesData.map(quiz => {
      console.log('=== Processing Quiz ===');
      console.log('Quiz ID:', quiz.id);
      console.log('Quiz Title:', quiz.title);
      console.log('Raw start_time from backend:', quiz.start_time);
      console.log('Raw end_time from backend:', quiz.end_time);
      console.log('Is Active:', quiz.is_active);
      console.log('Has Attempt:', !!quiz.attempt_id);
      
      const processed = {
        ...quiz,
        // Keep original time strings as they are (they're already in local time from backend)
        start_time: quiz.start_time,
        end_time: quiz.end_time,
        // Create Date objects treating the times as local time
        _localStartTime: quiz.start_time ? this.parseAsLocalTime(quiz.start_time) : null,
        _localEndTime: quiz.end_time ? this.parseAsLocalTime(quiz.end_time) : null,
        // Add computed properties for easier handling
        _computed: {
          isAvailable: this.isQuizCurrentlyAvailable(quiz),
          status: this.getQuizStatus(quiz),
          timeRemaining: this.getTimeRemaining(quiz)
        }
      };
      
      console.log('Processed quiz availability:', processed._computed);
      console.log('=== End Quiz Processing ===\n');
      
      return processed;
    });
    
    console.log('=== FINAL RESULT ===');
    console.log('Final processed quizzes:', processedQuizzes);
    console.log('Total count:', processedQuizzes.length);
    
    return {
      success: true,
      data: response.data,
      quizzes: processedQuizzes
    };
  } catch (error) {
    console.error('=== API ERROR DEBUG ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quizzes',
      error: error.response?.data || error.message
    };
  }
}
  /**
 * Parse datetime string as local time (not UTC)
 * This handles the MySQL datetime format from your backend
 * @param {string} dateTimeString - DateTime string from backend (e.g., "2025-07-27 16:27:00")
 * @returns {Date} Date object representing local time
 */
parseAsLocalTime(dateTimeString) {
  if (!dateTimeString) return null;
  
  try {
    console.log('Parsing datetime string:', dateTimeString);
    
    // Handle MySQL datetime format: "2025-07-27 16:27:00"
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      console.log('Detected MySQL datetime format');
      
      // Split date and time parts
      const [datePart, timePart] = dateTimeString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      
      // Create Date object with local time (not UTC)
      // Note: month is 0-indexed in JavaScript Date constructor
      const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
      
      console.log('Created local date:', {
        input: dateTimeString,
        parsed: localDate,
        localString: localDate.toLocaleString(),
        isoString: localDate.toISOString()
      });
      
      return localDate;
    }
    
    // Handle ISO-like format with 'T': "2025-07-27T16:27:00" 
    if (dateTimeString.includes('T') && !dateTimeString.includes('Z') && !dateTimeString.includes('+')) {
      console.log('Detected ISO-like format without timezone');
      
      // Parse as local time by creating components manually
      const isoDate = new Date(dateTimeString);
      
      // Check if parsing was successful
      if (!isNaN(isoDate.getTime())) {
        console.log('Successfully parsed ISO-like date:', isoDate.toLocaleString());
        return isoDate;
      }
    }
    
    // Handle other formats - try direct parsing
    const parsedDate = new Date(dateTimeString);
    if (!isNaN(parsedDate.getTime())) {
      console.log('Successfully parsed with direct parsing:', parsedDate.toLocaleString());
      return parsedDate;
    }
    
    console.error('Failed to parse datetime string:', dateTimeString);
    return null;
    
  } catch (error) {
    console.error('Error parsing local time:', error);
    return null;
  }
}
  /**
 * Check if quiz is currently available for taking
 * @param {Object} quiz - Quiz object
 * @returns {boolean} Whether quiz is available
 */
isQuizCurrentlyAvailable(quiz) {
  console.log('\n=== Quiz Availability Check ===');
  console.log('Quiz ID:', quiz?.id);
  console.log('Quiz Title:', quiz?.title);
  
  if (!quiz) {
    console.log('❌ Quiz object is null/undefined');
    return false;
  }
  
  if (!quiz.is_active) {
    console.log('❌ Quiz is not active:', quiz.is_active);
    return false;
  }
  
  if (!quiz.start_time || !quiz.end_time) {
    console.log('❌ Missing time data:', {
      start_time: quiz.start_time,
      end_time: quiz.end_time
    });
    return false;
  }

  // If student already attempted this quiz, it's not available
  if (quiz.attempt_id) {
    console.log('❌ Quiz already attempted, attempt_id:', quiz.attempt_id);
    return false;
  }
  
  const now = new Date();
  console.log('Current time:', now.toLocaleString());
  
  // Parse times as local time, not UTC
  const startTime = this.parseAsLocalTime(quiz.start_time);
  const endTime = this.parseAsLocalTime(quiz.end_time);
  
  if (!startTime || !endTime) {
    console.log('❌ Failed to parse times:', {
      startTime: startTime,
      endTime: endTime,
      raw_start: quiz.start_time,
      raw_end: quiz.end_time
    });
    return false;
  }
  
  console.log('Parsed times:');
  console.log('- Start:', startTime.toLocaleString());
  console.log('- End:', endTime.toLocaleString());
  
  const isAfterStart = now >= startTime;
  const isBeforeEnd = now <= endTime;
  
  console.log('Time checks:');
  console.log('- Now >= Start:', isAfterStart);
  console.log('- Now <= End:', isBeforeEnd);
  
  const isAvailable = isAfterStart && isBeforeEnd;
  
  if (isAvailable) {
    console.log('✅ Quiz is available!');
  } else {
    console.log('❌ Quiz is not available');
    if (!isAfterStart) console.log('  Reason: Quiz has not started yet');
    if (!isBeforeEnd) console.log('  Reason: Quiz has ended');
  }
  
  console.log('=== End Availability Check ===\n');
  
  return isAvailable;
}
  /**
   * Get quiz status for display
   * @param {Object} quiz - Quiz object
   * @returns {string} Status string
   */
  getQuizStatus(quiz) {
    if (!quiz || !quiz.is_active) return 'inactive';
    if (quiz.attempt_id) return 'completed';
    
    const now = new Date();
    const startTime = this.parseAsLocalTime(quiz.start_time);
    const endTime = this.parseAsLocalTime(quiz.end_time);
    
    if (!startTime || !endTime) return 'invalid';
    
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'expired';
    if (now >= startTime && now <= endTime) return 'available';
    
    return 'unavailable';
  }

  /**
   * Get remaining time for quiz
   * @param {Object} quiz - Quiz object
   * @returns {Object} Time remaining info
   */
  getTimeRemaining(quiz) {
    if (!quiz || !quiz.end_time) {
      return { expired: true, remaining: 0, formatted: '0s' };
    }

    const now = new Date();
    const endTime = this.parseAsLocalTime(quiz.end_time);
    
    if (!endTime) {
      return { expired: true, remaining: 0, formatted: 'Invalid time' };
    }
    
    const timeDiff = endTime - now;

    if (timeDiff <= 0) {
      return { expired: true, remaining: 0, formatted: 'Expired' };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0) formatted += `${minutes}m`;

    return {
      expired: false,
      remaining: timeDiff,
      formatted: formatted.trim() || '< 1m',
      days,
      hours,
      minutes
    };
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
   * @param {string} endTime - End time from backend (local time)
   * @returns {boolean} True if expired
   */
  isQuizExpired(endTime) {
    const now = new Date();
    const end = this.parseAsLocalTime(endTime);
    if (!end) return true;
    
    const isExpired = now > end;
    console.log('Checking if quiz expired:', { 
      now: now.toLocaleString(), 
      end: end.toLocaleString(), 
      isExpired 
    });
    return isExpired;
  }

  /**
   * Helper method to calculate remaining time
   * @param {string} endTime - End time from backend (local time)
   * @returns {object} Remaining time object with minutes and seconds
   */
  getRemainingTime(endTime) {
    const now = new Date();
    const end = this.parseAsLocalTime(endTime);
    
    if (!end) {
      return { minutes: 0, seconds: 0, expired: true };
    }
    
    const diff = end - now;

    console.log('Calculating remaining time:', { 
      now: now.toLocaleString(), 
      end: end.toLocaleString(), 
      diff 
    });

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