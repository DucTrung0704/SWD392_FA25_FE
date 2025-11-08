import React from 'react';
import { Box, RefreshCcw } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Box,
  title = 'Không có dữ liệu',
  message = 'Hãy thử điều chỉnh tiêu chí lọc hoặc thử lại sau.',
  actionLabel,
  onAction,
  secondaryAction
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center dark:border-gray-700 dark:bg-gray-800/40">
      <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">{message}</p>
      {(actionLabel || secondaryAction) && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {actionLabel}
            </button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

