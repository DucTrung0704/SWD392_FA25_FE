import { api } from './api';

export const classService = {
  // Get enrolled classes for current student
  getMyClasses: async () => {
    try {
      const data = await api.get('/class/student/my-classes');
      // Handle different response formats
      return Array.isArray(data) ? data : (data.classes || data.data || []);
    } catch (error) {
      console.error('Error fetching my classes:', error);
      throw error;
    }
  },

  // Get all available classes for student to join
  getAllClasses: async () => {
    try {
      const data = await api.get('/class/student/all');
      // Handle different response formats
      return Array.isArray(data) ? data : (data.classes || data.data || []);
    } catch (error) {
      console.error('Error fetching all classes:', error);
      throw error;
    }
  },

  // Get class details by ID
  getClassById: async (id) => {
    try {
      const data = await api.get(`/class/student/${id}`);
      return data.class || data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  // Join a class using class code
  joinClass: async (class_code) => {
    try {
      const data = await api.post('/class/student/join', { class_code });
      return data;
    } catch (error) {
      console.error('Error joining class:', error);
      throw error;
    }
  },

  // Leave a class
  leaveClass: async (id) => {
    try {
      const data = await api.post(`/class/student/${id}/leave`);
      return data;
    } catch (error) {
      console.error('Error leaving class:', error);
      throw error;
    }
  },
};

