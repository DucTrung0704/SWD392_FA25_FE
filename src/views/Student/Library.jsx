import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { flashcardService } from '../../services/flashcardService';

export default function StudentLibrary() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await flashcardService.getAllDecks();
        const publicDecks = (Array.isArray(data) ? data : [])
          .filter(d => d.isPublic === true || d.status === true || d.status === 'active');
        const normalized = publicDecks.map(d => ({
          id: d._id || d.id,
          title: d.title,
          description: d.description,
          subject: d.subject || d.category || 'General',
          difficulty: (d.difficulty || 'medium').toLowerCase(),
          tags: Array.isArray(d.tags) ? d.tags : [],
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
          views: d.views || d.stats?.views || 0,
        }));
        setDecks(normalized);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjects = useMemo(() => ['all', ...new Set(decks.map(d => d.subject).filter(Boolean))], [decks]);

  const filtered = useMemo(() => {
    const arr = decks.filter(d => {
      const q = searchTerm.toLowerCase();
      return (
        (!q || d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q))) &&
        (selectedSubject === 'all' || d.subject === selectedSubject)
      );
    });
    switch (sortBy) {
      case 'recent':
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return arr;
    }
  }, [decks, searchTerm, selectedSubject, sortBy]);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedSubject, sortBy, decks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageDecks = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
          {/* Main content (StudentLayout already has sidebar) */}
          <main>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Thư viện của bạn
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Khám phá các bộ thẻ flashcard công khai
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="recent">Gần đây</option>
                  <option value="popular">Phổ biến</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-900/50 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  value={searchTerm} 
                  onChange={(e)=>setSearchTerm(e.target.value)} 
                  placeholder="Tìm kiếm học phần..." 
                  className="flex-1 px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-500/40 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all" 
                />
                <select 
                  value={selectedSubject} 
                  onChange={(e)=>setSelectedSubject(e.target.value)} 
                  className="px-4 py-2 rounded-xl border border-orange-200 dark:border-orange-500/40 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                >
                  {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Tất cả' : s}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {pageDecks.map(deck => (
                    <div key={deck.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-orange-100 dark:border-orange-900/50 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                          {deck.title?.[0] || 'F'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{deck.title}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex-shrink-0 ml-2">Public</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{deck.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-800 dark:text-orange-200 rounded-full">{deck.subject}</span>
                        <button 
                          onClick={()=>navigate(`/dashboard/student/library/${deck.id}/study`)} 
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                          Bắt đầu học
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filtered.length > 0 && filtered.length > pageSize && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Hiển thị <span className="font-semibold text-orange-600 dark:text-orange-400">{startIndex + 1}</span> - <span className="font-semibold text-orange-600 dark:text-orange-400">{Math.min(startIndex + pageSize, filtered.length)}</span> trong tổng số <span className="font-semibold text-orange-600 dark:text-orange-400">{filtered.length}</span> bộ thẻ
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage = 
                            page === 1 || 
                            page === totalPages || 
                            (page >= safePage - 1 && page <= safePage + 1);
                          
                          if (!showPage) {
                            // Show ellipsis
                            if (page === safePage - 2 || page === safePage + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                                page === safePage
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                                  : 'border border-orange-200 bg-white text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-orange-500/40 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/30"
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
      </div>
    </div>
  );
}


