import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';

export default function Study() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Study Mode
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Choose your study method
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/flashcards"
            className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="flashcards" className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Flashcards</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Study with traditional flashcards</p>
          </Link>

          <Link
            to="/study/simple"
            className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="study" className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Simple Study</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quick and easy study mode</p>
          </Link>

          <Link
            to="/exams"
            className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Icon name="exams" className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Practice Exams</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Test your knowledge with exams</p>
          </Link>
        </div>
      </div>
    </div>
  );
}


