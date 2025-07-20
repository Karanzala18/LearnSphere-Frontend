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
  RefreshCw
} from 'lucide-react';
import { subjectService } from '../../services/subjectService';

const CourseDetails = () => {
  // Get courseId from URL parameters and navigation function
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
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

  const handleGoBack = () => {
    // Navigate back to student dashboard
    navigate('/student/dashboard');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Course</h2>
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
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Course Header */}
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

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quizzes Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-cyan-400" />
              Quizzes
            </h2>
            {course.quizzes && course.quizzes.length > 0 ? (
              <div className="space-y-3">
                {course.quizzes.slice(0, 3).map((quiz, index) => (
                  <div key={quiz.id || index} className="bg-white/10 p-4 rounded-lg">
                    <h3 className="font-semibold">{quiz.title || `Quiz ${index + 1}`}</h3>
                    <p className="text-sm text-gray-300">{quiz.description || 'No description'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        Questions: {quiz.questions_count || 0}
                      </span>
                      <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No quizzes available</p>
              </div>
            )}
          </div>

          {/* Assignments Section */}
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