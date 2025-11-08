import { api } from './api';

export const questionService = {
  // Create a new question
  createQuestion: async (payload) => {
    return await api.post('/question/teacher/create', payload);
  },

  // Get all questions (with filters) - Teacher sees only their questions, Admin sees all
  listAll: async (params) => {
    return await api.get('/question/teacher/all', { params });
  },

  // Get questions of current teacher
  listMyQuestions: async (params) => {
    return await api.get('/question/teacher/my-questions', { params });
  },

  // Get question by ID
  getQuestionById: async (id) => {
    return await api.get(`/question/teacher/${id}`);
  },

  // Update question
  updateQuestion: async (id, payload) => {
    return await api.put(`/question/teacher/update/${id}`, payload);
  },

  // Delete question
  deleteQuestion: async (id) => {
    return await api.delete(`/question/teacher/delete/${id}`);
  },

  // Bulk delete questions
  bulkDelete: async (question_ids) => {
    return await api.post('/question/teacher/bulk-delete', { question_ids });
  },
};

// Export as default for backward compatibility
export default questionService;


