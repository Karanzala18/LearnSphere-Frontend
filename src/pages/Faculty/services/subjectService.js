import api from '../../../services/api';

export const subjectService = {

  // ========== FACULTY ENDPOINTS ==========
  
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

  getFacultySubjects: async () => {
    try {
      const response = await api.get('/faculty/subjects');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFacultySubjectDetails: async (subjectId) => {
    try {
      // Fetch subject details
      const subjectResponse = await api.get(`/faculty/subjects/${subjectId}`);
      // Fetch students separately to get users.id
      const studentsResponse = await api.get(`/faculty/subjects/${subjectId}/students`);
      
      // Merge data
      const subjectData = subjectResponse.data;
      const studentsData = studentsResponse.data.students || [];
      
      // Map students to include all necessary fields
      const mergedStudents = studentsData.map(student => ({
        id: student.id, // From /students endpoint (users.id)
        student_id: subjectData.students.find(s => s.email === student.email)?.student_id || null, // Match by email
        name: student.name,
        email: student.email
      }));

      return {
        ...subjectData,
        students: mergedStudents
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch subject details';
      console.error('getFacultySubjectDetails error:', {
        subjectId,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  getSubjectStudents: async (subjectId) => {
    try {
      const response = await api.get(`/faculty/subjects/${subjectId}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteSubject: async (subjectId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeStudentFromSubject: async (subjectId, studentId) => {
    try {
      const response = await api.delete(`/faculty/subjects/${subjectId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove student';
      console.error('removeStudentFromSubject error:', {
        subjectId,
        studentId,
        status: error.response?.status,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  }
};