import React from 'react';

export default function LoadingPlaceholder({ count = 6, className = '' }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-4 h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-1 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-1 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-6 flex gap-3">
            <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

