import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/student/PageHeader';
import SubmissionList from '../../components/student/SubmissionList';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';

export default function MySubmissions() {
  const navigate = useNavigate();
  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [examTitles, setExamTitles] = useState({}); // Cache exam titles by examId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await submissionService.getMySubmissions();
      const list = Array.isArray(res?.submissions) ? res.submissions : Array.isArray(res) ? res : [];
      setRawSubmissions(list);
      
      // Load exam titles for submissions that don't have exam title
      const examIdsToLoad = new Set();
      list.forEach((submission) => {
        const examId = submission.exam_id?._id || submission.exam_id?.id || submission.exam_id;
        const hasTitle = submission.exam?.title || submission.exam_title || submission.examTitle;
        
        if (examId && !hasTitle) {
          examIdsToLoad.add(examId);
        }
      });
      
      // Load exam titles in parallel
      if (examIdsToLoad.size > 0) {
        const titlePromises = Array.from(examIdsToLoad).map(async (examId) => {
          try {
            const examData = await examService.getStudentExamById(examId);
            const exam = examData?.exam || examData;
            return { examId, title: exam?.title || 'Kỳ thi' };
          } catch (err) {
            console.error(`Failed to load exam ${examId}:`, err);
            return { examId, title: 'Kỳ thi' };
          }
        });
        
        const titles = await Promise.all(titlePromises);
        const titleMap = {};
        titles.forEach(({ examId, title }) => {
          titleMap[examId] = title;
        });
        setExamTitles(titleMap);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const allSubmissions = useMemo(() => {
    return rawSubmissions
      .filter((submission) => {
        // Filter out flashcard exams - only show regular exam submissions
        const isFlashcardExam = submission.deck_id || submission.deckId || submission.flashcard_exam;
        return !isFlashcardExam;
      })
      .map((submission) => {
      const id = submission._id || submission.id;
      const startedAt = submission.started_at || submission.startedAt || submission.createdAt;
      const submittedAt = submission.submitted_at || submission.submittedAt || submission.completed_at;
      const score =
        submission.score ?? submission.finalScore ?? submission.result?.score ?? submission.summary?.score ?? null;
        const maxScore = submission.maxScore ?? submission.result?.maxScore ?? submission.summary?.maxScore ?? 100;
        
        // Get exam title from multiple sources
        const examId = submission.exam_id?._id || submission.exam_id?.id || submission.exam_id;
        let title = 
          submission.exam?.title || 
          submission.exam_title || 
          submission.examTitle ||
          submission.exam_id?.title ||
          (examId && examTitles[examId]) ||
          'Kỳ thi';
        
      return {
        id,
          title,
          status: submission.status || 'completed',
        startedAt,
        submittedAt,
        score,
          maxScore,
      };
    });
  }, [rawSubmissions, examTitles]);

  // Pagination calculations
  const totalPages = Math.ceil(allSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const submissions = allSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when submissions change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);


  const handleViewSubmission = useCallback(
    (submissionId) => {
      if (!submissionId) return;
      // Only navigate to regular exam submission detail (flashcard exams are filtered out)
      navigate(`/dashboard/student/exams/${submissionId}`);
    },
    [navigate]
  );

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Bài nộp của tôi"
          subtitle="Theo dõi các kỳ thi đã tham gia và xem lại kết quả chi tiết"
          actions={
            <button
              onClick={loadSubmissions}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
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

        <SubmissionList 
          items={submissions} 
          loading={loading} 
          onView={handleViewSubmission} 
        />

        {/* Pagination */}
        {!loading && allSubmissions.length > itemsPerPage && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị <span className="font-semibold text-orange-600 dark:text-orange-400">{startIndex + 1}</span> - <span className="font-semibold text-orange-600 dark:text-orange-400">{Math.min(endIndex, allSubmissions.length)}</span> trong tổng số <span className="font-semibold text-orange-600 dark:text-orange-400">{allSubmissions.length}</span> bài nộp
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
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
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  if (!showPage) {
                    // Show ellipsis
                    if (page === currentPage - 2 || page === currentPage + 2) {
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
                        page === currentPage
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
                disabled={currentPage === totalPages}
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


