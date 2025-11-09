import { api } from './api';

export const aiService = {
  /**
   * Generate questions using AI
   * @param {Object} params - Generation parameters
   * @param {string} params.topic - Topic for questions (e.g., "Quadratic Equations")
   * @param {string} params.subject - Subject (e.g., "Mathematics")
   * @param {string} params.difficulty - Difficulty level: 'easy', 'medium', 'hard'
   * @param {number} params.count - Number of questions to generate (1-10)
   * @param {string} params.tag - Tag: 'geometry', 'algebra', 'probability', 'calculus', 'statistics', 'other'
   * @returns {Promise} Generated questions
   */
  generateQuestions: async (params) => {
    const { topic, subject, difficulty = 'medium', count = 5, tag = 'other' } = params;
    
    if (!topic || !subject) {
      throw new Error('Topic and subject are required');
    }

    return await api.post('/ai/generate-questions', {
      topic,
      subject,
      difficulty,
      count: Math.min(Math.max(parseInt(count) || 5, 1), 10),
      tag
    });
  },

  /**
   * Generate flashcards using AI
   * @param {Object} params - Generation parameters
   * @param {string} params.topic - Topic for flashcards (e.g., "Quadratic Equations")
   * @param {string} params.subject - Subject (e.g., "Mathematics")
   * @param {string} params.difficulty - Difficulty level: 'easy', 'medium', 'hard'
   * @param {number} params.count - Number of flashcards to generate (1-20)
   * @param {string} params.tag - Tag: 'geometry', 'algebra', 'probability', 'calculus', 'statistics', 'other'
   * @returns {Promise} Generated flashcards
   */
  generateFlashcards: async (params) => {
    const { topic, subject, difficulty = 'medium', count = 5, tag = 'other' } = params;
    
    if (!topic || !subject) {
      throw new Error('Topic and subject are required');
    }

    return await api.post('/ai/generate-flashcards', {
      topic,
      subject,
      difficulty,
      count: Math.min(Math.max(parseInt(count) || 5, 1), 20),
      tag
    });
  },

  /**
   * Validate/review a question using AI
   * @param {Object} questionData - Question data to validate
   * @param {string} questionData.question - Question text
   * @param {Object} questionData.options - Options object with A, B, C, D
   * @param {string} questionData.correctOption - Correct option (A, B, C, or D)
   * @param {string} [questionData.answer] - Answer text
   * @param {string} [questionData.tag] - Tag
   * @param {string} [questionData.difficulty] - Difficulty level
   * @param {string} [questionData.subject] - Subject
   * @param {string} [questionData.explanation] - Explanation
   * @returns {Promise} Validation result
   */
  validateQuestion: async (questionData) => {
    const { question, options, correctOption, answer, tag, difficulty, subject, explanation } = questionData;
    
    if (!question || !options || !correctOption) {
      throw new Error('Question, options, and correctOption are required');
    }

    return await api.post('/ai/validate-question', {
      question,
      options,
      correctOption,
      answer,
      tag,
      difficulty,
      subject,
      explanation
    });
  },

  /**
   * Check AI service health
   * @returns {Promise} Health check response
   */
  checkHealth: async () => {
    return await api.get('/ai/health');
  }
};

export default aiService;

