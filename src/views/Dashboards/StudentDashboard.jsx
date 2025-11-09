import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Clock, Award, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';
import { examService } from '../../services/examService';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({
    totalDecks: 0,
    completedDecks: 0,
    studyStreak: 0,
    accuracy: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load decks
        const decksData = await flashcardService.getAllDecks();
        const publicDecks = Array.isArray(decksData) 
          ? decksData.filter(deck => deck.isPublic === true || deck.status === true || deck.status === 'active')
          : [];
        
        const normalizedDecks = publicDecks.map((d) => ({
          id: d._id || d.id,
          title: d.title,
          description: d.description,
          subject: d.subject || d.category || 'General',
          difficulty: (d.difficulty || 'medium').toLowerCase(),
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
        }));
        setDecks(normalizedDecks);
        
        // Load exams
        try {
          const examsData = await examService.listStudentExams();
          const examsList = Array.isArray(examsData?.exams) ? examsData.exams : Array.isArray(examsData) ? examsData : [];
          
          const normalizedExams = examsList.map((exam) => ({
            id: exam._id || exam.id,
            title: exam.title || 'Chưa đặt tên',
            subject: exam.subject || 'General',
            duration: exam.time_limit || exam.duration || exam.durationMinutes || 60,
            date: exam.date || exam.scheduled_at || exam.startTime || exam.createdAt,
            description: exam.description,
          }));
          setExams(normalizedExams);
        } catch (examError) {
          console.error('Error loading exams:', examError);
          setExams([]);
        }
        
        // Calculate stats
        setStudentStats({
          totalDecks: publicDecks.length,
          completedDecks: 0,
          studyStreak: 0,
          accuracy: 0,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get recent decks (latest 3)
  const recentDecks = useMemo(() => {
    return decks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [decks]);

  // Get recent exams (latest 3)
  const recentExams = useMemo(() => {
    return exams
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 3);
  }, [exams]);

  const quickActions = [
    {
      title: 'Học tập',
      description: 'Học theo thứ tự hoặc ngẫu nhiên',
      icon: BookOpen,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/study'
    },
    {
      title: 'Kỳ thi',
      description: 'Làm bài thi thử trực tuyến',
      icon: FileText,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/exams'
    },
    {
      title: 'Thư viện',
      description: 'Khám phá các bộ thẻ công khai',
      icon: BookOpen,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/library'
    },
    {
      title: 'Bài nộp',
      description: 'Xem lịch sử làm bài',
      icon: FileText,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/submissions'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Bảng điều khiển
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Chào mừng trở lại! Tiếp tục hành trình học tập của bạn
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 dark:from-orange-900/30 dark:to-amber-900/30">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Chuỗi học tập</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">Ngày {studentStats.studyStreak}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng bộ thẻ</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.totalDecks}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã hoàn thành</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.completedDecks}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Độ chính xác</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.accuracy}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thời gian học</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">12.5h</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-md border border-orange-100 dark:border-orange-900/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  <div className={`mt-3 w-8 h-1 bg-gradient-to-r ${action.color} rounded-full group-hover:w-12 transition-all duration-300`}></div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Exams */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Kỳ thi gần đây
              </h3>
              <Link
                to="/dashboard/student/exams"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                Xem thêm
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentExams.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Chưa có kỳ thi nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => navigate(`/dashboard/student/exams`)}
                    className="group p-3 sm:p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate mb-1">
                          {exam.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                            {exam.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exam.duration} phút
                          </span>
                        </div>
                        {exam.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{exam.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Flashcards */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100 dark:border-orange-900/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Bộ thẻ gần đây
              </h3>
              <Link
                to="/dashboard/student/library"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                Xem thêm
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentDecks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Chưa có bộ thẻ nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDecks.map((deck) => (
                  <div
                    key={deck.id}
                    onClick={() => navigate(`/dashboard/student/library/${deck.id}/study`)}
                    className="group p-3 sm:p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                          {deck.title?.[0] || 'F'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate mb-1">
                            {deck.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                              {deck.subject}
                            </span>
                          </div>
                          {deck.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{deck.description}</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Study Recommendations */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Sẵn sàng học tập?</h3>
              <p className="text-orange-100">Tiếp tục từ nơi bạn đã dừng hoặc bắt đầu một bộ thẻ mới</p>
            </div>
            <Link
              to="/dashboard/student/study"
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              Bắt đầu học
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
