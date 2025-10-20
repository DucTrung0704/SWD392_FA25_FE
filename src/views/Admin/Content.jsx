import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';

export default function Content() {
  const [activeTab, setActiveTab] = useState('reported');
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data for content management
  const reportedContent = [
    {
      id: 1,
      type: 'Flashcard Deck',
      title: 'Advanced Calculus Formulas',
      reporter: 'student123',
      reason: 'Inappropriate content',
      status: 'pending',
      reportedAt: '2024-01-10 14:30',
      severity: 'high',
      content: 'Contains offensive mathematical examples',
      author: 'teacher_math'
    },
    {
      id: 2,
      type: 'User Comment',
      title: 'Discussion on Physics',
      reporter: 'moderator_bot',
      reason: 'Spam content',
      status: 'reviewed',
      reportedAt: '2024-01-09 09:15',
      severity: 'medium',
      content: 'Repeated promotional messages',
      author: 'user_physics'
    },
    {
      id: 3,
      type: 'Flashcard Deck',
      title: 'Basic English Vocabulary',
      reporter: 'student456',
      reason: 'Copyright violation',
      status: 'pending',
      reportedAt: '2024-01-11 16:45',
      severity: 'high',
      content: 'Uses copyrighted images without permission',
      author: 'teacher_english'
    },
    {
      id: 4,
      type: 'Exam Question',
      title: 'Chemistry Midterm 2024',
      reporter: 'system_auto',
      reason: 'Incorrect answer',
      status: 'resolved',
      reportedAt: '2024-01-08 11:20',
      severity: 'low',
      content: 'Question 12 has incorrect answer key',
      author: 'teacher_chemistry'
    }
  ];

  const contentStats = {
    totalReported: 47,
    pendingReview: 12,
    resolved: 28,
    removed: 7,
    avgResponseTime: '2.3h'
  };

  const tabs = [
    { id: 'reported', name: 'Reported Content', count: contentStats.pendingReview, icon: 'warning' },
    { id: 'resolved', name: 'Resolved Cases', count: contentStats.resolved, icon: 'check' },
    { id: 'removed', name: 'Removed Content', count: contentStats.removed, icon: 'delete' },
    { id: 'analytics', name: 'Content Analytics', icon: 'stats' }
  ];

  const severityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    // Handle bulk actions
    console.log(`Performing ${action} on:`, selectedItems);
    setSelectedItems([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'reported':
        return (
          <div className="space-y-6">
            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    {selectedItems.length} items selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('remove')}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleBulkAction('review')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content List */}
            <div className="space-y-4">
              {reportedContent.filter(item => item.status === 'pending').map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all duration-200 ${
                    selectedItems.includes(item.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.type} • Reported by {item.reporter}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[item.severity]}`}>
                              {item.severity} priority
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Details</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          <strong>Reason:</strong> {item.reason}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          <strong>Content:</strong> {item.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>Author: {item.author}</span>
                          <span>Reported: {new Date(item.reportedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1">
                            <Icon name="check" className="w-3 h-3" />
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1">
                            <Icon name="delete" className="w-3 h-3" />
                            Remove
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1">
                            <Icon name="eye" className="w-3 h-3" />
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'resolved':
        return (
          <div className="space-y-4">
            {reportedContent.filter(item => item.status === 'resolved').map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.type} • Resolved by admin
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Action taken: Content approved after review
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Resolved on {new Date(item.reportedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.totalReported}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reported</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.pendingReview}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.avgResponseTime}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Content Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Moderate and manage reported content across the platform
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">{contentStats.pendingReview}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              <Icon name={tab.icon} className="w-5 h-5" />
              {tab.name}
              {tab.count && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {renderContent()}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{contentStats.totalReported}</div>
            <div className="text-red-100 text-sm">Total Reports</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{contentStats.pendingReview}</div>
            <div className="text-yellow-100 text-sm">Awaiting Review</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{contentStats.resolved}</div>
            <div className="text-green-100 text-sm">Resolved Cases</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{contentStats.avgResponseTime}</div>
            <div className="text-blue-100 text-sm">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}