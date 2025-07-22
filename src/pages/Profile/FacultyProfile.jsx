import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyProfileService } from '../../services/facultyProfileService';
import { authService } from '../../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Award, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Check,
  AlertCircle,
  Brain,
  Building,
  IdCard,
  GraduationCap,
  Users,
  ChevronDown,
  Bell,
  LogOut,
  RefreshCw,
  ArrowLeft,
  ImageOff
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
        // Update existing profile
        response = await facultyProfileService.updateProfile(formData);
      } else {
        // Create new profile
        response = await facultyProfileService.createProfile(formData);
      }
      
      setProfile(response.profile);
      setSuccess(response.message);
      setEditing(false);
      
      // Clear success message after 3 seconds
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                LearnSphere AI
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-lg font-medium">Faculty Profile</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-300 hover:text-cyan-400 cursor-pointer" />
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 hover:bg-white/20 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 z-50">
                    <a href="/faculty/dashboard" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-white/20">
                      <Building className="w-4 h-4" />
                      <span>Dashboard</span>
                    </a>
                    <button onClick={authService.logout} className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:bg-white/20">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        )}
      <div className='flex items- justify between mb-3'>
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                <p className="text-gray-300">{user?.email}</p>
                <p className="text-sm text-cyan-400">{profile?.designation || 'Faculty Member'}</p>
              </div>
            </div>
            
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white">{new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="text-white capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Status</p>
                  <p className="text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-cyan-400 mb-6">Professional Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4" />
                  <span>Department</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter your department"
                  />
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {profile?.department || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <Award className="w-4 h-4" />
                  <span>Designation</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Assistant Professor, Professor"
                  />
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {profile?.designation || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Employee ID */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <IdCard className="w-4 h-4" />
                  <span>Employee ID</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter your employee ID"
                  />
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {profile?.employee_id || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Qualification */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Qualification</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., PhD in Computer Science, M.Tech"
                  />
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white">
                    {profile?.qualification || 'Not specified'}
                  </div>
                )}
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Profile Completion Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mt-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Profile Completion</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Basic Information</span>
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Professional Details</span>
              {profile ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: profile ? '100%' : '50%' }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {profile ? 'Profile completed' : 'Complete your professional information to unlock all features'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;