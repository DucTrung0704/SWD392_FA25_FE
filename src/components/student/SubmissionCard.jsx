import React from 'react';
import { ArrowRight, Award, Clock, CalendarCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SubmissionCard({ submission, onView }) {
  if (!submission) return null;

  const {
    id,
    title,
    status,
    startedAt,
    submittedAt,
    score,
    maxScore
  } = submission;

  const formattedScore = score != null ? `${score}${maxScore ? ` / ${maxScore}` : ''}` : null;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {startedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Bắt đầu: {new Date(startedAt).toLocaleString()}</span>
            </div>
          )}
          {submittedAt && (
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-green-500" />
              <span>Nộp bài: {new Date(submittedAt).toLocaleString()}</span>
            </div>
          )}
          {formattedScore && (
            <div className="flex items-center gap-2 font-semibold text-green-600 dark:text-green-300">
              <Award className="h-4 w-4" />
              <span>Điểm: {formattedScore}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onView?.(id)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

