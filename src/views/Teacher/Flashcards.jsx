import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, FileText, Users, TrendingUp, BookOpen, Globe, Lock, Play, X, MoreVertical } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';

export default function TeacherFlashcards() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [filterRules, setFilterRules] = useState([]);
  const [tempFilter, setTempFilter] = useState({ field: 'title', operator: 'contains', value: '' });
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'easy',
    isPublic: false
  });

  // Helper function to transform deck data
  const transformDeck = (deck) => {
    console.log('Transforming deck:', deck._id);
    console.log('  - isPublic from API:', deck.isPublic);
    console.log('  - status from API:', deck.status);
    
    // Capitalize difficulty (easy -> Easy, hard -> Hard)
    const difficulty = deck.difficulty 
      ? deck.difficulty.charAt(0).toUpperCase() + deck.difficulty.slice(1).toLowerCase()
      : 'Medium';
    
    // Backend has a bug: sends isPublic=true but returns status=false
    // We need to handle multiple scenarios:
    let isPublic = false;
    let statusString = 'draft';
    
    if (deck.isPublic !== undefined) {
      // If isPublic field exists in response, use it directly
      isPublic = deck.isPublic === true;
      statusString = isPublic ? 'active' : 'draft';
    } else if (deck.status !== undefined) {
      // Backend returns 'status' field instead of 'isPublic'
      if (typeof deck.status === 'boolean') {
        // BACKEND BUG: status is boolean but inverted!
        // Backend saves isPublic:true as status:false (wrong!)
        // For now, we assume status:true means public
        isPublic = deck.status === true;
        statusString = isPublic ? 'active' : 'draft';
      } else if (typeof deck.status === 'string') {
        // status is string enum: 'active'/'draft'/'archived'
        isPublic = deck.status === 'active';
        statusString = deck.status;
      }
    }
    
    // TEMPORARY FIX: Check if backend sent the original isPublic in a different way
    // This helps us preserve the intent even if backend has bugs
    if (deck.isPublic === undefined && deck.status === false) {
      // Backend might be storing isPublic incorrectly
      // We'll default to draft for now
      isPublic = false;
      statusString = 'draft';
    }
    
    console.log('  - Converted isPublic:', isPublic);
    console.log('  - Converted status:', statusString);
    
    return {
      id: deck._id,
      title: deck.title,
      subject: deck.subject || 'General',
      cardCount: deck.flashcards?.length || 0,
      difficulty: difficulty,
      createdDate: deck.created_at || deck.createdAt || new Date().toISOString(),
      lastModified: getTimeAgo(deck.updated_at || deck.updatedAt || deck.created_at || deck.createdAt),
      students: 0, // API doesn't provide this
      avgScore: 0, // API doesn't provide this
      status: statusString,
      isPublic: isPublic, // Store the boolean value
      description: deck.description || 'No description available',
      createdBy: deck.created_by?.name || deck.createdBy || 'Unknown'
    };
  };

  // Load decks from API
  useEffect(() => {
    const loadDecks = async () => {
      try {
        setIsLoading(true);
        setError('');
        const decks = await flashcardService.getAllDecks();
        
        // Transform API data to match component format
        const transformedDecks = decks.map(transformDeck);
        
        console.log('Initial load - transformed decks:', transformedDecks);
        setFlashcardDecks(transformedDecks);
      } catch (err) {
        console.error('Failed to load decks:', err);
        setError(err.message || 'Failed to load flashcard decks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDecks();
  }, []);

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      difficulty: 'easy',
      isPublic: false
    });
  };

  // Handle create deck
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a deck title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Backend might expect both isPublic and status, or convert one to another
      // Send isPublic as per API documentation, backend should handle conversion
      const apiData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        isPublic: formData.isPublic
      };
      
      console.log('Creating deck with data:', apiData);
      await flashcardService.createDeck(apiData);
      
      // Reload decks
      const decks = await flashcardService.getAllDecks();
      const transformedDecks = decks.map(transformDeck);
      
      console.log('After create - transformed decks:', transformedDecks);
      setFlashcardDecks(transformedDecks);
      
      // Close modal and reset form
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create deck:', err);
      setError(err.message || 'Failed to create deck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit deck
  const handleEditDeck = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a deck title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Backend might expect both isPublic and status, or convert one to another
      // Send isPublic as per API documentation, backend should handle conversion
      const apiData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        isPublic: formData.isPublic
      };
      
      console.log('Updating deck with data:', apiData);
      const updateResult = await flashcardService.updateDeck(selectedDeck.id, apiData);
      console.log('Update result from API:', updateResult);
      console.log('Updated deck difficulty from API:', updateResult.deck?.difficulty);
      
      // Reload decks
      const decks = await flashcardService.getAllDecks();
      console.log('Reloaded decks from API:', decks);
      
      // Log the specific deck we just updated
      const updatedDeck = decks.find(d => d._id === selectedDeck.id);
      console.log('Found updated deck:', updatedDeck);
      console.log('Updated deck difficulty from GET:', updatedDeck?.difficulty);
      
      const transformedDecks = decks.map(transformDeck);
      console.log('After update - transformed decks:', transformedDecks);
      
      // Log the transformed version of the updated deck
      const transformedUpdated = transformedDecks.find(d => d.id === selectedDeck.id);
      console.log('Transformed updated deck:', transformedUpdated);
      console.log('Transformed difficulty:', transformedUpdated?.difficulty);
      
      setFlashcardDecks(transformedDecks);
      
      // Close modal and reset
      setShowEditModal(false);
      setSelectedDeck(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update deck:', err);
      setError(err.message || 'Failed to update deck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete deck
  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await flashcardService.deleteDeck(selectedDeck.id);
      
      // Remove from local state
      setFlashcardDecks(flashcardDecks.filter(deck => deck.id !== selectedDeck.id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedDeck(null);
    } catch (err) {
      console.error('Failed to delete deck:', err);
      setError(err.message || 'Failed to delete deck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (deck) => {
    setSelectedDeck(deck);
    setFormData({
      title: deck.title,
      description: deck.description,
      subject: deck.subject,
      difficulty: deck.difficulty.toLowerCase(),
      isPublic: deck.status === 'active'
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (deck) => {
    setSelectedDeck(deck);
    setShowDeleteModal(true);
  };

  // Removed legacy mock deck list

  const filteredDecks = flashcardDecks.filter(deck => {
    // Apply filter rules
    if (filterRules.length > 0) {
      const matchesAllRules = filterRules.every(rule => {
        if (!rule.value) return true; // Skip empty rules
        
        let deckValue;
        if (rule.field === 'status') {
          deckValue = deck.status || 'draft';
        } else if (rule.field === 'difficulty') {
          deckValue = (deck.difficulty || 'Medium').toLowerCase();
        } else {
          deckValue = String(deck[rule.field] || '').toLowerCase();
        }
        const filterValue = rule.value.toLowerCase();
        
        switch (rule.operator) {
          case 'contains':
            return deckValue.includes(filterValue);
          case 'equals':
            return deckValue === filterValue;
          case 'startsWith':
            return deckValue.startsWith(filterValue);
          case 'endsWith':
            return deckValue.endsWith(filterValue);
          default:
            return true;
        }
      });
      if (!matchesAllRules) return false;
    }
    
    return true;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRules, flashcardDecks]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((filteredDecks.length || 0) / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageDecks = filteredDecks.slice(startIndex, endIndex);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flashcard Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Create, manage, and track your flashcard decks for effective teaching.
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Deck
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Decks</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{flashcardDecks.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.reduce((sum, deck) => sum + deck.cardCount, 0)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Public Decks</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.filter(deck => deck.status === 'active').length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {flashcardDecks.filter(deck => deck.status === 'draft').length} private
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {flashcardDecks.reduce((sum, deck) => sum + deck.cardCount, 0)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            In this view show records
          </h3>
          
          {filterRules.length === 0 ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Where</span>
                <select
                  value={tempFilter.field}
                  onChange={(e) => {
                    setTempFilter({ ...tempFilter, field: e.target.value });
                    if (tempFilter.value.trim()) {
                      setFilterRules([{ ...tempFilter, field: e.target.value }]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="title">Title</option>
                  <option value="subject">Subject</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="status">Status</option>
                </select>
                <select
                  value={tempFilter.operator}
                  onChange={(e) => {
                    setTempFilter({ ...tempFilter, operator: e.target.value });
                    if (tempFilter.value.trim()) {
                      setFilterRules([{ ...tempFilter, operator: e.target.value }]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="startsWith">starts with</option>
                  <option value="endsWith">ends with</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter value..."
                  value={tempFilter.value}
                  onChange={(e) => {
                    const newTemp = { ...tempFilter, value: e.target.value };
                    setTempFilter(newTemp);
                    if (e.target.value.trim()) {
                      setFilterRules([newTemp]);
                    } else {
                      setFilterRules([]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {filterRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {index === 0 ? 'Where' : 'And'}
                  </span>
                  <select
                    value={rule.field}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].field = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="subject">Subject</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="status">Status</option>
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].operator = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="startsWith">starts with</option>
                    <option value="endsWith">ends with</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter value..."
                    value={rule.value}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].value = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newRules = filterRules.filter((_, i) => i !== index);
                      setFilterRules(newRules);
                      if (newRules.length === 0) {
                        setTempFilter({ field: 'title', operator: 'contains', value: '' });
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setFilterRules([...filterRules, { field: 'title', operator: 'contains', value: '' }]);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add filter
            </button>
            {filterRules.length > 0 && (
              <button
                onClick={() => {
                  setFilterRules([]);
                  setTempFilter({ field: 'title', operator: 'contains', value: '' });
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading flashcard decks...</span>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No flashcard decks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterRules.length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first flashcard deck'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Deck
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPageDecks.map((deck) => (
            <div key={deck.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[480px] ${
              deck.status === 'active' 
                ? 'border-green-300 dark:border-green-700 ring-2 ring-green-100 dark:ring-green-900' 
                : 'border-gray-100 dark:border-gray-700'
            }`}>
              {/* Public/Private Badge Banner */}
              {deck.status === 'active' && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-semibold">Public Deck</span>
                  </div>
                  <span className="text-xs text-green-100">Visible to all students</span>
                </div>
              )}
              {deck.status !== 'active' && (
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-white">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-semibold">Private Deck</span>
                  </div>
                  <span className="text-xs text-orange-100">Only visible to you</span>
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4 flex-shrink-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 min-h-[3rem]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {deck.title}
                      </h3>
                      {deck.status === 'draft' && (
                        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" title="Private deck" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 min-h-[4rem]">
                      {deck.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(deck.difficulty)}`}>
                      {deck.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cards:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{deck.cardCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Students:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{deck.students}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                    <span className={`font-medium ${getScoreColor(deck.avgScore)}`}>
                      {deck.avgScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Modified:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{deck.lastModified}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto flex-shrink-0">
                  <button 
                    onClick={() => navigate(`/dashboard/teacher/flashcards/${deck.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => navigate(`/decks/${deck.id}/study`)}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
                    title="Preview Deck"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openEditModal(deck)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(deck)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredDecks.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                {' - '}
                <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredDecks.length)}</span>
                {' of '}
                <span className="font-medium text-gray-900 dark:text-white">{filteredDecks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}

        {/* Create Deck Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleCreateDeck}>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Flashcard Deck</h3>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deck Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter deck title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Biology, Mathematics"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select 
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the content of this deck"
                      />
                    </div>
                    
                    <div className={`rounded-xl p-4 border-2 transition-all ${
                      formData.isPublic 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                          className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <label htmlFor="isPublic" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            {formData.isPublic ? (
                              <>
                                <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Make this deck public
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                Keep this deck private
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formData.isPublic 
                              ? 'Students will be able to view and study this deck' 
                              : 'Only you can see this deck'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Deck
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Deck Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleEditDeck}>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Flashcard Deck</h3>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deck Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter deck title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Biology, Mathematics"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select 
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the content of this deck"
                      />
                    </div>
                    
                    <div className={`rounded-xl p-4 border-2 transition-all ${
                      formData.isPublic 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="isPublicEdit"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                          className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <label htmlFor="isPublicEdit" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                            {formData.isPublic ? (
                              <>
                                <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Make this deck public
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                Keep this deck private
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formData.isPublic 
                              ? 'Students will be able to view and study this deck' 
                              : 'Only you can see this deck'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedDeck(null);
                        resetForm();
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Update Deck
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedDeck && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Delete Deck
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to delete "{selectedDeck.title}"?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    This action cannot be undone and will delete all {selectedDeck.cardCount} flashcards in this deck.
                  </p>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedDeck(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteDeck}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Deck
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
