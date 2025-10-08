import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../../../services/quizService';
import { ArrowLeft, Plus, FileText, Calendar, Clock, Users, Edit, Trash2, Eye } from 'lucide-react';

const QuizListPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizzes(subjectId);
      setQuizzes(data.quizzes || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(subjectId, quizId);
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        alert('Quiz deleted successfully');
      } catch (error) {
        alert(error.message || 'Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(`/faculty/subjects/${subjectId}`)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Subject</span>
            </button>
            <div className="text-gray-400">|</div>
            <h1 className="text-xl font-semibold">Quiz Management</h1>
          </div>
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/create`)}
            className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
            <p className="text-red-300">{error}</p>
            <button 
              onClick={fetchQuizzes}
              className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No Quizzes Yet</h2>
            <p className="text-gray-400 mb-4">Get started by creating your first quiz</p>
            <button 
              onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/create`)}
              className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg transition-all"
            >
              Create First Quiz
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{quiz.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quiz.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {quiz.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{quiz.question_count || 0} Questions</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{quiz.total_marks} marks</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(quiz.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quiz.id}`)}
                      className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                      title="View Quiz"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quiz.id}/edit`)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all"
                      title="Edit Quiz"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Quiz"
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
  );
};
export default QuizListPage;