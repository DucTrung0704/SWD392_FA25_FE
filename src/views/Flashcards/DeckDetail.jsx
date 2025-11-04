import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import Button from '../../components/ui/Button';

export default function DeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadDeck();
  }, [id]);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const deckData = await flashcardService.getDeckById(id);
      const cards = await flashcardService.getFlashcardsByDeckId(id);
      const normalized = {
        id: deckData._id || deckData.id,
        title: deckData.title,
        description: deckData.description,
        tags: Array.isArray(deckData.tags) ? deckData.tags : [],
        difficulty: (deckData.difficulty || 'beginner').toLowerCase(),
        stats: { views: deckData.views || 0 },
        cards: Array.isArray(cards) ? cards.map(c => ({
          id: c._id || c.id,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation,
          questionImage: c.questionImage || null,
          answerImage: c.answerImage || null,
        })) : [],
      };
      setDeck(normalized);
    } catch (err) {
      setError('Không thể tải deck. Vui lòng thử lại.');
      console.error('Error loading deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = () => {
    navigate(`/decks/${id}/study`);
  };

  const handleBackToDecks = () => {
    navigate('/flashcards');
  };

  const nextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              Lỗi tải deck
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-6">
              {error || 'Deck không tồn tại hoặc đã bị xóa.'}
            </p>
            <Button onClick={handleBackToDecks} variant="primary">
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentCardIndex];

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToDecks}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <div className="flex gap-3">
              <Button onClick={handleStartStudy} variant="primary">
                Bắt đầu học
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {deck.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {deck.description || 'Không có mô tả'}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {deck.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {deck.cards.length} thẻ
            </span>
            <span className="flex items-center gap-1">
              👁️ {deck.stats?.views || 0} lượt xem
            </span>
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
        </div>

        {/* Card Preview */}
        {deck.cards.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Xem trước thẻ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Thẻ {currentCardIndex + 1} / {deck.cards.length}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%` }}
              ></div>
            </div>

            {/* Card Content */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Câu hỏi:
                </h3>
                <p className="text-xl text-gray-800 dark:text-gray-200 mb-6">
                  {currentCard.question}
                </p>
                
                {currentCard.questionImage && (
                  <div className="mb-6">
                    <img 
                      src={currentCard.questionImage} 
                      alt="Question" 
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    />
                  </div>
                )}

                {!showAnswer ? (
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    variant="primary"
                    className="px-8 py-3"
                  >
                    Xem đáp án
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Đáp án:
                    </h4>
                    <p className="text-xl text-gray-800 dark:text-gray-200 mb-4">
                      {currentCard.answer}
                    </p>
                    
                    {currentCard.answerImage && (
                      <div className="mb-4">
                        <img 
                          src={currentCard.answerImage} 
                          alt="Answer" 
                          className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        />
                      </div>
                    )}
                    
                    {currentCard.explanation && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Giải thích:
                        </h5>
                        <p className="text-gray-700 dark:text-gray-300">
                          {currentCard.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                variant="secondary"
                className="px-6 py-2"
              >
                ← Thẻ trước
              </Button>
              
              <div className="flex gap-2">
                {deck.cards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentCardIndex(index);
                      setShowAnswer(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentCardIndex 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                onClick={nextCard}
                disabled={currentCardIndex === deck.cards.length - 1}
                variant="secondary"
                className="px-6 py-2"
              >
                Thẻ tiếp →
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Deck trống
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Deck này chưa có thẻ nào. Hãy thêm thẻ để bắt đầu học!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
