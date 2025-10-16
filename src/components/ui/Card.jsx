import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm border-gray-200 dark:border-gray-700 transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}


