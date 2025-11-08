import React, { useState, useEffect } from 'react';
import RoleBadge from '../../components/RoleBadge';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { flashcardService } from '../../services/flashcardService';

export default function StudentDashboard() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // easy | medium | hard | all
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [studentStats, setStudentStats] = useState({
    totalDecks: 0,
    completedDecks: 0,
    studyStreak: 0,
    accuracy: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadDecks = async () => {
      try {
        setLoading(true);
        const data = await flashcardService.getAllDecks();
        // Filter only public decks for students
        const publicDecks = Array.isArray(data) 
          ? data.filter(deck => deck.isPublic === true || deck.status === true || deck.status === 'active')
          : [];
        
        // Normalize for UI
        const normalized = publicDecks.map((d) => ({
          id: d._id || d.id,
          title: d.title,
          description: d.description,
          subject: d.subject || d.category || 'General',
          difficulty: (d.difficulty || 'medium').toLowerCase(),
          tags: Array.isArray(d.tags) ? d.tags : [],
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
          stats: { views: d.views || d.stats?.views || 0 },
        }));
        setDecks(normalized);
        
        // Calculate stats from actual data
        setStudentStats({
          totalDecks: publicDecks.length,
          completedDecks: 0, // TODO: Calculate from progress API
          studyStreak: 0, // TODO: Calculate from progress API
          accuracy: 0, // TODO: Calculate from progress API
          recentActivity: publicDecks.slice(0, 3).map(deck => ({
            deck: deck.title,
            progress: 0, // TODO: Get from progress API
            time: deck.updatedAt || deck.createdAt || 'Recently'
          }))
        });
      } catch (error) {
        console.error('Error loading decks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDecks();
  }, []);

  // Subjects from decks
  const subjects = ['all', ...new Set(decks.map(d => d.subject).filter(Boolean))];

  // Filter + sort
  const filteredDecks = decks
    .filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = selectedSubject === 'all' || d.subject === selectedSubject;
      const matchesDifficulty = difficultyFilter === 'all' || d.difficulty === difficultyFilter;
      return matchesSearch && matchesSubject && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'popular') return (b.stats?.views || 0) - (a.stats?.views || 0);
      return 0;
    });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, difficultyFilter, sortBy, decks]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil((filteredDecks.length || 0) / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const currentPageDecks = filteredDecks.slice(startIndex, startIndex + pageSize);

  const quickActions = [
    {
      title: 'Study',
      description: 'Học theo thứ tự hoặc ngẫu nhiên',
      icon: 'study',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/study'
    },
    {
      title: 'Classes',
      description: 'Join and manage your classes',
      icon: 'users',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/dashboard/student/class'
    },
    {
      title: 'Smart Review',
      description: 'Gợi ý ôn dựa trên thẻ chưa nhớ',
      icon: 'review',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/review'
    },
    {
      title: 'Exams',
      description: 'Làm bài thi thử trực tuyến',
      icon: 'exams',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/exams'
    },
    {
      title: 'Progress',
      description: 'Theo dõi tiến độ học tập',
      icon: 'progress',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/dashboard/student/progress'
    },
    {
      title: 'Flashcards',
      description: 'Quản lý bộ thẻ của bạn',
      icon: 'flashcards',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      link: '/flashcards'
    },
    {
      title: 'Achievements',
      description: 'Xem thành tích đạt được',
      icon: 'achievements',
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
    <div className="min-h-screen pt-2 pb-6 sm:pt-3 lg:pt-4 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content (sidebar provided by StudentLayout) */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Student Dashboard
                </h1>
                <div className="sm:hidden">
                  <RoleBadge role="Student" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Welcome back! Continue your learning journey
              </p>
            </div>
            <div className="hidden sm:block">
              <RoleBadge role="Student" />
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Day {studentStats.studyStreak}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Study Streak <Icon name="clock" className="w-3 h-3" />
            </div>
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <Icon name="study" className="w-5 h-5 sm:w-6 sm:h-6" />
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
                <Icon name="check" className="w-5 h-5 sm:w-6 sm:h-6" />
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
                <Icon name="progress" className="w-5 h-5 sm:w-6 sm:h-6" />
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
                <Icon name="clock" className="w-5 h-5 sm:w-6 sm:h-6" />
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
                    <Icon name={action.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  <div className={`mt-3 w-8 h-1 bg-gradient-to-r ${action.color} rounded-full group-hover:w-12 transition-all duration-300`}></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Upcoming Exams */}
          <div className="space-y-6 lg:space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 sm:space-y-4">
                {studentStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{activity.deck}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{activity.progress}%</div>
                      <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Exams</h3>
              <div className="space-y-3 sm:space-y-4">
                {upcomingExams.map((exam, index) => (
                  <div key={index} className="p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{exam.name}</h4>
                      <span className="text-xs sm:text-sm bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full whitespace-nowrap">
                        {exam.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.subject}</p>
                    <div className="flex items-center text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                      <Icon name="calendar" className="w-3 h-3 mr-2" />
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Public Library */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Public Flashcard Library</h2>
          </div>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search public decks..."
                    className="w-full px-4 py-3 pl-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <select value={selectedSubject} onChange={(e)=>setSelectedSubject(e.target.value)} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  {subjects.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
                  ))}
                </select>
                <select value={difficultyFilter} onChange={(e)=>setDifficultyFilter(e.target.value)} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="all">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Decks Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading decks...</span>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No decks found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentPageDecks.map((deck) => (
                  <div key={deck.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                    {/* Public badge */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                      PUBLIC
                    </div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">{deck.title?.[0] || 'F'}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{deck.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{deck.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                      <span className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">{deck.subject}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${deck.difficulty==='hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : deck.difficulty==='medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{deck.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-900 dark:text-white">{filteredDecks.length === 0 ? 0 : startIndex + 1}</span>-<span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + pageSize, filteredDecks.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredDecks.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={safePage===1} className={`px-3 py-2 rounded-lg border text-sm transition-colors ${safePage===1 ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Prev</button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Page <span className="font-semibold">{safePage}</span> of <span className="font-semibold">{totalPages}</span></span>
                  <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} className={`px-3 py-2 rounded-lg border text-sm transition-colors ${safePage===totalPages ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Study Recommendations */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Ready to Study?</h3>
              <p className="text-orange-100">Continue from where you left off or start a new deck</p>
            </div>
            <Link
              to="/dashboard/student/study"
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
            >
              Start Studying
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}