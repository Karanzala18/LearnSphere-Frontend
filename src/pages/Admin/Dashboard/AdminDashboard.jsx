import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  BookOpen, 
  GraduationCap,
  FileText,
  Activity,
  Download,
  Eye,
  LogOut,
  ChevronDown,
  Trash2,
  X,
  UserCircle,
  Mail,
  Building,
  Calendar
} from 'lucide-react';

// Import actual services
import AdminDashboardService from '../services/adminDashboardService';
import FacultyReportService from '../services/facultyReportService';
import { authService } from '../../../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalSubjects: 0
    }
  });
  const [facultyReport, setFacultyReport] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);

  // Initialize services with useMemo
  const adminService = useMemo(() => new AdminDashboardService(), []);
  const facultyService = useMemo(() => new FacultyReportService(), []);

  // Fetch dashboard data with useCallback for optimization
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats();
      if (response.status) {
        setDashboardData(prevData => ({
          ...prevData,
          stats: {
            totalStudents: response.data.total_students || 0,
            totalFaculty: response.data.total_faculty || 0,
            totalSubjects: response.data.total_subjects || 0
          }
        }));
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [adminService]);

  // Fetch faculty report
  const fetchFacultyReport = useCallback(async () => {
    try {
      const response = await facultyService.getFacultySubjectReport();
      if (response.status) {
        setFacultyReport(response.data);
      } else {
        throw new Error('Failed to fetch faculty report');
      }
    } catch (error) {
      console.error('Error fetching faculty report:', error);
      setError('Failed to load faculty report');
    }
  }, [facultyService]);

  useEffect(() => {
    fetchDashboardData();
    fetchFacultyReport();
  }, [fetchDashboardData, fetchFacultyReport]);

  const handleExportFacultyReport = useCallback(async (format = 'csv') => {
    try {
      const blob = await facultyService.exportFacultyReport(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faculty-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting faculty report:', error);
    }
  }, [facultyService]);

  const handleViewFaculty = useCallback((faculty) => {
    setSelectedFaculty(faculty);
    setShowFacultyModal(true);
  }, []);

  const handleDeleteFaculty = useCallback(async (facultyId, facultyName) => {
    if (!window.confirm(`Are you sure you want to delete ${facultyName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await facultyService.deleteFaculty(facultyId);
      if (response.status) {
        alert('Faculty deleted successfully');
        fetchFacultyReport();
      } else {
        alert('Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Error deleting faculty');
    }
  }, [facultyService, fetchFacultyReport]);

  const handleDeleteSubject = useCallback(async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete ${subjectName}?`)) {
      return;
    }
    
    try {
      const response = await facultyService.deleteSubject(subjectId);
      if (response.status) {
        alert('Subject deleted successfully');
        if (selectedFaculty) {
          const updatedFaculty = facultyReport.find(f => f.faculty_id === selectedFaculty.faculty_id);
          if (updatedFaculty) {
            setSelectedFaculty(updatedFaculty);
          }
        }
        fetchFacultyReport();
      } else {
        alert('Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Error deleting subject');
    }
  }, [facultyService, fetchFacultyReport, selectedFaculty, facultyReport]);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Students" 
          value={dashboardData.stats.totalStudents.toLocaleString()} 
          color="bg-blue-600"
        />
        <StatCard 
          icon={GraduationCap} 
          title="Faculty Members" 
          value={dashboardData.stats.totalFaculty} 
          color="bg-purple-600"
        />
        <StatCard 
          icon={BookOpen} 
          title="Active Subjects" 
          value={dashboardData.stats.totalSubjects} 
          color="bg-green-600"
        />
      </div>
    </div>
  );

  const FacultyReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Faculty Subject Reports</span>
          </h3>
          <button
            onClick={() => handleExportFacultyReport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all duration-300 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading faculty reports...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : facultyReport.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No faculty reports available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Faculty Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facultyReport.map((faculty) => (
                  <tr key={faculty.faculty_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                          <div className="text-xs text-gray-500">{faculty.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{faculty.department || 'N/A'}</span>
                      {faculty.designation && (
                        <div className="text-xs text-gray-500">{faculty.designation}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {faculty.subjects && faculty.subjects.length > 0 ? (
                          faculty.subjects.slice(0, 3).map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                              {subject.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No subjects</span>
                        )}
                        {faculty.subjects && faculty.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            +{faculty.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {faculty.subjects.reduce((sum, subject) => sum + (subject.student_count || 0), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFaculty(faculty);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFaculty(faculty.faculty_id, faculty.name);
                          }}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Faculty Details Modal */}
      {showFacultyModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedFaculty.name}</h2>
                  <p className="text-sm text-blue-100 mt-1">{selectedFaculty.email}</p>
                  <p className="text-sm text-blue-100">{selectedFaculty.designation || 'Faculty'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFacultyModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Faculty Info Summary */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">Department</p>
                  </div>
                  <p className="text-lg font-semibold text-blue-900">{selectedFaculty.department || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <p className="text-sm text-purple-800 font-medium">Total Subjects</p>
                  </div>
                  <p className="text-lg font-semibold text-purple-900">{selectedFaculty.subjects?.length || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Total Students</p>
                  </div>
                  <p className="text-lg font-semibold text-green-900">
                    {selectedFaculty.subjects?.reduce((sum, subject) => sum + (subject.student_count || 0), 0) || 0}
                  </p>
                </div>
              </div>

              {/* Subjects List with Students */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Assigned Subjects & Enrolled Students</span>
                </h3>
                {selectedFaculty.subjects && selectedFaculty.subjects.length > 0 ? (
                  <div className="space-y-6">
                    {selectedFaculty.subjects.map((subject) => (
                      <div key={subject.subject_id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                        {/* Subject Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{subject.name}</h4>
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                                  {subject.code}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Building className="w-4 h-4" />
                                  <span>{subject.department}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Semester {subject.semester}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{subject.student_count} Students</span>
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSubject(subject.subject_id, subject.name)}
                              className="ml-4 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Students List */}
                        {subject.students && subject.students.length > 0 ? (
                          <div className="p-4">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">Enrolled Students</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {subject.students.map((student) => (
                                <div key={student.student_id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-white">
                                        {student.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                                      <p className="text-xs text-gray-500 truncate flex items-center space-x-1">
                                        <Mail className="w-3 h-3" />
                                        <span>{student.email}</span>
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {student.department && (
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                            {student.department}
                                          </span>
                                        )}
                                        {student.semester && (
                                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                            Sem {student.semester}
                                          </span>
                                        )}
                                        {student.year_of_admission && (
                                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                            {student.year_of_admission}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No students enrolled in this subject
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No subjects assigned</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowFacultyModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'faculty-reports', icon: FileText, label: 'Faculty Reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  LearnSphere AI
                </h1>
                <p className="text-sm text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">A</span>
                  </div>
                  <span className="text-sm text-gray-300">Admin</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 py-2 shadow-lg z-50">
                    <button
                      onClick={() => {
                        authService.logout();
                        navigate('/');
                      }} 
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'faculty-reports' && <FacultyReportsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;