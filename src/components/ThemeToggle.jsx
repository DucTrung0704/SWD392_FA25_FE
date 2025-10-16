import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button
      aria-label="Toggle theme"
      className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {/* Toggle Circle */}
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-300 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
        isDark ? 'translate-x-6' : 'translate-x-0'
      }`}>
        {/* Sun/Moon Icon */}
        <span className={`text-xs transition-all duration-300 ${
          isDark ? 'text-gray-600' : 'text-yellow-500'
        }`}>
          {isDark ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <span className={`text-xs transition-opacity duration-300 ${
          isDark ? 'opacity-30' : 'opacity-100'
        }`}>
          ☀️
        </span>
        <span className={`text-xs transition-opacity duration-300 ${
          isDark ? 'opacity-100' : 'opacity-30'
        }`}>
          🌙
        </span>
      </div>
    </button>
  );
}


