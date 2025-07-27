import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { timezoneUtils } from '../../services/quizService';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  HelpCircle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const EditQuizPage = () => {
  const { subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'questions'
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
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

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    marks: '',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const quizData = await quizService.getQuiz(subjectId, quizId);
      
      let quiz = null;
      if (quizData) {
        if (quizData.quiz) {
          quiz = quizData.quiz;
        } else if (quizData.data && quizData.data.quiz) {
          quiz = quizData.data.quiz;
        } else if (quizData.id) {
          quiz = quizData;
        } else {
          quiz = quizData;
        }
      }
      
      if (!quiz || !quiz.id) {
        throw new Error('Invalid or missing quiz data - no quiz ID found');
      }

      console.log('Quiz data from API:', quiz);
      console.log('User timezone:', timezoneUtils.getUserTimezone());
      
      // Use the new utcToLocalInput function for proper conversion
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        total_marks: quiz.total_marks || '',
        duration_minutes: quiz.duration_minutes || '',
        start_time: timezoneUtils.utcToLocalInput(quiz.start_time),
        end_time: timezoneUtils.utcToLocalInput(quiz.end_time),
        is_active: quiz.is_active ?? true,
        instructions: quiz.instructions || ''
      });

      console.log('Form data set with local times:', {
        start_time: timezoneUtils.utcToLocalInput(quiz.start_time),
        end_time: timezoneUtils.utcToLocalInput(quiz.end_time),
        timezone: timezoneUtils.getUserTimezone()
      });

      const questionsData = await quizService.getQuizQuestions(subjectId, quizId);
      setQuestions(questionsData.questions || questionsData || []);
      
    } catch (error) {
      console.error('Fetch Error Details:', error);
      setError(error.message || 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [subjectId, quizId]);

  const fetchQuizData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await quizService.getQuiz(subjectId, quizId);
    
    let quiz = null;
    if (data) {
      if (data.quiz) {
        quiz = data.quiz;
      } else if (data.data && data.data.quiz) {
        quiz = data.data.quiz;
      } else if (data.id) {
        quiz = data;
      } else {
        quiz = data;
      }
    }
    
    if (!quiz || !quiz.id) {
      throw new Error('Invalid or missing quiz data - no quiz ID found');
    }
    
    // Use the new utcToLocalInput function
    setFormData({
      title: quiz.title || '',
      description: quiz.description || '',
      total_marks: quiz.total_marks || '',
      duration_minutes: quiz.duration_minutes || '',
      start_time: timezoneUtils.utcToLocalInput(quiz.start_time),
      end_time: timezoneUtils.utcToLocalInput(quiz.end_time),
      is_active: quiz.is_active ?? true,
      instructions: quiz.instructions || ''
    });
  } catch (error) {
    console.error('Fetch Error Details:', error);
    setError(error.message || 'Failed to fetch quiz data');
  } finally {
    setLoading(false);
  }
};


  const fetchQuestions = async () => {
    try {
      const data = await quizService.getQuizQuestions(subjectId, quizId);
      setQuestions(data.questions || data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset options when question type changes
    if (name === 'question_type') {
      if (value === 'true_false') {
        setQuestionForm(prev => ({
          ...prev,
          options: [
            { option_text: 'True', is_correct: false },
            { option_text: 'False', is_correct: false }
          ]
        }));
      } else if (value === 'multiple_choice') {
        setQuestionForm(prev => ({
          ...prev,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        }));
      } else {
        setQuestionForm(prev => ({
          ...prev,
          options: []
        }));
      }
    }
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const removeOption = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: '',
      question_type: 'multiple_choice',
      marks: '',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    const validation = quizService.validateQuestionData(questionForm);
    if (!validation.isValid) {
      alert('Please fix the following errors:\n' + validation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      await quizService.createQuizQuestion(subjectId, quizId, questionForm);
      alert('Question created successfully!');
      resetQuestionForm();
      fetchQuestions();
    } catch (error) {
      alert(error.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_text: question.question_text || '',
      question_type: question.question_type || 'multiple_choice',
      marks: question.marks || '',
      options: question.options || []
    });
    setShowQuestionForm(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    
    const validation = quizService.validateQuestionData(questionForm);
    if (!validation.isValid) {
      alert('Please fix the following errors:\n' + validation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      await quizService.updateQuizQuestion(subjectId, quizId, editingQuestion.id, questionForm);
      alert('Question updated successfully!');
      resetQuestionForm();
      fetchQuestions();
    } catch (error) {
      alert(error.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setLoading(true);
      await quizService.deleteQuizQuestion(subjectId, quizId, questionId);
      alert('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      alert(error.message || 'Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async (e) => {
  e.preventDefault();

  const validation = quizService.validateQuizData(formData);
  if (!validation.isValid) {
    alert('Please fix the following errors:\n' + validation.errors.join('\n'));
    return;
  }

  try {
    setLoading(true);
    
    console.log('Submitting form data (local times):', formData);
    
    // The datetime values will be converted to UTC by the quizService.updateQuiz method
    const formattedData = {
      ...formData,
      start_time: formData.start_time,  // Will be converted to UTC in service
      end_time: formData.end_time,      // Will be converted to UTC in service
      total_marks: parseInt(formData.total_marks),
      duration_minutes: parseInt(formData.duration_minutes)
    };

    console.log('Formatted data for update:', formattedData);
    
    await quizService.updateQuiz(subjectId, quizId, formattedData);
    alert('Quiz updated successfully!');
    navigate(`/faculty/subjects/${subjectId}/quizzes`);
  } catch (error) {
    console.error('Update error:', error);
    alert(error.message || 'Failed to update quiz');
  } finally {
    setLoading(false);
  }
};

  if (loading && !questions.length) {
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
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quizzes</span>
          </button>
          <div className="text-gray-400">|</div>
          <h1 className="text-xl font-semibold">Edit Quiz</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'details' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Quiz Details
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'questions' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Questions ({questions.length})
          </button>
        </div>

        {/* Quiz Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold">Quiz Details</h2>
            </div>

            <form onSubmit={handleSubmitQuiz} className="space-y-6">
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
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Add Question Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold flex items-center space-x-3">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
                <span>Quiz Questions</span>
              </h2>
              <button
                onClick={() => setShowQuestionForm(true)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h3>
                  <button
                    onClick={resetQuestionForm}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Question Type *</label>
                      <select
                        name="question_type"
                        value={questionForm.question_type}
                        onChange={handleQuestionFormChange}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Marks *</label>
                      <input
                        type="number"
                        name="marks"
                        value={questionForm.marks}
                        onChange={handleQuestionFormChange}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                        placeholder="Points for this question"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Question Text *</label>
                    <textarea
                      name="question_text"
                      value={questionForm.question_text}
                      onChange={handleQuestionFormChange}
                      rows="3"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  {/* Options for Multiple Choice and True/False */}
                  {(questionForm.question_type === 'multiple_choice' || questionForm.question_type === 'true_false') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Answer Options</label>
                      <div className="space-y-3">
                        {questionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={option.is_correct}
                              onChange={() => {
                                setQuestionForm(prev => ({
                                  ...prev,
                                  options: prev.options.map((opt, i) => ({
                                    ...opt,
                                    is_correct: i === index
                                  }))
                                }));
                              }}
                              className="text-cyan-500"
                            />
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                              placeholder={`Option ${index + 1}`}
                              disabled={questionForm.question_type === 'true_false'}
                            />
                            {questionForm.question_type === 'multiple_choice' && questionForm.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {questionForm.question_type === 'multiple_choice' && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Option</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 px-6 py-3 rounded-lg transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetQuestionForm}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No questions added yet. Click "Add Question" to get started.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div key={question.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                            Q{index + 1}
                          </span>
                          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                            {question.question_type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-white font-medium">{question.question_text}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Show options for multiple choice and true/false */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`flex items-center space-x-2 p-3 rounded-lg ${
                                option.is_correct 
                                  ? 'bg-green-500/20 border border-green-500/50' 
                                  : 'bg-gray-500/20 border border-gray-500/50'
                              }`}
                            >
                              {option.is_correct && <CheckCircle className="w-4 h-4 text-green-400" />}
                              <span className="text-gray-300">{option.option_text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditQuizPage;