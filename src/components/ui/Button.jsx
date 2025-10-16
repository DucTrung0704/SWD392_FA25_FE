import React from 'react';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-100 focus:ring-gray-400 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700',
    ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-100 dark:hover:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600 dark:bg-green-500 dark:hover:bg-green-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-500 dark:hover:bg-red-600',
  };
  const cls = `${base} ${variants[variant] || variants.primary} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}


