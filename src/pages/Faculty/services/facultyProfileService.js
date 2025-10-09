import api from '../../../services/api';

export const facultyProfileService = {
  // Get faculty profile
  getProfile: async () => {
    try {
      const response = await api.get('/faculty/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Create faculty profile
  createProfile: async (profileData) => {
    try {
      const response = await api.post('/faculty/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create profile' };
    }
  },

  // Update faculty profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/faculty/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Validate profile data before submission
  validateProfileData: (data) => {
    const errors = {};

    if (!data.department || data.department.trim() === '') {
      errors.department = 'Department is required';
    } else if (data.department.length > 100) {
      errors.department = 'Department name must be less than 100 characters';
    }

    if (!data.employee_id || data.employee_id.trim() === '') {
      errors.employee_id = 'Employee ID is required';
    } else if (data.employee_id.length > 50) {
      errors.employee_id = 'Employee ID must be less than 50 characters';
    }

    if (data.designation && data.designation.length > 100) {
      errors.designation = 'Designation must be less than 100 characters';
    }

    if (data.qualification && data.qualification.length > 500) {
      errors.qualification = 'Qualification must be less than 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Check if profile is complete
  isProfileComplete: (profile) => {
    if (!profile) return false;
    
    const requiredFields = ['department', 'employee_id'];
    return requiredFields.every(field => 
      profile[field] && profile[field].toString().trim() !== ''
    );
  },

  // Get profile completion percentage
  getProfileCompletionPercentage: (profile) => {
    if (!profile) return 0;
    
    const fields = ['department', 'designation', 'employee_id', 'qualification'];
    const completedFields = fields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    );
    
    return Math.round((completedFields.length / fields.length) * 100);
  },

  // Format profile data for display
  formatProfileData: (profile) => {
    if (!profile) return null;
    
    return {
      ...profile,
      department: profile.department || 'Not specified',
      designation: profile.designation || 'Not specified',
      employee_id: profile.employee_id || 'Not specified',
      qualification: profile.qualification || 'Not specified',
      created_at: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
      updated_at: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : ''
    };
  },

  // Get department suggestions (you can expand this with API call)
  getDepartmentSuggestions: () => {
    return [
      'Computer Science',
      'Information Technology',
      'Electronics & Communication',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'Management',
      'Commerce',
      'Economics'
    ];
  },

  // Get designation suggestions
  getDesignationSuggestions: () => {
    return [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Senior Lecturer',
      'Principal',
      'Vice Principal',
      'Head of Department',
      'Dean',
      'Director',
      'Guest Faculty',
      'Visiting Professor'
    ];
  },

  // Get qualification suggestions
  getQualificationSuggestions: () => {
    return [
      'PhD',
      'M.Tech',
      'M.Sc',
      'M.A',
      'M.Com',
      'MBA',
      'M.Phil',
      'B.Tech',
      'B.Sc',
      'B.A',
      'B.Com',
      'BCA',
      'MCA',
      'ME',
      'MS'
    ];
  }
};