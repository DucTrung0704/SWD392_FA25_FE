import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';
import { examService } from '../../services/examService';

export default function StudentExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const list = await examService.listStudentExams();
        const arr = Array.isArray(list?.exams) ? list.exams : (Array.isArray(list) ? list : []);
        const normalized = arr.map(e => ({
          _id: e._id || e.id,
          title: e.title,
          subject: e.subject || 'General',
          duration: e.duration || e.durationMinutes || 60,
          date: e.date || e.scheduled_at || e.createdAt || new Date().toISOString(),
        }));
        setExams(normalized);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subjects = useMemo(() => ['all', ...new Set(exams.map(e => e.subject))], [exams]);

  const filtered = exams.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q);
    const matchS = subject === 'all' || e.subject === subject;
    return matchQ && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Exams</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search exams..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={subject}
            onChange={(e)=>setSubject(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading exams...</span>
        </div>
      ) : pageItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{error || 'No exams found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{exam.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">{exam.duration} mins</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.subject}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(exam.date).toLocaleDateString()}</div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await submissionService.startExam(exam._id);
                      const submissionId = res?.submission?._id || res?.submissionId || res?._id;
                      if (submissionId) {
                        navigate(`/dashboard/student/exams/${submissionId}`);
                      }
                    } catch (e) {
                      console.error(e);
                      alert(e.message || 'Failed to start exam');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Start
                </button>
                <button
                  onClick={async () => {
                    try {
                      const s = await submissionService.getSubmissionByExam(exam._id);
                      const submissionId = s?._id || s?.submissionId || s?.submission?._id;
                      if (submissionId) {
                        navigate(`/dashboard/student/exams/${submissionId}`);
                      } else {
                        alert('No submission found for this exam');
                      }
                    } catch (e) {
                      console.error(e);
                      alert(e.message || 'Failed to load submission');
                    }
                  }}
                  className="px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 text-sm">
        <div className="text-gray-600 dark:text-gray-400">Showing {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filtered.length)} / {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={safePage===1} className={`px-3 py-2 rounded-lg border ${safePage===1 ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Prev</button>
          <span className="text-gray-700 dark:text-gray-300">Page {safePage}/{totalPages}</span>
          <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} className={`px-3 py-2 rounded-lg border ${safePage===totalPages ? 'text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Next</button>
        </div>
      </div>
    </div>
  );
}


