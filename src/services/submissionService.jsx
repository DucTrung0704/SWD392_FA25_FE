import { api } from './api';

export const submissionService = {
  // Student: start an exam
  startExam: async (examId) => {
    return await api.post(`/submission/student/start/${examId}`, {});
  },

  // Student: submit an answer
  submitAnswer: async (submissionId, payload) => {
    // payload: { flashcard_id, selected_option }
    return await api.post(`/submission/student/submit-answer/${submissionId}`, payload);
  },

  // Student: finish exam
  finishExam: async (submissionId) => {
    return await api.post(`/submission/student/finish/${submissionId}`, {});
  },

  // Student: get one submission
  getSubmission: async (submissionId) => {
    return await api.get(`/submission/student/${submissionId}`);
  },

  // Student: my submissions list
  getMySubmissions: async (params) => {
    return await api.get('/submission/student/my-submissions', { params });
  },

  // Student: get submission by exam
  getSubmissionByExam: async (examId) => {
    return await api.get(`/submission/student/exam/${examId}`);
  },

  // Teacher/Admin: get all submissions
  getAllSubmissions: async (params) => {
    return await api.get('/submission/teacher/all', { params });
  },

  // Student: save flashcard exam result
  saveFlashcardExamResult: async (deckId, resultData) => {
    // resultData: { score, correctAnswers, totalQuestions, timeSpent, answers, questionResults }
    return await api.post('/submission/student/flashcard-exam', {
      deck_id: deckId,
      ...resultData
    });
  },
};

export default submissionService;


