import React from 'react';
import { ArrowRight, Award, Clock, CalendarCheck, BookOpen } from 'lucide-react';
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
    maxScore,
    isFlashcardExam
  } = submission;

  const formattedScore = score != null ? `${score}${maxScore ? ` / ${maxScore}` : ''}` : null;

  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl dark:border-orange-900/50 dark:from-gray-800 dark:to-orange-950/20 dark:hover:border-orange-800">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isFlashcardExam && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <BookOpen className="h-3 w-3" />
                  Bài thi thử
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{title}</h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-2.5 text-sm">
          {startedAt && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bắt đầu</div>
                <div className="font-medium">{new Date(startedAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          )}
          {submittedAt && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CalendarCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Nộp bài</div>
                <div className="font-medium">{new Date(submittedAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          )}
          {formattedScore && (
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-3 dark:from-orange-900/20 dark:to-amber-900/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Điểm số</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{formattedScore}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onView?.(id)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:scale-105 active:scale-95"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

