import React from 'react';

const STATUS_STYLES = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  'in-progress': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  graded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800/70 dark:text-gray-300',
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200'
};

export default function StatusBadge({ status, label, className = '' }) {
  const normalized = (status || '').toLowerCase();
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.default;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${style} ${className}`.trim()}
    >
      {label || normalized || 'unknown'}
    </span>
  );
}

