// Removed all mock data

const API_BASE_URL = '/api';

export const flashcardService = {
  // Get all decks from API
  getAllDecks: async () => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/deck/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/deck/all/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Deck not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },

  // Create new deck (Teacher/Admin only)
  createDeck: async (deckData) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/deck/teacher/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(deckData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  },

  // Update deck (Teacher/Admin only)
  updateDeck: async (id, deckData) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating deck with ID:', id);
      console.log('Update data:', deckData);

      const response = await fetch(`${API_BASE_URL}/deck/teacher/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(deckData),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Deleting deck with ID:', id);

      const response = await fetch(`${API_BASE_URL}/deck/teacher/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/student/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }
  },

  getFlashcardById: async (id) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/student/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      throw error;
    }
  },

  getFlashcardsByDeckId: async (deckId) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/student/deck/${deckId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data.flashcards || []);
    } catch (error) {
      console.error('Error fetching flashcards by deck:', error);
      throw error;
    }
  },

  // Flashcards - Teacher/Admin scope
  createFlashcard: async (payload) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/teacher/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  },

  updateFlashcard: async (id, payload) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/teacher/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  },

  deleteFlashcard: async (id) => {
    try {
      const token = localStorage.getItem('app_auth_user_token') || 
                    localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/flashcard/teacher/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  },

  // Removed mock helper functions
};
