import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus, BookOpen, Clock, User, Globe, Lock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';

export default function TeacherDeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const allowedTags = ['geometry', 'algebra', 'probability', 'calculus', 'statistics', 'other'];
  const [cardForm, setCardForm] = useState({ question: '', answer: '', explanation: '', tag: 'algebra' });
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [deleteCardError, setDeleteCardError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editCardForm, setEditCardForm] = useState({ question: '', answer: '', explanation: '', tag: 'algebra' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  
  // Form state for edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: 'easy',
    isPublic: false
  });

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await flashcardService.getDeckById(id);

        // Transform API response to match component expectations
        const transformedDeck = {
          ...data,
          id: data._id,
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
          createdBy: data.created_by?.name || data.createdBy || 'Không xác định',
          createdByEmail: data.created_by?.email,
          // Set defaults if not provided
          difficulty: data.difficulty || 'Medium',
          isPublic: data.isPublic !== undefined ? data.isPublic : false,
          subject: data.subject || 'General',
          flashcards: []
        };

        // Load flashcards for this deck
        try {
          const fcRes = await flashcardService.getFlashcardsByDeckId(id);
          const fcList = Array.isArray(fcRes) ? fcRes : (fcRes?.flashcards || []);
          transformedDeck.flashcards = fcList;
        } catch (fcErr) {
          // If flashcards fail to load, it's okay - deck might be empty
          // Just set flashcards to empty array and continue
          console.log('No flashcards found or error loading flashcards:', fcErr);
          transformedDeck.flashcards = [];
        }

        setDeck(transformedDeck);
      } catch (err) {
        console.error('Failed to load deck:', err);
        setError(err.message || 'Không thể tải chi tiết bộ thẻ. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadDeck();
    }
  }, [id]);

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
    return `${Math.floor(seconds / 2592000)} tháng trước`;
  };

  // Open edit modal with deck data
  const openEditModal = () => {
    if (!deck) return;
    
    setFormData({
      title: deck.title,
      description: deck.description || '',
      subject: deck.subject || '',
      difficulty: (deck.difficulty || 'medium').toLowerCase(),
      isPublic: deck.isPublic || false
    });
    setShowEditModal(true);
  };

  // Handle edit deck
  const handleEditDeck = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bộ thẻ');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await flashcardService.updateDeck(id, formData);
      
      // Reload deck data
      const data = await flashcardService.getDeckById(id);
      const transformedDeck = {
        ...data,
        id: data._id,
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt,
        createdBy: data.created_by?.name || data.createdBy || 'Unknown',
        createdByEmail: data.created_by?.email,
        difficulty: data.difficulty || 'Medium',
        isPublic: data.isPublic !== undefined ? data.isPublic : false,
        subject: data.subject || 'General',
        flashcards: data.flashcards || []
      };
      setDeck(transformedDeck);
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update deck:', err);
      setError(err.message || 'Không thể cập nhật bộ thẻ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete deck
  const handleDeleteDeck = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await flashcardService.deleteDeck(id);
      // Navigate back to flashcards list
      navigate('/dashboard/teacher/flashcards');
    } catch (err) {
      console.error('Failed to delete deck:', err);
      setError(err.message || 'Không thể xóa bộ thẻ. Vui lòng thử lại.');
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddCardModal = () => {
    const subjectLower = (deck?.subject || '').toString().toLowerCase();
    const suggestedTag = allowedTags.includes(subjectLower) ? subjectLower : 'other';
    setCardForm({ question: '', answer: '', explanation: '', tag: suggestedTag });
    setError('');
    setShowAddCardModal(true);
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    const trimmedQuestion = cardForm.question.trim();
    const trimmedAnswer = cardForm.answer.trim();

    if (!trimmedQuestion || !trimmedAnswer) {
      setError('Vui lòng nhập câu hỏi và câu trả lời');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await flashcardService.createFlashcard({
        deck_id: id,
        question: trimmedQuestion,
        answer: trimmedAnswer,
        note: cardForm.explanation || '',
        tag: (cardForm.tag || '').toString().toLowerCase()
      });
      const refreshed = await flashcardService.getFlashcardsByDeckId(id);
      const list = Array.isArray(refreshed) ? refreshed : (refreshed?.flashcards || []);
      setDeck(prev => ({ ...prev, flashcards: list }));
      setShowAddCardModal(false);
    } catch (err) {
      console.error('Failed to create flashcard:', err);
      setError(err.message || 'Không thể tạo flashcard. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditCardModal = (card) => {
    setSelectedCard(card);
    const isObj = typeof card === 'object';
    const subjectLower = (deck?.subject || '').toString().toLowerCase();
    const fallbackTag = allowedTags.includes(subjectLower) ? subjectLower : 'other';
    const normalizedTag = isObj ? (card.tag || '').toString().toLowerCase() : '';
    const safeTag = allowedTags.includes(normalizedTag) ? normalizedTag : fallbackTag;
    setEditCardForm({
      question: isObj ? (card.question || '') : String(card || ''),
      answer: isObj ? (card.answer || '') : '',
      explanation: isObj ? (card.explanation || card.note || '') : '',
      tag: safeTag
    });
    setShowEditCardModal(true);
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    const trimmedQuestion = editCardForm.question.trim();
    const trimmedAnswer = editCardForm.answer.trim();
    if (!trimmedQuestion || !trimmedAnswer) {
      setError('Vui lòng nhập câu hỏi và câu trả lời');
      return;
    }
    if (!allowedTags.includes(editCardForm.tag)) {
      setError('Vui lòng chọn một tag hợp lệ cho thẻ này.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      const cardId = selectedCard._id || selectedCard.id;
      await flashcardService.updateFlashcard(cardId, {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        note: editCardForm.explanation || '',
        tag: (editCardForm.tag || '').toString().toLowerCase()
      });
      const refreshed = await flashcardService.getFlashcardsByDeckId(id);
      const list = Array.isArray(refreshed) ? refreshed : (refreshed?.flashcards || []);
      setDeck(prev => ({ ...prev, flashcards: list }));
      setShowEditCardModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error('Failed to update flashcard:', err);
      setError(err.message || 'Không thể cập nhật flashcard. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteCardModal = (card) => {
    setSelectedCard(card);
    setDeleteCardError('');
    setShowDeleteCardModal(true);
  };

  const openPreviewModal = (card, index) => {
    setPreviewCardIndex(index);
    setIsFlipped(false);
    setShowPreviewModal(true);
  };

  const handlePrevCard = () => {
    if (previewCardIndex > 0) {
      setPreviewCardIndex(previewCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (deck?.flashcards && previewCardIndex < deck.flashcards.length - 1) {
      setPreviewCardIndex(previewCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    try {
      setIsSubmitting(true);
      setDeleteCardError('');
      const cardId = selectedCard._id || selectedCard.id;
      await flashcardService.deleteFlashcard(cardId);
      const refreshed = await flashcardService.getFlashcardsByDeckId(id);
      const list = Array.isArray(refreshed) ? refreshed : (refreshed?.flashcards || []);
      setDeck(prev => ({ ...prev, flashcards: list }));
      setShowDeleteCardModal(false);
      setSelectedCard(null);
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
      setDeleteCardError(err.message || 'Không thể xóa flashcard. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset pagination when flashcards list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deck?.flashcards?.length]);

  // Pagination calculations for flashcards grid
  const totalCards = deck?.flashcards?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCards / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageCards = (deck?.flashcards || []).slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải chi tiết bộ thẻ...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/dashboard/teacher/flashcards')}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Quay lại Flashcard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/teacher/flashcards')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Flashcards
        </button>

        {/* Deck Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {deck.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {deck.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {deck.subject && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    {deck.subject}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(deck.difficulty)}`}>
                  {deck.difficulty || 'Medium'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  deck.isPublic 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400'
                }`}>
                  {deck.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {deck.isPublic ? 'Công khai' : 'Riêng tư'}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{deck.flashcards?.length || 0} thẻ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Đã tạo {getTimeAgo(deck.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Bởi {deck.createdBy || 'Bạn'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => navigate(`/dashboard/teacher/flashcards/${id}/study`)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-colors flex items-center gap-2"
                title="Xem lại Bộ Thẻ"
              >
                Xem lại
              </button>
              <button 
                onClick={openEditModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa Bộ Thẻ
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Flashcards ({deck.flashcards?.length || 0})
            </h2>
            <button onClick={openAddCardModal} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm Thẻ
            </button>
          </div>

          {deck.flashcards && deck.flashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPageCards.map((card, index) => (
                <div
                  key={card._id || (startIndex + index)}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => openPreviewModal(card, startIndex + index)}
                  title="Nhấp để xem trước"
                  role="button"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Thẻ #{startIndex + index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openPreviewModal(card, startIndex + index); }} className="p-1 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded" title="Xem trước">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openEditCardModal(card); }} className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openDeleteCardModal(card); }} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Câu hỏi:</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {typeof card === 'string' ? card : card.question || 'Không có câu hỏi'}
                      </p>
                    </div>
                    {typeof card === 'object' && card.answer && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Câu trả lời:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {card.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có flashcard nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bắt đầu xây dựng bộ thẻ của bạn bằng cách thêm flashcard
              </p>
              <button onClick={openAddCardModal} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Thêm Thẻ Đầu Tiên
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {deck.flashcards && deck.flashcards.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                {' - '}
                <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, totalCards)}</span>
                {' trong tổng số '}
                <span className="font-medium text-gray-900 dark:text-white">{totalCards}</span>
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
                  Trước
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
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
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddCardModal(false)}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateCard}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm Flashcard</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={cardForm.question}
                      onChange={(e) => setCardForm({ ...cardForm, question: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập câu hỏi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Câu trả lời <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={cardForm.answer}
                      onChange={(e) => setCardForm({ ...cardForm, answer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập câu trả lời"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nhãn <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cardForm.tag}
                      onChange={(e) => setCardForm({ ...cardForm, tag: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {allowedTags.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giải thích (tùy chọn)
                    </label>
                    <textarea
                      rows={3}
                      value={cardForm.explanation}
                      onChange={(e) => setCardForm({ ...cardForm, explanation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thêm giải thích"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Thêm Thẻ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {showEditCardModal && selectedCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditCardModal(false)}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateCard}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉnh sửa Flashcard</h3>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      value={editCardForm.question}
                      onChange={(e) => setEditCardForm({ ...editCardForm, question: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập câu hỏi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      value={editCardForm.answer}
                      onChange={(e) => setEditCardForm({ ...editCardForm, answer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập câu trả lời"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Explanation (optional)</label>
                    <textarea
                      rows={3}
                      value={editCardForm.explanation}
                      onChange={(e) => setEditCardForm({ ...editCardForm, explanation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thêm giải thích"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tag <span className="text-red-500">*</span></label>
                    <select
                      value={editCardForm.tag}
                      onChange={(e) => setEditCardForm({ ...editCardForm, tag: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {allowedTags.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button type="button" onClick={() => setShowEditCardModal(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        Cập nhật Thẻ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Modal */}
      {showDeleteCardModal && selectedCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteCardModal(false)}></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Xóa Flashcard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">Bạn có chắc chắn muốn xóa flashcard này?</p>
                {error && (
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                    <p className="text-red-700 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                <button type="button" onClick={() => setShowDeleteCardModal(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                <button onClick={handleDeleteCard} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                        Xóa Thẻ
                    </>
                  )}
                </button>
              </div>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉnh sửa Bộ Thẻ</h3>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tiêu đề Bộ Thẻ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tiêu đề bộ thẻ"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Môn học
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ví dụ: Sinh học, Toán học"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mức Độ Khó
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
                        Mô tả
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Mô tả nội dung của bộ thẻ này"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublicEdit"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="isPublicEdit" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Công khai bộ thẻ này
                      </label>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setError('');
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Cập nhật Bộ Thẻ
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
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Xóa Bộ Thẻ
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa "{deck.title}"?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Hành động này không thể hoàn tác và sẽ xóa tất cả {deck.flashcards?.length || 0} flashcard trong bộ thẻ này.
                  </p>
                  
                  {error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleDeleteDeck}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa Bộ Thẻ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Card Modal */}
        {showPreviewModal && deck?.flashcards && deck.flashcards.length > 0 && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreviewModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Xem trước Flashcard
                  </h3>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-6">
                  {/* Card Counter */}
                  <div className="text-center mb-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Thẻ {previewCardIndex + 1} / {deck.flashcards.length}
                    </span>
                  </div>

                  {/* Flashcard */}
                  {(() => {
                    const currentCard = deck.flashcards[previewCardIndex];
                    const cardObj = typeof currentCard === 'object' ? currentCard : { question: currentCard };

                    return (
                      <div className="relative">
                        <div
                          className={`relative w-full h-64 cursor-pointer transition-transform duration-500 ${
                            isFlipped ? '[transform:rotateY(180deg)]' : ''
                          }`}
                          onClick={() => setIsFlipped(!isFlipped)}
                          style={{ perspective: '1000px' }}
                        >
                          {/* Front - Question */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 flex items-center justify-center border-2 border-blue-200 dark:border-blue-800 ${
                              isFlipped ? 'opacity-0' : 'opacity-100'
                            } transition-opacity duration-300`}
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="text-center w-full">
                              <div className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium">
                                CÂU HỎI
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {cardObj.question || 'Không có câu hỏi'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Nhấp để xem câu trả lời
                              </p>
                            </div>
                          </div>

                          {/* Back - Answer */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-600 dark:to-gray-700 rounded-xl p-8 flex items-center justify-center border-2 border-green-200 dark:border-green-800 ${
                              isFlipped ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300`}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div className="text-center w-full">
                              <div className="text-sm text-green-600 dark:text-green-400 mb-4 font-medium">
                                CÂU TRẢ LỜI
                              </div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {cardObj.answer || 'Không có câu trả lời'}
                              </p>
                              {cardObj.explanation || cardObj.note ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {cardObj.explanation || cardObj.note}
                                  </p>
                                </div>
                              ) : null}
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Nhấp để xem câu hỏi lại
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={handlePrevCard}
                      disabled={previewCardIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      {isFlipped ? 'Hiện Câu Hỏi' : 'Hiện Câu Trả Lời'}
                    </button>

                    <button
                      onClick={handleNextCard}
                      disabled={previewCardIndex === (deck.flashcards?.length || 0) - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
