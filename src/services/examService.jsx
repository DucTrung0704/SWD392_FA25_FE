import { api } from './api';

export const examService = {
  listExams: async (params) => {
    return await api.get('/exam/teacher/all', { params });
  },
  getExamById: async (id) => {
    return await api.get(`/exam/teacher/${id}`);
  },
  createExam: async (exam) => {
    return await api.post('/exam/teacher/create', exam);
  },
  updateExam: async (id, payload) => {
    return await api.put(`/exam/teacher/update/${id}`, payload);
  },
  deleteExam: async (id) => {
    return await api.delete(`/exam/teacher/delete/${id}`);
  },
  submitExam: async (examId, answers) => {
    return await api.post('/exam/student/submit', { examId, answers });
  },
};
