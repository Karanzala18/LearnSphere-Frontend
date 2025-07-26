import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { ArrowLeft, Edit, Trash2, FileText, Clock, Calendar, Award, Plus, Users, CheckCircle, XCircle, AlertCircle, Timer } from 'lucide-react';

const QuizViewPage = () => {
  const { subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formattedQuiz, setFormattedQuiz] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [subjectId, quizId]);

  // Update time remaining every second for active quizzes
  useEffect(() => {
    let interval;
    if (quiz && quiz.is_active && quiz.start_time && quiz.end_time) {
      interval = setInterval(() => {
        const remaining = quizService.getQuizTimeRemaining(quiz);
        setTimeRemaining(remaining);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quiz]);

    // Add this debugging code to your fetchQuizData function
const fetchQuizData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Fetching quiz with subjectId:', subjectId, 'quizId:', quizId);
    
    // First, fetch the quiz data
    const quizData = await quizService.getQuiz(subjectId, quizId);
    console.log('Quiz data response:', quizData);
    
    // Extract quiz from response - handle different response structures
    let rawQuiz = null;
    if (quizData.quiz) {
      rawQuiz = quizData.quiz;
    } else if (quizData.data && quizData.data.quiz) {
      rawQuiz = quizData.data.quiz;
    } else if (quizData.data) {
      rawQuiz = quizData.data;
    } else if (quizData.id) {
      rawQuiz = quizData;
    }
    
    if (!rawQuiz) {
      throw new Error('Quiz data not found in API response');
    }
    
    console.log('Extracted quiz:', rawQuiz);
    setQuiz(rawQuiz);
    
    // Now fetch questions separately with better error handling
    try {
      console.log('Fetching questions for quiz:', quizId);
      const questionsData = await quizService.getQuizQuestions(subjectId, quizId);
      console.log('Questions data response:', questionsData);
      
      // Handle different possible response structures for questions
      let questions = [];
      if (questionsData.questions && Array.isArray(questionsData.questions)) {
        questions = questionsData.questions;
      } else if (questionsData.data && Array.isArray(questionsData.data.questions)) {
        questions = questionsData.data.questions;
      } else if (questionsData.data && Array.isArray(questionsData.data)) {
        questions = questionsData.data;
      } else if (Array.isArray(questionsData)) {
        questions = questionsData;
      } else {
        console.warn('Questions not found in expected format:', questionsData);
        questions = [];
      }
      
      console.log('Extracted questions:', questions);
      setQuestions(questions);
      
    } catch (questionsError) {
      console.error('Failed to fetch questions:', questionsError);
      // Don't fail the entire page if questions fail - just show empty questions
      setQuestions([]);
      // Optionally show a warning to the user
      console.warn('Questions could not be loaded, but quiz data is available');
    }
    
  } catch (error) {
    console.error('Detailed error information:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
      subjectId,
      quizId
    });
    setError(error.message || 'Failed to fetch quiz data');
  } finally {
    setLoading(false);
  }
};

  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await quizService.deleteQuiz(subjectId, quizId);
        alert('Quiz deleted successfully');
        navigate(`/faculty/subjects/${subjectId}/quizzes`);
      } catch (error) {
        alert(error.message || 'Failed to delete quiz');
      }
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await quizService.deleteQuizQuestion(subjectId, quizId, questionId);
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        alert('Question deleted successfully');
      } catch (error) {
        alert(error.message || 'Failed to delete question');
      }
    }
  };

  // Calculate total marks from questions
  const calculateTotalMarksFromQuestions = () => {
    return questions.reduce((total, question) => total + (parseInt(question.marks) || 0), 0);
  };

  // Get quiz availability status with null checks
  const getQuizStatus = () => {
  if (!quiz) return { status: 'unknown', color: 'gray', text: 'Unknown' };
  
  // Use the fixed service method
  const isAvailable = quizService.isQuizAvailable(quiz);
  const now = new Date(); // UTC time
  const startTime = new Date(quiz.start_time); // UTC from database
  const endTime = new Date(quiz.end_time); // UTC from database
  
  if (!quiz.is_active) {
    return { status: 'inactive', color: 'gray', text: 'Inactive' };
  }
  
  if (now < startTime) {
    return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
  }
  
  if (now > endTime) {
    return { status: 'expired', color: 'red', text: 'Expired' };
  }
  
  if (isAvailable) {
    return { status: 'active', color: 'green', text: 'Active' };
  }
  
  return { status: 'unknown', color: 'gray', text: 'Unknown' };
};  

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Safe time formatting function
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const quizStatus = getQuizStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchQuizData}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
              aria-label="Retry loading quiz"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <p className="text-yellow-300">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
              aria-label="Back to quizzes"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Quizzes</span>
            </button>
            <div className="text-gray-400">|</div>
            <h1 className="text-xl font-semibold">Quiz Details</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/faculty/quizzes/${quizId}/scorecard`)}
              className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all"
              aria-label="View scorecard"
            >
              <Users className="w-4 h-4" />
              <span>Scorecard</span>
            </button>
            <button
              onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}/edit`)}
              className="flex items-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-all"
              aria-label="Edit quiz"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteQuiz}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all"
              aria-label="Delete quiz"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">{quiz?.title || 'Untitled Quiz'}</h2>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${
                quizStatus.color === 'green' ? 'bg-green-500/20 text-green-400' :
                quizStatus.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                quizStatus.color === 'red' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {quizStatus.color === 'green' && <CheckCircle className="w-3 h-3" />}
                {quizStatus.color === 'blue' && <Clock className="w-3 h-3" />}
                {quizStatus.color === 'red' && <XCircle className="w-3 h-3" />}
                {quizStatus.color === 'gray' && <AlertCircle className="w-3 h-3" />}
                <span>{quizStatus.text}</span>
              </span>
              
              {/* Time Remaining for Active Quizzes */}
              {timeRemaining && !timeRemaining.expired && quiz?.is_active && (
                <span className="px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400 flex items-center space-x-1">
                  <Timer className="w-3 h-3" />
                  <span>{timeRemaining.formatted}</span>
                </span>
              )}
            </div>
          </div>

          {quiz?.description && (
            <p className="text-gray-300 mb-6">{quiz.description}</p>
          )}

          {/* Quiz Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Questions</span>
              </div>
              <p className="text-white font-semibold">{questions.length}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-purple-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="text-white font-semibold">{quiz?.duration_minutes || 0} min</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">Set Marks</span>
              </div>
              <p className="text-white font-semibold">{quiz?.total_marks || 0}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">Calc. Marks</span>
              </div>
              <p className="text-white font-semibold">{calculateTotalMarksFromQuestions()}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-orange-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="text-white font-semibold text-xs">
                {quiz?.start_time ? new Date(quiz.start_time).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-pink-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">End Date</span>
              </div>
              <p className="text-white font-semibold text-xs">
                {quiz?.end_time ? new Date(quiz.end_time).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Date and Time Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-cyan-400 font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Start Time</span>
              </h4>
              <div className="space-y-1">
                <p className="text-white font-medium">
                  {formatDate(quiz?.start_time)}
                </p>
                <p className="text-gray-300 text-sm">
                  {formatTime(quiz?.start_time)}
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-pink-400 font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>End Time</span>
              </h4>
              <div className="space-y-1">
                <p className="text-white font-medium">
                  {formatDate(quiz?.end_time)}
                </p>
                <p className="text-gray-300 text-sm">
                  {formatTime(quiz?.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Instructions */}
          {quiz?.instructions && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-cyan-400 font-medium mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Instructions</span>
              </h4>
              <p className="text-gray-300 leading-relaxed">{quiz.instructions}</p>
            </div>
          )}
        </div>

        {/* Quiz Validation Status */}
        {quiz && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Quiz Validation</span>
            </h3>
            
            {(() => {
              const validation = quizService.validateQuizData(quiz);
              const marksMatch = quiz.total_marks === calculateTotalMarksFromQuestions();
              
              return (
                <div className="space-y-3">
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    validation.isValid ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {validation.isValid ? 
                      <CheckCircle className="w-4 h-4" /> : 
                      <XCircle className="w-4 h-4" />
                    }
                    <span className="font-medium">
                      Quiz Data: {validation.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    marksMatch ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {marksMatch ? 
                      <CheckCircle className="w-4 h-4" /> : 
                      <AlertCircle className="w-4 h-4" />
                    }
                    <span className="font-medium">
                      Marks Distribution: {marksMatch ? 'Correct' : 'Mismatch'}
                    </span>
                    {!marksMatch && (
                      <span className="text-sm">
                        (Set: {quiz.total_marks}, Calculated: {calculateTotalMarksFromQuestions()})
                      </span>
                    )}
                  </div>
                  
                  {!validation.isValid && (
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <p className="text-red-300 font-medium mb-2">Validation Errors:</p>
                      <ul className="text-red-200 text-sm space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Questions Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-cyan-400">Questions ({questions.length})</h3>
            <button 
              onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/create`)}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-all"
              aria-label="Add new question"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">No questions added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const validation = quizService.validateQuestionData(question);
                
                return (
                  <div key={question.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 text-sm rounded">
                            Q{index + 1}
                          </span>
                          <span className="text-gray-400 text-sm">{question.marks || 0} marks</span>
                          <span className="text-gray-400 text-sm capitalize">
                            {question.question_type?.replace('_', ' ') || 'Unknown'}
                          </span>
                          {validation.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        
                        <p className="text-white font-medium mb-2">{question.question_text || 'No question text'}</p>
                        
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-1">
                            {question.options.map((option) => (
                              <div key={option.id} className={`text-sm p-2 rounded ${
                                option.is_correct ? 'bg-green-500/20 text-green-300' : 'text-gray-400'
                              }`}>
                                {option.option_text} {option.is_correct && '✓'}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {!validation.isValid && (
                          <div className="mt-2 text-xs text-red-300">
                            Issues: {validation.errors.join(', ')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}/questions/${question.id}/edit`)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all"
                          aria-label={`Edit question ${index + 1}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          aria-label={`Delete question ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizViewPage;