import api from '../../../services/api.js';


class AdminDashboardService {
/**
 * Admin Dashboard Service
 * Handles all admin dashboard related API calls
 */

/**
 * Get admin dashboard statistics
 * @returns {Promise} Dashboard data including total students, faculty, and subjects
 */
async getDashboardStats() {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get all dashboard data (can be extended with more endpoints)
 * @returns {Promise} Complete dashboard information
 */
async getAllDashboardData() {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching all dashboard data:', error);
    throw error;
  }
};

}

export default AdminDashboardService;