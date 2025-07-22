import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  FileText,
  Award,
  Brain,
  Play,
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import quizService from '../../services/quizService';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizError, setQuizError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchStudentQuizzes();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await subjectService.getSubjectDetails(courseId);
      setCourse(response.data || response);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentQuizzes = async () => {
    try {
      setQuizzesLoading(true);
      setQuizError('');
      const response = await quizService.getStudentQuizzes(courseId);
      console.log('Quizzes API Response:', response); // Debug log
      setQuizzes(response.data?.quizzes || response.quizzes || response.data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizError('Failed to load quizzes');
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      const quiz = quizzes.find(q => q.id === quizId);
      if (!quizService.isQuizAvailable(quiz)) {
        alert('This quiz is not currently available');
        return;
      }

      const response = await quizService.startQuizAttempt(quizId);
      navigate(`/student/quiz/${quizId}/attempt/${response.data.attempt_id || response.attempt_id}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigate('/student/dashboard');
  };

  const formatQuizStatus = (quiz) => {
    const isAvailable = quizService.isQuizAvailable(quiz);
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);

    if (!quiz.is_active) {
      return { status: 'Inactive', color: 'text-gray-400', icon: XCircle };
    }
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'text-yellow-400', icon: Clock };
    }
    
    if (now > endTime) {
      return { status: 'Expired', color: 'text-red-400', icon: XCircle };
    }
    
    if (isAvailable) {
      return { status: 'Available', color: 'text-green-400', icon: CheckCircle };
    }
    
    return { status: 'Unavailable', color: 'text-gray-400', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mr-3" />
            <span>Loading course details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || quizError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Course or Quizzes</h2>
              <p className="text-gray-300 mb-6">{error || quizError}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchCourseDetails}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Retry Course
                </button>
                <button
                  onClick={fetchStudentQuizzes}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Retry Quizzes
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
              <p className="text-gray-300 mb-6">The requested course could not be found.</p>
              <button
                onClick={handleGoBack}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.name || 'Course Name'}</h1>
              <p className="text-xl text-gray-300 mb-4">{course.code || 'Course Code'}</p>
              <p className="text-gray-300 mb-6">{course.description || 'No description available'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm text-gray-300">Semester</p>
                  <p className="text-lg font-semibold">{course.semester || 'Current'}</p>
                </div>
                <div className="text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-gray-300">Credits</p>
                  <p className="text-lg font-semibold">{course.credits || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-sm text-gray-300">Department</p>
                  <p className="text-lg font-semibold">{course.department || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                  <p className="text-sm text-gray-300">Quizzes</p>
                  <p className="text-lg font-semibold">{quizzes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8" />
                </div>
                <p className="text-sm text-gray-300">Faculty</p>
                <p className="font-semibold">{course.faculty?.name || course.faculty_name || 'Unknown Faculty'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Brain className="w-5 h-5 mr-2 text-cyan-400" />
                Quizzes
              </h2>
              {quizzesLoading && (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
            </div>
            
            {!quizzesLoading && (quizzes?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quizzes.map((quiz, index) => {
                  const statusInfo = formatQuizStatus(quiz);
                  const StatusIcon = statusInfo.icon;
                  const isAvailable = quizService.isQuizAvailable(quiz);
                  const timeRemaining = quizService.getQuizTimeRemaining(quiz);

                  return (
                    <div key={quiz.id || index} className="bg-white/10 p-4 rounded-lg hover:bg-white/15 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{quiz.title || `Quiz ${index + 1}`}</h3>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-xs ${statusInfo.color}`}>{statusInfo.status}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{quiz.description || 'No description'}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-xs">
                          <span className="text-gray-400">Questions: </span>
                          <span className="text-white">{quiz.questions_count || quiz.question_count || 0}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-400">Duration: </span>
                          <span className="text-white">{quiz.duration_minutes || 0} min</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-400">Total Marks: </span>
                          <span className="text-white">{quiz.total_marks || 0}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-400">Attempts: </span>
                          <span className="text-white">{quiz.attempt_count || 0}</span>
                        </div>
                      </div>

                      {quiz.start_time && quiz.end_time && (
                        <div className="text-xs text-gray-400 mb-3">
                          <div>Start: {new Date(quiz.start_time).toLocaleString()}</div>
                          <div>End: {new Date(quiz.end_time).toLocaleString()}</div>
                          {isAvailable && !timeRemaining.expired && (
                            <div className="text-yellow-300 mt-1">
                              <Timer className="w-3 h-3 inline mr-1" />
                              Time remaining: {timeRemaining.formatted}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs">
                          {quiz.max_attempts && (
                            <span className="text-gray-400">
                              Max attempts: {quiz.max_attempts}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartQuiz(quiz.id)}
                          disabled={!isAvailable}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all ${
                            isAvailable
                              ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Play className="w-4 h-4" />
                          <span>{isAvailable ? 'Start Quiz' : 'Not Available'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No quizzes available</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Assignments
            </h2>
            {course.assignments && course.assignments.length > 0 ? (
              <div className="space-y-3">
                {course.assignments.slice(0, 3).map((assignment, index) => (
                  <div key={assignment.id || index} className="bg-white/10 p-4 rounded-lg">
                    <h3 className="font-semibold">{assignment.title || `Assignment ${index + 1}`}</h3>
                    <p className="text-sm text-gray-300">{assignment.description || 'No description'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        Due: {assignment.due_date || 'No due date'}
                      </span>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No assignments available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
