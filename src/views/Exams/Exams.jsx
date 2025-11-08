import React, { useEffect, useState } from 'react';
import { examService } from '../../services/examService';
import { Link } from 'react-router-dom';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    examService.listExams().then(data => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  // Filter exams based on category and search term
  const filteredExams = exams.filter(exam => {
    const matchesCategory = filter === 'all' || exam.category === filter;
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get unique categories
  const categories = ['all', ...new Set(exams.map(exam => exam.category).filter(Boolean))];

  // Mock exam statistics
  const examStats = {
    totalExams: exams.length,
    completed: exams.filter(e => e.status === 'completed').length,
    averageScore: 78,
    timeSpent: '15h 30m'
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2 sm:mb-4">
            Practice Exams
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Test your knowledge with our comprehensive exam collection
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{examStats.totalExams}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Exams</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{examStats.completed}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{examStats.averageScore}%</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg. Score</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{examStats.timeSpent}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exams by title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400 text-sm sm:text-base">🔍</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                    filter === category
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 h-56 sm:h-64"></div>
              </div>
            ))}
          </div>
        )}

        {/* Exams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExams.map((exam, index) => (
            <div 
              key={exam.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              {/* Exam Status Badge */}
              <div className="absolute -top-2 -right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  exam.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : exam.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {exam.status === 'completed' ? 'Completed' : exam.status === 'in-progress' ? 'In Progress' : 'New'}
                </span>
              </div>

              {/* Exam Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                <span className="text-xl sm:text-2xl text-white">📝</span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {exam.title}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                {exam.description || 'Comprehensive practice exam to test your knowledge'}
              </p>
              
              {/* Exam Details */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{exam.durationMinutes} min</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{exam.questions?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{exam.subject || 'General'}</span>
                </div>
                {exam.difficulty && (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      exam.difficulty === 'hard' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : exam.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {exam.difficulty}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                {exam.status === 'completed' ? (
                  <>
                    <Link
                      to={`/exams/${exam.id}/review`}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 sm:px-4 rounded-xl text-center font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Review
                    </Link>
                    <Link
                      to={`/exams/${exam.id}/retake`}
                      className="flex-1 bg-orange-600 text-white py-2 px-3 sm:px-4 rounded-xl text-center font-medium hover:bg-orange-700 transition-colors duration-200 text-sm sm:text-base"
                    >
                      Retake
                    </Link>
                  </>
                ) : exam.status === 'in-progress' ? (
                  <Link
                    to={`/exams/${exam.id}/continue`}
                    className="flex-1 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-xl text-center font-medium hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
                  >
                    Continue
                  </Link>
                ) : (
                  <Link
                    to={`/exams/${exam.id}/start`}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 px-3 sm:px-4 rounded-xl text-center font-medium hover:from-orange-700 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    Start Exam
                  </Link>
                )}
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredExams.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🔍</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No exams found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No exams available in this category'}
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Exam Preparation Tips</h3>
              <p className="text-orange-100 max-w-2xl text-sm sm:text-base">
                Practice regularly, review your mistakes, and simulate exam conditions for better performance.
              </p>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">25%</div>
                <div className="text-orange-100 text-xs sm:text-sm">Better Recall</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">40%</div>
                <div className="text-orange-100 text-xs sm:text-sm">Less Anxiety</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}