// services/studentProfileService.js
import api from './api';

export const studentProfileService = {
  // Get student profile
  getProfile: async () => {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create student profile
  createProfile: async (profileData) => {
    try {
      const response = await api.post('/student/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/student/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to get current year options
  getYearOptions: () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2000; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse(); // Most recent first
  },

  // Helper function to get semester options
  getSemesterOptions: () => {
    return [
      { value: 1, label: 'Semester 1' },
      { value: 2, label: 'Semester 2' },
      { value: 3, label: 'Semester 3' },
      { value: 4, label: 'Semester 4' },
      { value: 5, label: 'Semester 5' },
      { value: 6, label: 'Semester 6' },
      { value: 7, label: 'Semester 7' },
      { value: 8, label: 'Semester 8' },
      { value: 9, label: 'Semester 9' },
      { value: 10, label: 'Semester 10' },
      { value: 11, label: 'Semester 11' },
      { value: 12, label: 'Semester 12' }
    ];
  },

  // Helper function to get common departments
  getDepartmentOptions: () => {
    return [
      'Computer Science',
      'Information Technology',
      'Electronics and Communication',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Biotechnology',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Business Administration',
      'Economics',
      'Psychology',
      'Other'
    ];
  }
};