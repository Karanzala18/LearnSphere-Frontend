import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../../../services/quizService';
import { ArrowLeft, Save, FileText } from 'lucide-react';

const CreateQuestionPage = () => {
  const { subjectId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questionData, setQuestionData] = useState({
  question_text: '',
  question_type: 'multiple_choice',
  marks: '1',
  order_number: 0,
  options: [
    { option_text: '', is_correct: false, order_number: 0 },
    { option_text: '', is_correct: false, order_number: 1 },
    { option_text: '', is_correct: false, order_number: 2 },
    { option_text: '', is_correct: false, order_number: 3 }
  ]
});

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setQuestionData(prev => ({
    ...prev,
    [name]: value
  }));

  // Reset options when question type changes
  if (name === 'question_type') {
    if (value === 'true_false') {
      setQuestionData(prev => ({
        ...prev,
        options: [
          { option_text: 'True', is_correct: true, order_number: 0 },
          { option_text: 'False', is_correct: false, order_number: 1 }
        ]
      }));
    } else if (value === 'multiple_choice') {
      setQuestionData(prev => ({
        ...prev,
        options: [
          { option_text: '', is_correct: false, order_number: 0 },
          { option_text: '', is_correct: false, order_number: 1 },
          { option_text: '', is_correct: false, order_number: 2 },
          { option_text: '', is_correct: false, order_number: 3 }
        ]
      }));
    } else {
      setQuestionData(prev => ({
        ...prev,
        options: []
      }));
    }
  }
};

  const handleOptionChange = (index, field, value) => {
    setQuestionData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: field === 'is_correct' ? value === 'true' : value } : opt
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = quizService.validateQuestionData(questionData);
    if (!validation.isValid) {
      alert('Please fix the following errors:\n' + validation.errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      await quizService.createQuizQuestion(subjectId, quizId, questionData);
      alert('Question created successfully!');
      navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}`);
    } catch (error) {
      alert(error.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}`)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            aria-label="Back to quiz"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quiz</span>
          </button>
          <div className="text-gray-400">|</div>
          <h1 className="text-xl font-semibold">Create New Question</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold">Question Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Question Text *</label>
              <textarea
                name="question_text"
                value={questionData.question_text}
                onChange={handleInputChange}
                rows="2"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="Enter question text"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Question Type *</label>
              <select
                name="question_type"
                value={questionData.question_type}
                onChange={handleInputChange}
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
                name="marks"
                value={questionData.marks}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="Marks for this question"
                min="1"
                required
                disabled={loading}
              />
            </div>

            {questionData.question_type !== 'short_answer' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Options *</label>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                      placeholder={`Option ${index + 1}`}
                      required
                      disabled={loading || questionData.question_type === 'true_false'}
                      readOnly={questionData.question_type === 'true_false'}
                    />
                    <input
                      type="radio"
                      name={`correct_option_${questionData.order_number}`}
                      value="true"
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(index, 'is_correct', 'true')}
                      className="mr-2"
                      disabled={loading}
                    />
                    <label className="text-sm text-gray-300">Correct</label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 px-6 py-3 rounded-lg transition-all"
                aria-label="Create question"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Create Question'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/faculty/subjects/${subjectId}/quizzes/${quizId}`)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-all"
                aria-label="Cancel creation"
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

export default CreateQuestionPage;