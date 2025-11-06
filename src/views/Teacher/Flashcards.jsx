import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, FileText, Users, TrendingUp, BookOpen, Globe, Lock } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';

export default function TeacherFlashcards() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Remove mock data
  const oldFlashcardDecks = [
    {
      id: 1,
      title: 'Biology - Cell Structure',
      subject: 'Biology',
      cardCount: 45,
      difficulty: 'Medium',
      createdDate: '2024-01-15',
      lastModified: '2 days ago',
      students: 28,
      avgScore: 87,
      status: 'active',
      description: 'Comprehensive flashcards covering cell organelles and their functions.'
    },
    {
      id: 2,
      title: 'Mathematics - Calculus Basics',
      subject: 'Mathematics',
      cardCount: 32,
      difficulty: 'Hard',
      createdDate: '2024-01-10',
      lastModified: '1 week ago',
      students: 35,
      avgScore: 72,
      status: 'active',
      description: 'Fundamental concepts of differential and integral calculus.'
    },
    {
      id: 3,
      title: 'Physics - Mechanics',
      subject: 'Physics',
      cardCount: 58,
      difficulty: 'Hard',
      createdDate: '2024-01-05',
      lastModified: '3 days ago',
      students: 42,
      avgScore: 79,
      status: 'active',
      description: 'Newton\'s laws, forces, and motion principles.'
    },
    {
      id: 4,
      title: 'Chemistry - Periodic Table',
      subject: 'Chemistry',
      cardCount: 118,
      difficulty: 'Easy',
      createdDate: '2023-12-20',
      lastModified: '1 month ago',
      students: 56,
      avgScore: 91,
      status: 'active',
      description: 'Complete periodic table with element properties and trends.'
    },
    {
      id: 5,
      title: 'English - Vocabulary Builder',
      subject: 'English',
      cardCount: 200,
      difficulty: 'Medium',
      createdDate: '2023-12-15',
      lastModified: '2 weeks ago',
      students: 23,
      avgScore: 85,
      status: 'draft',
      description: 'Advanced vocabulary words with definitions and usage examples.'
    }
  ];

  // Extract unique subjects from decks
  const subjects = ['all', ...new Set(flashcardDecks.map(deck => deck.subject).filter(Boolean))];

  const filteredDecks = flashcardDecks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || deck.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

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
                Deck Management
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

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search flashcard decks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
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
              {searchTerm || selectedSubject !== 'all' 
                ? 'Try adjusting your search filters' 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
            <div key={deck.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
              deck.status === 'active' 
                ? 'border-green-300 dark:border-green-700 ring-2 ring-green-100 dark:ring-green-900' 
                : 'border-gray-100 dark:border-gray-700'
            }`}>
              {/* Public Badge Banner */}
              {deck.status === 'active' && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-semibold">Public Deck</span>
                  </div>
                  <span className="text-xs text-green-100">Visible to all students</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {deck.title}
                      </h3>
                      {deck.status === 'draft' && (
                        <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" title="Private deck" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {deck.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(deck.difficulty)}`}>
                      {deck.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
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

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/dashboard/teacher/flashcards/${deck.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
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
