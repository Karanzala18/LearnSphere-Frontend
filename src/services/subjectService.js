// services/subjectService.js
import api from './api';

export const subjectService = {
  // Student: Enroll in a subject using team code
  enrollInSubject: async (teamCode) => {
    try {
      const response = await api.post('/student/subjects/enroll', {
        team_code: teamCode
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Student: Get enrolled subjects
  // Note: You'll need to add this endpoint to your Laravel backend
  // Add this route: Route::get('/student/subjects', [StudentSubjectEnrollmentController::class, 'index']);
  getEnrolledSubjects: async () => {
    try {
      const response = await api.get('/student/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Create a new subject
  createSubject: async (subjectData) => {
    try {
      const response = await api.post('/faculty/subjects', {
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        semester: subjectData.semester,
        department: subjectData.department,
        credits: subjectData.credits
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Get subjects created by faculty
  // Note: You'll need to add this endpoint to your Laravel backend
  // Add this route: Route::get('/faculty/subjects', [FacultySubjectController::class, 'index']);
  getFacultySubjects: async () => {
    try {
      const response = await api.get('/faculty/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Get students enrolled in a specific subject
  getSubjectStudents: async (subjectId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Delete a subject
  deleteSubject: async (subjectId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Remove student from subject
  removeStudentFromSubject: async (subjectId, studentId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};