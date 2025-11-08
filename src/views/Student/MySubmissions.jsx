import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import PageHeader from '../../components/student/PageHeader';
import SubmissionList from '../../components/student/SubmissionList';
import { submissionService } from '../../services/submissionService';

export default function MySubmissions() {
  const navigate = useNavigate();
  const [rawSubmissions, setRawSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await submissionService.getMySubmissions();
      const list = Array.isArray(res?.submissions) ? res.submissions : Array.isArray(res) ? res : [];
      setRawSubmissions(list);
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

  const submissions = useMemo(() => {
    return rawSubmissions.map((submission) => {
      const id = submission._id || submission.id;
      const startedAt = submission.started_at || submission.startedAt || submission.createdAt;
      const submittedAt = submission.submitted_at || submission.submittedAt || submission.completed_at;
      const score =
        submission.score ?? submission.finalScore ?? submission.result?.score ?? submission.summary?.score ?? null;
      const maxScore = submission.maxScore ?? submission.result?.maxScore ?? submission.summary?.maxScore ?? null;
      return {
        id,
        title: submission.exam?.title || 'Kỳ thi',
        status: submission.status,
        startedAt,
        submittedAt,
        score,
        maxScore
      };
    });
  }, [rawSubmissions]);

  const handleViewSubmission = useCallback(
    (submissionId) => {
      if (!submissionId) return;
      navigate(`/dashboard/student/exams/${submissionId}`);
    },
    [navigate]
  );

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-4 dark:from-gray-900 dark:to-gray-800 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Bài nộp của tôi"
          subtitle="Theo dõi các kỳ thi đã tham gia và xem lại kết quả chi tiết"
          actions={
            <button
              onClick={loadSubmissions}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-blue-500/40 dark:bg-gray-800 dark:text-blue-200 dark:hover:bg-blue-900/30"
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

        <SubmissionList items={submissions} loading={loading} onView={handleViewSubmission} />
      </div>
    </div>
  );
}


