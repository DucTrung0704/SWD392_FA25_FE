import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter, Trash2, Edit, Eye, X, Check, AlertCircle, BookOpen, Tag, Gauge, FileText, Sparkles, Loader2 } from 'lucide-react';
import { questionService } from '../../services/questionService';
import { aiService } from '../../services/aiService';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiForm, setAiForm] = useState({
    topic: '',
    subject: 'Mathematics',
    difficulty: 'medium',
    count: 5,
    tag: 'other'
  });

  const tagOptions = ['geometry', 'algebra', 'probability', 'calculus', 'statistics', 'other'];
  const tagLabels = {
    'geometry': 'Hình học',
    'algebra': 'Đại số',
    'probability': 'Xác suất',
    'calculus': 'Giải tích',
    'statistics': 'Thống kê',
    'other': 'Khác'
  };
  const difficultyOptions = ['easy', 'medium', 'hard'];
  const difficultyLabels = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó'
  };
  const optionKeys = ['A', 'B', 'C', 'D'];

  const defaultFormState = {
    question: '',
    answer: '',
    options: { A: '', B: '', C: '', D: '' },
    correctOption: '',
    tag: 'other',
    difficulty: 'medium',
    explanation: '',
    isActive: true,
  };

  const [form, setForm] = useState(defaultFormState);

  // Load questions
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (selectedStatus !== 'all') params.isActive = selectedStatus === 'active';

      // Sử dụng API /question/teacher/all để lấy tất cả questions trong question bank chung
      const response = await questionService.listAll(params);
      const questionsList = response?.questions || response?.data?.questions || (Array.isArray(response) ? response : []);
      setQuestions(questionsList);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.message || 'Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTag, selectedDifficulty, selectedStatus]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handle create question
  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // Validate
      if (!form.question.trim()) {
        setError('Vui lòng nhập câu hỏi');
        return;
      }
      if (!form.answer.trim()) {
        setError('Vui lòng nhập đáp án');
        return;
      }
      if (!form.tag) {
        setError('Vui lòng chọn thể loại');
        return;
      }

      // If options are provided, correctOption is required
      const hasOptions = Object.values(form.options).some(opt => opt.trim());
      if (hasOptions && !form.correctOption) {
        setError('Vui lòng chọn đáp án đúng nếu có các lựa chọn');
        return;
      }

      await questionService.createQuestion(form);
      setShowCreateModal(false);
      setForm(defaultFormState);
      await loadQuestions();
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.message || 'Không thể tạo câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update question
  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!form.question.trim()) {
        setError('Vui lòng nhập câu hỏi');
        return;
      }
      if (!form.answer.trim()) {
        setError('Vui lòng nhập đáp án');
        return;
      }

      const hasOptions = Object.values(form.options).some(opt => opt.trim());
      if (hasOptions && !form.correctOption) {
        setError('Vui lòng chọn đáp án đúng nếu có các lựa chọn');
        return;
      }

      await questionService.updateQuestion(currentQuestion._id, form);
      setShowEditModal(false);
      setCurrentQuestion(null);
      setForm(defaultFormState);
      await loadQuestions();
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err.message || 'Không thể cập nhật câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete question
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await questionService.deleteQuestion(currentQuestion._id);
      setShowDeleteModal(false);
      setCurrentQuestion(null);
      await loadQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err.message || 'Không thể xóa câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await questionService.bulkDelete(selectedQuestions);
      setSelectedQuestions([]);
      setShowDeleteModal(false);
      await loadQuestions();
    } catch (err) {
      console.error('Error bulk deleting questions:', err);
      setError(err.message || 'Không thể xóa các câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (question) => {
    setCurrentQuestion(question);
    setForm({
      question: question.question || '',
      answer: question.answer || '',
      options: question.options || { A: '', B: '', C: '', D: '' },
      correctOption: question.correctOption || '',
      tag: question.tag || 'other',
      difficulty: question.difficulty || 'medium',
      explanation: question.explanation || '',
      isActive: question.isActive !== undefined ? question.isActive : true,
    });
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = async (questionId) => {
    try {
      const response = await questionService.getQuestionById(questionId);
      const question = response?.question || response?.data?.question || response;
      setCurrentQuestion(question);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading question:', err);
      setError(err.message || 'Không thể tải chi tiết câu hỏi');
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedQuestions.length === currentPageQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(currentPageQuestions.map(q => q._id || q.id));
    }
  };

  // Handle AI generation
  const handleAIGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');

      if (!aiForm.topic.trim()) {
        setError('Vui lòng nhập chủ đề');
        return;
      }

      const response = await aiService.generateQuestions(aiForm);
      const generated = response?.questions || response?.data?.questions || [];
      setGeneratedQuestions(generated);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Không thể tạo câu hỏi bằng AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated questions to bank
  const handleSaveGeneratedQuestions = async (selectedIndices) => {
    try {
      setIsSubmitting(true);
      setError('');

      const questionsToSave = generatedQuestions.filter((_, index) => selectedIndices.includes(index));
      
      // Save each question
      await Promise.all(questionsToSave.map(q => questionService.createQuestion(q)));
      
      setShowAIGenerateModal(false);
      setGeneratedQuestions([]);
      await loadQuestions();
    } catch (err) {
      console.error('Error saving questions:', err);
      setError(err.message || 'Không thể lưu câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchTerm || 
      q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((filteredQuestions.length || 0) / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, selectedDifficulty, selectedStatus]);

  if (loading && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ngân hàng câu hỏi chung - Tất cả teachers có thể xem và sử dụng
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAiForm({
                  topic: '',
                  subject: 'Mathematics',
                  difficulty: 'medium',
                  count: 5,
                  tag: 'other'
                });
                setGeneratedQuestions([]);
                setShowAIGenerateModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </button>
            <button
              onClick={() => {
                setForm(defaultFormState);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              Tạo câu hỏi mới
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả thể loại</option>
              {tagOptions.map(tag => (
                <option key={tag} value={tag}>{tagLabels[tag]}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả độ khó</option>
              {difficultyOptions.map(diff => (
                <option key={diff} value={diff}>{difficultyLabels[diff]}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã ẩn</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Đã chọn {selectedQuestions.length} câu hỏi
              </span>
              <button
                onClick={() => {
                  setCurrentQuestion({ _id: 'bulk' });
                  setShowDeleteModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Xóa đã chọn
              </button>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Không có câu hỏi nào</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.length === currentPageQuestions.length && currentPageQuestions.length > 0 && currentPageQuestions.every(q => selectedQuestions.includes(q._id || q.id))}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Câu hỏi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Thể loại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Độ khó
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {currentPageQuestions.map((question) => {
                    const isSelected = selectedQuestions.includes(question._id || question.id);
                    return (
                      <tr key={question._id || question.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(question._id || question.id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-md">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {question.question}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Tag className="h-3 w-3" />
                            {tagLabels[question.tag] || question.tag}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            <Gauge className="h-3 w-3" />
                            {difficultyLabels[question.difficulty] || question.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            question.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {question.isActive ? 'Hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openViewModal(question._id || question.id)}
                              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(question)}
                              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentQuestion(question);
                                setShowDeleteModal(true);
                              }}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredQuestions.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                  {' - '}
                  <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredQuestions.length)}</span>
                  {' trong tổng số '}
                  <span className="font-medium text-gray-900 dark:text-white">{filteredQuestions.length}</span>
                  {' câu hỏi'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      currentPage === 1
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {totalPages <= 7 ? (
                      // Hiển thị tất cả nếu <= 7 trang
                      Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-orange-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })
                    ) : (
                      // Hiển thị với dấu ... nếu > 7 trang
                      <>
                        {/* Trang đầu */}
                        <button
                          onClick={() => setCurrentPage(1)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? 'bg-orange-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          1
                        </button>
                        
                        {/* Dấu ... trước */}
                        {currentPage > 3 && (
                          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                        )}
                        
                        {/* Các trang xung quanh trang hiện tại */}
                        {Array.from({ length: 5 }, (_, i) => {
                          let pageNum;
                          if (currentPage <= 3) {
                            pageNum = i + 2; // 2, 3, 4, 5, 6
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i; // totalPages - 4, totalPages - 3, ...
                          } else {
                            pageNum = currentPage - 2 + i; // currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2
                          }
                          
                          // Chỉ hiển thị nếu không phải trang đầu hoặc cuối
                          if (pageNum <= 1 || pageNum >= totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-orange-600 text-white'
                                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {/* Dấu ... sau */}
                        {currentPage < totalPages - 2 && (
                          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                        )}
                        
                        {/* Trang cuối */}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'bg-orange-600 text-white'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      currentPage === totalPages
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Tạo câu hỏi mới' : 'Chỉnh sửa câu hỏi'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setForm(defaultFormState);
                    setError('');
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập câu hỏi..."
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Đáp án <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Nhập đáp án..."
                  />
                </div>

                {/* Multiple Choice Options */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Các lựa chọn (Tùy chọn)
                  </label>
                  <div className="space-y-2">
                    {optionKeys.map(key => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-8 text-sm font-medium text-gray-700 dark:text-gray-300">{key}.</span>
                        <input
                          type="text"
                          value={form.options[key] || ''}
                          onChange={(e) => setForm({
                            ...form,
                            options: { ...form.options, [key]: e.target.value }
                          })}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder={`Lựa chọn ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                  {Object.values(form.options).some(opt => opt.trim()) && (
                    <div className="mt-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Đáp án đúng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.correctOption}
                        onChange={(e) => setForm({ ...form, correctOption: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Chọn đáp án đúng</option>
                        {optionKeys.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tag and Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Thể loại <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {tagOptions.map(tag => (
                        <option key={tag} value={tag}>{tagLabels[tag]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Độ khó
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {difficultyOptions.map(diff => (
                        <option key={diff} value={diff}>{difficultyLabels[diff]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Giải thích (Tùy chọn)
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Giải thích đáp án..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Câu hỏi đang hoạt động
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setForm(defaultFormState);
                    setError('');
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  disabled={isSubmitting}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : showCreateModal ? 'Tạo mới' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && currentQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết câu hỏi</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setCurrentQuestion(null);
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Câu hỏi</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{currentQuestion.question}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Đáp án</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{currentQuestion.answer}</p>
                </div>
                {currentQuestion.options && Object.values(currentQuestion.options).some(opt => opt) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Các lựa chọn</label>
                    <div className="mt-1 space-y-2">
                      {optionKeys.map(key => (
                        currentQuestion.options[key] && (
                          <div key={key} className="flex items-center gap-2">
                            <span className={`w-8 rounded px-2 py-1 text-center text-sm font-medium ${
                              currentQuestion.correctOption === key
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {key}
                            </span>
                            <span className="text-gray-900 dark:text-white">{currentQuestion.options[key]}</span>
                            {currentQuestion.correctOption === key && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Thể loại</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{tagLabels[currentQuestion.tag] || currentQuestion.tag}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Độ khó</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{difficultyLabels[currentQuestion.difficulty] || currentQuestion.difficulty}</p>
                  </div>
                </div>
                {currentQuestion.explanation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giải thích</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentQuestion.explanation}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      currentQuestion.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {currentQuestion.isActive ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(currentQuestion);
                  }}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setCurrentQuestion(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Xác nhận xóa
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentQuestion?._id === 'bulk'
                      ? `Bạn có chắc chắn muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`
                      : 'Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCurrentQuestion(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={currentQuestion?._id === 'bulk' ? handleBulkDelete : handleDelete}
                  disabled={isSubmitting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Generate Modal */}
        {showAIGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generate Questions with AI
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tạo câu hỏi tự động bằng AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAIGenerateModal(false);
                    setGeneratedQuestions([]);
                    setError('');
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}

              {generatedQuestions.length === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Chủ đề cụ thể <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={aiForm.topic}
                        onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                        placeholder="Ví dụ: Phương trình bậc hai, Hình học, Đại số, Tích phân..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Nhập chủ đề cụ thể trong môn Toán để AI tạo câu hỏi chính xác hơn. Ví dụ: "Phương trình bậc hai", "Hình học tam giác", "Đại số", "Tích phân"
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Độ khó
                      </label>
                      <select
                        value={aiForm.difficulty}
                        onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lượng câu hỏi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={aiForm.count}
                        onChange={(e) => setAiForm({ ...aiForm, count: parseInt(e.target.value) || 5 })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thể loại
                      </label>
                      <select
                        value={aiForm.tag}
                        onChange={(e) => setAiForm({ ...aiForm, tag: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        {tagOptions.map(tag => (
                          <option key={tag} value={tag}>{tagLabels[tag]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAIGenerateModal(false);
                        setGeneratedQuestions([]);
                        setError('');
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAIGenerate}
                      disabled={isGenerating || !aiForm.topic.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Questions
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      ✅ Đã tạo {generatedQuestions.length} câu hỏi thành công!
                    </p>
                  </div>

                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {index + 1}. {question.question}
                          </p>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            id={`ai-q-${index}`}
                          />
                        </div>
                        {question.options && (
                          <div className="ml-4 space-y-1 text-sm">
                            {Object.entries(question.options).map(([key, value]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-2 ${
                                  question.correctOption === key
                                    ? 'font-semibold text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                <span className="font-medium">{key}.</span>
                                <span>{value}</span>
                                {question.correctOption === key && (
                                  <Check className="h-4 w-4" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            💡 {question.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setGeneratedQuestions([]);
                        setError('');
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Tạo lại
                    </button>
                    <button
                      onClick={() => {
                        const selectedIndices = generatedQuestions.map((_, i) => i);
                        handleSaveGeneratedQuestions(selectedIndices);
                      }}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Lưu tất cả vào Question Bank
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

