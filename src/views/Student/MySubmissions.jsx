import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionService } from '../../services/submissionService';

export default function MySubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await submissionService.getMySubmissions();
        const list = Array.isArray(res?.submissions) ? res.submissions : (Array.isArray(res) ? res : []);
        setItems(list);
      } catch (e) {
        setError(e.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-3 lg:pt-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No submissions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{s.exam?.title || 'Exam'}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{s.status}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.started_at || s.createdAt || Date.now()).toLocaleString()}</div>
              <div className="mt-3 flex justify-end">
                <button onClick={()=>navigate(`/dashboard/student/exams/${s._id}`)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


