import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { ArrowLeft, Edit, Trash2, FileText, Clock, Calendar, Award, Plus } from 'lucide-react';

const QuizViewPage = () => {
  const { subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [subjectId, quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuiz(subjectId, quizId),
        quizService.getQuizQuestions(subjectId, quizId)
      ]);
      setQuiz(quizData.quiz);
      setQuestions(questionsData.questions || []);
    } catch (error) {
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
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">{quiz?.title}</h2>
            <span className={`px-3 py-1 text-sm rounded-full ${
              quiz?.is_active 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {quiz?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {quiz?.description && (
            <p className="text-gray-300 mb-4">{quiz.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-white font-semibold">{quiz?.duration_minutes} min</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm">Total Marks</span>
              </div>
              <p className="text-white font-semibold">{quiz?.total_marks}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-orange-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="text-white font-semibold text-sm">
                {quiz?.start_time ? new Date(quiz.start_time).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {quiz?.instructions && (
            <div className="mt-4 bg-white/5 rounded-lg p-4">
              <h4 className="text-cyan-400 font-medium mb-2">Instructions</h4>
              <p className="text-gray-300">{quiz.instructions}</p>
            </div>
          )}
        </div>

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
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 text-sm rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-gray-400 text-sm">{question.marks} marks</span>
                        <span className="text-gray-400 text-sm capitalize">{question.question_type?.replace('_', ' ')}</span>
                      </div>
                      <p className="text-white font-medium mb-2">{question.question_text}</p>
                      
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizViewPage;