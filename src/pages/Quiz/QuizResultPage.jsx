import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Trophy, Target, Clock, RefreshCw } from 'lucide-react';
import studentQuizService from '../../services/studentQuizService';

const QuizResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentQuizService.getQuizResult(attemptId);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      setResult(response.result);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.message || 'Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500/10';
    if (percentage >= 80) return 'bg-blue-500/10';
    if (percentage >= 70) return 'bg-yellow-500/10';
    if (percentage >= 60) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  const getGradeText = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center text-white">
          <RefreshCw className="w-8 h-8 animate-spin mr-3" />
          <span className="text-xl">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={fetchResults}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('student/course/${courseId}/quizzes')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No results available</div>
      </div>
    );
  }

  const percentage = result.percentage || 0;
  const correctAnswers = result.answers?.filter(a => a.is_correct).length || 0;
  const totalQuestions = result.answers?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
        </div>

        {/* Score Summary */}
        <div className={`${getGradeBgColor(percentage)} rounded-lg p-6 mb-8 border border-white/20`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className={`w-16 h-16 ${getGradeColor(percentage)}`} />
            </div>
            <h2 className="text-3xl font-bold mb-2">{getGradeText(percentage)}</h2>
            <div className={`text-5xl font-bold mb-4 ${getGradeColor(percentage)}`}>
              {percentage.toFixed(1)}%
            </div>
            <p className="text-gray-300 text-lg">
              {result.marksObtained} out of {result.totalMarks} marks
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-cyan-400 mr-2" />
              <h3 className="font-semibold">Score</h3>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {result.marksObtained}/{result.totalMarks}
            </p>
            <p className="text-sm text-gray-300">Total Marks</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <h3 className="font-semibold">Accuracy</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {correctAnswers}/{totalQuestions}
            </p>
            <p className="text-sm text-gray-300">Correct Answers</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center mb-2">
              <Trophy className={`w-5 h-5 ${getGradeColor(percentage)} mr-2`} />
              <h3 className="font-semibold">Grade</h3>
            </div>
            <p className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
              {getGradeText(percentage)}
            </p>
            <p className="text-sm text-gray-300">{percentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Detailed Results */}
        {result.answers && result.answers.length > 0 && (
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Question-wise Results</h3>
            <div className="space-y-4">
              {result.answers.map((answer, index) => (
                <div
                  key={answer.question_id}
                  className={`p-4 rounded-lg border ${
                    answer.is_correct
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        Q{index + 1}
                      </span>
                      {answer.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                        {answer.marks_obtained} marks
                      </p>
                    </div>
                  </div>
                  
                  {answer.selected_option_id && (
                    <div className="text-sm text-gray-300 mt-2">
                      <p><strong>Your Answer:</strong> Option {answer.selected_option_id}</p>
                    </div>
                  )}
                  
                  {answer.answer_text && (
                    <div className="text-sm text-gray-300 mt-2">
                      <p><strong>Your Answer:</strong> {answer.answer_text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => navigate(-2)} // Go back to quiz list
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;