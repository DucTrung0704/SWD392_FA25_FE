import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('engagement');

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalUsers: 2847,
      activeUsers: 1923,
      newRegistrations: 145,
      retentionRate: 78,
      avgSessionDuration: '12m 34s',
      completionRate: 85
    },
    engagement: {
      dailyActive: [65, 72, 68, 80, 75, 90, 85],
      weeklyActive: [420, 480, 520, 580, 540, 600, 650],
      monthlyActive: [1800, 1920, 1850, 2100, 2050, 2200, 2300],
      sessions: [1250, 1380, 1420, 1560, 1480, 1620, 1750]
    },
    performance: {
      avgScores: [72, 75, 78, 82, 80, 85, 88],
      completionRates: [65, 68, 72, 75, 78, 82, 85],
      studyTime: ['10.2h', '11.5h', '12.1h', '13.4h', '12.8h', '14.2h', '15.1h'],
      masteryLevel: [45, 48, 52, 55, 58, 62, 65]
    },
    content: {
      decksCreated: [12, 15, 18, 14, 20, 22, 25],
      cardsStudied: [1250, 1420, 1380, 1560, 1620, 1750, 1880],
      popularSubjects: [
        { subject: 'Mathematics', decks: 45, students: 892 },
        { subject: 'Science', decks: 38, students: 745 },
        { subject: 'Languages', decks: 32, students: 623 },
        { subject: 'History', decks: 28, students: 512 },
        { subject: 'Programming', decks: 25, students: 487 }
      ]
    },
    userGrowth: {
      newUsers: [45, 52, 48, 65, 58, 72, 68],
      returningUsers: [420, 450, 480, 520, 500, 550, 580],
      churnRate: [8.2, 7.8, 7.5, 7.2, 6.9, 6.5, 6.2],
      activationRate: [68, 72, 75, 78, 80, 82, 85]
    }
  };

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const metrics = [
    { id: 'engagement', name: 'Engagement', icon: 'clock', color: 'from-orange-500 to-red-500' },
    { id: 'performance', name: 'Performance', icon: 'stats', color: 'from-blue-500 to-cyan-500' },
    { id: 'content', name: 'Content', icon: 'study', color: 'from-green-500 to-teal-500' },
    { id: 'growth', name: 'Growth', icon: 'arrowUp', color: 'from-purple-500 to-pink-500' }
  ];

  const StatCard = ({ title, value, change, trend, icon }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{title}</h3>
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <span>{trend === 'up' ? '↗' : '↘'}</span>
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
    </div>
  );

  const ChartPlaceholder = ({ title, data, color }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-48 flex items-end justify-between gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all duration-500 hover:opacity-80`}
              style={{ height: `${(value / Math.max(...data)) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track performance metrics and user engagement insights
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
              {timeRanges.map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    timeRange === range.value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <Link
              to="/dashboard/admin/reports"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Export Report
            </Link>
          </div>
        </div>

        {/* Metrics Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0 ${
                activeMetric === metric.id
                  ? `bg-gradient-to-r ${metric.color} text-white shadow-lg`
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              <Icon name={metric.icon} className="w-5 h-5" />
              {metric.name}
            </button>
          ))}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={analyticsData.overview.totalUsers.toLocaleString()}
            change="+12%"
            trend="up"
            icon="👥"
          />
          <StatCard
            title="Active Users"
            value={analyticsData.overview.activeUsers.toLocaleString()}
            change="+8%"
            trend="up"
            icon="🔥"
          />
          <StatCard
            title="New Registrations"
            value={analyticsData.overview.newRegistrations}
            change="+15%"
            trend="up"
            icon="📈"
          />
          <StatCard
            title="Retention Rate"
            value={`${analyticsData.overview.retentionRate}%`}
            change="+5%"
            trend="up"
            icon="📊"
          />
          <StatCard
            title="Avg Session"
            value={analyticsData.overview.avgSessionDuration}
            change="+2m"
            trend="up"
            icon="⏱️"
          />
          <StatCard
            title="Completion Rate"
            value={`${analyticsData.overview.completionRate}%`}
            change="+7%"
            trend="up"
            icon="✅"
          />
        </div>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="xl:col-span-2 space-y-8">
            {/* Engagement Metrics */}
            {activeMetric === 'engagement' && (
              <>
                <ChartPlaceholder
                  title="Daily Active Users"
                  data={analyticsData.engagement.dailyActive}
                  color="from-orange-500 to-red-500"
                />
                <ChartPlaceholder
                  title="Weekly Sessions"
                  data={analyticsData.engagement.sessions}
                  color="from-purple-500 to-pink-500"
                />
              </>
            )}

            {/* Performance Metrics */}
            {activeMetric === 'performance' && (
              <>
                <ChartPlaceholder
                  title="Average Scores"
                  data={analyticsData.performance.avgScores}
                  color="from-blue-500 to-cyan-500"
                />
                <ChartPlaceholder
                  title="Mastery Level Progress"
                  data={analyticsData.performance.masteryLevel}
                  color="from-green-500 to-teal-500"
                />
              </>
            )}

            {/* Content Metrics */}
            {activeMetric === 'content' && (
              <>
                <ChartPlaceholder
                  title="Flashcard Decks Created"
                  data={analyticsData.content.decksCreated}
                  color="from-green-500 to-emerald-500"
                />
                <ChartPlaceholder
                  title="Cards Studied Daily"
                  data={analyticsData.content.cardsStudied}
                  color="from-indigo-500 to-purple-500"
                />
              </>
            )}

            {/* Growth Metrics */}
            {activeMetric === 'growth' && (
              <>
                <ChartPlaceholder
                  title="New User Registrations"
                  data={analyticsData.userGrowth.newUsers}
                  color="from-purple-500 to-pink-500"
                />
                <ChartPlaceholder
                  title="User Activation Rate"
                  data={analyticsData.userGrowth.activationRate}
                  color="from-blue-500 to-cyan-500"
                />
              </>
            )}
          </div>

          {/* Right Column - Insights & Details */}
          <div className="space-y-8">
            {/* Key Insights */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>💡</span>
                Key Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <span className="text-green-600 dark:text-green-400 text-lg">📈</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      User engagement increased by 15% this week
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Highest activity recorded on weekends
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Average study time increased by 2.5 minutes
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Users are spending more time on advanced decks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">🚀</span>
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      New feature adoption rate at 68%
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Smart review system is popular among users
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Subjects */}
            {activeMetric === 'content' && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🏆</span>
                  Popular Subjects
                </h3>
                <div className="space-y-4">
                  {analyticsData.content.popularSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {subject.subject.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.subject}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{subject.decks} decks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{subject.students}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {activeMetric === 'performance' && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Performance Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <ProgressBar
                      label="Average Score"
                      value={analyticsData.performance.avgScores[6]}
                      max={100}
                      color="from-blue-500 to-cyan-500"
                    />
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${analyticsData.performance.avgScores[6]}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <ProgressBar
                      label="Completion Rate"
                      value={analyticsData.performance.completionRates[6]}
                      max={100}
                      color="from-green-500 to-teal-500"
                    />
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${analyticsData.performance.completionRates[6]}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <ProgressBar
                      label="Mastery Level"
                      value={analyticsData.performance.masteryLevel[6]}
                      max={100}
                      color="from-purple-500 to-pink-500"
                    />
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${analyticsData.performance.masteryLevel[6]}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Analytics Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center gap-3">
                  <Icon name="stats" className="w-4 h-4" />
                  Generate Detailed Report
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center gap-3">
                  <Icon name="email" className="w-4 h-4" />
                  Export to Email
                </button>
                <button className="w-full text-left px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200 flex items-center gap-3">
                  <Icon name="bell" className="w-4 h-4" />
                  Set Up Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">4.8/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Rating</div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2.1s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}