import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { ArrowLeft, Save, FileText } from 'lucide-react';

const EditQuizPage = () => {
  const { subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_marks: '',
    duration_minutes: '',
    start_time: '',
    end_time: '',
    is_active: true,
    instructions: ''
  });

  useEffect(() => {
    fetchQuizData();
  }, [subjectId, quizId]);

  const fetchQuizData = async () => {
    try {
      const data = await quizService.getQuiz(subjectId, quizId);
      console.log('API Response:', data); // Debug log
      const quiz = data.quiz || data.data?.quiz || {};
      if (!quiz || !quiz.id) {
        throw new Error('Invalid or missing quiz data');
      }
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        total_marks: quiz.total_marks || '',
        duration_minutes: quiz.duration_minutes || '',
        start_time: quiz.start_time ? new Date(quiz.start_time).toISOString().slice(0, 16) : '',
        end_time: quiz.end_time ? new Date(quiz.end_time).toISOString().slice(0, 16) : '',
        is_active: quiz.is_active ?? true,
        instructions: quiz.instructions || ''
      });
    } catch (error) {
      console.error('Fetch Error:', error); // Debug error
      setError(error.message || 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = quizService.validateQuizData(formData);
    if (!validation.isValid) {
      alert('Please fix the following errors:\n' + validation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      await quizService.updateQuiz(subjectId, quizId, formData);
      alert('Quiz updated successfully!');
      navigate(`/faculty/subjects/${subjectId}/quizzes`);
    } catch (error) {
      alert(error.message || 'Failed to update quiz');
    } finally {
      setLoading(false);
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
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            aria-label="Back to quizzes"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quizzes</span>
          </button>
          <div className="text-gray-400">|</div>
          <h1 className="text-xl font-semibold">Edit Quiz</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold">Quiz Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter quiz title"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Marks *</label>
                <input
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Total marks"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Duration in minutes"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                  min={formData.start_time || new Date().toISOString().slice(0, 16)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                  id="is_active"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-300">Quiz is Active</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="Quiz description (optional)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows="4"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="Quiz instructions for students (optional)"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 px-6 py-3 rounded-lg transition-all"
                aria-label="Save quiz changes"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
                aria-label="Cancel editing"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage;
