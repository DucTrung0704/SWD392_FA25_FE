import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCcw } from 'lucide-react';
import PageHeader from '../../components/student/PageHeader';
import ExamGrid from '../../components/student/ExamGrid';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';

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
      const list = await examService.listStudentExams();
      const arr = Array.isArray(list?.exams) ? list.exams : Array.isArray(list) ? list : [];
      setRawExams(arr);
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

      return {
        id,
        title: exam.title || 'Chưa đặt tên',
        subject: exam.subject || 'General',
        duration: exam.time_limit || exam.duration || exam.durationMinutes || 60,
        date: exam.date || exam.scheduled_at || exam.startTime || submission?.started_at || exam.createdAt,
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
        const res = await submissionService.startExam(examId);
        const submissionId = res?.submission?._id || res?.submissionId || res?._id;
        if (submissionId) {
          navigate(`/dashboard/student/exams/${submissionId}`);
        } else {
          throw new Error('Không xác định được bài làm');
        }
      } catch (e) {
        console.error(e);
        setError(e.message || 'Không thể bắt đầu kỳ thi');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 py-4 dark:from-gray-900 dark:to-gray-800 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Kỳ thi"
          subtitle="Bắt đầu luyện tập và theo dõi tiến trình của bạn"
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

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên kỳ thi hoặc môn học"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 transition-shadow focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-orange-400"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
                <Filter className="h-4 w-4 text-gray-400" />
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
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
                <Filter className="h-4 w-4 text-gray-400" />
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

        {filteredExams.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300 sm:flex-row">
            <div>
              Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span>
              {' - '}
              <span className="font-semibold text-gray-900 dark:text-white">{Math.min(startIndex + PAGE_SIZE, filteredExams.length)}</span>
              {' trong '}
              <span className="font-semibold text-gray-900 dark:text-white">{filteredExams.length}</span> kỳ thi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  safePage === 1
                    ? 'cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Trước
              </button>
              <span>
                Trang <span className="font-semibold text-gray-900 dark:text-white">{safePage}</span> /{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  safePage === totalPages
                    ? 'cursor-not-allowed border-gray-200 text-gray-400 dark:border-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


