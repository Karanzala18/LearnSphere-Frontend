import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, CheckSquare, Award, TrendingUp, Target, FileText } from 'lucide-react';
import studentQuizService from '../../../../services/studentQuizService';

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

        let quizInfo;
        if (response.data) {
          quizInfo = response.data.quiz || response.data.data || response.data;
        } else {
          quizInfo = response.quiz || response;
        }

        console.log('Processed quizInfo:', quizInfo);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Questions</h2>
          <p className="text-gray-600 mb-6">No quiz questions available</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Exit Quiz</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quizData.title || 'Quiz'}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className={`flex items-center space-x-2 ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-xs text-gray-500">Time Remaining</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 text-gray-900">
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-xl font-bold">{getAnsweredCount()}/{quizData.questions.length}</span>
                </div>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        {timeLeft <= 300 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Time Warning!</p>
              <p className="text-sm text-red-700">Less than 5 minutes remaining. Please complete your answers soon.</p>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {currentQuestion + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{currentQ.question_text}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">{currentQ.marks} marks</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span className="capitalize">{currentQ.question_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-3">
            {(currentQ.question_type === 'multiple_choice' || currentQ.question_type === 'true_false') && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label 
                    key={option.id} 
                    className={`flex items-center cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                      answers[currentQ.id]?.selected_option_id === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      value={option.id}
                      checked={answers[currentQ.id]?.selected_option_id === option.id}
                      onChange={() => handleAnswerChange(currentQ.id, option.option_text, option.id)}
                      disabled={isSubmitting}
                      className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-medium text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900 font-medium">{option.option_text}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {currentQ.question_type === 'short_answer' && (
              <div>
                <textarea
                  value={answers[currentQ.id]?.answer_text || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isSubmitting}
                  className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 min-h-[160px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {answers[currentQ.id]?.answer_text?.length || 0} characters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Navigator</h3>
          <div className="flex flex-wrap gap-2">
            {quizData.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                disabled={isSubmitting}
                className={`w-12 h-12 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white shadow-md'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-xs text-gray-600">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-xs text-gray-600">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-xs text-gray-600">Not Answered</span>
            </div>
          </div>
        </div>

        {/* Unanswered Warning */}
        {getAnsweredCount() < quizData.questions.length && !isSubmitting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Incomplete Quiz</p>
              <p className="text-sm text-yellow-700">
                You have {quizData.questions.length - getAnsweredCount()} unanswered question(s). 
                Please answer all questions before submitting.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0 || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-medium text-gray-700 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            {currentQuestion < quizData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all duration-200 font-medium text-white"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 rounded-xl transition-all duration-200 font-medium text-white shadow-md"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizAttemptPage;