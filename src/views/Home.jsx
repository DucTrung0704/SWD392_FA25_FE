import React from 'react';
import { Link } from 'react-router-dom';
import { flashcardService } from '../services/flashcardService';
import { useEffect, useState } from 'react';
import { BookOpen, Target, Users } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashcardService.getFeatured()
      .then(data => {
        // Ensure data is an array
        const featuredData = Array.isArray(data) ? data : (data?.decks || data?.data || []);
        setFeatured(featuredData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading featured flashcards:', error);
        setFeatured([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            Toán Học Flashcard
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
            className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Xem tất cả
          </Link>
        </div>

       
        

        {/* Quick Actions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/flashcards" 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
          >
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-7 h-7 text-white" />
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
              <Target className="w-7 h-7 text-white" />
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
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
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
        <div className="mt-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-orange-100">Bộ Thẻ</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-orange-100">Người Dùng</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-orange-100">Hiệu Quả</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-orange-100">Học Tập</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}