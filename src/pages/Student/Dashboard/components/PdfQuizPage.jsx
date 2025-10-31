import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, CheckSquare, Award, Target, FileText } from 'lucide-react';
import pdfService from '../../services/pdfService';

const PdfQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await pdfService.startPdfQuiz(quizId);
      console.log('Quiz Start Response:', response);
      setQuizData(response.data);
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question');
      return;
    }

    if (!window.confirm('Are you sure you want to submit?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await pdfService.submitPdfQuiz(quizId, answers);
      console.log('Quiz Submit Response:', response);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  const calculateProgress = (answered, total) => {
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  if (loading) {
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const quiz = quizData.quiz;
    const score = result.score || result.attempt?.total_marks_obtained || 0;
    const totalMarks = result.attempt?.total_marks || quiz.total_marks;
    const percentage = result.percentage || Math.round((score / totalMarks) * 100);

    return (
      <div className="min-h-screen bg-white text-gray-900">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
        <div className="fixed inset-0 opacity-[0.03] -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {score}/{totalMarks}
                </h2>
                <p className="text-lg text-gray-700">Your Score</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 mb-2">{percentage}%</div>
                <p className="text-lg text-gray-700">Percentage</p>
              </div>
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Answers</h3>
            <p className="text-gray-600">Review your responses and see the correct answers</p>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correctAnswer = question.options.find(opt => opt.is_correct);
              const isCorrect = userAnswer === correctAnswer?.id;
              const userSelectedOption = question.options.find(opt => opt.id === userAnswer);

              return (
                <div
                  key={question.id}
                  className={`bg-white rounded-2xl border-2 shadow-sm p-6 ${
                    isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                      isCorrect ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.question_text}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Award className="w-4 h-4" />
                          <span className="font-medium">{question.marks} marks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3 ml-16">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                      <div className={`p-3 rounded-lg ${
                        isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                      }`}>
                        <p className="text-gray-900">
                          {userSelectedOption?.option_text || 'No answer provided'}
                        </p>
                      </div>
                    </div>

                    {!isCorrect && correctAnswer && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Correct Answer:</p>
                        <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                          <p className="text-gray-900">{correctAnswer.option_text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!quizData || !quizData.quiz) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Data</h2>
          <p className="text-gray-600 mb-6">No quiz data available</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const quiz = quizData.quiz;
  const currentQ = quiz.questions[currentQuestion];
  const progress = calculateProgress(getAnsweredCount(), quiz.questions.length);

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
                onClick={() => navigate('/student/dashboard')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="flex items-center space-x-2 text-gray-900">
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-xl font-bold">{getAnsweredCount()}/{quiz.questions.length}</span>
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
        {/* Quiz Info Banner */}
        {quiz.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-900">{quiz.description}</p>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Total Marks:</strong> {quiz.total_marks}
            </p>
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
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-3">
            {currentQ.options && currentQ.options.map((option, index) => (
              <label 
                key={option.id} 
                className={`flex items-center cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQ.id] === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name={`question_${currentQ.id}`}
                  value={option.id}
                  checked={answers[currentQ.id] === option.id}
                  onChange={() => handleAnswerChange(currentQ.id, option.id)}
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
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Navigator</h3>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, index) => (
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
        {getAnsweredCount() < quiz.questions.length && !isSubmitting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Incomplete Quiz</p>
              <p className="text-sm text-yellow-700">
                You have {quiz.questions.length - getAnsweredCount()} unanswered question(s). 
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
            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all duration-200 font-medium text-white"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
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

export default PdfQuizPage;