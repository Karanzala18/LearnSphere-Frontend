import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import studentQuizService from '../../services/studentQuizService';

const QuizAttemptPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    console.log('useEffect triggered with attemptId:', attemptId);
    if (!attemptId) {
      console.error('attemptId is undefined, redirecting');
      setError('No valid attempt ID provided');
      navigate(-1);
      return;
    }

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        console.log('Starting fetchQuiz for attemptId:', attemptId);

        const response = await studentQuizService.fetchQuiz(attemptId);
        console.log('FetchQuiz raw response:', response);

        if (!response.success) {
          throw new Error(response.message || 'API call failed');
        }

        // Handle different possible response structures
        let quizInfo;
        if (response.data) {
          // Try different possible structures
          quizInfo = response.data.quiz || response.data.data || response.data;
        } else {
          quizInfo = response.quiz || response;
        }

        console.log('Processed quizInfo:', quizInfo);

        // Validate required fields
        if (!quizInfo) {
          throw new Error('No quiz data received from server');
        }

        if (!quizInfo.questions || !Array.isArray(quizInfo.questions)) {
          throw new Error('Invalid quiz data: questions array is missing or invalid');
        }

        if (quizInfo.questions.length === 0) {
          throw new Error('No questions found in this quiz');
        }

        if (!quizInfo.end_time) {
          throw new Error('Quiz end time is missing');
        }

        console.log('Valid quiz data received:', quizInfo);
        
        const timeRemaining = studentQuizService.getRemainingTime(quizInfo.end_time);
        console.log('Time remaining calculated:', timeRemaining);
        
        if (timeRemaining.expired) {
          setError('Quiz time has expired');
          return;
        }

        const totalSeconds = (timeRemaining.minutes * 60) + timeRemaining.seconds;
        setTimeLeft(totalSeconds);
        setQuizData(quizInfo);
        
      } catch (err) {
        console.error('Error in fetchQuizData:', err);
        setError(err.message || 'Failed to load quiz data');
      } finally {
        console.log('Fetch completed, loading set to false');
        setLoading(false);
      }
    };

    fetchQuizData().catch(err => console.error('Uncaught error in fetchQuizData:', err));
  }, [attemptId, navigate]);

  useEffect(() => {
    console.log('Timer useEffect triggered with timeLeft:', timeLeft);
    if (timeLeft === null || timeLeft <= 0 || isSubmitting || hasSubmittedRef.current) {
      console.log('Timer not started due to conditions:', { timeLeft, isSubmitting, hasSubmitted: hasSubmittedRef.current });
      return;
    }

    console.log('Starting timer with timeLeft:', timeLeft);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log('Timer expired, auto-submitting');
          clearInterval(timerRef.current);
          if (!hasSubmittedRef.current && !isSubmitting) {
            handleSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log('Cleaning up timer');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, isSubmitting]);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value, optionId = null) => {
    if (!quizData || hasSubmittedRef.current) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        answer_text: value,
        selected_option_id: optionId,
        question_type: quizData.questions.find(q => q.id === questionId)?.question_type
      }
    }));
    console.log('Answer changed for questionId:', questionId, 'Value:', value, 'OptionId:', optionId);
  };

  const handleSubmit = async (isTimerExpired = false) => {
    if (!quizData || hasSubmittedRef.current || isSubmitting) {
      console.log('Submit blocked:', { hasSubmitted: hasSubmittedRef.current, isSubmitting });
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const formattedAnswers = studentQuizService.formatAnswersForSubmission(
        quizData.questions.map(q => ({
          id: q.id,
          question_type: q.question_type,
          selectedOptionId: answers[q.id]?.selected_option_id,
          answerText: answers[q.id]?.answer_text
        }))
      );
      
      console.log('Submitting answers:', formattedAnswers);
      
      if (!isTimerExpired) {
        const validation = studentQuizService.validateAnswers(formattedAnswers);
        if (!validation.isValid) {
          alert('Please fix the following errors:\n' + validation.errors.join('\n'));
          hasSubmittedRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }

      const response = await studentQuizService.submitQuiz(attemptId, formattedAnswers);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      console.log('Submission response:', response);
      
      if (isTimerExpired) {
        alert('Time expired! Quiz has been automatically submitted.');
      } else {
        alert('Quiz submitted successfully!');
      }
      
      navigate(`/student/quiz-attempts/${attemptId}/result`, { replace: true });
      
    } catch (err) {
      console.error('Submission error:', err);
      hasSubmittedRef.current = false;
      
      if (err.message === 'Quiz already submitted' || err.response?.status === 403) {
        setError('Quiz has already been submitted');
        navigate(`/student/quiz-attempts/${attemptId}/result`, { replace: true });
      } else {
        alert('Error submitting quiz: ' + err.message);
        setIsSubmitting(false);
      }
    }
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  const calculateProgress = (answered, total) => {
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    console.log('Rendering no quiz data state, quizData:', quizData);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No quiz questions available</div>
          <div className="text-gray-400 text-sm mb-4">
            Debug info: {JSON.stringify(quizData, null, 2)}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestion];
  const progress = calculateProgress(getAnsweredCount(), quizData.questions.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{quizData.title || 'Quiz'}</h1>
              <p className="text-gray-300 text-sm">
                Question {currentQuestion + 1} of {quizData.questions.length} | 
                Answered: {getAnsweredCount()}/{quizData.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center mb-1 ${timeLeft <= 300 ? 'text-red-300' : 'text-yellow-300'}`}>
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <p className="text-xs text-gray-300">Time Remaining</p>
              {timeLeft <= 300 && (
                <p className="text-xs text-red-300 mt-1">⚠️ Less than 5 minutes left!</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-start mb-4">
            <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">Q{currentQuestion + 1}</span>
            <div>
              <h2 className="text-lg font-medium mb-2">{currentQ.question_text}</h2>
              <p className="text-sm text-gray-300">Marks: {currentQ.marks}</p>
            </div>
          </div>

          <div className="ml-12">
            {(currentQ.question_type === 'multiple_choice' || currentQ.question_type === 'true_false') && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option) => (
                  <label key={option.id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      value={option.id}
                      checked={answers[currentQ.id]?.selected_option_id === option.id}
                      onChange={() => handleAnswerChange(currentQ.id, option.option_text, option.id)}
                      disabled={isSubmitting}
                      className="mr-3"
                    />
                    <span className="bg-white/5 p-3 rounded-lg flex-1 hover:bg-white/10 transition-colors">
                      {option.option_text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {currentQ.question_type === 'short_answer' && (
              <textarea
                value={answers[currentQ.id]?.answer_text || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                disabled={isSubmitting}
                className="w-full p-4 bg-white/5 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 min-h-[120px]"
              />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0 || isSubmitting}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-2">
            {quizData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                disabled={isSubmitting}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-cyan-500 text-white'
                    : answers[quizData.questions[index].id]
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            {currentQuestion < quizData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                disabled={isSubmitting}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {getAnsweredCount() < quizData.questions.length && !isSubmitting && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-center text-yellow-300">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">You have {quizData.questions.length - getAnsweredCount()} unanswered question(s)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttemptPage;