import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Clock, User, Globe, Lock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { examService } from '../../services/examService';

export default function TeacherExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    time_limit: 60,
    isPublic: false
  });
  
  // Ref to track if we're currently loading to prevent duplicate calls
  const isLoadingRef = useRef(false);
  // Ref to track if we've already gotten a 404 error
  const has404ErrorRef = useRef(false);

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadExam = useCallback(async () => {
    if (!id) {
      setError('Exam ID is required');
      setIsLoading(false);
      isLoadingRef.current = false;
      return;
    }

    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    // If we already have a 404 error for this ID, don't retry
    if (has404ErrorRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError('');
      has404ErrorRef.current = false; // Reset 404 flag for new attempt
      
      // Normalize exam ID - ensure it's a string
      const examId = typeof id === 'string' 
        ? id 
        : (id?._id || id?.id || String(id));
      
      if (!examId || examId === 'undefined' || examId === 'null') {
        throw new Error('Invalid exam ID');
      }
      
      const data = await examService.getExamById(examId);

      // Handle different response formats: { exam: {...} } or directly the exam object
      const examData = data?.exam || data;
      
      if (!examData) {
        throw new Error('Exam not found');
      }

      // Transform API response to match component expectations
      const transformedExam = {
        ...examData,
        id: examData._id || examData.id || examId,
        title: examData.title || 'Untitled Exam',
        description: examData.description || '',
        createdAt: examData.created_at || examData.createdAt,
        updatedAt: examData.updated_at || examData.updatedAt,
        createdBy: examData.created_by?.name || examData.created_by || examData.createdBy || 'Unknown',
        createdByEmail: examData.created_by?.email || examData.createdByEmail,
        isPublic: examData.isPublic !== undefined ? examData.isPublic : false,
        flashcards: Array.isArray(examData.flashcards) ? examData.flashcards : [],
        totalQuestions: examData.total_questions || (Array.isArray(examData.flashcards) ? examData.flashcards.length : 0),
        timeLimit: examData.time_limit || examData.duration || 60,
        subject: examData.subject || 'General'
      };

      setExam(transformedExam);
      setError(''); // Clear any previous errors
    } catch (err) {
      // Only log error once to avoid spam
      if (!has404ErrorRef.current) {
        console.error('Failed to load exam:', err);
      }
      
      const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || 'Không thể tải thông tin kỳ thi. Vui lòng thử lại.';
      
      // Nếu là lỗi 404, hiển thị thông báo rõ ràng hơn và marquer comme 404
      if (err?.status === 404 || err?.response?.status === 404 || 
          err?.message?.includes('404') || 
          err?.message?.includes('Cannot GET') ||
          errorMessage.includes('404') ||
          errorMessage.includes('không tồn tại')) {
        has404ErrorRef.current = true; // Mark as 404 to prevent retries
        setError('Kỳ thi không tồn tại hoặc bạn không có quyền truy cập.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [id]);

  useEffect(() => {
    // Reset 404 flag when ID changes
    has404ErrorRef.current = false;
    
    if (id) {
      loadExam();
    } else {
      setIsLoading(false);
      setError('Exam ID is required');
    }
    // Only depend on id, not loadExam to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEditModal = () => {
    if (!exam) return;
    
    setEditForm({
      title: exam.title || '',
      description: exam.description || '',
      time_limit: exam.timeLimit || 60,
      isPublic: exam.isPublic || false
    });
    setShowEditModal(true);
    setError('');
  };

  const handleEditExam = async (e) => {
    e.preventDefault();
    
    if (!editForm.title.trim()) {
      setError('Please enter an exam title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await examService.updateExam(id, {
        title: editForm.title,
        description: editForm.description,
        time_limit: Number(editForm.time_limit) || 60,
        isPublic: editForm.isPublic
      });
      
      // Reload exam data
      await loadExam();
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update exam:', err);
      setError(err.message || 'Failed to update exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await examService.deleteExam(id);
      
      // Navigate back to exams list
      navigate('/dashboard/teacher/exams');
    } catch (err) {
      console.error('Failed to delete exam:', err);
      setError(err.message || 'Failed to delete exam. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin kỳ thi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                Không thể tải kỳ thi
              </h2>
            </div>
            <p className="text-red-700 dark:text-red-400 text-center mb-2">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-500 text-center mb-4">
              ID kỳ thi: {id}
            </p>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/dashboard/teacher/exams')}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Quay lại danh sách kỳ thi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/teacher/exams')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Exams
        </button>

        {/* Exam Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {exam.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {exam.description || 'No description available'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  exam.isPublic 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400'
                }`}>
                  {exam.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {exam.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {exam.totalQuestions} Questions
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exam.timeLimit} minutes
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{exam.totalQuestions} flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Created {getTimeAgo(exam.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>By {exam.createdBy || 'You'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={openEditModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Exam
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Exam Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Limit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exam.timeLimit} min</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {exam.isPublic ? 'Public' : 'Private'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                {exam.isPublic ? (
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Flashcards in Exam ({exam.flashcards?.length || 0})
            </h2>
          </div>

          {exam.flashcards && exam.flashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exam.flashcards.map((flashcard, index) => {
                const card = typeof flashcard === 'object' ? flashcard : { question: flashcard };
                return (
                  <div
                    key={flashcard._id || flashcard.id || index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question #{index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Question:</p>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {card.question || 'No question'}
                        </p>
                      </div>
                      {card.answer && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Answer:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {card.answer}
                          </p>
                        </div>
                      )}
                      {card.explanation && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Explanation:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {card.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No flashcards in this exam
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This exam doesn't have any flashcards yet. You can add flashcards when editing the exam.
              </p>
            </div>
          )}
        </div>

        {/* Exam Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Exam Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created At</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(exam.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(exam.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created By</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {exam.createdBy || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visibility</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {exam.isPublic ? 'Public - Visible to all students' : 'Private - Only visible to you'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Exam Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleEditExam}>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Exam</h3>
                  </div>
                  
                  <div className="px-6 py-4 space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exam Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter exam title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the exam content and requirements"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Limit (minutes) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.time_limit}
                        onChange={(e) => setEditForm({ ...editForm, time_limit: parseInt(e.target.value) || 60 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="60"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublicEdit"
                        checked={editForm.isPublic}
                        onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="isPublicEdit" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Make this exam public (visible to all students)
                      </label>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setError('');
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Update Exam
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Delete Exam
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to delete "{exam.title}"?
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

