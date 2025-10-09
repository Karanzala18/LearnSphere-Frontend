import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Trophy, 
  Target, 
  RefreshCw,
  Award,
  TrendingUp,
  Printer,
  Download,
  BarChart3,
  BookOpen,
  AlertCircle
} from 'lucide-react';
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
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (percentage) => {
    if (percentage >= 90) return 'from-green-500 to-green-600';
    if (percentage >= 80) return 'from-blue-500 to-blue-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getGradeText = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Very Good';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={fetchResults}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-xl">No results available</p>
        </div>
      </div>
    );
  }

  const percentage = result.percentage || 0;
  const correctAnswers = result.answers?.filter(a => a.is_correct).length || 0;
  const totalQuestions = result.answers?.length || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700"
            >
              <Printer className="w-4 h-4" />
              <span className="font-medium">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Result Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 bg-gradient-to-br ${getGradeBgColor(percentage)} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-xl text-gray-600 mb-6">{getGradeText(percentage)} Performance</p>
            <div className={`text-6xl font-bold mb-4 ${getGradeColor(percentage)}`}>
              {percentage.toFixed(1)}%
            </div>
            <p className="text-lg text-gray-600">
              You scored <span className="font-semibold text-gray-900">{result.marksObtained}</span> out of <span className="font-semibold text-gray-900">{result.totalMarks}</span> marks
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {result.marksObtained}<span className="text-xl text-gray-500">/{result.totalMarks}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-600">
              {correctAnswers}<span className="text-xl text-gray-500">/{totalQuestions}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Incorrect</p>
            <p className="text-3xl font-bold text-red-600">
              {incorrectAnswers}<span className="text-xl text-gray-500">/{totalQuestions}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getGradeBgColor(percentage)} rounded-xl flex items-center justify-center`}>
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Grade</p>
            <p className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
              {getGradeText(percentage)}
            </p>
          </div>
        </div>

        {/* Performance Insight */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analysis</h3>
              <p className="text-gray-700">
                {percentage >= 90 && "Outstanding work! You've demonstrated exceptional understanding of the material."}
                {percentage >= 80 && percentage < 90 && "Great job! You have a strong grasp of the concepts covered in this quiz."}
                {percentage >= 70 && percentage < 80 && "Good effort! You're on the right track. Review the areas where you missed points."}
                {percentage >= 60 && percentage < 70 && "Fair performance. Consider reviewing the material and practicing more."}
                {percentage < 60 && "Keep practicing! Review the material thoroughly and don't hesitate to ask for help."}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {result.answers && result.answers.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Question-wise Results</h2>
            </div>
            
            <div className="space-y-4">
              {result.answers.map((answer, index) => (
                <div
                  key={answer.question_id}
                  className={`rounded-xl p-6 border-2 transition-all duration-200 ${
                    answer.is_correct
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                        answer.is_correct ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        {answer.is_correct ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-semibold text-green-900">Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-600" />
                            <span className="font-semibold text-red-900">Incorrect</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${answer.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.marks_obtained}
                      </div>
                      <div className="text-sm text-gray-600">marks</div>
                    </div>
                  </div>
                  
                  {answer.selected_option_id && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                      <p className="text-gray-900">Option {answer.selected_option_id}</p>
                    </div>
                  )}
                  
                  {answer.answer_text && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                      <p className="text-gray-900">{answer.answer_text}</p>
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
            onClick={() => navigate(-2)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm"
          >
            Back to Quizzes
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuizResultPage;