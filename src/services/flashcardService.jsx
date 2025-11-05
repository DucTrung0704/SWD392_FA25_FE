// Removed all mock data
import { api } from './api';

export const flashcardService = {
  // Get all decks from API
  getAllDecks: async () => {
    try {
      const data = await api.get('/deck/all');
      // API returns array directly, not { decks: [...] }
      return Array.isArray(data) ? data : (data.decks || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      throw error;
    }
  },

  // Get deck by ID from API
  getDeckById: async (id) => {
    try {
      const data = await api.get(`/deck/all/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },

  // Create new deck (Teacher/Admin only)
  createDeck: async (deckData) => {
    try {
      const data = await api.post('/deck/teacher/create', deckData);
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  },

  // Update deck (Teacher/Admin only)
  updateDeck: async (id, deckData) => {
    try {
      console.log('Updating deck with ID:', id);
      console.log('Update data:', deckData);

      const data = await api.put(`/deck/teacher/update/${id}`, deckData);
      console.log('Update success:', data);
      return data;
    } catch (error) {
      console.error('Error updating deck:', error);
      throw error;
    }
  },

  // Delete deck (Teacher/Admin only)
  deleteDeck: async (id) => {
    try {
      console.log('Deleting deck with ID:', id);

      const data = await api.delete(`/deck/teacher/delete/${id}`);
      console.log('Delete success:', data);
      return data;
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  },
  
  // Flashcards - Student scope
  getAllFlashcards: async () => {
    try {
      return await api.get('/flashcard/student/all');
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }
  },

  getFlashcardById: async (id) => {
    try {
      return await api.get(`/flashcard/student/${id}`);
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      throw error;
    }
  },

  getFlashcardsByDeckId: async (deckId) => {
    try {
      const data = await api.get(`/flashcard/student/deck/${deckId}`);
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.flashcards && Array.isArray(data.flashcards)) {
        return data.flashcards;
      } else if (data.count === 0 || data.flashcards === 0) {
        return [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching flashcards by deck:', error);
      throw error;
    }
  },

  // Flashcards - Teacher/Admin scope
  createFlashcard: async (payload) => {
    try {
      const data = await api.post('/flashcard/teacher/create', payload);
      return data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  },

  updateFlashcard: async (id, payload) => {
    try {
      const data = await api.put(`/flashcard/teacher/update/${id}`, payload);
      return data;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  },

  deleteFlashcard: async (id) => {
    try {
      const data = await api.delete(`/flashcard/teacher/delete/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  },

  // Removed mock helper functions
};
