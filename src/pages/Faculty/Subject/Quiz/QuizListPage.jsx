import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Award,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

const QuizListPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getQuizzes(subjectId);
      setQuizzes(data.quizzes || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizService.deleteQuiz(subjectId, quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      alert('Quiz deleted successfully');
    } catch (error) {
      alert(error.message || 'Failed to delete quiz');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getQuizStats = () => {
    const total = quizzes.length;
    const active = quizzes.filter(q => q.is_active).length;
    const totalQuestions = quizzes.reduce((sum, q) => sum + (q.question_count || 0), 0);
    const totalMarks = quizzes.reduce((sum, q) => sum + (q.total_marks || 0), 0);
    
    return { total, active, totalQuestions, totalMarks };
  };

  const stats = getQuizStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Black Navbar */}
      <div className="bg-black text-white p-4 border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(`/faculty/subjects/${subjectId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Subject</span>
            </button>
            <div className="text-gray-600">|</div>
            <h1 className="text-xl font-semibold">Quiz Management</h1>
          </div>
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/create`)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Total Quizzes</span>
            </div>
            <p className="text-black font-bold text-2xl">{stats.total}</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 text-green-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Active Quizzes</span>
            </div>
            <p className="text-black font-bold text-2xl">{stats.active}</p>
          </div>

          
        </div>

        {/* Content Section */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Quizzes</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={fetchQuizzes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-medium"
              >
                Retry
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Quizzes Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first quiz. You can add questions, set time limits, and track student performance.
              </p>
              <button 
                onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/create`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all font-medium inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Quiz</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="bg-gray-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl p-6 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
                          quiz.is_active 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-200 text-gray-600 border border-gray-300'
                        }`}>
                          {quiz.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-blue-600 mb-1">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">Questions</span>
                          </div>
                          <p className="font-semibold">{quiz.question_count || 0}</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-purple-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Duration</span>
                          </div>
                          <p className="font-semibold">{quiz.duration_minutes} min</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-orange-600 mb-1">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">Total Marks</span>
                          </div>
                          <p className="font-semibold">{quiz.total_marks}</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-green-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Start Date</span>
                          </div>
                          <p className="font-semibold text-sm">
                            {new Date(quiz.start_time).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quiz.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Quiz"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quiz.id}/edit`)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                        title="Edit Quiz"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(quiz)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Quiz</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">{deleteConfirm.title}</span>? 
              This action cannot be undone and all quiz data will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteQuiz(deleteConfirm.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all font-medium"
              >
                Delete Quiz
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizListPage;