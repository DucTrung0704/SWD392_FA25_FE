import { api } from './api';

export const examService = {
  // Teacher endpoints
  listExams: async (params) => api.get('/exam/teacher/all', { params }),
  listMyExams: async (params) => api.get('/exam/teacher/my-exams', { params }),
  getExamById: async (id) => {
    // Normalize exam ID to ensure it's a string
    const examId = typeof id === 'string' 
      ? id 
      : (id?._id || id?.id || String(id));
    
    if (!examId || examId === 'undefined' || examId === 'null') {
      throw new Error('Invalid exam ID');
    }
    
    try {
      const response = await api.get(`/exam/teacher/${examId}`);
      return response;
    } catch (error) {
      // Only log non-404 errors to reduce console spam
      // 404 errors are expected when exam doesn't exist or user lacks permission
      if (error?.status !== 404 && error?.response?.status !== 404) {
        console.error(`Failed to fetch exam ${examId}:`, error);
      }
      
      // Re-throw with more context for 404 errors
      if (error?.status === 404 || error?.response?.status === 404) {
        const enhancedError = new Error(`Kỳ thi với ID "${examId}" không tồn tại hoặc bạn không có quyền truy cập.`);
        enhancedError.status = 404;
        enhancedError.data = error.data || error.response?.data;
        throw enhancedError;
      }
      throw error;
    }
  },
  createExam: async (exam) => api.post('/exam/teacher/create', exam),
  updateExam: async (id, payload) => {
    // Normalize exam ID
    const examId = typeof id === 'string' 
      ? id 
      : (id?._id || id?.id || String(id));
    return api.put(`/exam/teacher/update/${examId}`, payload);
  },
  deleteExam: async (id) => {
    // Normalize exam ID
    const examId = typeof id === 'string' 
      ? id 
      : (id?._id || id?.id || String(id));
    return api.delete(`/exam/teacher/delete/${examId}`);
  },

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
