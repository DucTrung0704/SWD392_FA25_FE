import React from 'react';
import { CalendarDays, Clock, BookOpen, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ExamCard({
  exam,
  onStart,
  onContinue,
  actionState = {},
  disabled = false
}) {
  if (!exam) return null;

  const {
    id,
    title,
    subject,
    duration,
    date,
    description,
    status,
    progress,
    score,
    canContinue,
    canReview
  } = exam;

  const isStarting = actionState.type === 'start' && actionState.id === id;
  const isContinuing = actionState.type === 'continue' && actionState.id === id;
  const isDisabled = disabled || isStarting || isContinuing;

  return (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{subject || 'General'}</span>
            </div>
          </div>
          <StatusBadge status={status} label={status?.replace('-', ' ') || 'Scheduled'} />
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-orange-500" />
            <span>{date ? new Date(date).toLocaleString() : 'Chưa có thời gian'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>{duration ? `${duration} phút` : 'Không giới hạn thời gian'}</span>
          </div>
          {description && <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>

        {(progress != null || score != null) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-900/40">
            {progress != null && (
              <span className="font-medium text-orange-600 dark:text-orange-300">Tiến độ: {progress}%</span>
            )}
            {score != null && (
              <span className="font-medium text-green-600 dark:text-green-300">Điểm: {score}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {canReview && (
          <button
            onClick={() => onContinue?.(id, 'review')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Xem lại
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {canContinue && (
          <button
            onClick={() => onContinue?.(id, 'resume')}
            disabled={isDisabled}
            className={`inline-flex items-center gap-2 rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-500/60 dark:text-orange-300 dark:hover:bg-orange-900/30 ${
              isContinuing ? 'pl-3 pr-3' : ''
            }`}
          >
            {isContinuing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                Đang mở
              </span>
            ) : (
              <>
                Tiếp tục
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
        {!canReview && !canContinue && (
          <button
            onClick={() => onStart?.(id)}
            disabled={isDisabled}
            className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${
              isStarting ? 'pl-3 pr-3' : ''
            }`}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang khởi tạo
              </span>
            ) : (
              <>
                Bắt đầu ngay
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

