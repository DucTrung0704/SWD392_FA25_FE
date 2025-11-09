import React from 'react';
import Icon from '../../components/ui/Icon';

export default function Progress() {
  const progressData = {
    totalStudyTime: '12.5 hours',
    streak: 7,
    accuracy: 82,
    completedDecks: 4,
    totalDecks: 12,
    weeklyProgress: [
      { day: 'Mon', hours: 2.5 },
      { day: 'Tue', hours: 1.8 },
      { day: 'Wed', hours: 3.2 },
      { day: 'Thu', hours: 2.1 },
      { day: 'Fri', hours: 1.5 },
      { day: 'Sat', hours: 2.8 },
      { day: 'Sun', hours: 1.2 },
    ]
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Progress Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Monitor your learning journey
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{progressData.totalStudyTime}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Icon name="clock" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{progressData.streak} days</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Icon name="fire" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{progressData.accuracy}%</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Icon name="target" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{progressData.completedDecks}/{progressData.totalDecks}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Icon name="check" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weekly Study Time</h3>
          <div className="flex items-end justify-between h-32">
            {progressData.weeklyProgress.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2"
                  style={{ height: `${(day.hours / 3.5) * 100}px` }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <Icon name="trophy" className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">7 Day Streak!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep up the great work!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Icon name="star" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">High Accuracy!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">82% average accuracy this week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


