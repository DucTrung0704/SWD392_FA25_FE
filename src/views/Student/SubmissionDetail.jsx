import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Save, Send, ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import StatusBadge from '../../components/student/StatusBadge';

export default function SubmissionDetail() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  const isNavigatingRef = useRef(false);
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState(0); // in minutes
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Load submission and exam data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const subData = await submissionService.getSubmission(submissionId);
        setSubmission(subData);

        // Load exam data - exam là nguồn chính của questions
        const examId = subData?.exam_id?._id || subData?.exam_id?.id || subData?.exam_id;
        console.log('Exam ID from submission:', examId);
        console.log('Submission data:', subData);
        
        if (examId) {
          try {
            // Fetch exam details - sử dụng API student
            const examData = await examService.getStudentExamById(examId);
            const examObj = examData?.exam || examData;
            console.log('Exam object loaded (student API):', examObj);
            
            setExam(examObj);
            
            // Lấy questions từ exam - kiểm tra nhiều field names có thể
            let questionIds = examObj?.questions || 
                             examObj?.question_ids || 
                             examObj?.questionIds ||
                             examData?.questions ||
                             [];
            
            console.log('=== DEBUG QUESTIONS ===');
            console.log('examObj:', examObj);
            console.log('examObj.questions:', examObj?.questions);
            console.log('examObj.question_ids:', examObj?.question_ids);
            console.log('examObj.questionIds:', examObj?.questionIds);
            console.log('examData.questions:', examData?.questions);
            console.log('Question IDs from exam:', questionIds);
            console.log('Submission generatedoptions:', subData?.generatedoptions);
            console.log('Submission exam_id.questions:', subData?.exam_id?.questions);
            console.log('========================');
            
            // Nếu questions là array rỗng hoặc không tồn tại, thử các nguồn khác
            if (!Array.isArray(questionIds) || questionIds.length === 0) {
              // Thử từ submission.generatedoptions (backend có thể lưu ở đây khi start exam)
              if (subData?.generatedoptions && Array.isArray(subData.generatedoptions) && subData.generatedoptions.length > 0) {
                questionIds = subData.generatedoptions;
                console.log('Using questions from submission.generatedoptions:', questionIds);
              }
              // Thử từ exam_id trong submission
              else if (subData?.exam_id?.questions && Array.isArray(subData.exam_id.questions)) {
                questionIds = subData.exam_id.questions;
                console.log('Using questions from submission.exam_id.questions:', questionIds);
              }
              // Thử từ exam_id.question_ids
              else if (subData?.exam_id?.question_ids && Array.isArray(subData.exam_id.question_ids)) {
                questionIds = subData.exam_id.question_ids;
                console.log('Using questions from submission.exam_id.question_ids:', questionIds);
              }
            }
            
            // Nếu vẫn có question IDs, fetch chi tiết
            if (Array.isArray(questionIds) && questionIds.length > 0) {
              const firstItem = questionIds[0];
              
              // Kiểm tra xem là IDs (string/ObjectId) hay đã là full objects
              const isIdArray = typeof firstItem === 'string' || 
                               (firstItem?._id && !firstItem?.question && !firstItem?.content);
              
              if (isIdArray) {
                // Questions là IDs, cần fetch chi tiết
                console.log('Fetching question details from IDs...');
                try {
                  const questionPromises = questionIds.map((qId) => {
                    const id = typeof qId === 'string' ? qId : (qId?._id || qId?.id);
                    return questionService.getQuestionById(id).catch((err) => {
                      console.warn(`Failed to fetch question ${id}:`, err);
                      return null;
                    });
                  });
                  
                  const questionResults = await Promise.all(questionPromises);
                  const fetchedQuestions = questionResults
                    .map((res) => res?.question || res?.data?.question || res)
                    .filter((q) => q != null && (q.question || q.content));
                  
                  console.log('Fetched questions:', fetchedQuestions.length, fetchedQuestions);
                  setQuestions(fetchedQuestions);
                } catch (e) {
                  console.error('Error fetching question details:', e);
                  setQuestions([]);
                }
              } else {
                // Questions đã là full objects
                console.log('Questions are already full objects:', questionIds);
                setQuestions(questionIds.filter((q) => q && (q.question || q.content)));
              }
            } else {
              console.warn('No questions found in exam or submission');
              setQuestions([]);
            }
          } catch (e) {
            console.error('Could not load exam details:', e);
            // Fallback: dùng exam data từ submission nếu có
            if (subData?.exam_id) {
              setExam(subData.exam_id);
              
              // Thử lấy questions từ submission
              if (subData?.generatedoptions && Array.isArray(subData.generatedoptions)) {
                console.log('Fallback: using generatedoptions');
                setQuestions(subData.generatedoptions);
              } else if (subData?.exam_id?.questions) {
                const qIds = Array.isArray(subData.exam_id.questions) ? subData.exam_id.questions : [];
                console.log('Fallback: trying to fetch from exam_id.questions:', qIds);
                
                if (qIds.length > 0) {
                  try {
                    const questionPromises = qIds.map((qId) => {
                      const id = typeof qId === 'string' ? qId : (qId?._id || qId?.id);
                      return questionService.getQuestionById(id).catch(() => null);
                    });
                    const questionResults = await Promise.all(questionPromises);
                    const qList = questionResults
                      .map((res) => res?.question || res?.data?.question || res)
                      .filter((q) => q != null);
                    setQuestions(qList);
                  } catch (err) {
                    console.error('Fallback fetch failed:', err);
                    setQuestions([]);
                  }
                } else {
                  setQuestions([]);
                }
              } else {
                setQuestions([]);
              }
            } else {
              setQuestions([]);
            }
          }
        } else {
          console.error('No exam ID found in submission');
          setQuestions([]);
        }

        // Initialize answers from submission
        const existingAnswers = subData?.answers || [];
        const answerMap = {};
        if (Array.isArray(existingAnswers)) {
          existingAnswers.forEach((ans) => {
            if (ans?.question_id || ans?.flashcard_id) {
              const qId = ans.question_id || ans.flashcard_id;
              answerMap[qId] = ans.selected_option || ans.answer || '';
            }
          });
        }
        setAnswers(answerMap);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Không thể tải dữ liệu bài thi');
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId]);

  // Handle finish exam
  const handleFinishExam = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    
    const confirmMessage = autoSubmit
      ? 'Hết thời gian! Bài thi sẽ được nộp tự động.'
      : 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn không thể chỉnh sửa.';
    
    if (!autoSubmit && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submissionService.finishExam(submissionId);
      
      // Reload submission to get updated status
      const updated = await submissionService.getSubmission(submissionId);
      setSubmission(updated);
      
      if (!autoSubmit) {
        alert('Nộp bài thành công!');
        // Optionally navigate to results page
        // navigate(`/dashboard/student/submissions`);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [submissionId, submitting]);

  // Calculate time remaining and time spent
  useEffect(() => {
    if (!submission || !exam) return;

    const timeLimit = exam.time_limit || exam.duration || 90; // minutes
    const startedAt = submission.started_at ? new Date(submission.started_at) : new Date();
    const endTime = new Date(startedAt.getTime() + timeLimit * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
      
      // Calculate time spent
      if (submission.status === 'in_progress') {
        const spent = Math.floor((now - startedAt) / 1000 / 60); // minutes
        setTimeSpent(spent);
      } else if (submission.time_spent) {
        // Use time_spent from backend if available
        setTimeSpent(submission.time_spent);
      } else if (submission.submitted_at) {
        // Calculate from submitted_at if time_spent not available
        const submittedAt = new Date(submission.submitted_at);
        const spent = Math.floor((submittedAt - startedAt) / 1000 / 60);
        setTimeSpent(spent);
      }
      
      if (remaining === 0 && submission.status === 'in_progress') {
        // Auto submit when time runs out
        handleFinishExam(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [submission, exam, handleFinishExam]);

  // Create a wrapped navigate function that checks exam status
  const safeNavigate = useCallback((to, options) => {
    const inProgress = submission?.status === 'in_progress' || submission?.status === 'started';
    if (inProgress) {
      setShowWarningModal(true);
      return;
    }
    navigate(to, options);
  }, [navigate, submission?.status]);

  // Warning when trying to leave page during exam
  useEffect(() => {
    // Check if exam is in progress
    const inProgress = submission?.status === 'in_progress' || submission?.status === 'started';
    if (!inProgress) return;

    // Warning when closing tab/window
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Vui lòng hoàn thành bài thi trước khi rời khỏi trang này.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Intercept all link clicks (including sidebar, navigation, React Router Links, etc.)
    const handleClick = (e) => {
      // Check for <a> tags
      const linkTarget = e.target.closest('a');
      if (linkTarget && linkTarget.href) {
        // Check if it's an internal link (same origin)
        try {
          const url = new URL(linkTarget.href);
          const currentUrl = new URL(window.location.href);
          
          // Only intercept if it's navigating to a different page
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            setShowWarningModal(true);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        } catch (err) {
          // Invalid URL, ignore
        }
      }
      
      // Check for React Router Link components (they have data attributes or specific classes)
      // Also check for buttons/divs that might trigger navigation
      const clickableElement = e.target.closest('[role="link"], [data-link], button[type="button"]');
      if (clickableElement && clickableElement !== e.target) {
        // Check if this element is inside a navigation area (sidebar, nav, etc.)
        const isInNav = clickableElement.closest('nav, [role="navigation"], aside, header');
        if (isInNav && (clickableElement.getAttribute('href') || clickableElement.onclick)) {
          // This might be a navigation element - block it
          setShowWarningModal(true);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Handle browser back/forward button
    const handlePopState = (e) => {
      setShowWarningModal(true);
      // Push state back to prevent navigation
      window.history.pushState(null, '', location.pathname);
    };

    // Push state to detect back button
    window.history.pushState(null, '', location.pathname);
    
    // Add event listeners
    document.addEventListener('click', handleClick, true); // Use capture phase
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
    };
  }, [submission?.status, location.pathname]);

  // Auto-save answers
  const saveAnswer = useCallback(async (questionId, answer) => {
    if (!submissionId || !questionId) return;
    
    try {
      await submissionService.submitAnswer(submissionId, {
        question_id: questionId,
        selected_option: answer
      });
    } catch (e) {
      console.error('Failed to save answer:', e);
    }
  }, [submissionId]);

  // Update answer with debounce
  const updateAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Set new timer for auto-save
    const timer = setTimeout(() => {
      saveAnswer(questionId, value);
    }, 1000);
    setAutoSaveTimer(timer);
  }, [saveAnswer, autoSaveTimer]);

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
    e.stopPropagation(); // Prevent navigation when clicking bookmark
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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Navigation</h3>
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
                    title="Click to remove bookmark"
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
            <span className="text-gray-600 dark:text-gray-400">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-4 w-4 rounded bg-gray-200 dark:bg-gray-700">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-yellow-400"></div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">Book Marked</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click number to navigate. Double-click or right-click to bookmark.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCompleted = submission?.status === 'completed' || submission?.status === 'submitted' || submission?.status === 'graded';
  const isInProgress = submission?.status === 'in_progress' || submission?.status === 'started';

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

  if (error && !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lỗi</h2>
          </div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/dashboard/student/exams')}
            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Quay lại danh sách
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
            {isInProgress && timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Time remaining</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            {!isInProgress && (
              <div className="flex items-center gap-3">
                <StatusBadge status={submission?.status} />
                <button
                  onClick={() => safeNavigate('/dashboard/student/exams')}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại danh sách
                </button>
              </div>
            )}
            
            {/* Submit button - Right */}
            {isInProgress && questions.length > 0 && (
              <button
                onClick={handleFinishExam}
                disabled={submitting}
                className="bg-[#2D543D] hover:bg-[#1e3a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
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
        {isCompleted && (
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Điểm số</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission?.score ?? submission?.result?.score ?? '-'}
              </div>
          </div>
          <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Đúng</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {submission?.correct_answers ?? submission?.result?.correct_answers ?? '-'}
              </div>
          </div>
          <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tổng câu</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission?.total_questions ?? exam?.total_questions ?? questions.length ?? '-'}
              </div>
          </div>
          <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Thời gian</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {timeSpent > 0 
                  ? `${timeSpent} phút` 
                  : submission?.time_spent 
                    ? `${Math.floor(submission.time_spent)} phút`
                    : '-'}
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
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentQuestion.question || currentQuestion.content || 'Nội dung câu hỏi'}
                </h2>
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
              ) : (
                <textarea
                  value={answers[currentQuestion._id || currentQuestion.id] || ''}
                  onChange={(e) => updateAnswer(currentQuestion._id || currentQuestion.id, e.target.value)}
                  placeholder="Nhập câu trả lời của bạn..."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2D543D] focus:outline-none focus:ring-2 focus:ring-[#2D543D]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              )}
            </div>

            {/* Right Column - Question Grid */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <QuestionGrid />
              </div>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Đã hoàn thành</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Bạn đã nộp bài thi này.</p>
            <button
              onClick={() => navigate('/dashboard/student/exams')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2D543D] hover:bg-[#1e3a2a] px-6 py-2 text-sm font-medium text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách bài thi
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-600 dark:text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Không có câu hỏi nào trong bài thi này</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Bài thi này chưa có câu hỏi được gán. Vui lòng liên hệ giáo viên để thêm câu hỏi vào bài thi.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-lg bg-gray-100 p-4 text-left text-xs dark:bg-gray-800">
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Debug Info:</p>
                <p className="text-gray-600 dark:text-gray-400">Exam ID: {exam?._id || exam?.id || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">Questions count: {questions.length}</p>
                <p className="text-gray-600 dark:text-gray-400">Check console for detailed logs</p>
              </div>
            )}
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
                Vui lòng nộp bài thi trước khi rời khỏi trang này. Hãy nhấn nút <strong className="text-gray-900 dark:text-white">"Submit"</strong> ở góc trên bên phải để hoàn thành bài thi.
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
      </div>
    </div>
  );
}
