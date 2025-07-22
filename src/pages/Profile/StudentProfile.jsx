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
import { authService } from "../../services/authService";
import { studentProfileService } from "../../services/studentProfileService";

// Original FormField component
const FormField = React.memo(({ icon: Icon, label, name, type = "text", value, onChange, required = false, options = null }) => {
  const handleChange = (e) => {
    onChange(e);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        {options ? (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            required={required}
            className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value || option} value={option.value || option} className="bg-gray-800">
                {option.label || option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            required={required}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        )}
      </div>
    </div>
  );
});

// Original ProfileField component
const ProfileField = ({ icon: Icon, label, value, color = "text-cyan-400" }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color === "text-cyan-400" ? "from-cyan-500/20 to-blue-500/20" : 
        color === "text-purple-400" ? "from-purple-500/20 to-pink-500/20" :
        color === "text-green-400" ? "from-green-500/20 to-teal-500/20" :
        "from-yellow-500/20 to-orange-500/20"}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1">
        <p className="text-gray-300 text-sm">{label}</p>
        <p className="text-white font-medium">{value || 'Not specified'}</p>
      </div>
    </div>
  </div>
);

const StudentProfile = () => {
  const Navigate = useNavigate();
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
  }, []); // Empty dependency array to run only once on mount

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentProfileService.getProfile();
      console.log("Profile response:", response); // Debug the response
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
    console.log(`Input ${name} changed to: ${value}`); // Debug log
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
      setMessage({ type: "", text: "" }); // Clear message for partial input
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
  Navigate('/student/dashboard');
}

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
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Student Profile</h1>
              <p className="text-gray-300">Manage your academic information</p>
            </div>
          </div>
          {profile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-400"
                : "bg-red-500/20 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
                <p className="text-gray-300">{currentUser?.email}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 mr-1" />
                  Student
                </div>
              </div>
              {profile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Student ID:</span>
                    <span className="text-white font-medium">
                      {profile.student_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Current Semester:</span>
                    <span className="text-white font-medium">
                      {profile.semester}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Admission Year:</span>
                    <span className="text-white font-medium">
                      {profile.year_of_admission}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {isEditing || !profile ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6">
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
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>{saving ? "Saving..." : "Save Profile"}</span>
                    </button>
                    {profile && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border border-white/30 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField
                      icon={User}
                      label="Student ID"
                      value={profile.student_id}
                      color="text-cyan-400"
                    />
                    <ProfileField
                      icon={BookOpen}
                      label="Current Semester"
                      value={`Semester ${profile.semester}`}
                      color="text-purple-400"
                    />
                    <ProfileField
                      icon={Building}
                      label="Department"
                      value={profile.department}
                      color="text-green-400"
                    />
                    <ProfileField
                      icon={Calendar}
                      label="Year of Admission"
                      value={profile.year_of_admission}
                      color="text-yellow-400"
                    />
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <ProfileField
                      icon={Mail}
                      label="Email Address"
                      value={currentUser?.email}
                      color="text-cyan-400"
                    />
                    <ProfileField
                      icon={Settings}
                      label="Account Role"
                      value="Student"
                      color="text-purple-400"
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