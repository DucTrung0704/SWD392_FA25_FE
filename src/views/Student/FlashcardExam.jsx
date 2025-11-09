import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, Bookmark } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';
import { submissionService } from '../../services/submissionService';

export default function FlashcardExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0); // in minutes
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [startTime] = useState(new Date());
  const timeLimit = 60; // 60 minutes default

  // Load deck and convert flashcards to questions, or load saved result
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        
        // If submissionId exists, load saved result
        if (submissionId) {
          try {
            const submission = await submissionService.getSubmission(submissionId);
            if (submission && submission.deck_id === id) {
              // Load saved result
              setResults({
                score: submission.score || 0,
                correctAnswers: submission.correct_answers || 0,
                totalQuestions: submission.total_questions || 0,
                timeSpent: submission.time_spent || 0,
                questionResults: submission.question_results || submission.questionResults || [],
              });
              setIsCompleted(true);
              setTimeSpent(submission.time_spent || 0);
              
              // Load deck info
              const deckData = await flashcardService.getDeckById(id);
              setDeck({
                id: deckData._id || deckData.id,
                title: deckData.title || submission.deck_title,
              });
              
              // Load questions for display
              const flashcards = await flashcardService.getFlashcardsByDeckId(id);
              const convertedQuestions = (flashcards || []).map((fc, index) => {
                const cardId = fc._id || fc.id;
                const question = fc.question;
                const correctAnswer = fc.answer;
                
                const wrongAnswers = flashcards
                  .filter((f, i) => i !== index)
                  .slice(0, 3)
                  .map(f => f.answer);
                
                const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
                const options = {};
                ['A', 'B', 'C', 'D'].forEach((key, idx) => {
                  if (allOptions[idx]) {
                    options[key] = allOptions[idx];
                  }
                });
                
                const correctOption = Object.keys(options).find(key => options[key] === correctAnswer) || 'A';
                
                return {
                  id: cardId,
                  _id: cardId,
                  question: question,
                  content: question,
                  options: options,
                  correctAnswer: correctOption,
                  explanation: fc.explanation || fc.note,
                  questionImage: fc.questionImage || null,
                  answerImage: fc.answerImage || null,
                };
              });
              setQuestions(convertedQuestions);
              
              // Load saved answers
              if (submission.answers) {
                const answerMap = {};
                if (Array.isArray(submission.answers)) {
                  submission.answers.forEach((ans) => {
                    if (ans.question_id || ans.flashcard_id) {
                      const qId = ans.question_id || ans.flashcard_id;
                      answerMap[qId] = ans.selected_option || ans.answer || '';
                    }
                  });
                } else if (typeof submission.answers === 'object') {
                  Object.assign(answerMap, submission.answers);
                }
                setAnswers(answerMap);
              }
              
              setLoading(false);
              return;
            }
          } catch (loadError) {
            console.error('Failed to load submission:', loadError);
            // Continue to load deck normally
          }
        }
        
        // Normal load: Load deck and convert flashcards to questions
        const deckData = await flashcardService.getDeckById(id);
        const flashcards = await flashcardService.getFlashcardsByDeckId(id);
        
        setDeck({
          id: deckData._id || deckData.id,
          title: deckData.title,
        });

        // Convert flashcards to questions
        // Each flashcard becomes a question with the answer as the correct option
        const convertedQuestions = (flashcards || []).map((fc, index) => {
          const cardId = fc._id || fc.id;
          const question = fc.question;
          const correctAnswer = fc.answer;
          
          // Generate wrong answers from other flashcards
          const wrongAnswers = flashcards
            .filter((f, i) => i !== index)
            .slice(0, 3)
            .map(f => f.answer);
          
          // Shuffle options
          const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
          const options = {};
          ['A', 'B', 'C', 'D'].forEach((key, idx) => {
            if (allOptions[idx]) {
              options[key] = allOptions[idx];
            }
          });
          
          // Find correct option key
          const correctOption = Object.keys(options).find(key => options[key] === correctAnswer) || 'A';
          
          return {
            id: cardId,
            _id: cardId,
            question: question,
            content: question,
            options: options,
            correctAnswer: correctOption,
            explanation: fc.explanation || fc.note,
            questionImage: fc.questionImage || null,
            answerImage: fc.answerImage || null,
          };
        });
        
        setQuestions(convertedQuestions);
        setAnswers({});
      } catch (e) {
        console.error(e);
        setError(e.message || 'Không thể tải bộ thẻ');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, submissionId]);

  // Timer
  useEffect(() => {
    if (isCompleted || !questions.length) return;
    
    const endTime = new Date(startTime.getTime() + timeLimit * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      const spent = Math.floor((now - startTime) / 1000 / 60);
      setTimeSpent(spent);
      
      if (remaining === 0 && !isCompleted) {
        handleSubmit(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, timeLimit, isCompleted, questions.length]);

  // Warning when trying to leave page
  useEffect(() => {
    if (isCompleted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Vui lòng hoàn thành bài thi trước khi rời khỏi trang này.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleClick = (e) => {
      const linkTarget = e.target.closest('a');
      if (linkTarget && linkTarget.href) {
        try {
          const url = new URL(linkTarget.href);
          const currentUrl = new URL(window.location.href);
          
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            setShowWarningModal(true);
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        } catch (err) {
          // Invalid URL, ignore
        }
      }
    };

    const handlePopState = (e) => {
      setShowWarningModal(true);
      window.history.pushState(null, '', location.pathname);
    };

    window.history.pushState(null, '', location.pathname);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isCompleted, location.pathname]);

  // Update answer
  const updateAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours} : ${minutes.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes} : ${secs.toString().padStart(2, '0')}`;
  };

  // Toggle bookmark
  const toggleBookmark = useCallback((questionIndex, e) => {
    if (e) e.stopPropagation();
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  }, []);

  // Actual submit function
  const submitExam = useCallback(async (autoSubmit = false) => {
    if (submitting || isCompleted) return;

    try {
      setSubmitting(true);
      setError('');
      
      // Calculate results
      let correctCount = 0;
      const questionResults = questions.map((q) => {
        const userAnswer = answers[q.id] || '';
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correctCount++;
        
        return {
          questionId: q.id,
          question: q.question,
          userAnswer: userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: isCorrect,
          explanation: q.explanation,
        };
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      
      // Save result to backend
      try {
        await submissionService.saveFlashcardExamResult(id, {
          score: score,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          timeSpent: timeSpent,
          answers: answers,
          questionResults: questionResults,
          deckTitle: deck?.title,
        });
      } catch (saveError) {
        console.error('Failed to save flashcard exam result:', saveError);
        // Continue even if save fails - show result anyway
      }
      
      setResults({
        score: score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeSpent: timeSpent,
        questionResults: questionResults,
      });
      
      setIsCompleted(true);
      
      if (!autoSubmit) {
        setSuccessMessage(`Nộp bài thành công! Điểm số: ${score}/100`);
        setShowSuccessModal(true);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, isCompleted, questions, answers, timeSpent, id, deck]);

  // Submit exam handler
  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || isCompleted) return;
    
    if (!autoSubmit) {
      // Show confirm modal
      setConfirmCallback(() => () => submitExam(autoSubmit));
      setShowConfirmModal(true);
      return;
    }
    
    // Auto submit
    submitExam(autoSubmit);
  }, [submitting, isCompleted, submitExam]);

  // Question Grid Component
  const QuestionGrid = () => {
    const totalQuestions = questions.length;

    const getQuestionStatus = (index) => {
      const question = questions[index];
      if (!question) return null;
      
      const qId = question._id || question.id;
      const isAnswered = answers[qId] && answers[qId] !== '';
      const isBookmarked = bookmarkedQuestions.has(index);
      const isCurrent = index === currentQuestionIndex;
      
      return { isAnswered, isBookmarked, isCurrent };
    };

    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Điều hướng câu hỏi</h3>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const { isAnswered, isBookmarked, isCurrent } = getQuestionStatus(index);
            const questionNumber = index + 1;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                onDoubleClick={(e) => toggleBookmark(index, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleBookmark(index, e);
                }}
                className={`
                  relative h-12 w-full rounded-lg text-sm font-semibold transition-all
                  ${isCurrent 
                    ? 'ring-2 ring-[#2D543D] ring-offset-2 bg-[#2D543D] text-white' 
                    : isAnswered
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                {String(questionNumber).padStart(2, '0')}
                
                {/* Bookmark flag */}
                {isBookmarked && (
                  <div 
                    className="absolute top-0 right-0 cursor-pointer"
                    onClick={(e) => toggleBookmark(index, e)}
                    title="Nhấp để bỏ đánh dấu"
                  >
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-yellow-400"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Đã trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Chưa trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-4 w-4 rounded bg-gray-200 dark:bg-gray-700">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-yellow-400"></div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">Đã đánh dấu</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nhấp số để điều hướng. Nhấp đôi hoặc nhấp chuột phải để đánh dấu.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (error && !deck) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lỗi</h2>
          </div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/dashboard/student/library')}
            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Time remaining - Left */}
            {!isCompleted && timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Thời gian còn lại</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard/student/library')}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại thư viện
                </button>
              </div>
            )}
            
            {/* Submit button - Right */}
            {!isCompleted && questions.length > 0 && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-[#2D543D] hover:bg-[#1e3a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Summary Stats - Only show when completed */}
        {isCompleted && results && (
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Điểm số</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.score}/100
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Đúng</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {results.correctAnswers}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tổng câu</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.totalQuestions}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Thời gian</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.timeSpent} phút
              </div>
            </div>
          </div>
        )}

        {/* Main Content - 2 Column Layout */}
        {questions.length > 0 && currentQuestion && !isCompleted ? (
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Question Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentQuestion.question || currentQuestion.content || 'Nội dung câu hỏi'}
                </h2>
                {currentQuestion.questionImage && (
                  <img 
                    src={currentQuestion.questionImage} 
                    alt="Câu hỏi" 
                    className="mt-4 max-w-full h-auto rounded-lg"
                  />
                )}
                {currentQuestion.explanation && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{currentQuestion.explanation}</p>
                )}
              </div>

              {/* Answer Options */}
              {currentQuestion.options && Object.keys(currentQuestion.options).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([key, value]) => {
                    const qId = currentQuestion._id || currentQuestion.id;
                    const isSelected = answers[qId] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateAnswer(qId, key)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#2D543D] bg-[#2D543D]/5'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white">{key}.</span>
                          <span className="text-gray-900 dark:text-white">{value}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Right Column - Question Grid */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <QuestionGrid />
              </div>
            </div>
          </div>
        ) : isCompleted && results ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">Đã hoàn thành</h3>
              <p className="mb-6 text-center text-gray-600 dark:text-gray-400">Bạn đã hoàn thành bài thi thử từ bộ thẻ "{deck?.title}"</p>
            </div>
            
            {/* Results Details */}
            <div className="mb-6 space-y-4">
              {results.questionResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-2 p-4 ${
                    result.isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Câu {index + 1}: {result.question}
                    </span>
                    {result.isCorrect ? (
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        Đúng
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        Sai
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Đáp án của bạn:</span> {result.userAnswer || 'Chưa trả lời'}
                    </p>
                    {!result.isCorrect && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Đáp án đúng:</span> {result.correctAnswer}
                      </p>
                    )}
                    {result.explanation && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Giải thích:</span> {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard/student/library')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2D543D] hover:bg-[#1e3a2a] px-6 py-2 text-sm font-medium text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại thư viện
              </button>
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setResults(null);
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setTimeSpent(0);
                  setBookmarkedQuestions(new Set());
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm font-medium text-white transition-colors"
              >
                Làm lại
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-600 dark:text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Không có câu hỏi nào</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Bộ thẻ này chưa có flashcard nào để tạo bài thi.
            </p>
            <button
              onClick={() => navigate('/dashboard/student/library')}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 px-6 py-2 text-sm font-medium text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại thư viện
            </button>
          </div>
        )}

        {/* Warning Modal */}
        {showWarningModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowWarningModal(false)}
          >
            <div 
              className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all dark:border-gray-700 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Không thể rời khỏi trang
                </h3>
              </div>
              
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Vui lòng nộp bài thi trước khi rời khỏi trang này. Hãy nhấn nút <strong className="text-gray-900 dark:text-white">"Nộp bài"</strong> ở góc trên bên phải để hoàn thành bài thi.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="rounded-lg bg-[#2D543D] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a2a] focus:outline-none focus:ring-2 focus:ring-[#2D543D] focus:ring-offset-2"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          >
            <div 
              className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all dark:border-gray-700 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Xác nhận nộp bài
                </h3>
              </div>
              
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể chỉnh sửa.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmCallback(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (confirmCallback) {
                      confirmCallback();
                    }
                    setConfirmCallback(null);
                  }}
                  className="rounded-lg bg-[#2D543D] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a2a] focus:outline-none focus:ring-2 focus:ring-[#2D543D] focus:ring-offset-2"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <div 
              className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all dark:border-gray-700 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Thành công
                </h3>
              </div>
              
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {successMessage}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-lg bg-[#2D543D] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a2a] focus:outline-none focus:ring-2 focus:ring-[#2D543D] focus:ring-offset-2"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

