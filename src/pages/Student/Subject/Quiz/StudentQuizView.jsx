import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  FileText,
  Play,
  Eye,
  AlertCircle,
  RefreshCw,
  Timer,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  Star,
  BarChart3,
  Target,
  CheckSquare
} from 'lucide-react';
import studentQuizService from '../../services/studentQuizService';
import { subjectService } from '../../../Student/services/subjectService';

const StudentQuizView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizError, setQuizError] = useState('');
  const [startingQuiz, setStartingQuiz] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    console.log('StudentQuizView mounted with courseId:', courseId);
    if (courseId) {
      fetchCourseDetails();
      fetchStudentQuizzes();
    } else {
      console.error('No courseId provided');
      setError('No course ID provided');
      setLoading(false);
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching course details for ID:', courseId);
      const response = await subjectService.getSubjectDetails(courseId);
      console.log('Course details response:', response);
      setCourse(response.data || response);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError(error.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentQuizzes = async () => {
    try {
      setQuizzesLoading(true);
      setQuizError('');
      console.log('Fetching quizzes for course:', courseId);
      console.log('Course ID type:', typeof courseId);
      
      const response = await studentQuizService.getQuizzes(courseId);
      console.log('Service response received:', response);
      
      if (!response.success) {
        console.error('Service returned error:', response.message);
        throw new Error(response.message);
      }
      
      const quizzesData = response.quizzes || [];
      console.log('Setting quizzes data:', quizzesData);
      console.log('Quizzes count:', quizzesData.length);
      
      if (!Array.isArray(quizzesData)) {
        console.error('Quizzes data is not an array:', quizzesData);
        throw new Error('Invalid quiz data format received');
      }
      
      setQuizzes(quizzesData);
      
      quizzesData.forEach((quiz, index) => {
        console.log(`Quiz ${index + 1}:`, {
          id: quiz.id,
          title: quiz.title,
          active: quiz.is_active,
          start: quiz.start_time,
          end: quiz.end_time,
          attempted: !!quiz.attempt_id
        });
      });
      
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      console.error('Error stack:', error.stack);
      setQuizError(error.message || 'Failed to load quizzes');
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      setStartingQuiz(quizId);
      const response = await studentQuizService.startQuiz(quizId);
      if (response.success && response.attempt) {
        const attemptId = response.attempt.id;
        console.log('Quiz started, attempt ID:', attemptId);
        
        console.log('Current location before navigation:', window.location.href);
        
        const targetPath = `/student/quiz-attempts/${attemptId}`;
        console.log('Navigating to:', targetPath);
        
        navigate(targetPath);
        
        setTimeout(() => {
          console.log('Current location after navigation:', window.location.href);
        }, 100);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz: ' + error.message);
    } finally {
      setStartingQuiz(null);
    }
  };

  const handleGoBack = () => {
    navigate(`/student/subjects/${courseId}`);
  };

  const isQuizAvailable = (quiz) => {
    return studentQuizService.isQuizCurrentlyAvailable(quiz);
  };

  const getQuizStats = () => {
    const now = new Date();
    let available = 0;
    let attempted = 0;
    let missed = 0;
    let upcoming = 0;

    quizzes.forEach(quiz => {
      if (!quiz.is_active) {
        return;
      }

      const startTime = new Date(quiz.start_time);
      const endTime = new Date(quiz.end_time);

      if (quiz.attempt_id) {
        attempted++;
      } else if (now < startTime) {
        upcoming++;
      } else if (now > endTime) {
        missed++;
      } else if (now >= startTime && now <= endTime) {
        available++;
      }
    });

    return { available, attempted, missed, upcoming };
  };

  const getFilteredQuizzes = () => {
    const now = new Date();
    
    switch (activeFilter) {
      case 'available':
        return quizzes.filter(quiz => {
          if (!quiz.is_active || quiz.attempt_id) return false;
          const startTime = new Date(quiz.start_time);
          const endTime = new Date(quiz.end_time);
          return now >= startTime && now <= endTime;
        });
      case 'attempted':
        return quizzes.filter(quiz => quiz.attempt_id);
      case 'missed':
        return quizzes.filter(quiz => {
          if (!quiz.is_active || quiz.attempt_id) return false;
          const endTime = new Date(quiz.end_time);
          return now > endTime;
        });
      case 'upcoming':
        return quizzes.filter(quiz => {
          if (!quiz.is_active || quiz.attempt_id) return false;
          const startTime = new Date(quiz.start_time);
          return now < startTime;
        });
      default:
        return quizzes;
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const formatQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (quiz.attempt_id) {
      return { status: 'Completed', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckSquare };
    }

    if (!quiz.is_active) {
      return { status: 'Inactive', color: 'text-gray-400', bgColor: 'bg-gray-100', icon: XCircle };
    }
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
    }
    
    if (now > endTime) {
      return { status: 'Missed', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
    }
    
    if (now >= startTime && now <= endTime) {
      return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    }
    
    return { status: 'Unavailable', color: 'text-gray-400', bgColor: 'bg-gray-100', icon: XCircle };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not specified';
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid duration';
      
      const diffMinutes = Math.floor((end - start) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} min`;
      }
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } catch (error) {
      console.error('Duration calculation error:', error);
      return 'Invalid duration';
    }
  };

  const getQuizTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'practice':
        return <Zap className="w-4 h-4" />;
      case 'assessment':
        return <Award className="w-4 h-4" />;
      case 'midterm':
        return <TrendingUp className="w-4 h-4" />;
      case 'final':
        return <Star className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl p-6 border transition-all duration-300 text-left w-full ${
        isActive 
          ? 'border-blue-300 shadow-lg ring-2 ring-blue-100' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-2">Course ID: {courseId}</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchCourseDetails}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              Retry
            </button>
            <button
              onClick={handleGoBack}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getQuizStats();
  const filteredQuizzes = getFilteredQuizzes();

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
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Course</span>
          </button>
          
          <button
            onClick={fetchStudentQuizzes}
            disabled={quizzesLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700"
          >
            <RefreshCw className={`w-4 h-4 ${quizzesLoading ? 'animate-spin' : ''}`} />
            <span className="font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Course Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course?.name || 'Course Quizzes'}</h1>
              <p className="text-gray-600">{course?.code || ''}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('available')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeFilter === 'available'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Available Now</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'available'
                ? 'bg-green-700 text-white'
                : 'bg-green-100 text-green-700'
            }`}>
              {stats.available}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange('attempted')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeFilter === 'attempted'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Attempted</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'attempted'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {stats.attempted}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange('missed')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeFilter === 'missed'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Missed</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'missed'
                ? 'bg-red-700 text-white'
                : 'bg-red-100 text-red-700'
            }`}>
              {stats.missed}
            </span>
          </button>

          <button
            onClick={() => handleFilterChange('upcoming')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeFilter === 'upcoming'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Upcoming</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'upcoming'
                ? 'bg-yellow-700 text-white'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {stats.upcoming}
            </span>
          </button>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          {quizzesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-3" />
              <span className="text-gray-600">Loading quizzes...</span>
            </div>
          ) : quizError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Quizzes</h3>
              <p className="text-red-700 mb-4">{quizError}</p>
              <button
                onClick={fetchStudentQuizzes}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
              <p className="text-gray-600">There are no quizzes available for this course yet.</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Quizzes
              </h3>
              <p className="text-gray-600 mb-6">There are no {activeFilter} quizzes at the moment.</p>
              <button
                onClick={() => handleFilterChange('all')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Show All Quizzes
              </button>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const statusInfo = formatQuizStatus(quiz);
              const isAvailable = isQuizAvailable(quiz);
              const isStarting = startingQuiz === quiz.id;
              
              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            {getQuizTypeIcon(quiz.quiz_type)}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex items-center space-x-1`}>
                          <statusInfo.icon className="w-3 h-3" />
                          <span>{statusInfo.status}</span>
                        </div>
                      </div>
                      
                      {quiz.description && (
                        <p className="text-gray-600 mb-4">{quiz.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Start Time</p>
                            <p className="text-sm text-gray-900">{formatDateTime(quiz.start_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">End Time</p>
                            <p className="text-sm text-gray-900">{formatDateTime(quiz.end_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Timer className="w-4 h-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Duration</p>
                            <p className="text-sm text-gray-900">{calculateDuration(quiz.start_time, quiz.end_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Award className="w-4 h-4 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Max Marks</p>
                            <p className="text-sm text-gray-900">{quiz.total_marks || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {quiz.instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Instructions:</h4>
                          <p className="text-sm text-blue-800">{quiz.instructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      {isAvailable && !quiz.attempt_id ? (
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          disabled={isStarting}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 font-medium min-w-[140px] justify-center shadow-sm"
                        >
                          {isStarting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              <span>Start Quiz</span>
                            </>
                          )}
                        </button>
                      ) : !quiz.attempt_id ? (
                        <button
                          disabled
                          className="bg-gray-100 text-gray-400 px-6 py-3 rounded-lg flex items-center space-x-2 cursor-not-allowed min-w-[140px] justify-center border border-gray-200"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Unavailable</span>
                        </button>
                      ) : null}
                      
                      {quiz.attempt_id && (
                        <button
                          onClick={() => navigate(`/student/quiz-attempts/${quiz.attempt_id}/result`)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Result</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentQuizView;