import React from 'react';

const colorByRole = {
  Admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Teacher: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function RoleBadge({ role }) {
  const cls = colorByRole[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{role}</span>;
}


