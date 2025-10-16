const mockExams = [
  {
    id: 'e1',
    title: 'Bio Quiz 1',
    durationMinutes: 30,
    questions: [
      { id: 'q1', text: 'What is the powerhouse of the cell?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Lysosome'], correctIndex: 1, topic: 'Biology', difficulty: 'Easy' },
    ],
    ownerId: 1,
  },
];

export const examService = {
  listExams: async () => mockExams,
  createExam: async (exam) => {
    const id = `e${Date.now()}`;
    const newExam = { id, ...exam };
    mockExams.push(newExam);
    return newExam;
  },
  updateExam: async (id, payload) => {
    const idx = mockExams.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exam not found');
    mockExams[idx] = { ...mockExams[idx], ...payload };
    return mockExams[idx];
  },
  deleteExam: async (id) => {
    const idx = mockExams.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exam not found');
    const [removed] = mockExams.splice(idx, 1);
    return removed;
  },
  submitExam: async (examId, answers) => {
    const exam = mockExams.find(e => e.id === examId);
    if (!exam) throw new Error('Exam not found');
    let correct = 0;
    exam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct += 1;
    });
    const score = Math.round((correct / exam.questions.length) * 100);
    return { score, correct, total: exam.questions.length };
  },
};
