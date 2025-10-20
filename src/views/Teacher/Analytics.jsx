import React, { useState } from 'react';
import { Users, Home, Clock, TrendingUp, CheckCircle, BarChart3, Mail, Bell, Settings } from 'lucide-react';

export default function TeacherAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data for analytics
  const analyticsData = {
    overview: {
      totalStudents: 156,
      activeClasses: 8,
      avgAttendance: 92.5,
      avgGrade: 8.1,
      completedAssignments: 234,
      pendingGrading: 18
    },
    performance: [
      { subject: 'Mathematics', avgGrade: 8.3, attendance: 94, students: 28 },
      { subject: 'Biology', avgGrade: 7.8, attendance: 91, students: 32 },
      { subject: 'Physics', avgGrade: 8.5, attendance: 96, students: 25 },
      { subject: 'Chemistry', avgGrade: 7.9, attendance: 89, students: 30 },
      { subject: 'English', avgGrade: 8.1, attendance: 93, students: 27 },
      { subject: 'History', avgGrade: 7.6, attendance: 88, students: 14 }
    ],
    attendance: [
      { day: 'Mon', attendance: 95 },
      { day: 'Tue', attendance: 92 },
      { day: 'Wed', attendance: 94 },
      { day: 'Thu', attendance: 89 },
      { day: 'Fri', attendance: 91 },
      { day: 'Sat', attendance: 85 },
      { day: 'Sun', attendance: 0 }
    ],
    gradeDistribution: [
      { range: '9.0-10.0', count: 45, percentage: 28.8 },
      { range: '8.0-8.9', count: 52, percentage: 33.3 },
      { range: '7.0-7.9', count: 38, percentage: 24.4 },
      { range: '6.0-6.9', count: 15, percentage: 9.6 },
      { range: '0.0-5.9', count: 6, percentage: 3.9 }
    ],
    recentActivity: [
      { id: 1, type: 'assignment', title: 'Math Quiz Graded', time: '2 hours ago', class: '10A', students: 28 },
      { id: 2, type: 'exam', title: 'Biology Midterm Completed', time: '4 hours ago', class: '11B', students: 32 },
      { id: 3, type: 'attendance', title: 'Physics Class Attendance', time: '6 hours ago', class: '12A', students: 25 },
      { id: 4, type: 'flashcard', title: 'Chemistry Deck Created', time: '1 day ago', class: '10B', students: 30 }
    ]
  };

  const classes = ['all', '10A', '10B', '11A', '11B', '12A', '12B'];
  const periods = ['week', 'month', 'semester', 'year'];

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return 'text-green-600 dark:text-green-400';
    if (grade >= 8.0) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 7.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return 'text-green-600 dark:text-green-400';
    if (attendance >= 90) return 'text-blue-600 dark:text-blue-400';
    if (attendance >= 85) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Track student performance, attendance, and class analytics.
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                  </option>
                ))}
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalStudents}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Classes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.activeClasses}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Attendance</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.avgAttendance}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Grade</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.avgGrade}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.completedAssignments}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.pendingGrading}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Performance by Subject */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance by Subject</h2>
            <div className="space-y-4">
              {analyticsData.performance.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{subject.subject.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{subject.subject}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{subject.students} students</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getGradeColor(subject.avgGrade)}`}>
                      {subject.avgGrade}
                    </div>
                    <div className={`text-sm ${getAttendanceColor(subject.attendance)}`}>
                      {subject.attendance}% attendance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Attendance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Weekly Attendance</h2>
            <div className="space-y-4">
              {analyticsData.attendance.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="w-12 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {day.day}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${day.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`w-12 text-sm font-medium text-right ${getAttendanceColor(day.attendance)}`}>
                    {day.attendance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Grade Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Grade Distribution</h2>
            <div className="space-y-4">
              {analyticsData.gradeDistribution.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="w-20 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {range.range}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${range.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{range.count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{range.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.class} • {activity.students} students • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Generate Report</span>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Export Data</span>
            </button>
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="font-medium">Set Alerts</span>
            </button>
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Analytics Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
