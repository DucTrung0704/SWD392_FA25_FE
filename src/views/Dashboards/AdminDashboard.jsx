import React, { useState } from 'react';
import RoleBadge from '../../components/RoleBadge';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for admin dashboard
  const adminStats = {
    totalUsers: 2847,
    activeUsers: 1923,
    totalTeachers: 156,
    totalStudents: 2689,
    systemUptime: '99.9%',
    storageUsed: '2.3TB',
    responseTime: '128ms',
    errorRate: '0.2%'
  };

  const recentUsers = [
    { name: 'Nguyen Van A', email: 'nguyenvana@email.com', role: 'Student', status: 'Active', joinDate: '2024-01-10' },
    { name: 'Tran Thi B', email: 'tranthib@email.com', role: 'Teacher', status: 'Active', joinDate: '2024-01-08' },
    { name: 'Le Van C', email: 'levanc@email.com', role: 'Student', status: 'Pending', joinDate: '2024-01-12' },
    { name: 'Pham Thi D', email: 'phamthid@email.com', role: 'Student', status: 'Active', joinDate: '2024-01-09' }
  ];

  const systemAlerts = [
    { type: 'warning', message: 'High server load detected', time: '5 minutes ago', icon: 'warning' },
    { type: 'info', message: 'New user registration spike', time: '1 hour ago', icon: 'stats' },
    { type: 'success', message: 'Backup completed successfully', time: '2 hours ago', icon: 'check' }
  ];

  const contentModeration = [
    { type: 'Reported Deck', title: 'Inappropriate Content', reporter: 'User123', status: 'Pending', priority: 'high' },
    { type: 'User Report', title: 'Spam Account', reporter: 'Moderator1', status: 'Resolved', priority: 'medium' },
    { type: 'Content Flag', title: 'Copyright Issue', reporter: 'System', status: 'Under Review', priority: 'high' }
  ];

  const analyticsData = [
    { metric: 'Daily Active Users', value: '1,923', change: '+12%', trend: 'up', icon: 'users' },
    { metric: 'New Registrations', value: '45', change: '+8%', trend: 'up', icon: 'register' },
    { metric: 'Content Created', value: '234', change: '+15%', trend: 'up', icon: 'study' },
    { metric: 'System Errors', value: '3', change: '-25%', trend: 'down', icon: 'error' }
  ];

  const quickActions = [
    { title: 'User Management', description: 'Manage user accounts & roles', icon: 'users', color: 'from-red-500 to-pink-600', link: '/dashboard/admin/users' },
    { title: 'Analytics', description: 'View system analytics', icon: 'stats', color: 'from-blue-500 to-cyan-600', link: '/dashboard/admin/analytics' },
    { title: 'System Settings', description: 'Configure system options', icon: 'settings', color: 'from-green-500 to-emerald-600', link: '/dashboard/admin/system' },
    { title: 'Content Moderation', description: 'Review reported content', icon: 'lock', color: 'from-yellow-500 to-orange-600', link: '/dashboard/admin/content' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 lg:mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="admin" className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <Icon name="check" className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                System overview and administrative controls
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <RoleBadge role="Admin" size="lg" />
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{adminStats.systemUptime}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">System Uptime</div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Stats & Quick Actions */}
          <div className="xl:col-span-1 space-y-8">
            {/* Stats Overview */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Icon name="stats" className="w-5 h-5" />
                System Overview
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), icon: 'users', color: 'text-blue-600' },
                  { label: 'Active Users', value: adminStats.activeUsers.toLocaleString(), icon: 'check', color: 'text-green-600' },
                  { label: 'Teachers', value: adminStats.totalTeachers, icon: 'teacher', color: 'text-purple-600' },
                  { label: 'Students', value: adminStats.totalStudents.toLocaleString(), icon: 'student', color: 'text-cyan-600' },
                  { label: 'Storage Used', value: adminStats.storageUsed, icon: 'file', color: 'text-orange-600' },
                  { label: 'Response Time', value: adminStats.responseTime, icon: 'clock', color: 'text-green-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <Icon name={stat.icon} className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Icon name="arrowRight" className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 hover:shadow-lg border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon name={action.icon} className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Analytics Overview */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-3 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full"></span>
                  Real-time Analytics
                </h2>
                <Link 
                  to="/dashboard/admin/analytics" 
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Details
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.map((item, index) => (
                  <div 
                    key={index}
                    className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon name={item.icon} className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.trend === 'up' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {item.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.value}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.metric}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-3 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></span>
                  Recent User Activity
                </h2>
                <Link 
                  to="/dashboard/admin/users" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Manage All
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div 
                    key={index}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Teacher' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.joinDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Moderation */}
          <div className="xl:col-span-1 space-y-8">
            {/* System Alerts */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">System Alerts</h3>
                  <p className="text-yellow-100 text-sm">Monitor system health</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Icon name="warning" className="w-7 h-7" />
                </div>
              </div>
              
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <Icon name={alert.icon} className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{alert.message}</p>
                        <p className="text-yellow-100 text-xs">{alert.time}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-200 text-yellow-800'
                          : alert.type === 'info'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-green-200 text-green-800'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Moderation */}
            <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Content Moderation</h3>
                  <p className="text-red-100 text-sm">Review reported content</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Icon name="lock" className="w-7 h-7" />
                </div>
              </div>
              
              <div className="space-y-4">
                {contentModeration.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.priority === 'high' 
                          ? 'bg-red-200 text-red-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-red-100">
                      <span>Type: {item.type}</span>
                      <span>Reporter: {item.reporter}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Pending' 
                          ? 'bg-yellow-200 text-yellow-800'
                          : item.status === 'Resolved'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                      <button className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors duration-200">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-3 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'CPU Usage', value: '24%', color: 'from-green-500 to-emerald-600', status: 'good' },
              { label: 'Memory', value: '68%', color: 'from-yellow-500 to-orange-600', status: 'warning' },
              { label: 'Disk I/O', value: '45%', color: 'from-green-500 to-emerald-600', status: 'good' },
              { label: 'Network', value: '82%', color: 'from-red-500 to-pink-600', status: 'critical' }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <span className="text-white text-2xl font-bold">{metric.value}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{metric.label}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.status === 'good' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : metric.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}