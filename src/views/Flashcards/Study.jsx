import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import Button from '../../components/ui/Button';

export default function Study() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState('sequential');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeck();
  }, [id]);

  const loadDeck = async () => {
    try {
      setLoading(true);
      setError('');
      const deckData = await flashcardService.getDeck(id);
      setDeck(deckData);
      
      // Shuffle cards if random mode
      let deckCards = [...deckData.cards];
      if (studyMode === 'random') {
        deckCards = deckCards.sort(() => Math.random() - 0.5);
      }
      
      setCards(deckCards);
    } catch (error) {
      console.error('Error loading deck:', error);
      setError('Deck not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Completed deck
      navigate('/flashcards', { 
        state: { 
          message: `Completed studying ${deck?.title}!`,
          cardsStudied: cards.length 
        }
      });
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = async () => {
    if (currentCard) {
      try {
        await flashcardService.markCardAsKnown(currentCard.id);
      } catch (error) {
        console.error('Error marking card as known:', error);
      }
    }
    handleNext();
  };

  const handleDontKnow = async () => {
    if (currentCard) {
      try {
        await flashcardService.markCardForReview(currentCard.id);
      } catch (error) {
        console.error('Error marking card for review:', error);
      }
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Deck not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The deck you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/flashcards')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Decks
          </Button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No cards in deck</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This deck doesn't have any cards to study.</p>
          <Button onClick={() => navigate('/flashcards')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Back to Decks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Studying: {deck.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/flashcards')}
            className="border-gray-300 dark:border-gray-600"
          >
            Exit Study
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div
            className={`relative w-full max-w-2xl mx-auto h-96 cursor-pointer perspective-1000 ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            } transition-transform duration-500`}
            onClick={handleFlip}
          >
            {/* Front of Card */}
            <div className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 p-8 flex items-center justify-center backface-hidden ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">QUESTION</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentCard.question || 'Image question'}
                </h2>
                {currentCard.questionImage && (
                  <img src={currentCard.questionImage} alt="question" className="max-h-52 mx-auto rounded-lg" />
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  Click to reveal answer
                </p>
              </div>
            </div>

            {/* Back of Card */}
            <div className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-800 p-8 flex items-center justify-center backface-hidden [transform:rotateY(180deg)] ${
              isFlipped ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-center">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-4">ANSWER</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentCard.answer || 'Image answer'}
                </h2>
                {currentCard.answerImage && (
                  <img src={currentCard.answerImage} alt="answer" className="max-h-52 mx-auto rounded-lg" />
                )}
                {currentCard.explanation && (
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    {currentCard.explanation}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click to see question again
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-2"
          >
            ← Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDontKnow}
              className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              ❌ Need Review
            </Button>
            <Button
              onClick={handleKnow}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ✅ I Know This
            </Button>
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentCardIndex === cards.length - 1 ? 'Complete' : 'Next →'}
          </Button>
        </div>

        {/* Study Mode Selector */}
        <div className="mt-8 text-center">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[
              { value: 'sequential', label: 'Sequential', icon: '🔢' },
              { value: 'random', label: 'Random', icon: '🎲' }
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setStudyMode(mode.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  studyMode === mode.value
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
