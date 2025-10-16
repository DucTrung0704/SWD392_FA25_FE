import React from 'react';
import Container from '../../components/ui/Container';
import RoleBadge from '../../components/RoleBadge';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  // Mock data for student progress
  const studentStats = {
    totalDecks: 12,
    completedDecks: 4,
    studyStreak: 7,
    accuracy: 82,
    recentActivity: [
      { deck: 'English Vocabulary', progress: 75, time: '2 hours ago' },
      { deck: 'Math Formulas', progress: 60, time: '1 day ago' },
      { deck: 'Science Concepts', progress: 90, time: '3 days ago' }
    ]
  };

  const quickActions = [
    {
      title: 'Study',
      description: 'Học theo thứ tự hoặc ngẫu nhiên',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/study'
    },
    {
      title: 'Smart Review',
      description: 'Gợi ý ôn dựa trên thẻ chưa nhớ',
      icon: '🧠',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/review'
    },
    {
      title: 'Exams',
      description: 'Làm bài thi thử trực tuyến',
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/exams'
    },
    {
      title: 'Progress',
      description: 'Theo dõi tiến độ học tập',
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/progress'
    },
    {
      title: 'Flashcards',
      description: 'Quản lý bộ thẻ của bạn',
      icon: '🎴',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      link: '/flashcards'
    },
    {
      title: 'Achievements',
      description: 'Xem thành tích đạt được',
      icon: '🏆',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      link: '/achievements'
    }
  ];

  const upcomingExams = [
    { name: 'Midterm Test', subject: 'Mathematics', date: '2024-01-15', duration: '90 mins' },
    { name: 'Vocabulary Quiz', subject: 'English', date: '2024-01-18', duration: '45 mins' },
    { name: 'Science Exam', subject: 'Physics', date: '2024-01-22', duration: '120 mins' }
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Container size="6xl" padding="sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Welcome back! Continue your learning journey
              </p>
            </div>
            <RoleBadge role="Student" />
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Day {studentStats.studyStreak}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Study Streak 🔥</div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Decks</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.totalDecks}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.completedDecks}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{studentStats.accuracy}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">12.5h</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <span className="text-lg sm:text-xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-xl sm:text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  <div className={`mt-3 w-8 h-1 bg-gradient-to-r ${action.color} rounded-full group-hover:w-12 transition-all duration-300`}></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Upcoming Exams */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {studentStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.deck}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{activity.progress}%</div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${activity.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Exams</h3>
              <div className="space-y-4">
                {upcomingExams.map((exam, index) => (
                  <div key={index} className="p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{exam.name}</h4>
                      <span className="text-sm bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
                        {exam.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.subject}</p>
                    <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                      <span className="mr-2">📅</span>
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Study Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Study?</h3>
              <p className="text-blue-100">Continue from where you left off or start a new deck</p>
            </div>
            <Link 
              to="/study" 
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Start Studying
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}