import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/student/PageHeader';
import ExamGrid from '../../components/student/ExamGrid';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';
import { classService } from '../../services/classService';

const PAGE_SIZE = 6;

export default function StudentExams() {
  const navigate = useNavigate();
  const [rawExams, setRawExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionState, setActionState] = useState({});

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load enrolled classes first
      const classes = await classService.getMyClasses();
      const classesArray = Array.isArray(classes) ? classes : (classes?.classes || classes?.data || []);
      
      if (classesArray.length === 0) {
        setRawExams([]);
        return;
      }
      
      // Collect all exam IDs from enrolled classes
      const examIds = new Set();
      classesArray.forEach((cls) => {
        const exams = cls.exams || [];
        exams.forEach((examIdItem) => {
          // Normalize exam ID
          const examId = typeof examIdItem === 'string' 
            ? examIdItem 
            : (examIdItem?._id || examIdItem?.id || String(examIdItem));
          
          if (examId && examId !== 'undefined' && examId !== 'null') {
            examIds.add(examId);
          }
        });
      });
      
      if (examIds.size === 0) {
        setRawExams([]);
        return;
      }
      
      // Load exam details for each exam ID
      const examPromises = Array.from(examIds).map(async (examId) => {
        try {
          const examData = await examService.getStudentExamById(examId);
          const exam = examData?.exam || examData;
          
          // Debug: log exam data to check available fields
          if (process.env.NODE_ENV === 'development') {
            console.log('Exam data for', examId, ':', {
              time_limit: exam?.time_limit,
              timeLimit: exam?.timeLimit,
              duration: exam?.duration,
              date: exam?.date,
              scheduled_at: exam?.scheduled_at,
              scheduledAt: exam?.scheduledAt,
              startTime: exam?.startTime,
              createdAt: exam?.createdAt,
              created_at: exam?.created_at
            });
          }
          
          // Get submission for this exam to include submission data
          let submission = null;
          try {
            const submissions = await submissionService.getMySubmissions();
            const examSubmissions = Array.isArray(submissions) 
              ? submissions 
              : (submissions?.submissions || submissions?.data || []);
            
            submission = examSubmissions.find(
              (s) => {
                const sExamId = s.exam_id?._id || s.exam_id?.id || s.exam_id;
                return sExamId === examId;
              }
            );
          } catch (subErr) {
            console.warn('Could not load submission for exam:', examId, subErr);
          }
          
          // Attach submission to exam object
          if (submission) {
            exam.activeSubmission = submission;
            exam.submission = submission;
            if (!Array.isArray(exam.submissions)) {
              exam.submissions = [submission];
            }
          }
          
          return exam;
        } catch (err) {
          console.warn('Could not load exam:', examId, err);
          return null;
        }
      });
      
      const examResults = await Promise.all(examPromises);
      const validExams = examResults.filter(exam => exam !== null);
      
      setRawExams(validExams);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Không thể tải danh sách kỳ thi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const normalizedExams = useMemo(() => {
    return rawExams.map((exam) => {
      const id = exam._id || exam.id;
      const submission =
        exam.activeSubmission || exam.submission || (Array.isArray(exam.submissions) ? exam.submissions[0] : null);
      const submissionStatus = (submission?.status || '').toLowerCase();
      const baseStatus = (exam.status || submission?.status || (exam.isPublic ? 'scheduled' : 'draft') || '').toLowerCase();
      const canContinue = ['in-progress', 'pending', 'started'].includes(submissionStatus);
      const canReview = ['completed', 'submitted', 'graded'].includes(submissionStatus);
      const score =
        submission?.score ?? submission?.result?.score ?? submission?.summary?.score ?? submission?.finalScore ?? null;
      const maxScore = submission?.result?.maxScore ?? submission?.maxScore ?? null;

      // Normalize duration - try multiple field names
      const duration = exam.time_limit || 
                      exam.timeLimit || 
                      exam.duration || 
                      exam.durationMinutes || 
                      exam.time_limit_minutes ||
                      exam.timeLimitMinutes ||
                      (typeof exam.time_limit === 'number' ? exam.time_limit : null) ||
                      60;

      // Normalize date - try multiple field names
      const date = exam.date || 
                   exam.scheduled_at || 
                   exam.scheduledAt ||
                   exam.startTime || 
                   exam.start_time ||
                   exam.start_at ||
                   exam.created_at ||
                   exam.createdAt ||
                   submission?.started_at ||
                   submission?.startedAt ||
                   submission?.created_at ||
                   submission?.createdAt ||
                   null;

      return {
        id,
        title: exam.title || 'Chưa đặt tên',
        subject: exam.subject || 'General',
        duration: duration,
        date: date,
        description: exam.description,
        status: canContinue ? 'in-progress' : canReview ? submissionStatus || baseStatus : baseStatus,
        progress: submission?.progress ?? submission?.percentage ?? null,
        score: score != null && maxScore != null ? `${score}/${maxScore}` : score,
        canContinue,
        canReview,
        disabled: canReview && !canContinue
      };
    });
  }, [rawExams]);

  const subjects = useMemo(() => ['all', ...new Set(normalizedExams.map((exam) => exam.subject || 'General'))], [
    normalizedExams
  ]);

  const statusOptions = useMemo(
    () => ['all', ...new Set(normalizedExams.map((exam) => exam.status || 'scheduled'))],
    [normalizedExams]
  );

  const filteredExams = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return normalizedExams.filter((exam) => {
      const matchesKeyword =
        !keyword ||
        exam.title.toLowerCase().includes(keyword) ||
        (exam.subject || '').toLowerCase().includes(keyword) ||
        (exam.description || '').toLowerCase().includes(keyword);
      const matchesSubject = subject === 'all' || exam.subject === subject;
      const matchesStatus = statusFilter === 'all' || (exam.status || '').toLowerCase() === statusFilter;
      return matchesKeyword && matchesSubject && matchesStatus;
    });
  }, [normalizedExams, search, subject, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filteredExams.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, subject, statusFilter]);

  const handleStartExam = useCallback(
    async (examId) => {
      if (!examId) return;
      try {
        setActionState({ id: examId, type: 'start' });
        setError(''); // Clear previous errors
        
        // Optional: Validate exam before starting (non-blocking)
        // If validation fails, we'll still try to start and let backend validate
        try {
          const examData = await examService.getStudentExamById(examId);
          const exam = examData?.exam || examData;
          const flashcards = exam?.flashcards || exam?.questions || [];
          
          if (Array.isArray(flashcards) && flashcards.length > 0) {
            // Check if all questions have required fields for multiple choice
            const incompleteQuestions = flashcards.filter((question) => {
              // Check if question has options and correctOption
              const hasOptions = question?.options && typeof question.options === 'object' && Object.keys(question.options).length > 0;
              const hasCorrectOption = question?.correctOption && 
                typeof question.correctOption === 'string' &&
                ['A', 'B', 'C', 'D'].includes(question.correctOption.toUpperCase().trim());
              
              // Questions without options/correctOption are incomplete for exams
              return !hasOptions || !hasCorrectOption;
            });
            
            if (incompleteQuestions.length > 0) {
              const questionCount = incompleteQuestions.length;
              const totalCount = flashcards.length;
              throw new Error(
                `Kỳ thi này chứa ${questionCount}/${totalCount} câu hỏi chưa hoàn chỉnh (thiếu đáp án hoặc lựa chọn). ` +
                `Vui lòng liên hệ giáo viên để được hỗ trợ.`
              );
            }
          }
        } catch (validationError) {
          // If validation error is about incomplete questions, throw it
          if (validationError.message && validationError.message.includes('chưa hoàn chỉnh')) {
            throw validationError;
          }
          // Otherwise, log and continue (backend will validate)
          console.warn('Exam validation warning (non-blocking):', validationError);
        }
        
        // Start the exam
        const res = await submissionService.startExam(examId);
        const submissionId = res?.submission?._id || res?.submissionId || res?._id;
        if (submissionId) {
          navigate(`/dashboard/student/exams/${submissionId}`);
        } else {
          throw new Error('Không xác định được bài làm');
        }
      } catch (e) {
        console.error('Error starting exam:', e);
        
        // Parse error message to provide more helpful feedback
        // Check multiple possible error message locations
        let errorMessage = e.message || 
                          e.data?.message || 
                          e.response?.data?.message || 
                          e.error?.message ||
                          'Không thể bắt đầu kỳ thi';
        
        // Also check error.data for nested messages
        if (!errorMessage || errorMessage === 'Không thể bắt đầu kỳ thi') {
          if (e.data && typeof e.data === 'object') {
            errorMessage = e.data.message || e.data.error || errorMessage;
          }
        }
        
        // Check for specific error patterns from backend
        const errorStr = String(errorMessage).toLowerCase();
        
        if (errorStr.includes('missing options') || 
            errorStr.includes('correctoption') || 
            errorStr.includes('missing options or correctoption') ||
            errorStr.includes('is missing options') ||
            errorStr.includes('chưa hoàn chỉnh') ||
            errorStr.includes('thiếu đáp án') ||
            errorStr.includes('thiếu lựa chọn') ||
            (errorStr.includes('question') && errorStr.includes('missing'))) {
          errorMessage = 'Kỳ thi này chứa câu hỏi chưa hoàn chỉnh (thiếu đáp án hoặc lựa chọn). Vui lòng liên hệ giáo viên để được hỗ trợ.';
        } else if (errorStr.includes('404') || errorStr.includes('not found') || errorStr.includes('không tìm thấy')) {
          errorMessage = 'Không tìm thấy kỳ thi này. Vui lòng thử lại.';
        } else if (errorStr.includes('permission') || errorStr.includes('unauthorized') || errorStr.includes('quyền') || errorStr.includes('forbidden')) {
          errorMessage = 'Bạn không có quyền truy cập kỳ thi này.';
        } else if (errorStr.includes('already started') || errorStr.includes('already exists') || errorStr.includes('đã bắt đầu')) {
          errorMessage = 'Bạn đã bắt đầu kỳ thi này. Vui lòng tiếp tục bài làm của bạn.';
        } else if (errorStr.includes('question') && (errorStr.includes('invalid') || errorStr.includes('error'))) {
          errorMessage = 'Kỳ thi này chứa câu hỏi không hợp lệ. Vui lòng liên hệ giáo viên để được hỗ trợ.';
        }
        
        setError(errorMessage);
      } finally {
        setActionState({});
      }
    },
    [navigate]
  );

  const handleContinueExam = useCallback(
    async (examId) => {
      if (!examId) return;
      try {
        setActionState({ id: examId, type: 'continue' });
        const submission = await submissionService.getSubmissionByExam(examId);
        const submissionId = submission?._id || submission?.submissionId || submission?.submission?._id;
        if (submissionId) {
          navigate(`/dashboard/student/exams/${submissionId}`);
        } else {
          throw new Error('Chưa có bài nộp cho kỳ thi này');
        }
      } catch (e) {
        console.error(e);
        setError(e.message || 'Không thể mở lại kỳ thi');
      } finally {
        setActionState({});
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Kỳ thi"
          subtitle="Các bài kiểm tra từ các lớp học bạn đã tham gia"
          actions={
            <button
              onClick={loadExams}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-300 dark:hover:bg-orange-900/30"
            >
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </button>
          }
        />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-orange-900/50 dark:bg-gray-800 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên kỳ thi hoặc môn học"
                className="w-full rounded-xl border border-orange-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 transition-shadow focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-orange-500/40 dark:bg-gray-700 dark:text-white dark:focus:border-orange-400"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm dark:border-orange-500/40 dark:bg-gray-700">
                <Filter className="h-4 w-4 text-orange-400" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-transparent text-gray-700 focus:outline-none dark:text-gray-200"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'Tất cả môn học' : s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm dark:border-orange-500/40 dark:bg-gray-700">
                <Filter className="h-4 w-4 text-orange-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-gray-700 focus:outline-none dark:text-gray-200"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'Mọi trạng thái' : s.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <ExamGrid
          exams={pageItems}
          loading={loading}
          onStart={handleStartExam}
          onContinue={handleContinueExam}
          actionState={actionState}
          emptyTitle="Không tìm thấy kỳ thi phù hợp"
          emptyMessage="Hãy thử thay đổi từ khoá hoặc bộ lọc để thấy thêm lựa chọn."
        />

        {!loading && filteredExams.length > PAGE_SIZE && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span className="font-semibold text-orange-600 dark:text-orange-400">{startIndex + 1}</span> - <span className="font-semibold text-orange-600 dark:text-orange-400">{Math.min(startIndex + PAGE_SIZE, filteredExams.length)}</span> trong tổng số <span className="font-semibold text-orange-600 dark:text-orange-400">{filteredExams.length}</span> kỳ thi
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= safePage - 1 && page <= safePage + 1);
                  
                  if (!showPage) {
                    // Show ellipsis
                    if (page === safePage - 2 || page === safePage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                        page === safePage
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                          : 'border border-orange-200 bg-white text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


