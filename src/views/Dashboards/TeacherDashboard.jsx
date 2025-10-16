import React, { useState } from 'react';
import Container from '../../components/ui/Container';
import RoleBadge from '../../components/RoleBadge';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for teacher dashboard
  const teacherStats = {
    totalStudents: 156,
    activeClasses: 8,
    flashcardsCreated: 24,
    examsCreated: 12,
    averageScore: 87,
    completionRate: 92,
    studentEngagement: 85,
    satisfactionRate: 4.8
  };

  const recentStudents = [
    { name: 'Nguyen Van A', class: 'Math 101', progress: 85, lastActive: '2 hours ago', avatar: 'A', status: 'active' },
    { name: 'Tran Thi B', class: 'Physics 201', progress: 92, lastActive: '1 hour ago', avatar: 'B', status: 'active' },
    { name: 'Le Van C', class: 'Chemistry 102', progress: 78, lastActive: '3 hours ago', avatar: 'C', status: 'away' },
    { name: 'Pham Thi D', class: 'Math 101', progress: 95, lastActive: '30 minutes ago', avatar: 'D', status: 'active' }
  ];

  const recentDecks = [
    { title: 'Algebra Basics', cards: 45, students: 23, difficulty: 'Beginner', performance: 92, icon: '🔢' },
    { title: 'Physics Formulas', cards: 67, students: 18, difficulty: 'Intermediate', performance: 85, icon: '⚛️' },
    { title: 'Chemistry Elements', cards: 89, students: 31, difficulty: 'Advanced', performance: 78, icon: '🧪' }
  ];

  const upcomingExams = [
    { title: 'Midterm Math', date: '2024-01-15', students: 45, duration: '90 mins', subject: 'Mathematics', icon: '📐' },
    { title: 'Physics Quiz', date: '2024-01-18', students: 32, duration: '60 mins', subject: 'Physics', icon: '🔭' },
    { title: 'Chemistry Test', date: '2024-01-22', students: 28, duration: '120 mins', subject: 'Chemistry', icon: '🧬' }
  ];

  const quickActions = [
    { title: 'Create Flashcards', description: 'Build new study materials', icon: '🎴', color: 'from-purple-500 to-blue-600', link: '/dashboard/teacher/flashcards' },
    { title: 'Create Exam', description: 'Design practice tests', icon: '📝', color: 'from-green-500 to-teal-600', link: '/dashboard/teacher/exams' },
    { title: 'Manage Students', description: 'View student progress', icon: '👥', color: 'from-orange-500 to-red-600', link: '/dashboard/teacher/students' },
    { title: 'Analytics', description: 'View performance insights', icon: '📊', color: 'from-blue-500 to-indigo-600', link: '/dashboard/teacher/analytics' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <Container size="7xl" padding="lg">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 lg:mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">👨‍🏫</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Manage your classes and track student progress
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <RoleBadge role="Teacher" size="lg" />
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{teacherStats.activeClasses}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Classes</div>
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
                <span>📈</span>
                Teaching Overview
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Students', value: teacherStats.totalStudents, icon: '👥', color: 'text-blue-600' },
                  { label: 'Flashcards', value: teacherStats.flashcardsCreated, icon: '🎴', color: 'text-purple-600' },
                  { label: 'Exams Created', value: teacherStats.examsCreated, icon: '📝', color: 'text-green-600' },
                  { label: 'Avg Score', value: `${teacherStats.averageScore}%`, icon: '🎯', color: 'text-orange-600' },
                  { label: 'Completion Rate', value: `${teacherStats.completionRate}%`, icon: '✅', color: 'text-teal-600' },
                  { label: 'Engagement', value: `${teacherStats.studentEngagement}%`, icon: '🔥', color: 'text-red-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
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
                <span>🚀</span>
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
                      <span className="text-xl text-white">{action.icon}</span>
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
            {/* Students Overview */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-3 h-8 bg-gradient-to-b from-purple-500 to-blue-600 rounded-full"></span>
                  Student Progress
                </h2>
                <Link 
                  to="/dashboard/teacher/students" 
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  View All Students
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentStudents.map((student, index) => (
                  <div 
                    key={index}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                          {student.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          student.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{student.progress}%</span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last active: {student.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flashcard Decks */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-3 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></span>
                  My Flashcard Decks
                </h2>
                <Link 
                  to="/dashboard/teacher/flashcards" 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  Manage All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentDecks.map((deck, index) => (
                  <div 
                    key={index}
                    className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">{deck.icon}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        deck.difficulty === 'Advanced' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : deck.difficulty === 'Intermediate'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {deck.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{deck.title}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Cards:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{deck.cards}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{deck.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{deck.performance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Exams & Performance */}
          <div className="xl:col-span-1 space-y-8">
            {/* Upcoming Exams */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Upcoming Exams</h3>
                  <p className="text-purple-100 text-sm">Manage assessments</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingExams.map((exam, index) => (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{exam.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm">{exam.title}</h4>
                          <p className="text-purple-100 text-xs">{exam.subject}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-purple-100">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span className="font-medium">{exam.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{exam.duration}</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-lg transition-colors duration-200">
                      Prepare Materials
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span>🎯</span>
                Performance Metrics
              </h3>
              
              <div className="space-y-4">
                {[
                  { metric: 'Student Satisfaction', value: `${teacherStats.satisfactionRate}/5`, icon: '⭐', color: 'from-yellow-500 to-orange-500' },
                  { metric: 'Content Quality', value: '94%', icon: '📚', color: 'from-green-500 to-teal-500' },
                  { metric: 'Response Time', value: '2.1h', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
                  { metric: 'Course Completion', value: `${teacherStats.completionRate}%`, icon: '✅', color: 'from-purple-500 to-pink-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm">{item.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.metric}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Goals Section */}
        <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-3 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></span>
            Teaching Goals & Progress
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { goal: 'Student Engagement', target: '90%', current: '85%', color: 'from-purple-500 to-blue-600' },
              { goal: 'Exam Performance', target: '88%', current: '87%', color: 'from-green-500 to-teal-600' },
              { goal: 'Content Creation', target: '30 decks', current: '24 decks', color: 'from-orange-500 to-red-600' },
              { goal: 'Student Feedback', target: '4.9/5', current: '4.8/5', color: 'from-yellow-500 to-amber-600' }
            ].map((goal, index) => {
              const progress = goal.current.includes('%') 
                ? parseInt(goal.current) 
                : goal.current.includes('/')
                ? (parseFloat(goal.current.split('/')[0]) / parseFloat(goal.current.split('/')[1])) * 100
                : 80; // Default progress for non-percentage goals
                
              return (
                <div key={index} className="text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${goal.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <span className="text-white text-2xl font-bold">{goal.current}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{goal.goal}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target: {goal.target}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${goal.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}