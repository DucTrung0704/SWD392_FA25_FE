import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBadge from '../../components/RoleBadge';
import Icon from '../../components/ui/Icon';
import { flashcardService } from '../../services/flashcardService';
import { examService } from '../../services/examService';
import { api } from '../../services/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherStats, setTeacherStats] = useState({
    activeClasses: 0,
    flashcardsCreated: 0,
    examsScheduled: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [recentFlashcards, setRecentFlashcards] = useState([]);

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
    return `${Math.floor(seconds / 2592000)} tháng trước`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN', { 
        day: 'numeric',
        month: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load flashcards
        const decks = await flashcardService.getAllDecks();
        const totalFlashcards = decks.reduce((sum, deck) => sum + (deck.flashcards?.length || 0), 0);
        const publicDecks = decks.filter(deck => deck.isPublic === true || deck.status === 'active');
        
        // Load exams
        const examsRes = await examService.listMyExams();
        const examsList = Array.isArray(examsRes?.exams) ? examsRes.exams : (Array.isArray(examsRes) ? examsRes : []);
        const scheduledExams = examsList.filter(exam => exam.status === 'scheduled' || exam.status === 'draft');
        
        // Load classes
        let classes = [];
        try {
          const classesRes = await api.get('/class/teacher/my-classes');
          const classesArray = Array.isArray(classesRes) ? classesRes : (classesRes.classes || []);
          classes = classesArray;
        } catch (classError) {
          console.error('Error loading classes:', classError);
        }

        // Calculate stats
        const activeClasses = classes.filter(cls => cls.isActive !== false).length;

        setTeacherStats({
          activeClasses,
          flashcardsCreated: decks.length,
          examsScheduled: scheduledExams.length
        });

        // Recent activities - combine recent exams and flashcards
        const activities = [];
        
        // Add recent exams (last 5, sorted by date)
        const recentExamsSorted = [...examsList]
          .sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || a.date || 0);
            const dateB = new Date(b.created_at || b.createdAt || b.date || 0);
            return dateB - dateA;
          })
          .slice(0, 3)
          .map(exam => ({
            id: exam._id || exam.id,
            type: 'exams',
            title: exam.title || 'Bài thi không có tiêu đề',
            time: getTimeAgo(exam.created_at || exam.createdAt || exam.date),
            status: exam.status === 'completed' ? 'completed' : exam.status === 'scheduled' ? 'completed' : 'pending'
          }));
        
        // Add recent flashcards (last 5, sorted by date)
        const recentDecksSorted = [...decks]
          .sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || 0);
            const dateB = new Date(b.created_at || b.createdAt || 0);
            return dateB - dateA;
          })
          .slice(0, 2)
          .map(deck => ({
            id: deck._id || deck.id,
            type: 'flashcards',
            title: deck.title || 'Bộ thẻ không có tiêu đề',
            time: getTimeAgo(deck.created_at || deck.createdAt),
            status: 'completed'
          }));

        activities.push(...recentExamsSorted, ...recentDecksSorted);
        activities.sort((a, b) => {
          // Simple sort by time string (not perfect but works for display)
          return 0;
        });
        
        setRecentActivities(activities.slice(0, 4));

        // Upcoming events - exams scheduled in the future
        const now = new Date();
        const upcoming = examsList
          .filter(exam => {
            const examDate = exam.date || exam.scheduled_at;
            if (!examDate) return false;
            const date = new Date(examDate);
            return date > now && (exam.status === 'scheduled' || exam.status === 'draft');
          })
          .sort((a, b) => {
            const dateA = new Date(a.date || a.scheduled_at || 0);
            const dateB = new Date(b.date || b.scheduled_at || 0);
            return dateA - dateB;
          })
          .slice(0, 3)
          .map(exam => {
            const examDate = exam.date || exam.scheduled_at;
            const date = new Date(examDate);
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            let dateStr = '';
            if (date.toDateString() === tomorrow.toDateString()) {
              dateStr = 'Ngày mai';
            } else {
              dateStr = formatDate(examDate);
            }
            
            return {
              id: exam._id || exam.id,
              title: exam.title || 'Bài thi không có tiêu đề',
              date: dateStr,
              time: exam.time || formatTime(examDate),
              type: 'exams'
            };
          });

        setUpcomingEvents(upcoming);

        // Store recent items for display
        setRecentExams(examsList.slice(0, 3));
        setRecentFlashcards(decks.slice(0, 3));

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Tạo Thẻ Ghi Nhớ',
      description: 'Thêm thẻ ghi nhớ mới vào bộ sưu tập',
      icon: 'flashcards',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/teacher/flashcards'
    },
    {
      title: 'Tạo Bài Thi',
      description: 'Thiết lập một bài kiểm tra mới',
      icon: 'exams',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/teacher/exams'
    },
    {
      title: 'Quản Lý Lớp Học',
      description: 'Xem và quản lý các lớp học',
      icon: 'home',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/teacher/classes'
    },
    {
      title: 'Ngân Hàng Câu Hỏi',
      description: 'Xem và quản lý câu hỏi',
      icon: 'file-text',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/teacher/question-bank'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Bảng Điều Khiển Giáo Viên
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Chào mừng trở lại! Đây là những gì đang diễn ra trong các lớp học của bạn hôm nay.
              </p>
            </div>
            <RoleBadge role="Teacher" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lớp Học Hoạt Động</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.activeClasses}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Icon name="home" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thẻ Ghi Nhớ</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.flashcardsCreated}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="flashcards" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bài Thi</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.examsScheduled}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Icon name="exams" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Thao Tác Nhanh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.link}
                    className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-orange-100 dark:border-orange-900/50 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon name={action.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hoạt Động Gần Đây</h2>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có hoạt động nào</p>
                </div>
              ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <Icon name={activity.type} className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                        : activity.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-400'
                    }`}>
                        {activity.status === 'completed' ? 'Hoàn thành' : activity.status === 'pending' ? 'Chờ xử lý' : 'Đã xem xét'}
                    </span>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sự Kiện Sắp Tới</h2>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có sự kiện sắp tới</p>
                </div>
              ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer" onClick={() => event.type === 'exams' && navigate(`/dashboard/teacher/exams/${event.id}`)}>
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <Icon name={event.type} className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.date} lúc {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}