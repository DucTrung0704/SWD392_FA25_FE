import React from 'react';
import RoleBadge from '../../components/RoleBadge';
import Icon from '../../components/ui/Icon';

export default function TeacherDashboard() {
  // Mock data for teacher dashboard
  const teacherStats = {
    totalStudents: 156,
    activeClasses: 8,
    flashcardsCreated: 324,
    examsScheduled: 12,
    avgStudentScore: 87,
    pendingReviews: 23
  };

  const recentActivities = [
    { id: 1, type: 'exam', title: 'Math Quiz - Grade 10A', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'flashcard', title: 'Created Biology Deck', time: '4 hours ago', status: 'completed' },
    { id: 3, type: 'student', title: 'New student enrolled', time: '6 hours ago', status: 'pending' },
    { id: 4, type: 'class', title: 'Class 9B assignment submitted', time: '8 hours ago', status: 'reviewed' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Physics Exam - Class 11A', date: 'Tomorrow', time: '10:00 AM', type: 'exam' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Dec 15', time: '2:00 PM', type: 'meeting' },
    { id: 3, title: 'Chemistry Lab - Class 10B', date: 'Dec 16', time: '9:00 AM', type: 'class' }
  ];

  const quickActions = [
    {
      title: 'Create Flashcard',
      description: 'Add new flashcards to your collection',
      icon: 'flashcards',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/dashboard/teacher/flashcards'
    },
    {
      title: 'Schedule Exam',
      description: 'Set up a new examination',
      icon: 'exams',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/dashboard/teacher/exams'
    },
    {
      title: 'Manage Students',
      description: 'View and manage student profiles',
      icon: 'users',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/dashboard/teacher/students'
    },
    {
      title: 'Class Analytics',
      description: 'View detailed performance metrics',
      icon: 'stats',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/teacher/analytics'
    }
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Welcome back! Here's what's happening in your classes today.
              </p>
            </div>
            <RoleBadge role="Teacher" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.totalStudents}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Icon name="users" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Classes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.activeClasses}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Icon name="home" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Flashcards</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.flashcardsCreated}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Icon name="flashcards" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exams</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.examsScheduled}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Icon name="exams" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Score</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.avgStudentScore}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <Icon name="progress" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.pendingReviews}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                <Icon name="clock" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.link}
                    className="group block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={action.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={activity.type} className="w-4 h-4" />
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
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={event.type} className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}