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
import { subjectService } from '../../services/subjectService';

const StudentQuizView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState(new Set());
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
      loadAttemptedQuizzes();
    } else {
      console.error('No courseId provided');
      setError('No course ID provided');
      setLoading(false);
    }
  }, [courseId]);

  const loadAttemptedQuizzes = () => {
    // Load attempted quiz IDs from localStorage or any other storage
    // Since we can't modify backend, we'll track this on frontend
    const attempted = localStorage.getItem(`attempted_quizzes_${courseId}`);
    if (attempted) {
      setAttemptedQuizzes(new Set(JSON.parse(attempted)));
    }
  };

  const saveAttemptedQuiz = (quizId) => {
    const newAttempted = new Set([...attemptedQuizzes, quizId]);
    setAttemptedQuizzes(newAttempted);
    localStorage.setItem(`attempted_quizzes_${courseId}`, JSON.stringify([...newAttempted]));
  };

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
      
      const response = await studentQuizService.getQuizzes(courseId);
      console.log('Quizzes API Response:', response);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Extract quizzes from the response
      let quizzesData = [];
      if (response.quizzes) {
        quizzesData = response.quizzes;
      } else if (response.data?.quizzes) {
        quizzesData = response.data.quizzes;
      } else if (response.data && Array.isArray(response.data)) {
        quizzesData = response.data;
      }
      
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
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
        
        // Mark this quiz as attempted
        saveAttemptedQuiz(quizId);
        
        // Debug: Check current location
        console.log('Current location before navigation:', window.location.href);
        
        // Try navigation
        const targetPath = `/student/quiz-attempts/${attemptId}`;
        console.log('Navigating to:', targetPath);
        
        navigate(targetPath);
        
        // Debug: Check if navigation worked (with a small delay)
        setTimeout(() => {
          console.log('Current location after navigation:', window.location.href);
        }, 100);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setStartingQuiz(null);
    }
  };

  const handleGoBack = () => {
    navigate(`/student/subjects/${courseId}`);
  };

  const isQuizAvailable = (quiz) => {
    if (!quiz || !quiz.is_active) return false;
    
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);
    
    return now >= startTime && now <= endTime;
  };

  const isQuizAttempted = (quiz) => {
    return attemptedQuizzes.has(quiz.id);
  };

  const getQuizStats = () => {
    const now = new Date();
    let available = 0;
    let attempted = 0;
    let missed = 0;
    let upcoming = 0;

    quizzes.forEach(quiz => {
      const startTime = new Date(quiz.start_time);
      const endTime = new Date(quiz.end_time);
      const isAttempted = isQuizAttempted(quiz);

      if (isAttempted) {
        attempted++;
      } else if (!quiz.is_active) {
        // Inactive quizzes - don't count these
        return;
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
          const startTime = new Date(quiz.start_time);
          const endTime = new Date(quiz.end_time);
          const isAttempted = isQuizAttempted(quiz);
          return quiz.is_active && !isAttempted && now >= startTime && now <= endTime;
        });
      case 'attempted':
        return quizzes.filter(quiz => isQuizAttempted(quiz));
      case 'missed':
        return quizzes.filter(quiz => {
          const endTime = new Date(quiz.end_time);
          const isAttempted = isQuizAttempted(quiz);
          return quiz.is_active && !isAttempted && now > endTime;
        });
      case 'upcoming':
        return quizzes.filter(quiz => {
          const startTime = new Date(quiz.start_time);
          const isAttempted = isQuizAttempted(quiz);
          return quiz.is_active && !isAttempted && now < startTime;
        });
      default:
        return quizzes;
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const formatQuizStatus = (quiz) => {
    const isAvailable = isQuizAvailable(quiz);
    const isAttempted = isQuizAttempted(quiz);
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (isAttempted) {
      return { status: 'Completed', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: CheckSquare };
    }

    if (!quiz.is_active) {
      return { status: 'Inactive', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: XCircle };
    }
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock };
    }
    
    if (now > endTime) {
      return { status: 'Missed', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle };
    }
    
    if (isAvailable) {
      return { status: 'Available', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle };
    }
    
    return { status: 'Unavailable', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: XCircle };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Not specified';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.floor((end - start) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
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

  // Function to clear attempted quizzes (for testing purposes)
  const clearAttemptedQuizzes = () => {
    setAttemptedQuizzes(new Set());
    localStorage.removeItem(`attempted_quizzes_${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
            <span>Loading quizzes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Course</h2>
              <p className="text-gray-300 mb-2">Course ID: {courseId}</p>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchCourseDetails}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Retry
                </button>
                <button
                  onClick={handleGoBack}
                  className="border border-white/30 px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getQuizStats();
  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Course</span>
          </button>
          
          {/* Refresh Button and Debug Button */}
          <div className="flex space-x-4">
            <button
              onClick={clearAttemptedQuizzes}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-4 py-2 rounded-xl text-sm transition-all"
            >
              Clear Attempted (Debug)
            </button>
            <button
              onClick={fetchStudentQuizzes}
              disabled={quizzesLoading}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${quizzesLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Quizzes</span>
            </button>
          </div>
        </div>

        {/* Course Info Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{course?.name || 'Course Quizzes'}</h1>
              <p className="text-gray-300">{course?.code || ''}</p>
            </div>
          </div>
        </div>

        {/* Quiz Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => handleFilterChange('available')}
            className={`bg-green-500/10 backdrop-blur-sm rounded-xl p-6 border transition-all hover:bg-green-500/20 text-left ${
              activeFilter === 'available' ? 'border-green-500/50 ring-2 ring-green-500/30' : 'border-green-500/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-white">{stats.available}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterChange('attempted')}
            className={`bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border transition-all hover:bg-blue-500/20 text-left ${
              activeFilter === 'attempted' ? 'border-blue-500/50 ring-2 ring-blue-500/30' : 'border-blue-500/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-400 text-sm font-medium">Attempted</p>
                <p className="text-2xl font-bold text-white">{stats.attempted}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterChange('missed')}
            className={`bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border transition-all hover:bg-red-500/20 text-left ${
              activeFilter === 'missed' ? 'border-red-500/50 ring-2 ring-red-500/30' : 'border-red-500/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 text-sm font-medium">Missed</p>
                <p className="text-2xl font-bold text-white">{stats.missed}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterChange('upcoming')}
            className={`bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border transition-all hover:bg-yellow-500/20 text-left ${
              activeFilter === 'upcoming' ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : 'border-yellow-500/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-400 text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Filter Indicator */}
        {activeFilter !== 'all' && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Showing:</span>
              <span className="text-white font-semibold capitalize">{activeFilter} Quizzes</span>
              <span className="text-gray-400">({filteredQuizzes.length})</span>
            </div>
            <button
              onClick={() => handleFilterChange('all')}
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Show All Quizzes
            </button>
          </div>
        )}

        {/* Quiz List */}
        <div className="space-y-6">
          {quizzesLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mr-3" />
              <span>Loading quizzes...</span>
            </div>
          ) : quizError ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Quizzes</h3>
              <p className="text-gray-300 mb-4">{quizError}</p>
              <button
                onClick={fetchStudentQuizzes}
                className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
              <p className="text-gray-300 mb-6">There are no quizzes available for this course yet.</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Quizzes</h3>
              <p className="text-gray-300 mb-6">There are no {activeFilter} quizzes at the moment.</p>
              <button
                onClick={() => handleFilterChange('all')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                Show All Quizzes
              </button>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const statusInfo = formatQuizStatus(quiz);
              const isAvailable = isQuizAvailable(quiz) && !isQuizAttempted(quiz);
              const isAttempted = isQuizAttempted(quiz);
              const isStarting = startingQuiz === quiz.id;
              
              return (
                <div
                  key={quiz.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getQuizTypeIcon(quiz.quiz_type)}
                          <h3 className="text-xl font-semibold">{quiz.title}</h3>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} flex items-center space-x-1`}>
                          <statusInfo.icon className="w-3 h-3" />
                          <span>{statusInfo.status}</span>
                        </div>
                      </div>
                      
                      {quiz.description && (
                        <p className="text-gray-300 mb-4">{quiz.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-gray-400">Start Time</p>
                            <p className="text-white">{formatDateTime(quiz.start_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="text-gray-400">End Time</p>
                            <p className="text-white">{formatDateTime(quiz.end_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Timer className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-gray-400">Duration</p>
                            <p className="text-white">{quiz.duration_minutes ? `${quiz.duration_minutes} min` : calculateDuration(quiz.start_time, quiz.end_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <div>
                            <p className="text-gray-400">Max Marks</p>
                            <p className="text-white">{quiz.total_marks || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {quiz.instructions && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-blue-400 mb-1">Instructions:</h4>
                          <p className="text-sm text-gray-300">{quiz.instructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      {isAvailable ? (
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          disabled={isStarting}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all min-w-[120px] justify-center"
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
                      ) : (
                        <button
                          disabled
                          className="bg-gray-500/30 text-gray-400 px-6 py-3 rounded-xl flex items-center space-x-2 cursor-not-allowed min-w-[120px] justify-center"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Unavailable</span>
                        </button>
                      )}
                      
                      {isAttempted && (
                        <button
                          onClick={() => navigate(`/student/quiz-results/${quiz.id}`)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-6 py-2 rounded-xl flex items-center space-x-2 transition-all text-sm"
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
      </div>
    </div>
  );
};

export default StudentQuizView;