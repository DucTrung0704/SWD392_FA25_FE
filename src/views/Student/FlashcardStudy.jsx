import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import Button from '../../components/ui/Button';
import { XCircle, CheckCircle, NotebookText, ArrowLeft, ArrowRight, Shuffle, ListOrdered, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function StudentFlashcardStudy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath = '/dashboard/student/library';
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [originalCards, setOriginalCards] = useState([]); // Store original order
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
      const deckData = await flashcardService.getDeckById(id);
      const flashcards = await flashcardService.getFlashcardsByDeckId(id);
      const normalizedDeck = {
        id: deckData._id || deckData.id,
        title: deckData.title,
      };
      setDeck(normalizedDeck);

      let deckCards = (flashcards || []).map(fc => ({
        id: fc._id || fc.id,
        question: fc.question,
        answer: fc.answer,
        explanation: fc.explanation || fc.note,
        questionImage: fc.questionImage || null,
        answerImage: fc.answerImage || null,
      }));
      // Store original order for sequential mode
      setOriginalCards([...deckCards]);
      // Apply study mode
      if (studyMode === 'random') {
        deckCards = [...deckCards].sort(() => Math.random() - 0.5);
      }
      setCards(deckCards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error loading deck:', error);
      setError('Không thể tải bộ thẻ. Vui lòng thử lại.');
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
      navigate(backPath, {
        state: {
          message: `Bạn đã hoàn thành bộ thẻ ${deck?.title}!`,
          cardsStudied: cards.length,
        },
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

  const handleKnow = () => {
    handleNext();
  };

  const handleDontKnow = () => {
    handleNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải bộ thẻ...</p>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy bộ thẻ</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Bộ thẻ bạn tìm không tồn tại.'}</p>
          <Button onClick={() => navigate(backPath)} className="bg-orange-600 hover:bg-orange-700 text-white">
            Quay lại thư viện
          </Button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {deck?.title || 'Bộ thẻ'}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(backPath)}
              className="border-gray-300 dark:border-gray-600"
            >
              Quay lại
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <NotebookText className="w-10 h-10 text-gray-500 dark:text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chưa có flashcard nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Bộ thẻ này chưa có thẻ nào để học. Vui lòng quay lại thư viện và chọn bộ khác.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-gray-300 dark:border-gray-600"
              >
                Quay lại
              </Button>
              <Button
                onClick={() => navigate(backPath)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Xem tất cả bộ thẻ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không có thẻ</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Bộ thẻ này không có thẻ nào để học.</p>
          <Button onClick={() => navigate(backPath)} className="bg-orange-600 hover:bg-orange-700 text-white">
            Quay lại thư viện
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Đang học: {deck.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Thẻ {currentCardIndex + 1} / {cards.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(`/dashboard/student/flashcard-exam/${id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Tạo bài thi thử
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(backPath)}
              className="border-gray-300 dark:border-gray-600 inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Thoát học
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Tiến độ</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div
            className={`relative w-full max-w-2xl mx-auto h-96 cursor-pointer perspective-1000 ${
              isFlipped ? '[transform:rotateY(180deg)]' : ''
            } transition-transform duration-500`}
            onClick={handleFlip}
          >
            <div
              className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 p-8 flex items-center justify-center backface-hidden ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">CÂU HỎI</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentCard.question || 'Câu hỏi dạng hình ảnh'}
                </h2>
                {currentCard.questionImage && (
                  <img src={currentCard.questionImage} alt="Câu hỏi" className="max-h-52 mx-auto rounded-lg" />
                )}
                <p className="text-gray-600 dark:text-gray-400">Nhấp để xem đáp án</p>
              </div>
            </div>

            <div
              className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-orange-200 dark:border-orange-800 p-8 flex items-center justify-center backface-hidden [transform:rotateY(180deg)] ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-center">
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-4">ĐÁP ÁN</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {currentCard.answer || 'Đáp án dạng hình ảnh'}
                </h2>
                {currentCard.answerImage && (
                  <img src={currentCard.answerImage} alt="Câu trả lời" className="max-h-52 mx-auto rounded-lg" />
                )}
                {currentCard.explanation && (
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    {currentCard.explanation}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nhấp để xem lại câu hỏi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Trước
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDontKnow}
              className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 inline-flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cần ôn thêm
            </Button>
            <Button
              onClick={handleKnow}
              className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Đã thuộc
            </Button>
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
          >
            {currentCardIndex === cards.length - 1 ? (
              'Hoàn thành'
            ) : (
              <>
                Tiếp theo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => {
                setStudyMode('sequential');
                // Restore original order
                if (originalCards.length > 0) {
                  setCards([...originalCards]);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                studyMode === 'sequential'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              Tuần tự
            </button>
            <button
              onClick={() => {
                setStudyMode('random');
                // Shuffle cards when switching to random mode
                const shuffled = originalCards.length > 0 
                  ? [...originalCards].sort(() => Math.random() - 0.5)
                  : [...cards].sort(() => Math.random() - 0.5);
                setCards(shuffled);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                studyMode === 'random'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Ngẫu nhiên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


