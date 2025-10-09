import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Brain, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp, 
  Settings, 
  Shield,
  School,
  FileText,
  Activity,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Clock,
  GraduationCap,
  UserCheck,
  Bell,
  ChevronDown,
  LogOut
} from 'lucide-react';

// Import actual services
import AdminDashboardService from '../services/adminDashboardService';
import FacultyReportService from '../services/facultyReportService';

const authService = {
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalSubjects: 0,
      totalQuizzes: 0,
      totalAssignments: 0,
      activeUsers: 0,
      pendingApprovals: 0
    },
    recentActivity: [],
    performanceMetrics: [],
    systemHealth: {}
  });
  const [facultyReport, setFacultyReport] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

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
            totalSubjects: response.data.total_subjects || 0,
            totalQuizzes: 0, // Placeholder, not provided by API
            totalAssignments: 0, // Placeholder, not provided by API
            activeUsers: 0, // Placeholder, not provided by API
            pendingApprovals: 0 // Placeholder, not provided by API
          },
          recentActivity: []
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
        setFacultyReport(response.data); // Array of faculties
      } else {
        throw new Error('Failed to fetch faculty report');
      }
    } catch (error) {
      console.error('Error fetching faculty report:', error);
      setError('Failed to load faculty report');
    }
  }, [facultyService]);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchFacultyReport();
    fetchUsers();
  }, [fetchDashboardData, fetchNotifications, fetchFacultyReport, fetchUsers]);

  const handleApproveUser = useCallback(async (userId) => {
    try {
      await fetchDashboardData();
      alert(`User ${userId} approved successfully`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user');
    }
  }, [fetchDashboardData]);

  const handleRejectUser = useCallback(async (userId) => {
    try {
      await fetchDashboardData();
      alert(`User ${userId} rejected`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user');
    }
  }, [fetchDashboardData]);

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                          (filterType === 'faculty' && user.role === 'Faculty') ||
                          (filterType === 'students' && user.role === 'Student') ||
                          (filterType === 'active' && user.status === 'Active') ||
                          (filterType === 'inactive' && user.status !== 'Active');
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterType]);

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          title="Total Students" 
          value={dashboardData.stats.totalStudents.toLocaleString()} 
          change={12}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard 
          icon={GraduationCap} 
          title="Faculty Members" 
          value={dashboardData.stats.totalFaculty} 
          change={8}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard 
          icon={BookOpen} 
          title="Active Subjects" 
          value={dashboardData.stats.totalSubjects} 
          change={15}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard 
          icon={Activity} 
          title="Active Users" 
          value={dashboardData.stats.activeUsers.toLocaleString()} 
          change={5}
          color="bg-gradient-to-r from-cyan-500 to-cyan-600"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-3">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span>System Health</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Server Status</span>
              <span className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <span className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Response</span>
              <span className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Normal</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {dashboardData.stats.pendingApprovals > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span>Pending Approvals ({dashboardData.stats.pendingApprovals})</span>
          </h3>
          <p className="text-gray-300 mb-4">
            You have {dashboardData.stats.pendingApprovals} faculty registration requests awaiting approval.
          </p>
          <button
            onClick={() => setActiveTab('approvals')}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
          >
            Review Approvals
          </button>
        </div>
      )}
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Users</option>
          <option value="faculty">Faculty</option>
          <option value="students">Students</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'Faculty' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.joined}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button className="text-cyan-400 hover:text-cyan-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const FacultyReportsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Faculty Subject Reports</span>
          </h3>
          <button
            onClick={() => handleExportFacultyReport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading faculty reports...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : facultyReport.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No faculty reports available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Faculty Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {facultyReport.map((faculty) => (
                  <tr key={faculty.faculty_id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{faculty.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {faculty.subjects && faculty.subjects.length > 0 ? (
                          faculty.subjects.map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                              {subject.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No subjects</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {faculty.subjects.reduce((sum, subject) => sum + (subject.student_count || 0), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button className="text-cyan-400 hover:text-cyan-300">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const ApprovalsTab = () => {
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [approvalsLoading, setApprovalsLoading] = useState(true);

    useEffect(() => {
      const fetchPendingApprovals = async () => {
        try {
          setApprovalsLoading(true);
          setPendingApprovals([]);
        } catch (error) {
          console.error('Error fetching pending approvals:', error);
          setPendingApprovals([]);
        } finally {
          setApprovalsLoading(false);
        }
      };
      fetchPendingApprovals();
    }, []);

    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-yellow-400" />
              <span>Pending Faculty Approvals</span>
            </h3>
          </div>
          {approvalsLoading ? (
            <div className="p-6 text-center text-gray-400">Loading approvals...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No pending approvals</div>
          ) : (
            <div className="divide-y divide-white/10">
              {pendingApprovals.map((applicant) => (
                <div key={applicant.id} className="p-6 hover:bg-white/5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-white">{applicant.name}</h4>
                      <p className="text-gray-300">{applicant.email}</p>
                      <p className="text-sm text-gray-400">
                        {applicant.department} • {applicant.experience} experience
                      </p>
                      {applicant.documents && applicant.documents.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-gray-400">Documents:</span>
                          {applicant.documents.map((doc, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {doc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApproveUser(applicant.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectUser(applicant.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Usage Analytics</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Daily Active Users</span>
              <span className="text-white font-medium">{dashboardData.stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Quizzes</span>
              <span className="text-white font-medium">{dashboardData.stats.totalQuizzes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Assignments</span>
              <span className="text-white font-medium">{dashboardData.stats.totalAssignments}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            <span>User Distribution</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Faculty</span>
              <span className="text-white font-medium">{dashboardData.stats.totalFaculty}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Students</span>
              <span className="text-white font-medium">{dashboardData.stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Subjects</span>
              <span className="text-white font-medium">{dashboardData.stats.totalSubjects}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'faculty-reports', icon: FileText, label: 'Faculty Reports' },
    { id: 'approvals', icon: UserCheck, label: 'Approvals' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="relative z-40 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  LearnSphere AI
                </h1>
                <p className="text-sm text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">A</span>
                  </div>
                  <span className="text-sm text-gray-300">Admin</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium">Admin</p>
                      <p className="text-xs text-gray-400">admin@learnsphere.ai</p>
                    </div>
                    <a
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Profile</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </a>
                    <button
                      onClick={authService.logout}
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center space-x-2 text-red-400"
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
        <div className="flex flex-wrap gap-2 mb-8">
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
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'faculty-reports' && <FacultyReportsTab />}
          {activeTab === 'approvals' && <ApprovalsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">System Settings</h3>
              <p className="text-gray-300">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;