import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, TrendingUp, Search, FileText, Users, Clock, CheckCircle, Trash2, X, Filter } from 'lucide-react';
import { examService } from '../../services/examService';

export default function TeacherExams() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', time_limit: 90, isPublic: true });

  useEffect(() => {
    loadExams();
  }, []);

  const statuses = ['all', 'draft', 'scheduled', 'completed', 'graded'];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'graded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Quiz':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Midterm':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-400';
      case 'Final':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
      case 'Lab Test':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'Essay':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await examService.listMyExams();
      const list = Array.isArray(res?.exams) ? res.exams : (Array.isArray(res) ? res : []);
      const normalized = list.map(e => ({
        id: e._id || e.id,
        title: e.title,
        subject: e.subject || 'General',
        date: e.date || e.scheduled_at || e.createdAt,
        time: e.time || '09:00',
        duration: e.time_limit || e.duration || 60,
        totalQuestions: Array.isArray(e.flashcards) ? e.flashcards.length : (e.totalQuestions || 0),
        enrolledStudents: 0,
        completedStudents: 0,
        avgScore: 0,
        status: e.status || (e.isPublic ? 'scheduled' : 'draft'),
        type: e.type || 'Exam',
        description: e.description || ''
      }));
      setExams(normalized);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
    setError('');
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await examService.deleteExam(examToDelete.id);
      
      // Reload exams list
      await loadExams();
      
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (err) {
      console.error('Failed to delete exam:', err);
      setError(err.message || 'Failed to delete exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Exam Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Create, schedule, and monitor examinations for your classes.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Exams</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {exams.length}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Scheduled</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {exams.filter(exam => exam.status === 'scheduled').length}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {exams.filter(exam => exam.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Avg Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {Math.round(exams.filter(exam => exam.avgScore > 0).reduce((sum, exam) => sum + exam.avgScore, 0) / exams.filter(exam => exam.avgScore > 0).length) || 0}%
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams by title, subject, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="sm:w-56">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading exams...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6">
            <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Exams Table */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exams <span className="text-blue-600 dark:text-blue-400">({filteredExams.length})</span>
              </h2>
            </div>
            
            {filteredExams.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No exams found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first exam.'}
                </p>
                {!searchTerm && selectedStatus === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Exam
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Exam Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Class & Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredExams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {exam.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {exam.subject} • {exam.totalQuestions} questions
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(exam.type)}`}>
                              {exam.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        Class {exam.class}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(exam.date)} at {exam.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.duration} minutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.completedStudents}/{exam.enrolledStudents}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.avgScore > 0 ? (
                        <span className={`text-sm font-medium ${getScoreColor(exam.avgScore)}`}>
                          {exam.avgScore}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}
                          className="p-2.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Edit Exam"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(exam)}
                          className="p-2.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {exam.status === 'completed' && (
                          <button className="p-2.5 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" title="Grade Exam">
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            )}
          </div>
        )}

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Exam</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill in the details below</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e)=>setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter exam title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Biology">Biology</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select class</option>
                        <option value="10A">Class 10A</option>
                        <option value="10B">Class 10B</option>
                        <option value="11A">Class 11A</option>
                        <option value="11B">Class 11B</option>
                        <option value="12A">Class 12A</option>
                        <option value="12B">Class 12B</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="90"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Questions
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="25"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e)=>setForm({...form, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe the exam content and requirements"
                    />
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting || !form.title.trim()}
                    onClick={async ()=>{
                      try{
                        setIsSubmitting(true);
                        setError('');
                        await examService.createExam({
                          title: form.title,
                          description: form.description,
                          time_limit: Number(form.time_limit) || 90,
                          isPublic: form.isPublic,
                        });
                        await loadExams();
                        setShowCreateModal(false);
                        setForm({ title: '', description: '', time_limit: 90, isPublic: true });
                      }catch(e){
                        console.error(e);
                        setError(e.message || 'Failed to create exam');
                      }finally{
                        setIsSubmitting(false);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Create Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && examToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Delete Exam
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to delete "{examToDelete.title}"?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    This action cannot be undone.
                  </p>
                  
                  {error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setExamToDelete(null);
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteExam}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Exam
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
