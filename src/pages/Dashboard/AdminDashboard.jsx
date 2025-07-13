import React, { useState, useEffect } from 'react';
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
  Bell
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalFaculty: 0,
      totalStudents: 0,
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

  // TODO: API Integration - Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/dashboard', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setDashboardData(data);
      
      // Mock data for demonstration
      setDashboardData({
        stats: {
          totalUsers: 1247,
          totalFaculty: 86,
          totalStudents: 1161,
          totalSubjects: 45,
          totalQuizzes: 234,
          totalAssignments: 189,
          activeUsers: 892,
          pendingApprovals: 12
        },
        recentActivity: [
          { type: 'user_registration', user: 'John Doe', action: 'registered as student', time: '2 hours ago' },
          { type: 'subject_creation', user: 'Dr. Smith', action: 'created subject "Advanced Physics"', time: '4 hours ago' },
          { type: 'quiz_submission', user: 'Jane Wilson', action: 'submitted quiz in Mathematics', time: '6 hours ago' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/notifications', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setNotifications(data);
      
      // Mock notifications
      setNotifications([
        { id: 1, type: 'approval', message: 'New faculty registration pending approval', time: '1 hour ago' },
        { id: 2, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago' },
        { id: 3, type: 'alert', message: 'High server load detected', time: '5 hours ago' }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/users/${userId}/approve`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Refresh data after approval
      fetchDashboardData();
      console.log(`User ${userId} approved`);
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/users/${userId}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Refresh data after rejection
      fetchDashboardData();
      console.log(`User ${userId} rejected`);
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

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
          title="Total Users" 
          value={dashboardData.stats.totalUsers.toLocaleString()} 
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
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
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
              <span className="flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span>Slow</span>
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
              {/* TODO: Replace with actual user data from API */}
              {[
                { id: 1, name: 'Dr. John Smith', email: 'john@example.com', role: 'Faculty', status: 'Active', joined: '2024-01-15' },
                { id: 2, name: 'Jane Doe', email: 'jane@example.com', role: 'Student', status: 'Active', joined: '2024-02-10' },
                { id: 3, name: 'Prof. Wilson', email: 'wilson@example.com', role: 'Faculty', status: 'Pending', joined: '2024-03-01' }
              ].map((user) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ApprovalsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-yellow-400" />
            <span>Pending Faculty Approvals</span>
          </h3>
        </div>
        <div className="divide-y divide-white/10">
          {/* TODO: Replace with actual pending approvals from API */}
          {[
            { id: 1, name: 'Dr. Michael Johnson', email: 'michael@university.edu', department: 'Computer Science', experience: '8 years', documents: ['CV', 'Certificates'] },
            { id: 2, name: 'Prof. Sarah Wilson', email: 'sarah@university.edu', department: 'Mathematics', experience: '12 years', documents: ['CV', 'Research Papers'] }
          ].map((applicant) => (
            <div key={applicant.id} className="p-6 hover:bg-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-white">{applicant.name}</h4>
                  <p className="text-gray-300">{applicant.email}</p>
                  <p className="text-sm text-gray-400">
                    {applicant.department} • {applicant.experience} experience
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-400">Documents:</span>
                    {applicant.documents.map((doc, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        {doc}
                      </span>
                    ))}
                  </div>
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
      </div>
    </div>
  );

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
              <span className="text-white font-medium">892</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Quizzes Completed</span>
              <span className="text-white font-medium">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Assignments Submitted</span>
              <span className="text-white font-medium">567</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            <span>Performance Metrics</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Quiz Score</span>
              <span className="text-white font-medium">78.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Assignment Completion Rate</span>
              <span className="text-white font-medium">92.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Student Engagement</span>
              <span className="text-white font-medium">85.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', icon: Activity, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'approvals', icon: UserCheck, label: 'Approvals' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
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
              
              {/* Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">A</span>
                </div>
                <span className="text-sm text-gray-300">Admin</span>
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