import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';

export default function StudySimple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState('normal'); // normal, review, mastered
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0
  });

  useEffect(() => {
    loadDeck();
  }, [id]);

  const loadDeck = async () => {
    try {
      setLoading(true);
      const deckData = await flashcardService.getDeck(id);
      setDeck(deckData);
    } catch (err) {
      setError('Không thể tải deck. Vui lòng thử lại.');
      console.error('Error loading deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDeck = () => {
    navigate(`/decks/${id}`);
  };

  const handleBackToDecks = () => {
    navigate('/flashcards');
  };

  const nextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // End of deck
      setStudyMode('completed');
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markCardCorrect = async () => {
    try {
      await flashcardService.markCardAsKnown(deck.cards[currentCardIndex].id);
      setStudyStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      nextCard();
    } catch (err) {
      console.error('Error marking card:', err);
    }
  };

  const markCardIncorrect = async () => {
    try {
      await flashcardService.markCardForReview(deck.cards[currentCardIndex].id);
      setStudyStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      nextCard();
    } catch (err) {
      console.error('Error marking card:', err);
    }
  };

  const skipCard = () => {
    setStudyStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    nextCard();
  };

  const restartStudy = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode('normal');
    setStudyStats({ correct: 0, incorrect: 0, skipped: 0 });
  };

  if (loading) {
    return (
      <Container className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !deck) {
    return (
      <Container className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
              Lỗi tải deck
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-6">
              {error || 'Deck không tồn tại hoặc đã bị xóa.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBackToDeck} variant="secondary">
                Xem deck
              </Button>
              <Button onClick={handleBackToDecks} variant="primary">
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (deck.cards.length === 0) {
  return (
    <Container className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
              Deck trống
            </h2>
            <p className="text-yellow-600 dark:text-yellow-300 mb-6">
              Deck này chưa có thẻ nào. Hãy thêm thẻ để bắt đầu học!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBackToDeck} variant="secondary">
                Xem deck
              </Button>
              <Button onClick={handleBackToDecks} variant="primary">
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (studyMode === 'completed') {
    const totalCards = deck.cards.length;
    const accuracy = totalCards > 0 ? Math.round((studyStats.correct / totalCards) * 100) : 0;
    
    return (
      <Container className="min-h-screen py-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Hoàn thành học tập!
        </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Bạn đã hoàn thành deck "{deck.title}"
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {studyStats.correct}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Đúng
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {studyStats.incorrect}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Sai
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {studyStats.skipped}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Bỏ qua
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-8">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Độ chính xác: {accuracy}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={restartStudy} variant="primary">
                Học lại
              </Button>
              <Button onClick={handleBackToDeck} variant="secondary">
                Xem deck
              </Button>
              <Button onClick={handleBackToDecks} variant="secondary">
                Danh sách
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const currentCard = deck.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / deck.cards.length) * 100;

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Container size="4xl" padding="sm">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToDeck}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Quay lại</span>
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentCardIndex + 1} / {deck.cards.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
            {deck.title}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                Thẻ {currentCardIndex + 1}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
              {currentCard.question}
            </h2>
            
            {currentCard.questionImage && (
              <div className="mb-8">
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
                className="px-8 py-4 text-lg"
              >
                Xem đáp án
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Đáp án:
                  </h3>
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
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Giải thích:
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentCard.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={markCardCorrect}
                    variant="success"
                    className="px-6 py-3"
                  >
                    ✅ Đúng
                  </Button>
                  <Button 
                    onClick={markCardIncorrect}
                    variant="danger"
                    className="px-6 py-3"
                  >
                    ❌ Sai
                  </Button>
                  <Button 
                    onClick={skipCard}
                    variant="secondary"
                    className="px-6 py-3"
                  >
                    ⏭️ Bỏ qua
                  </Button>
                </div>
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
      </Container>
    </div>
  );
}

