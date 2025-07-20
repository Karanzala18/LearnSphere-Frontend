// services/subjectService.js
import api from './api';

export const subjectService = {
  // ========== STUDENT ENDPOINTS ==========
  
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

  // Student: Get all enrolled subjects (dashboard view)
  getEnrolledSubjects: async () => {
    try {
      const response = await api.get('/student/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Student: Get detailed view of a specific enrolled subject (with quizzes & assignments)
  getSubjectDetails: async (subjectId) => {
    try {
      const response = await api.get(`/student/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== FACULTY ENDPOINTS ==========
  
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

  // Faculty: Get all subjects created by the faculty member
  getFacultySubjects: async () => {
    try {
      const response = await api.get('/faculty/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Faculty: Get detailed view of a specific subject they created
  getFacultySubjectDetails: async (subjectId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}`);
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

// Usage examples:

// For Students:
// const enrolledSubjects = await subjectService.getEnrolledSubjects();
// const subjectDetails = await subjectService.getSubjectDetails(subjectId);
// const enrollResult = await subjectService.enrollInSubject('ABC12345');

// For Faculty:
// const facultySubjects = await subjectService.getFacultySubjects();
// const subjectDetails = await subjectService.getFacultySubjectDetails(subjectId);
// const students = await subjectService.getSubjectStudents(subjectId);
// const createResult = await subjectService.createSubject(subjectData);
// await subjectService.deleteSubject(subjectId);
// await subjectService.removeStudentFromSubject(subjectId, studentId);