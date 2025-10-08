import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../../../services/quizService';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  BarChart3, 
  TrendingUp, 
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Search,
  Award,
  Clock,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

const QuizScorecardPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'attempted', 'not-attempted'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchScorecard();
  }, [quizId]);

  const fetchScorecard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getQuizScorecard(quizId);
      setScorecard(data);
    } catch (error) {
      console.error('Failed to fetch scorecard:', error);
      setError(error.message || 'Failed to fetch scorecard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      setLoadingDetails(true);
      const details = await quizService.getStudentQuizDetails(quizId, studentId);
      setStudentDetails(details);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      alert(error.message || 'Failed to fetch student details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter and search students
  const filteredStudents = scorecard?.scorecard?.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'attempted' && student.attempted) ||
                         (filterStatus === 'not-attempted' && !student.attempted);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Calculate statistics
  const statistics = scorecard ? quizService.getQuizStatistics(scorecard.scorecard) : null;

  // Export to CSV
  const exportToCSV = () => {
    if (!scorecard?.scorecard) return;
    
    const headers = ['Student ID', 'Name', 'Email', 'Attempted', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade'];
    const csvContent = [
      headers.join(','),
      ...scorecard.scorecard.map(student => {
        const grade = student.attempted ? quizService.calculateGrade(student.percentage || 0) : { grade: 'N/A' };
        return [
          student.student_id,
          `"${student.student_name}"`,
          student.student_email,
          student.attempted ? 'Yes' : 'No',
          student.marks_obtained || 'N/A',
          student.total_marks || 'N/A',
          student.percentage ? `${student.percentage}%` : 'N/A',
          grade.grade
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scorecard.quiz_title}_scorecard.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchScorecard}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="text-gray-400">|</div>
            <h1 className="text-xl font-semibold">Quiz Scorecard</h1>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quiz Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400">{scorecard?.quiz_title}</h2>
              <p className="text-gray-300">Subject: {scorecard?.subject}</p>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Scorecard</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Students</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.totalStudents}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-green-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Attempted</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.attemptedCount}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-red-400 mb-2">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Not Attempted</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.notAttemptedCount}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Average</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.averageScore}%</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Highest</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.highestScore}%</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-orange-400 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Lowest</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.lowestScore}%</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-2 text-pink-400 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-sm">Pass Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{statistics.passRate}%</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="attempted">Attempted</option>
                  <option value="not-attempted">Not Attempted</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white">
              Student Performance ({filteredStudents.length} students)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-cyan-400 font-medium">Student ID</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Name</th>
                  <th className="text-left p-4 text-cyan-400 font-medium">Email</th>
                  <th className="text-center p-4 text-cyan-400 font-medium">Status</th>
                  <th className="text-center p-4 text-cyan-400 font-medium">Marks</th>
                  <th className="text-center p-4 text-cyan-400 font-medium">Percentage</th>
                  <th className="text-center p-4 text-cyan-400 font-medium">Grade</th>
                  <th className="text-center p-4 text-cyan-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const grade = student.attempted ? quizService.calculateGrade(student.percentage || 0) : null;
                    
                    return (
                      <tr key={student.student_id} className={`border-t border-white/10 hover:bg-white/5 transition-all ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                        <td className="p-4 text-white font-medium">{student.student_id}</td>
                        <td className="p-4 text-white">{student.student_name}</td>
                        <td className="p-4 text-gray-300">{student.student_email}</td>
                        <td className="p-4 text-center">
                          {student.attempted ? (
                            <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                              <XCircle className="w-3 h-3" />
                              <span>Not Attempted</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center text-white">
                          {student.attempted ? `${student.marks_obtained}/${student.total_marks}` : '-'}
                        </td>
                        <td className="p-4 text-center text-white">
                          {student.attempted ? `${student.percentage}%` : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {grade ? (
                            <span className={`font-bold ${grade.color}`}>{grade.grade}</span>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-center">
                          {student.attempted && (
                            <button
                              onClick={() => fetchStudentDetails(student.student_id)}
                              disabled={loadingDetails}
                              className="inline-flex items-center space-x-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-xs transition-all disabled:opacity-50"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Details</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Details Modal */}
        {selectedStudent && studentDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {studentDetails.student_name}'s Quiz Attempt
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentDetails(null);
                    }}
                    className="text-gray-400 hover:text-white transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-400 mt-1">Student ID: {studentDetails.student_id}</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Student Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-cyan-400 text-sm mb-1">Started At</div>
                    <div className="text-white font-medium">
                      {studentDetails.started_at ? 
                        new Date(studentDetails.started_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-purple-400 text-sm mb-1">Submitted At</div>
                    <div className="text-white font-medium">
                      {studentDetails.submitted_at ? 
                        new Date(studentDetails.submitted_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-green-400 text-sm mb-1">Score</div>
                    <div className="text-white font-medium">
                      {studentDetails.total_marks_obtained}/{studentDetails.total_marks}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-yellow-400 text-sm mb-1">Percentage</div>
                    <div className="text-white font-medium">{studentDetails.percentage}%</div>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Answer Details</h4>
                  {studentDetails.answers?.map((answer, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="text-white font-medium">Q{index + 1}: {answer.question}</h5>
                        <div className="flex items-center space-x-2">
                          {answer.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="text-sm text-gray-300">
                            {answer.marks_obtained} marks
                          </span>
                        </div>
                      </div>
                      
                      {answer.selected_option && (
                        <div className="mb-2">
                          <span className="text-gray-400 text-sm">Selected Option: </span>
                          <span className={`${answer.is_correct ? 'text-green-300' : 'text-red-300'}`}>
                            {answer.selected_option}
                          </span>
                        </div>
                      )}
                      
                      {answer.answer_text && (
                        <div>
                          <span className="text-gray-400 text-sm">Text Answer: </span>
                          <span className="text-white">{answer.answer_text}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizScorecardPage;