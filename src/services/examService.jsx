import { api } from './api';

export const examService = {
  // Teacher endpoints
  listExams: async (params) => api.get('/exam/teacher/all', { params }),
  listMyExams: async (params) => api.get('/exam/teacher/my-exams', { params }),
  getExamById: async (id) => api.get(`/exam/teacher/${id}`),
  createExam: async (exam) => api.post('/exam/teacher/create', exam),
  updateExam: async (id, payload) => api.put(`/exam/teacher/update/${id}`, payload),
  deleteExam: async (id) => api.delete(`/exam/teacher/delete/${id}`),

  // Student endpoints (listing exams visible to student)
  listStudentExams: async (params) => api.get('/exam/student/all', { params }).catch(async (e) => {
    // Fallback: some backends expose /exam/all for students
    if (e?.status === 404) {
      return await api.get('/exam/all', { params });
    }
    throw e;
  }),
  
  // Student: get exam details by ID - sử dụng /exam/all và filter
  getStudentExamById: async (id) => {
    // Lấy tất cả exams và tìm exam theo ID
    const allExams = await api.get('/exam/all');
    const examsList = allExams?.exams || allExams?.data?.exams || (Array.isArray(allExams) ? allExams : []);
    const exam = examsList.find((e) => (e._id || e.id) === id);
    
    if (exam) {
      return { exam };
    }
    
    throw new Error(`Exam with ID ${id} not found`);
  },
};
