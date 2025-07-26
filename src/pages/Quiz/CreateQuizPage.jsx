import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import timezoneUtils from '../../services/quizService';
import { ArrowLeft, Save, FileText, Plus, Trash2, Edit3, Check, AlertCircle } from 'lucide-react';

const CreateQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // Added for better user feedback
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
  
  // Store questions as an array with unique IDs and save status
  const [questions, setQuestions] = useState([]);
  const [nextQuestionId, setNextQuestionId] = useState(1);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper function to create empty question template
  const createEmptyQuestion = (id = null) => ({
    id: id || nextQuestionId,
    question_text: '',
    question_type: 'multiple_choice',
    marks: '',
    order_number: questions.length,
    is_saved: false, // Track if question is saved
    options: [
      { option_text: '', is_correct: false, order_number: 0 },
      { option_text: '', is_correct: false, order_number: 1 },
      { option_text: '', is_correct: false, order_number: 2 },
      { option_text: '', is_correct: false, order_number: 3 }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, [field]: value, is_saved: false } // Mark as unsaved when changed
        : q
    ));
  };

  const handleOptionChange = (questionId, optionIndex, field, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      
      return {
        ...q,
        is_saved: false, // Mark as unsaved when changed
        options: q.options.map((opt, i) => {
          if (field === 'is_correct') {
            // Only one option can be correct at a time
            return { ...opt, is_correct: i === optionIndex };
          } else if (i === optionIndex) {
            return { ...opt, [field]: value };
          }
          return opt;
        })
      };
    }));
  };

  const addNewQuestion = () => {
    const newQuestion = createEmptyQuestion();
    setQuestions(prev => [...prev, newQuestion]);
    setNextQuestionId(prev => prev + 1);
    setEditingQuestionId(newQuestion.id);
    setShowAddQuestion(false);
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      // Update order numbers
      return filtered.map((q, index) => ({ ...q, order_number: index }));
    });
    
    // If we were editing this question, stop editing
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
  };

  const saveQuestion = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    const validation = quizService.validateQuestionData(question);
    
    if (!validation.isValid) {
      showNotification('Please fix the following errors in the question:\n' + validation.errors.join('\n'), 'error');
      return false;
    }
    
    // Mark question as saved and stop editing
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, is_saved: true }
        : q
    ));
    
    setEditingQuestionId(null);
    
    // Show success notification instead of alert
    showNotification('Question saved successfully!', 'success');
    return true;
  };

  const editQuestion = (questionId) => {
    setEditingQuestionId(questionId);
    // Mark as unsaved when starting to edit
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, is_saved: false }
        : q
    ));
  };

  const cancelEdit = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    
    // If this is a new question that hasn't been saved yet
    if (!question.is_saved && !question.question_text.trim()) {
      removeQuestion(questionId);
    } else {
      // If it was previously saved, revert to saved state
      setEditingQuestionId(null);
      if (question.is_saved) {
        // Mark as saved again (was marked unsaved when editing started)
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, is_saved: true }
            : q
        ));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;

    // Check if there are any unsaved questions
    const unsavedQuestions = questions.filter(q => !q.is_saved);
    if (unsavedQuestions.length > 0) {
      showNotification(`Please save ${unsavedQuestions.length} unsaved question(s) before submitting the quiz.`, 'error');
      return;
    }

    const validation = quizService.validateQuizData(formData);
    if (!validation.isValid) {
      showNotification('Please fix the following errors:\n' + validation.errors.join('\n'), 'error');
      return;
    }

    // Only include saved questions
    const savedQuestions = questions.filter(q => q.is_saved);

    try {
      setLoading(true);
      
      // Format the datetime values to ensure compatibility
      const formattedQuizData = {
      ...formData,
      // datetime-local input values are already in local time
      // Let the browser handle UTC conversion automatically
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      total_marks: parseInt(formData.total_marks),
      duration_minutes: parseInt(formData.duration_minutes)
    };
      
      console.log('Sending quiz data:', formattedQuizData);
      
      const quizResponse = await quizService.createQuiz(subjectId, formattedQuizData);
      console.log('Quiz creation response:', quizResponse);
      
      // More flexible quiz ID extraction
      let quizId = null;
      if (quizResponse.quiz?.id) {
        quizId = quizResponse.quiz.id;
      } else if (quizResponse.id) {
        quizId = quizResponse.id;
      } else if (quizResponse.data?.id) {
        quizId = quizResponse.data.id;
      }
      
      console.log('Extracted quiz ID:', quizId);
      
      // Only try to create questions if we have saved questions and a valid quiz ID
      if (savedQuestions.length > 0 && quizId) {
        console.log('Creating questions for quiz ID:', quizId);
        try {
          // Remove the id and is_saved fields from questions before sending to API
          const questionsForAPI = savedQuestions.map(({ id, is_saved, ...question }) => question);
          await quizService.createQuizQuestionsBulk(subjectId, quizId, questionsForAPI);
          console.log('Questions created successfully');
        } catch (questionError) {
          console.error('Error creating questions:', questionError);
          showNotification(`Quiz created successfully, but there was an issue with questions: ${questionError.message}`, 'error');
          return; // Don't navigate away if there was an error
        }
      } else if (savedQuestions.length > 0 && !quizId) {
        console.warn('Quiz created but no ID returned, cannot create questions');
        showNotification('Quiz created successfully, but questions could not be added due to missing quiz ID', 'error');
        return; // Don't navigate away if there was an error
      }
      
      showNotification('Quiz created successfully!', 'success');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate(`/faculty/subjects/${subjectId}/quizzes`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      
      let errorMessage = 'Failed to create quiz';
      if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionForm = (question) => {
    const isEditing = editingQuestionId === question.id;
    
    if (!isEditing) {
      // Display mode
      return (
        <div className={`bg-white/10 rounded-lg p-4 mb-4 border ${
          question.is_saved 
            ? 'border-green-400/50 bg-green-500/5' 
            : 'border-orange-400/50 bg-orange-500/5'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-sm">
                  Question {question.order_number + 1}
                </span>
                <span className="text-gray-400 text-sm">
                  {question.marks} marks • {question.question_type.replace('_', ' ')}
                </span>
                {question.is_saved ? (
                  <span className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-white mb-2 font-medium">{question.question_text || 'No question text yet'}</p>
              
              {question.question_type !== 'short_answer' && (
                <div className="space-y-1">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        option.is_correct ? 'bg-green-400' : 'bg-gray-500'
                      }`}></span>
                      <span className={option.is_correct ? 'text-green-300 font-medium' : 'text-gray-300'}>
                        {option.option_text || `Option ${index + 1} (empty)`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                type="button"
                onClick={() => editQuestion(question.id)}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                aria-label={`Edit question ${question.order_number + 1}`}
                disabled={loading}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                aria-label={`Remove question ${question.order_number + 1}`}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Edit mode
    return (
      <div className="bg-white/5 rounded-lg p-6 mb-4 border border-cyan-400/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-cyan-300">
            {question.is_saved ? `Edit Question ${question.order_number + 1}` : 'New Question'}
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => saveQuestion(question.id)}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-all flex items-center space-x-1"
              disabled={loading}
            >
              <Check className="w-3 h-3" />
              <span>Save Question</span>
            </button>
            <button
              type="button"
              onClick={() => cancelEdit(question.id)}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-all"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Question Text *</label>
            <textarea
              value={question.question_text}
              onChange={(e) => handleQuestionChange(question.id, 'question_text', e.target.value)}
              rows="2"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="Enter question text"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Question Type *</label>
              <select
                value={question.question_type}
                onChange={(e) => handleQuestionChange(question.id, 'question_type', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                disabled={loading}
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
                value={question.marks}
                onChange={(e) => handleQuestionChange(question.id, 'marks', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="Marks"
                min="1"
                disabled={loading}
              />
            </div>
          </div>

          {question.question_type !== 'short_answer' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Options *</label>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(question.id, index, 'option_text', e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder={`Option ${index + 1}`}
                    disabled={loading}
                  />
                  <input
                    type="radio"
                    name={`correct_option_${question.id}`}
                    checked={option.is_correct}
                    onChange={() => handleOptionChange(question.id, index, 'is_correct', true)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <label className="text-sm text-gray-300 min-w-[60px]">Correct</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Count saved questions
  const savedQuestionsCount = questions.filter(q => q.is_saved).length;
  const unsavedQuestionsCount = questions.filter(q => !q.is_saved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Notification Component */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          <div className="flex items-start space-x-2">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm whitespace-pre-line">{notification.message}</p>
          </div>
        </div>
      )}

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
          <h1 className="text-xl font-semibold">Create New Quiz</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold">Quiz Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Details Form */}
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
                  min={formData.start_time}
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

            {/* Questions Section */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-cyan-400">
                  Questions ({savedQuestionsCount} saved, {unsavedQuestionsCount} unsaved)
                </h3>
                
                {!editingQuestionId && (
                  <button
                    type="button"
                    onClick={addNewQuestion}
                    className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition-all"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                )}
              </div>

              {editingQuestionId && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    Please save or cancel the current question before adding a new one.
                  </p>
                </div>
              )}

              {unsavedQuestionsCount > 0 && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                  <p className="text-sm text-orange-300">
                    ⚠️ You have {unsavedQuestionsCount} unsaved question(s). Please save them before submitting the quiz.
                  </p>
                </div>
              )}

              {/* Render all questions */}
              {questions.map((question) => (
                <div key={question.id}>
                  {renderQuestionForm(question)}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex space-x-4 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || editingQuestionId !== null || unsavedQuestionsCount > 0}
                className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 px-6 py-3 rounded-lg transition-all"
                aria-label="Create quiz"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
                aria-label="Cancel creation"
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            {(editingQuestionId || unsavedQuestionsCount > 0) && (
              <div className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                ⚠️ Please save all questions before submitting the quiz.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;