import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';

export default function SubmissionDetail() {
  const { submissionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await submissionService.getSubmission(submissionId);
        setData(res);
      } catch (e) {
        setError(e.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading submission...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || data?.result || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Submission Detail</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{summary.score ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{summary.correct_answers ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{summary.total_questions ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{data?.status ?? '-'}</div>
          </div>
        </div>
        <pre className="mt-4 text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-xl overflow-auto">
{JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}


