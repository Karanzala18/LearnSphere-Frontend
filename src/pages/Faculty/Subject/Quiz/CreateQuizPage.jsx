import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
import { timezoneUtils } from '../../services/quizService';
import { ArrowLeft, Save, FileText, Plus, Trash2, Edit3, Check, AlertCircle, Clock, Award, Calendar } from 'lucide-react';

const CreateQuizPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
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

  const [questions, setQuestions] = useState([]);
  const [nextQuestionId, setNextQuestionId] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Memoized calculations for performance
  const { savedQuestionsCount, unsavedQuestionsCount, calculatedTotalMarks } = useMemo(() => {
    const saved = questions.filter(q => q.is_saved).length;
    const unsaved = questions.filter(q => !q.is_saved).length;
    const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
    return {
      savedQuestionsCount: saved,
      unsavedQuestionsCount: unsaved,
      calculatedTotalMarks: totalMarks
    };
  }, [questions]);

  // Marks validation logic
  const marksValidation = useMemo(() => {
    const setMarks = parseInt(formData.total_marks) || 0;
    if (setMarks === 0 || calculatedTotalMarks === 0) return { isValid: true, message: '' };

    if (calculatedTotalMarks > setMarks) {
      return {
        isValid: false,
        message: `Question marks (${calculatedTotalMarks}) exceed total marks (${setMarks}). Please reduce question marks or increase total marks.`,
        type: 'error'
      };
    }
    if (calculatedTotalMarks < setMarks) {
      return {
        isValid: true,
        message: `Question marks (${calculatedTotalMarks}) are less than total marks (${setMarks}). Total marks will be auto-adjusted to ${calculatedTotalMarks}.`,
        type: 'warning',
        autoAdjust: true
      };
    }
    return { isValid: true, message: '', type: 'success' };
  }, [formData.total_marks, calculatedTotalMarks]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleQuestionTypeChange = (questionId, newType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;

      let newOptions = [];
      if (newType === 'true_false') {
        newOptions = [
          { option_text: 'True', is_correct: true, order_number: 0 },
          { option_text: 'False', is_correct: false, order_number: 1 }
        ];
      } else if (newType === 'multiple_choice') {
        newOptions = [
          { option_text: '', is_correct: false, order_number: 0 },
          { option_text: '', is_correct: false, order_number: 1 },
          { option_text: '', is_correct: false, order_number: 2 },
          { option_text: '', is_correct: false, order_number: 3 }
        ];
      } else {
        newOptions = [];
      }

      return {
        ...q,
        question_type: newType,
        options: newOptions,
        is_saved: false
      };
    }));
  };

  const createEmptyQuestion = (id = null) => ({
    id: id || nextQuestionId,
    question_text: '',
    question_type: 'multiple_choice',
    marks: '1',
    order_number: questions.length,
    is_saved: false,
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
        ? { ...q, [field]: value, is_saved: false }
        : q
    ));
  };

  const handleOptionChange = (questionId, optionIndex, field, value) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;

      return {
        ...q,
        is_saved: false,
        options: q.options.map((opt, i) => {
          if (field === 'is_correct') {
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
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      return filtered.map((q, index) => ({ ...q, order_number: index }));
    });

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

    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, is_saved: true }
        : q
    ));

    setEditingQuestionId(null);
    showNotification('Question saved successfully!', 'success');
    return true;
  };

  const saveAllQuestions = () => {
    const unsavedQuestions = questions.filter(q => !q.is_saved);
    let allValid = true;
    const invalidQuestions = [];
    unsavedQuestions.forEach((question) => {
      const validation = quizService.validateQuestionData(question);
      if (!validation.isValid) {
        allValid = false;
        invalidQuestions.push({
          questionNumber: question.order_number + 1,
          errors: validation.errors
        });
      }
    });
    if (!allValid) {
      const errorMessage = invalidQuestions.map(q =>
        `Question ${q.questionNumber}:\n${q.errors.join('\n')}`
      ).join('\n\n');

      showNotification('Please fix the following errors before saving:\n\n' + errorMessage, 'error');
      return false;
    }
    setQuestions(prev => prev.map(q => ({ ...q, is_saved: true })));
    setEditingQuestionId(null);

    showNotification(`Successfully saved ${unsavedQuestions.length} question(s)!`, 'success');
    return true;
  };

  const editQuestion = (questionId) => {
    setEditingQuestionId(questionId);
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, is_saved: false }
        : q
    ));
  };

  const cancelEdit = (questionId) => {
    const question = questions.find(q => q.id === questionId);

    if (!question.is_saved && !question.question_text.trim()) {
      removeQuestion(questionId);
    } else {
      setEditingQuestionId(null);
      if (question.is_saved) {
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

    if (loading) return;

    // Check for marks validation
    if (!marksValidation.isValid) {
      showNotification(marksValidation.message, 'error');
      return;
    }

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

    const savedQuestions = questions.filter(q => q.is_saved);
    try {
      setLoading(true);

      // Auto-adjust total marks if needed
      const finalTotalMarks = marksValidation.autoAdjust ? calculatedTotalMarks : parseInt(formData.total_marks);

      const formattedQuizData = {
        ...formData,
        start_time: formData.start_time,
        end_time: formData.end_time,
        total_marks: finalTotalMarks,
        duration_minutes: parseInt(formData.duration_minutes)
      };

      console.log('Form data before conversion:', formData);
      console.log('Formatted quiz data:', formattedQuizData);

      const quizResponse = await quizService.createQuiz(subjectId, formattedQuizData);

      let quizId = null;
      if (quizResponse.quiz?.id) {
        quizId = quizResponse.quiz.id;
      } else if (quizResponse.id) {
        quizId = quizResponse.id;
      } else if (quizResponse.data?.id) {
        quizId = quizResponse.data.id;
      }

      if (savedQuestions.length > 0 && quizId) {
        try {
          const questionsForAPI = savedQuestions.map(({ id, is_saved, ...question }) => question);
          await quizService.createQuizQuestionsBulk(subjectId, quizId, questionsForAPI);
        } catch (questionError) {
          console.error('Error creating questions:', questionError);
          showNotification(`Quiz created successfully, but there was an issue with questions: ${questionError.message}`, 'error');
          return;
        }
      }

      showNotification('Quiz created successfully!', 'success');

      setTimeout(() => {
        navigate(`/faculty/subjects/${subjectId}/quizzes`);
      }, 1500);

    } catch (error) {
      console.error('Error creating quiz:', error);
      showNotification(error.message || 'Failed to create quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionForm = (question) => {
    const isEditing = editingQuestionId === question.id;

    if (!isEditing) {
      return (
        <div className={`bg-white rounded-lg p-5 mb-4 border-2 shadow-sm ${
          question.is_saved
            ? 'border-green-200 bg-green-50'
            : 'border-orange-200 bg-orange-50'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm font-medium">
                  Q{question.order_number + 1}
                </span>
                <span className="text-gray-600 text-sm flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  {question.marks} marks
                </span>
                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                  {question.question_type.replace('_', ' ')}
                </span>
                {question.is_saved ? (
                  <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-medium">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-gray-900 mb-3 font-medium">{question.question_text || 'No question text yet'}</p>

              {question.question_type !== 'short_answer' && (
                <div className="space-y-2 ml-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        option.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}>
                        {option.is_correct && <Check className="w-3 h-3 text-green-600" />}
                      </div>
                      <span className={option.is_correct ? 'text-green-700 font-medium' : 'text-gray-700'}>
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
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                aria-label={`Edit question ${question.order_number + 1}`}
                disabled={loading}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

    return (
      <div className="bg-white rounded-lg p-6 mb-4 border-2 border-blue-300 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {question.is_saved ? `Edit Question ${question.order_number + 1}` : 'New Question'}
          </h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => saveQuestion(question.id)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all flex items-center space-x-1 font-medium"
              disabled={loading}
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => cancelEdit(question.id)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
            <textarea
              value={question.question_text}
              onChange={(e) => handleQuestionChange(question.id, 'question_text', e.target.value)}
              rows="3"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
              placeholder="Enter question text"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
              <select
                value={question.question_type}
                onChange={(e) => handleQuestionTypeChange(question.id, e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                disabled={loading}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
              <input
                type="number"
                value={question.marks}
                onChange={(e) => handleQuestionChange(question.id, 'marks', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                placeholder="Marks"
                min="1"
                disabled={loading}
              />
            </div>
          </div>
          {question.question_type !== 'short_answer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(question.id, index, 'option_text', e.target.value)}
                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder={`Option ${index + 1}`}
                    disabled={loading || question.question_type === 'true_false'}
                    readOnly={question.question_type === 'true_false'}
                  />
                  <input
                    type="radio"
                    name={`correct_option_${question.id}`}
                    checked={option.is_correct}
                    onChange={() => handleOptionChange(question.id, index, 'is_correct', true)}
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <label className="text-sm text-gray-700 font-medium min-w-[60px]">Correct</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md border-l-4 ${
          notification.type === 'success'
            ? 'bg-white border-green-500'
            : 'bg-white border-red-500'
        }`}>
          <div className="flex items-start space-x-3">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
            )}
            <p className={`text-sm whitespace-pre-line ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>{notification.message}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all"
              aria-label="Back to quizzes"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Quizzes</span>
            </button>
            <div className="text-gray-300">|</div>
            <h1 className="text-xl font-bold text-gray-900">Create New Quiz</h1>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Quiz Info Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <FileText className="w-7 h-7" />
              <h2 className="text-2xl font-bold">Quiz Details</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Quiz Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Enter quiz title"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  Total Marks *
                </label>
                <input
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Total marks"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Duration in minutes"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                  min={formData.start_time}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 mr-3"
                  id="is_active"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Quiz is Active</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                placeholder="Quiz description (optional)"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows="4"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                placeholder="Quiz instructions for students (optional)"
                disabled={loading}
              />
            </div>
            {/* Questions Section */}
            <div className="border-t-2 border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Questions</h3>
                  <p className="text-sm text-gray-600">
                    {savedQuestionsCount} saved • {unsavedQuestionsCount} unsaved • Total Marks: {calculatedTotalMarks}
                  </p>
                </div>
                <div className="flex space-x-3">
                  {unsavedQuestionsCount > 0 && (
                    <button
                      type="button"
                      onClick={saveAllQuestions}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-sm"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All ({unsavedQuestionsCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addNewQuestion}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-sm"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>
              {/* Marks Validation Alert */}
              {marksValidation.message && (
                <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                  marksValidation.type === 'error'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-start space-x-3">
                    {marksValidation.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
                    )}
                    <p className={`text-sm ${
                      marksValidation.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                    }`}>{marksValidation.message}</p>
                  </div>
                </div>
              )}
              {/* Unsaved Questions Alert */}
              {unsavedQuestionsCount > 0 && (
                <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      ⚠️ You have {unsavedQuestionsCount} unsaved question(s). Please save them before submitting the quiz.
                    </p>
                  </div>
                </div>
              )}
              {/* Render all questions */}
              {questions.map((question) => (
                <div key={question.id}>
                  {renderQuestionForm(question)}
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions added yet. Click "Add Question" to get started.</p>
                </div>
              )}
              {/* Add Question button at bottom */}
              <div className="flex justify-center py-4">
                <button
                  type="button"
                  onClick={addNewQuestion}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-sm"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Another Question</span>
                </button>
              </div>
              {/* Submit buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || unsavedQuestionsCount > 0 || !marksValidation.isValid}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-sm"
                  aria-label="Create quiz"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes`)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-all font-medium shadow-sm"
                  aria-label="Cancel creation"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;