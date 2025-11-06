import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
          {/* Main content (StudentLayout already has sidebar) */}
          <main>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thư viện của bạn</h1>
              <div className="flex items-center gap-2">
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="recent">Gần đây</option>
                  <option value="popular">Phổ biến</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Tìm kiếm học phần..." className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <select value={selectedSubject} onChange={(e)=>setSelectedSubject(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Tất cả' : s}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pageDecks.map(deck => (
                    <div key={deck.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4 hover:shadow-lg transition">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
                          {deck.title?.[0] || 'F'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{deck.title}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Public</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{deck.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">{deck.subject}</span>
                        <button onClick={()=>navigate(`/decks/${deck.id}/study`)} className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs">Study</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Hiển thị {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filtered.length)} / {filtered.length}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={safePage===1} className={`px-3 py-2 rounded-lg border ${safePage===1 ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Prev</button>
                    <span className="text-gray-700 dark:text-gray-300">Trang {safePage}/{totalPages}</span>
                    <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} className={`px-3 py-2 rounded-lg border ${safePage===totalPages ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Next</button>
                  </div>
                </div>
              </>
            )}
          </main>
      </div>
    </div>
  );
}


