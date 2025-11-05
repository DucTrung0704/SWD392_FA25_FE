import React, { useEffect, useState } from 'react';
import { flashcardService } from '../../services/flashcardService';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Eye, Plus, Play } from 'lucide-react';

export default function Decks() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await flashcardService.getAllDecks();
        // Normalize to expected shape used by UI
        const normalized = (data || []).map((d) => ({
          id: d._id || d.id,
          title: d.title,
          description: d.description,
          tags: Array.isArray(d.tags) ? d.tags : [],
          category: d.category || d.subject || 'general',
          difficulty: (d.difficulty || 'beginner').toLowerCase(),
          stats: { views: d.views || d.stats?.views || 0 },
          premium: !!d.premium,
          cards: Array.isArray(d.cards) ? d.cards : [],
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
          lastStudied: d.lastStudied || null,
        }));
        setDecks(normalized);
        setFilteredDecks(normalized);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    filterAndSortDecks();
  }, [keyword, selectedCategory, sortBy, decks]);

  const filterAndSortDecks = () => {
    let result = [...decks];

    // Filter by keyword
    if (keyword) {
      result = result.filter(deck =>
        deck.title.toLowerCase().includes(keyword.toLowerCase()) ||
        deck.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        deck.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(deck => deck.category === selectedCategory);
    }

    // Sort decks
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'cards':
        result.sort((a, b) => b.cards.length - a.cards.length);
        break;
      case 'popular':
        result.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
        break;
      default:
        break;
    }

    setFilteredDecks(result);
  };

  const categories = ['all', ...new Set(decks.map(deck => deck.category).filter(Boolean))];

  // Navigation handlers
  const handlePreviewDeck = (deckId) => {
    navigate(`/decks/${deckId}`);
  };

  const handleStudyDeck = (deckId) => {
    navigate(`/decks/${deckId}/study`);
  };

  const handleCreateDeck = () => {
    navigate('/decks/create');
  };

  // Mock statistics
  const deckStats = {
    totalDecks: decks.length,
    totalCards: decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0),
    averageCards: Math.round((decks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0) / (decks.length || 1))) || 0,
    studiedToday: decks.filter(deck => deck.lastStudied).length
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
            Flashcard Decks
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Explore and master your knowledge with our curated collection of flashcard decks
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{deckStats.totalDecks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Decks</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{deckStats.totalCards}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{deckStats.averageCards}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Cards</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{deckStats.studiedToday}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Studied Today</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search decks by title, description, or tags..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="cards">Most Cards</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 h-80"></div>
              </div>
            ))}
          </div>
        )}

        {/* Decks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDecks.map((deck, index) => (
            <div 
              key={deck.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              {/* Deck Status Badge */}
              {deck.premium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PREMIUM
                </div>
              )}

              {/* Deck Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {deck.title}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {deck.description || 'A comprehensive flashcard deck for effective learning'}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {deck.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {deck.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{deck.tags.length - 3}
                  </span>
                )}
              </div>
              
              {/* Deck Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {(deck.cards?.length || 0)} cards
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {deck.stats?.views || 0}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deck.difficulty === 'advanced' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : deck.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {deck.difficulty || 'beginner'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => handleStudyDeck(deck.id)}
                  variant="primary"
                  className="flex-1 py-2 px-4 text-sm font-medium"
                >
                  Study
                </Button>
                <button
                  onClick={() => handlePreviewDeck(deck.id)}
                  className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                  title="Preview Deck"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredDecks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No decks found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {keyword ? 'Try adjusting your search terms or filters' : 'No flashcard decks available at the moment'}
            </p>
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Create New Deck CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to Create Your Own Deck?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of learners who create and share their own flashcard decks
          </p>
          <Button 
            onClick={handleCreateDeck}
            variant="primary"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Create New Deck
          </Button>
        </div>
      </div>
    </div>
  );
}