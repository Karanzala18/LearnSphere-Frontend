import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Award,
  Brain,
  FileText,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  BarChart3,
  Users,
  TrendingUp,
  Timer,
  ChevronRight
} from 'lucide-react';
import { subjectService } from '../services/subjectService';
import studentQuizService from '../services/studentQuizService';

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
      
      const response = await studentQuizService.getQuizzes(courseId);
      console.log('Quizzes API Response:', response);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
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
      return { status: 'Inactive', color: 'text-gray-400', bgColor: 'bg-gray-100', icon: XCircle };
    }
    
    if (now < startTime) {
      return { status: 'Upcoming', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
    }
    
    if (now > endTime) {
      return { status: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
    }
    
    if (isAvailable) {
      return { status: 'Available', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    }
    
    return { status: 'Unavailable', color: 'text-gray-400', bgColor: 'bg-gray-100', icon: XCircle };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
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

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The requested course could not be found.</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      <div className="fixed inset-0 opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Course Header */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{course.name || 'Course Name'}</h1>
                  <p className="text-gray-600">{course.code || 'Course Code'}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 max-w-3xl">{course.description || 'No description available'}</p>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-100">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Instructor</p>
                <p className="font-semibold text-gray-900">{course.faculty?.name || course.faculty_name || 'Unknown Faculty'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Semester"
            value={course.semester || 'Current'}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Award}
            title="Credits"
            value={course.credits || 'N/A'}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Brain}
            title="Total Quizzes"
            value={quizzes.length}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Department"
            value={course.department || 'N/A'}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => navigate(`/student/course/${courseId}/quizzes`)}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-4 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">All Quizzes</h3>
              <p className="text-sm text-gray-600">View and manage all quizzes</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>

          <button 
            onClick={() => navigate(`/student/course/${courseId}/assignments`)}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 flex items-center space-x-4 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Assignments</h3>
              <p className="text-sm text-gray-600">View and manage assignments</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default CourseDetails;