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
import studentQuizService from '../../services/studentQuizService'; // Updated import

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
    console.log('CourseDetails mounted with courseId:', courseId);
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
      
      // Use the new studentQuizService
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
      const quiz = quizzes.find(q => q.id === quizId);
      if (!isQuizAvailable(quiz)) {
        alert('This quiz is not currently available');
        return;
      }

      console.log('Starting quiz:', quizId);
      const response = await studentQuizService.startQuiz(quizId);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      // Navigate to quiz attempt page
      const attemptId = response.attempt?.id || response.data?.attempt?.id || response.data?.id;
      console.log('Quiz started, attempt ID:', attemptId);
      
      if (attemptId) {
        navigate(`/student/quiz-attempts/${attemptId}`);
      } else {
        throw new Error('No attempt ID received from server');
      }
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz: ' + error.message);
    }
  };

  const handleGoBack = () => {
    navigate('/student/dashboard');
  };

  const isQuizAvailable = (quiz) => {
    if (!quiz || !quiz.is_active) return false;
    
    const now = new Date();
    const startTime = new Date(quiz.start_time);
    const endTime = new Date(quiz.end_time);
    
    return now >= startTime && now <= endTime;
  };

  const formatQuizStatus = (quiz) => {
    const isAvailable = isQuizAvailable(quiz);
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

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/student/course/${courseId}/quizzes`)}
            className="flex-1 bg-blue-900 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-800 transition-colors"
          >
            <span className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">All Quizzes</h3>
              <p className="text-sm text-gray-300">View and manage all quizzes</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`/student/course/${courseId}/assignments`)}
            className="flex-1 bg-blue-900 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-800 transition-colors"
          >
            <span className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"/>
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-semibold">Assignments</h3>
              <p className="text-sm text-gray-300">View and manage assignments</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;