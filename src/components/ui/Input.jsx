import React from 'react';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`block text-sm ${className}`}>
      {label && (
        <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-md border px-3 py-2 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
          error 
            ? 'border-red-500 focus:ring-red-500 dark:border-red-400' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}


