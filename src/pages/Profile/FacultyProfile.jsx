import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyProfileService } from '../../services/facultyProfileService';
import { authService } from '../../services/authService';
import { 
  User, 
  Mail, 
  Award, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Check,
  AlertCircle,
  Brain,
  Building,
  GraduationCap,
  Users,
  ChevronDown,
  Bell,
  LogOut,
  RefreshCw,
  ArrowLeft,
  CreditCard
} from 'lucide-react';

const FacultyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    employee_id: '',
    qualification: ''
  });

  useEffect(() => {
    fetchProfile();
    setUser(authService.getCurrentUser());
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await facultyProfileService.getProfile();
      setProfile(data.profile);
      if (data.profile) {
        setFormData({
          department: data.profile.department || '',
          designation: data.profile.designation || '',
          employee_id: data.profile.employee_id || '',
          qualification: data.profile.qualification || ''
        });
      }
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (profile) {
        response = await facultyProfileService.updateProfile(formData);
      } else {
        response = await facultyProfileService.createProfile(formData);
      }
      
      setProfile(response.profile);
      setSuccess(response.message);
      setEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to save profile');
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        department: profile.department || '',
        designation: profile.designation || '',
        employee_id: profile.employee_id || '',
        qualification: profile.qualification || ''
      });
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleBackToDashboard = () => {
    navigate('/faculty/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">
                LearnSphere AI
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-lg font-medium text-gray-300">Faculty Profile</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-900 rounded-lg px-4 py-2 hover:bg-gray-800 transition-all border border-gray-800"
                >
                  <User className="w-5 h-5 text-gray-300" />
                  <span className="text-white">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-xl border border-gray-800 z-50">
                    <button 
                      onClick={() => navigate('/faculty/dashboard')}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-gray-300 hover:bg-gray-900 transition-colors text-left rounded-t-lg"
                    >
                      <Building className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button 
                      onClick={() => authService.logout()}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-gray-300 hover:bg-gray-900 transition-colors text-left rounded-b-lg"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-800 rounded-xl p-4 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h1>
                <p className="text-gray-600 mb-1">{user?.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                  {profile?.designation || 'Faculty Member'}
                </span>
              </div>
            </div>
            
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-green-500 text-white px-5 py-2.5 rounded-xl hover:bg-green-600 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Member Since</p>
                  <p className="text-sm text-gray-900 font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Role</p>
                  <p className="text-sm text-gray-900 font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span>Department</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your department"
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium">
                    {profile?.department || <span className="text-gray-400">Not specified</span>}
                  </div>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Designation</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Assistant Professor, Professor"
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium">
                    {profile?.designation || <span className="text-gray-400">Not specified</span>}
                  </div>
                )}
              </div>

              {/* Employee ID */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Employee ID</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your employee ID"
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium">
                    {profile?.employee_id || <span className="text-gray-400">Not specified</span>}
                  </div>
                )}
              </div>

              {/* Qualification */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span>Qualification</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., PhD in Computer Science, M.Tech"
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium">
                    {profile?.qualification || <span className="text-gray-400">Not specified</span>}
                  </div>
                )}
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 font-medium shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Completion</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Basic Information</span>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Complete</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Professional Details</span>
              {profile ? (
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600 font-medium">Incomplete</span>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-blue-500">{profile ? '100%' : '50%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: profile ? '100%' : '50%' }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {profile 
                  ? '🎉 Your profile is complete!' 
                  : '📝 Complete your professional information to unlock all features'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;