import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Mail,
  Settings,
  BookOpen,
  Building,
  Calendar,
} from "lucide-react";
import { authService } from "../../../services/authService";
import { studentProfileService } from "../../../services/studentProfileService";

// Modern FormField component with light theme
const FormField = React.memo(({ icon: Icon, label, name, type = "text", value, onChange, required = false, options = null }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        {options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        )}
      </div>
    </div>
  );
});

// Modern ProfileField component with light theme
const ProfileField = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 text-blue-600",
    purple: "from-purple-500/10 to-purple-600/10 text-purple-600",
    green: "from-green-500/10 to-green-600/10 text-green-600",
    orange: "from-orange-500/10 to-orange-600/10 text-orange-600"
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-gray-900 font-semibold">{value || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    student_id: "",
    semester: "",
    department: "",
    year_of_admission: "",
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getProfile();
      console.log("Profile response:", response);
      setProfile(response.profile);
      if (response.profile) {
        setFormData({
          student_id: response.profile.student_id || "",
          semester: response.profile.semester || "",
          department: response.profile.department || "",
          year_of_admission: response.profile.year_of_admission || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log(`Input ${name} changed to: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "year_of_admission" && value.length === 4) {
      const year = parseInt(value, 10);
      if (year < 2000) {
        setMessage({ type: "error", text: "Year must be at least 2000." });
      } else {
        setMessage({ type: "", text: "" });
      }
    } else if (name === "year_of_admission" && value.length > 0) {
      setMessage({ type: "", text: "" });
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let response;
      if (profile) {
        response = await studentProfileService.updateProfile(formData);
      } else {
        response = await studentProfileService.createProfile(formData);
      }
      setProfile(response.profile);
      setIsEditing(false);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: error.errors
          ? Object.values(error.errors).flat().join(", ")
          : "Failed to save profile",
      });
    } finally {
      setSaving(false);
    }
  }, [profile, formData]);

  const handleCancel = () => {
    if (profile) {
      setFormData({
        student_id: profile.student_id || "",
        semester: profile.semester || "",
        department: profile.department || "",
        year_of_admission: profile.year_of_admission || "",
      });
    }
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
              <p className="text-gray-600">Manage your academic information</p>
            </div>
          </div>
          {profile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{currentUser?.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{currentUser?.email}</p>
                <div className="flex items-center justify-center mt-3 text-sm">
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Student</span>
                  </div>
                </div>
              </div>
              {profile && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="text-gray-900 font-semibold">
                      {profile.student_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Semester:</span>
                    <span className="text-gray-900 font-semibold">
                      {profile.semester}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Admission Year:</span>
                    <span className="text-gray-900 font-semibold">
                      {profile.year_of_admission}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form/Details */}
          <div className="lg:col-span-2">
            {isEditing || !profile ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                  {profile ? "Edit Profile" : "Create Profile"}
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      icon={User}
                      label="Student ID"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      icon={BookOpen}
                      label="Current Semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      options={studentProfileService.getSemesterOptions()}
                      required
                    />
                  </div>
                  <FormField
                    icon={Building}
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    options={studentProfileService.getDepartmentOptions()}
                    required
                  />
                  <FormField
                    icon={Calendar}
                    label="Year of Admission"
                    name="year_of_admission"
                    type="text"
                    value={formData.year_of_admission}
                    onChange={handleInputChange}
                    required
                    maxLength={4}
                  />
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span className="font-medium">{saving ? "Saving..." : "Save Profile"}</span>
                    </button>
                    {profile && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                      >
                        <X className="w-5 h-5" />
                        <span className="font-medium">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Academic Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField
                      icon={User}
                      label="Student ID"
                      value={profile.student_id}
                      color="blue"
                    />
                    <ProfileField
                      icon={BookOpen}
                      label="Current Semester"
                      value={`Semester ${profile.semester}`}
                      color="purple"
                    />
                    <ProfileField
                      icon={Building}
                      label="Department"
                      value={profile.department}
                      color="green"
                    />
                    <ProfileField
                      icon={Calendar}
                      label="Year of Admission"
                      value={profile.year_of_admission}
                      color="orange"
                    />
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Account Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <ProfileField
                      icon={Mail}
                      label="Email Address"
                      value={currentUser?.email}
                      color="blue"
                    />
                    <ProfileField
                      icon={Settings}
                      label="Account Role"
                      value="Student"
                      color="purple"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;