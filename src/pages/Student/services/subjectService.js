import api from '../../../services/api';

export const subjectService = {
  // ========== STUDENT ENDPOINTS ==========
  
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

  getEnrolledSubjects: async () => {
    try {
      const response = await api.get('/student/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSubjectDetails: async (subjectId) => {
    try {
      // Fixed: Ensure proper template literal usage
      const response = await api.get(`/student/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('getSubjectDetails error:', {
        subjectId,
        url: `/student/subjects/${subjectId}`,
        error: error.response?.data || error.message
      });
      throw error.response?.data || error.message;
    }
  }
}
