import api from './api';

/**
 * Faculty Dashboard Service
 * Handles API calls related to faculty dashboard functionality
 */
class FacultyDashboardService {
  /**
   * Get faculty dashboard data including subjects with counts
   * @returns {Promise} Promise resolving to dashboard data
   */
  async getDashboardData() {
    try {
      const response = await api.get('/faculty/dashboard');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data',
        status: error.response?.status,
        error: error
      };
    }
  }

  /**
   * Get total subjects count for the faculty
   * @returns {Promise} Promise resolving to total subjects count
   */
  async getTotalSubjects() {
    try {
      const dashboardData = await this.getDashboardData();
      if (dashboardData.success) {
        return {
          success: true,
          count: dashboardData.data.total_subjects
        };
      }
      return dashboardData;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch total subjects count',
        error: error
      };
    }
  }

  /**
   * Get subjects list with detailed counts
   * @returns {Promise} Promise resolving to subjects array
   */
  async getSubjects() {
    try {
      const dashboardData = await this.getDashboardData();
      if (dashboardData.success) {
        return {
          success: true,
          subjects: dashboardData.data.subjects
        };
      }
      return dashboardData;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subjects list',
        error: error
      };
    }
  }

  /**
   * Get statistics summary for dashboard
   * @returns {Promise} Promise resolving to dashboard statistics
   */
  async getDashboardStats() {
    try {
      const dashboardData = await this.getDashboardData();
      if (dashboardData.success) {
        const { subjects, total_subjects } = dashboardData.data;
        
        // Calculate totals across all subjects
        const totalStudents = subjects.reduce((sum, subject) => sum + subject.student_count, 0);
        const totalQuizzes = subjects.reduce((sum, subject) => sum + subject.quiz_count, 0);
        const totalAssignments = subjects.reduce((sum, subject) => sum + subject.assignment_count, 0);

        return {
          success: true,
          stats: {
            total_subjects,
            total_students: totalStudents,
            total_quizzes: totalQuizzes,
            total_assignments: totalAssignments,
            subjects_by_semester: this._groupSubjectsBySemester(subjects)
          }
        };
      }
      return dashboardData;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to calculate dashboard statistics',
        error: error
      };
    }
  }

  /**
   * Get subject by ID from dashboard data
   * @param {number|string} subjectId - The subject ID to find
   * @returns {Promise} Promise resolving to subject data
   */
  async getSubjectById(subjectId) {
    try {
      const subjectsData = await this.getSubjects();
      if (subjectsData.success) {
        const subject = subjectsData.subjects.find(s => s.id == subjectId);
        if (subject) {
          return {
            success: true,
            subject: subject
          };
        } else {
          return {
            success: false,
            message: 'Subject not found'
          };
        }
      }
      return subjectsData;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch subject',
        error: error
      };
    }
  }

  /**
   * Helper method to group subjects by semester
   * @private
   * @param {Array} subjects - Array of subjects
   * @returns {Object} Subjects grouped by semester
   */
  _groupSubjectsBySemester(subjects) {
    return subjects.reduce((grouped, subject) => {
      const semester = subject.semester || 'Unknown';
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(subject);
      return grouped;
    }, {});
  }

  /**
   * Refresh dashboard data (useful for real-time updates)
   * @returns {Promise} Promise resolving to fresh dashboard data
   */
  async refreshDashboard() {
    // This method can be used to force refresh data
    // by bypassing any potential caching mechanisms
    try {
      const response = await api.get('/faculty/dashboard', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to refresh dashboard data',
        status: error.response?.status,
        error: error
      };
    }
  }
}

// Create and export a singleton instance
const facultyDashboardService = new FacultyDashboardService();

export default facultyDashboardService;