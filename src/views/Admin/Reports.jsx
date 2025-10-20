import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Mock data for reports
  const reportTemplates = [
    {
      id: 1,
      title: 'User Activity Report',
      description: 'Comprehensive overview of user engagement and activity patterns',
      icon: 'users',
      category: 'users',
      frequency: 'daily',
      lastGenerated: '2024-01-10',
      dataPoints: ['Active Users', 'New Registrations', 'Session Duration', 'Feature Usage'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 2,
      title: 'Content Performance',
      description: 'Analysis of flashcard decks and study materials performance',
      icon: 'study',
      category: 'content',
      frequency: 'weekly',
      lastGenerated: '2024-01-08',
      dataPoints: ['Deck Completions', 'Average Scores', 'Popular Subjects', 'Study Time'],
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 3,
      title: 'System Performance',
      description: 'Server metrics, response times, and system health indicators',
      icon: 'settings',
      category: 'system',
      frequency: 'daily',
      lastGenerated: '2024-01-11',
      dataPoints: ['Uptime', 'Response Times', 'Error Rates', 'Server Load'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      title: 'Financial Overview',
      description: 'Revenue, subscriptions, and financial performance metrics',
      icon: 'dollar',
      category: 'finance',
      frequency: 'monthly',
      lastGenerated: '2024-01-05',
      dataPoints: ['Revenue', 'Active Subscriptions', 'Churn Rate', 'ARPU'],
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 5,
      title: 'Teacher Performance',
      description: 'Educator activity and content creation metrics',
      icon: 'teacher',
      category: 'teachers',
      frequency: 'weekly',
      lastGenerated: '2024-01-09',
      dataPoints: ['Content Created', 'Student Engagement', 'Exam Performance', 'Ratings'],
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 6,
      title: 'Security Audit',
      description: 'Security events, login attempts, and system access logs',
      icon: 'lock',
      category: 'security',
      frequency: 'monthly',
      lastGenerated: '2024-01-03',
      dataPoints: ['Login Attempts', 'Security Events', 'Access Logs', 'Compliance'],
      color: 'from-red-500 to-pink-600'
    }
  ];

  const recentReports = [
    {
      id: 101,
      template: 'User Activity Report',
      generatedAt: '2024-01-10 14:30',
      period: '2024-01-03 to 2024-01-10',
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 102,
      template: 'Content Performance',
      generatedAt: '2024-01-08 09:15',
      period: '2024-01-01 to 2024-01-08',
      size: '1.8 MB',
      format: 'Excel',
      status: 'completed'
    },
    {
      id: 103,
      template: 'System Performance',
      generatedAt: '2024-01-11 11:20',
      period: '2024-01-10 to 2024-01-11',
      size: '3.1 MB',
      format: 'PDF',
      status: 'completed'
    }
  ];

  const reportStats = {
    totalGenerated: 147,
    thisMonth: 12,
    avgGenerationTime: '45s',
    mostPopular: 'User Activity'
  };

  const dateRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: 'file' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: 'stats' },
    { value: 'csv', label: 'CSV Data', icon: 'file' },
    { value: 'json', label: 'JSON Data', icon: 'settings' }
  ];

  const handleGenerateReport = (report) => {
    setSelectedReport(report);
    // In a real app, this would trigger report generation
    console.log('Generating report:', report.title);
  };

  const handleExport = () => {
    if (selectedReport) {
      // In a real app, this would trigger the export process
      console.log(`Exporting ${selectedReport.title} as ${exportFormat}`);
      alert(`Report "${selectedReport.title}" is being exported as ${exportFormat.toUpperCase()}`);
    }
  };

  const ReportCard = ({ report }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${report.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon name={report.icon} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          report.frequency === 'daily' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            : report.frequency === 'weekly'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        }`}>
          {report.frequency}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Last generated:</span>
          <span className="font-medium">{report.lastGenerated}</span>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Points:</h4>
          <div className="flex flex-wrap gap-1">
            {report.dataPoints.map((point, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleGenerateReport(report)}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          Generate Report
        </button>
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
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Generate and export comprehensive administrative reports
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">{reportStats.thisMonth}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Report Templates */}
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report Templates</h2>
              <div className="flex items-center gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTemplates.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Recent Reports */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recently Generated Reports</h2>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="space-y-4">
                  {recentReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg">📄</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{report.template}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {report.period} • {report.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {report.format}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
                          <Icon name="download" className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Report Generator & Stats */}
          <div className="space-y-8">
            {/* Report Generator */}
            {selectedReport && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Report</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <div className={`w-10 h-10 bg-gradient-to-r ${selectedReport.color} rounded-xl flex items-center justify-center`}>
                      <span className="text-white text-lg">{selectedReport.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{selectedReport.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReport.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {exportFormats.map(format => (
                        <button
                          key={format.value}
                          onClick={() => setExportFormat(format.value)}
                          className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                            exportFormat === format.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="mb-1">
                            <Icon name={format.icon} className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-medium">{format.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dateRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Export as {exportFormat.toUpperCase()}
                  </button>

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Report Statistics */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Report Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Generated</span>
                  <span className="font-bold">{reportStats.totalGenerated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>This Month</span>
                  <span className="font-bold">{reportStats.thisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Generation Time</span>
                  <span className="font-bold">{reportStats.avgGenerationTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Most Popular</span>
                  <span className="font-bold">{reportStats.mostPopular}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-3">
                  <Icon name="clock" className="w-4 h-4" />
                  Schedule Automated Reports
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-3">
                  <Icon name="email" className="w-4 h-4" />
                  Email Report Digest
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-3">
                  <Icon name="bell" className="w-4 h-4" />
                  Set Up Alerts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">92%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Report Accuracy</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Availability</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Report Types</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Export Formats</div>
          </div>
        </div>
      </div>
    </div>
  );
}