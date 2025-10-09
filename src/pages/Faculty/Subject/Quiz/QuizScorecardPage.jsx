import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../../services/quizService';
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
  const [filterStatus, setFilterStatus] = useState('all');
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

  const filteredStudents = scorecard?.scorecard?.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'attempted' && student.attempted) ||
                         (filterStatus === 'not-attempted' && !student.attempted);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const statistics = scorecard ? quizService.getQuizStatistics(scorecard.scorecard) : null;

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchScorecard}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Black Navbar */}
      <div className="bg-black text-white p-4 border-b-2 border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="text-gray-600">|</div>
            <h1 className="text-xl font-semibold">Quiz Scorecard</h1>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quiz Info */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">{scorecard?.quiz_title}</h2>
              <p className="text-gray-700">Subject: {scorecard?.subject}</p>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Scorecard</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.totalStudents}</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Attempted</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.attemptedCount}</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Not Attempted</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.notAttemptedCount}</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Average</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.averageScore}%</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Highest</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.highestScore}%</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-600 mb-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Lowest</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.lowestScore}%</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-pink-600 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Pass Rate</span>
              </div>
              <p className="text-2xl font-bold text-black">{statistics.passRate}%</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="attempted">Attempted</option>
                  <option value="not-attempted">Not Attempted</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h3 className="text-xl font-semibold text-black">
              Student Performance ({filteredStudents.length} students)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left p-4 text-blue-600 font-semibold">Student ID</th>
                  <th className="text-left p-4 text-blue-600 font-semibold">Name</th>
                  <th className="text-left p-4 text-blue-600 font-semibold">Email</th>
                  <th className="text-center p-4 text-blue-600 font-semibold">Status</th>
                  <th className="text-center p-4 text-blue-600 font-semibold">Marks</th>
                  <th className="text-center p-4 text-blue-600 font-semibold">Percentage</th>
                  <th className="text-center p-4 text-blue-600 font-semibold">Grade</th>
                  <th className="text-center p-4 text-blue-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center p-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const grade = student.attempted ? quizService.calculateGrade(student.percentage || 0) : null;
                    
                    return (
                      <tr key={student.student_id} className={`border-t border-gray-200 hover:bg-gray-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="p-4 text-black font-medium">{student.student_id}</td>
                        <td className="p-4 text-black">{student.student_name}</td>
                        <td className="p-4 text-gray-600">{student.student_email}</td>
                        <td className="p-4 text-center">
                          {student.attempted ? (
                            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              <span>Not Attempted</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center text-black font-medium">
                          {student.attempted ? `${student.marks_obtained}/${student.total_marks}` : '-'}
                        </td>
                        <td className="p-4 text-center text-black font-medium">
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
                              className="inline-flex items-center space-x-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs transition-all disabled:opacity-50 font-medium"
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
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-300">
              <div className="p-6 border-b-2 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black">
                    {studentDetails.student_name}'s Quiz Attempt
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentDetails(null);
                    }}
                    className="text-gray-500 hover:text-black transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Student ID: {studentDetails.student_id}</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Student Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                    <div className="text-blue-600 text-sm mb-1 font-medium">Started At</div>
                    <div className="text-black font-semibold">
                      {studentDetails.started_at ? 
                        new Date(studentDetails.started_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                    <div className="text-purple-600 text-sm mb-1 font-medium">Submitted At</div>
                    <div className="text-black font-semibold">
                      {studentDetails.submitted_at ? 
                        new Date(studentDetails.submitted_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                    <div className="text-green-600 text-sm mb-1 font-medium">Score</div>
                    <div className="text-black font-semibold">
                      {studentDetails.total_marks_obtained}/{studentDetails.total_marks}
                    </div>
                  </div>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                    <div className="text-yellow-600 text-sm mb-1 font-medium">Percentage</div>
                    <div className="text-black font-semibold">{studentDetails.percentage}%</div>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-black mb-4">Answer Details</h4>
                  {studentDetails.answers?.map((answer, index) => (
                    <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="text-black font-medium">Q{index + 1}: {answer.question}</h5>
                        <div className="flex items-center space-x-2">
                          {answer.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm text-gray-700 font-medium">
                            {answer.marks_obtained} marks
                          </span>
                        </div>
                      </div>
                      
                      {answer.selected_option && (
                        <div className="mb-2">
                          <span className="text-gray-600 text-sm font-medium">Selected Option: </span>
                          <span className={`font-medium ${answer.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                            {answer.selected_option}
                          </span>
                        </div>
                      )}
                      
                      {answer.answer_text && (
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Text Answer: </span>
                          <span className="text-black">{answer.answer_text}</span>
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