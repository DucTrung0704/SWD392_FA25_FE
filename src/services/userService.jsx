import { api } from './api';

export const userService = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const data = await api.get('/user/admin/all');
      // Transform API response to match component expectations
      return {
        users: data.users || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (id) => {
    try {
      const data = await api.get(`/user/admin/${id}`);
      return data.user || data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user role (Admin only)
  updateUserRole: async (id, role) => {
    try {
      const data = await api.put(`/user/admin/update-role/${id}`, { role });
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    try {
      const data = await api.delete(`/user/admin/delete/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Update user status (Admin only) - Activate/Deactivate
  updateUserStatus: async (id, status) => {
    try {
      // Try common API patterns for status update
      // Pattern 1: PUT /user/admin/update-status/{id}
      // Pattern 2: PUT /user/admin/{id}/status
      // Pattern 3: PATCH /user/admin/{id}
      const data = await api.put(`/user/admin/update-status/${id}`, { status });
      return data;
    } catch (error) {
      // If endpoint doesn't exist, we'll handle it in the component
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Create user (Admin only)
  createUser: async (userData) => {
    try {
      // Try admin-specific endpoint first, fallback to register endpoint
      // Pattern 1: POST /user/admin/create
      // Pattern 2: POST /user/admin/register
      // Pattern 3: POST /user/register (with admin token)
      let data;
      try {
        data = await api.post('/user/admin/create', userData);
      } catch (err) {
        // Fallback to register endpoint
        data = await api.post('/user/register', userData);
      }
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
};

