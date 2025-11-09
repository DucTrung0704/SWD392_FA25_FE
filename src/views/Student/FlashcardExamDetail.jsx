import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, BookOpen } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import { flashcardService } from '../../services/flashcardService';

export default function FlashcardExamDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissionDetail();
  }, [submissionId]);

  const loadSubmissionDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load submission
      const subData = await submissionService.getSubmission(submissionId);
      setSubmission(subData);
      
      // Load deck info
      const deckId = subData.deck_id || subData.deckId;
      if (deckId) {
        const deckData = await flashcardService.getDeckById(deckId);
        setDeck({
          id: deckData._id || deckData.id,
          title: deckData.title || subData.deck_title,
        });
        
        // Load flashcards to reconstruct questions
        const flashcards = await flashcardService.getFlashcardsByDeckId(deckId);
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
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Không thể tải chi tiết bài thi');
    } finally {
      setLoading(false);
    }
  };

  // Get user answer for a question
  const getUserAnswer = (questionId) => {
    if (!submission || !submission.answers) return null;
    
    if (Array.isArray(submission.answers)) {
      const answer = submission.answers.find(
        ans => (ans.question_id || ans.flashcard_id) === questionId
      );
      return answer?.selected_option || answer?.answer || null;
    } else if (typeof submission.answers === 'object') {
      return submission.answers[questionId] || null;
    }
    return null;
  };

  // Get question result
  const getQuestionResult = (questionId) => {
    if (!submission || !submission.question_results) return null;
    
    const results = Array.isArray(submission.question_results) 
      ? submission.question_results 
      : submission.questionResults || [];
    
    return results.find(r => r.questionId === questionId || r.question_id === questionId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải chi tiết bài thi...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lỗi</h2>
          </div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error || 'Không tìm thấy bài thi'}</p>
          <button
            onClick={() => navigate('/dashboard/student/submissions')}
            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const score = submission.score || 0;
  const correctAnswers = submission.correct_answers || submission.correctAnswers || 0;
  const totalQuestions = submission.total_questions || submission.totalQuestions || questions.length;
  const timeSpent = submission.time_spent || submission.timeSpent || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/student/submissions')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Bài thi thử</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {deck?.title || submission.deck_title || 'Chi tiết bài thi'}
              </h1>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Điểm số</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {score}/100
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Đúng</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {correctAnswers}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tổng câu</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalQuestions}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Thời gian</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {timeSpent} phút
            </div>
          </div>
        </div>

        {/* Questions Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Chi tiết từng câu hỏi
          </h2>
          
          {questions.length > 0 ? (
            questions.map((question, index) => {
              const userAnswer = getUserAnswer(question.id);
              const questionResult = getQuestionResult(question.id);
              const isCorrect = questionResult?.isCorrect || (userAnswer === question.correctAnswer);
              
              return (
                <div
                  key={question.id}
                  className={`rounded-lg border-2 p-6 ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Câu {index + 1}
                      </span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                          <CheckCircle className="h-3 w-3" />
                          Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                          <XCircle className="h-3 w-3" />
                          Sai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {question.question || question.content}
                    </h3>
                    {question.questionImage && (
                      <img 
                        src={question.questionImage} 
                        alt="Câu hỏi" 
                        className="mt-2 max-w-full h-auto rounded-lg"
                      />
                    )}
                  </div>

                  {/* Options */}
                  {question.options && Object.keys(question.options).length > 0 && (
                    <div className="mb-4 space-y-2">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isUserAnswer = userAnswer === key;
                        const isCorrectAnswer = question.correctAnswer === key;
                        
                        return (
                          <div
                            key={key}
                            className={`rounded-lg border-2 p-3 ${
                              isCorrectAnswer
                                ? 'border-green-500 bg-green-100 dark:border-green-600 dark:bg-green-900/30'
                                : isUserAnswer && !isCorrectAnswer
                                ? 'border-red-500 bg-red-100 dark:border-red-600 dark:bg-red-900/30'
                                : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${
                                isCorrectAnswer
                                  ? 'text-green-700 dark:text-green-300'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {key}.
                              </span>
                              <span className={`${
                                isCorrectAnswer
                                  ? 'text-green-700 dark:text-green-300 font-medium'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {value}
                              </span>
                              {isCorrectAnswer && (
                                <CheckCircle className="ml-auto h-5 w-5 text-green-600 dark:text-green-400" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="ml-auto h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* User Answer vs Correct Answer */}
                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Đáp án của bạn:
                      </div>
                      <div className={`font-semibold ${
                        isCorrect 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {userAnswer || 'Chưa trả lời'}
                      </div>
                    </div>
                    {!isCorrect && (
                      <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Đáp án đúng:
                        </div>
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Giải thích:
                      </div>
                      <p className="text-blue-800 dark:text-blue-200">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-gray-600 dark:text-gray-400">
                Không có câu hỏi nào trong bài thi này.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard/student/submissions')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
          {deck?.id && (
            <button
              onClick={() => navigate(`/dashboard/student/flashcard-exam/${deck.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4" />
              Làm lại bài thi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

