import api from '../../../services/api.js';

class FacultyReportService {
  /**
   * Faculty Report Service
   * Handles all faculty subject report related API calls
   */

  /**
   * Get faculty subject report with student details
   * @returns {Promise} Complete report of all faculties with their subjects and enrolled students
   */
  async getFacultySubjectReport() {
    try {
      const response = await api.get('/admin/faculty-subject-report');
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty subject report:', error);
      throw error;
    }
  }

  /**
   * Get faculty subject report by faculty ID
   * @param {number|string} facultyId - The faculty user ID
   * @returns {Promise} Report for specific faculty
   */
  async getFacultySubjectReportById(facultyId) {
    try {
      const response = await api.get(`/admin/faculty-subject-report/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty subject report for ID ${facultyId}:`, error);
      throw error;
    }
  }

  /**
   * Get faculty report filtered by department
   * @param {string} department - Department name
   * @returns {Promise} Filtered faculty report
   */
  async getFacultyReportByDepartment(department) {
    try {
      const response = await api.get('/admin/faculty-subject-report', {
        params: { department }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty report for department ${department}:`, error);
      throw error;
    }
  }

  /**
   * Export faculty report data
   * @param {string} format - Export format (csv, pdf, excel)
   * @returns {Promise} File blob
   */
  async exportFacultyReport(format = 'csv') {
    try {
      const response = await api.get('/admin/faculty-subject-report/export', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting faculty report as ${format}:`, error);
      throw error;
    }
  }

  /**
   * Delete a subject
   * @param {number|string} subjectId - The subject ID to delete
   * @returns {Promise} Response from server
   */
  async deleteSubject(subjectId) {
    try {
      const response = await api.delete(`/admin/delete-subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subject ID ${subjectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a faculty
   * @param {number|string} facultyId - The faculty ID to delete
   * @returns {Promise} Response from server
   */
  async deleteFaculty(facultyId) {
    try {
      const response = await api.delete(`/admin/delete-faculty/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting faculty ID ${facultyId}:`, error);
      throw error;
    }
  }
}

export default FacultyReportService;