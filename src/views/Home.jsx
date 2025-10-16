import React from 'react';
import { Link } from 'react-router-dom';
import { flashcardService } from '../services/flashcardService';
import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashcardService.getFeatured().then(data => {
      setFeatured(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Container size="6xl" padding="sm">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Flashcard Master
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Học tập thông minh với các bộ thẻ flashcard được thiết kế chuyên nghiệp
          </p>
        </div>

        {/* Featured Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Nổi bật
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Khám phá các bộ thẻ được đề xuất hàng đầu
            </p>
          </div>
          <Link 
            to="/flashcards" 
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 h-40 sm:h-48"></div>
              </div>
            ))}
          </div>
        )}

        {/* Flashcard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((deck, index) => (
            <div 
              key={deck.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium Badge */}
              {deck.premium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PREMIUM
                </div>
              )}
              
              {/* Deck Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="text-white font-bold text-lg">📚</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {deck.title}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {deck.description || 'Bộ thẻ học tập chất lượng cao'}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {deck.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {deck.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{deck.tags.length - 3}
                  </span>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    {deck.cardCount} thẻ
                  </span>
                  <span className="flex items-center">
                    👥 {deck.followers || 0}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deck.difficulty === 'advanced' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : deck.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {deck.difficulty || 'beginner'}
                </span>
              </div>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/flashcards" 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🎴</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Bộ Thẻ
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Khám phá tất cả bộ thẻ flashcard có sẵn
            </p>
          </Link>
          
          <Link 
            to="/exams" 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Bài Kiểm Tra
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thử thách bản thân với các bài kiểm tra
            </p>
          </Link>
          
          <Link 
            to="/profile" 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Hồ Sơ
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý tài khoản và theo dõi tiến độ
            </p>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-blue-100">Bộ Thẻ</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-100">Người Dùng</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-100">Hiệu Quả</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-blue-100">Học Tập</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}