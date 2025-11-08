import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, TrendingUp, Search, FileText, Users, Clock, CheckCircle, Trash2, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';

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
  const defaultFormState = {
    title: '',
    description: '',
    subject: '',
    className: '',
    date: '',
    time: '',
    time_limit: '90',
    totalQuestions: '1',
    isPublic: true
  };
  const [form, setForm] = useState(defaultFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedExams, setSelectedExams] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterRules, setFilterRules] = useState([]);
  const [tempFilter, setTempFilter] = useState({ field: 'title', operator: 'contains', value: '' });
  const questionTagOptions = ['geometry', 'algebra', 'probability', 'calculus', 'statistics', 'other'];
  const questionDifficultyOptions = [
    { value: 'easy', label: 'Easy', helper: 'Recall and fundamentals' },
    { value: 'medium', label: 'Medium', helper: 'Balanced practice level' },
    { value: 'hard', label: 'Hard', helper: 'Stretch for mastery' }
  ];
  const optionKeys = ['A', 'B', 'C', 'D'];
  const emptyOptions = { A: '', B: '', C: '', D: '' };
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    explanation: '',
    tag: 'algebra',
    difficulty: 'medium',
    options: { ...emptyOptions },
    correctOption: 'A',
    useCustomOptions: false
  });
  const [questionList, setQuestionList] = useState([]);
  const [questionError, setQuestionError] = useState('');
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const [questionMode, setQuestionMode] = useState('create'); // 'create' or 'select'
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [bankTagFilter, setBankTagFilter] = useState('all');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('all');

  useEffect(() => {
    loadExams();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, filterRules]);

  const statuses = ['all', 'draft', 'scheduled', 'completed', 'graded'];
  const creationSteps = [
    { id: 1, title: 'Exam Details', description: 'Nhập thông tin kỳ thi' },
    { id: 2, title: 'Questions', description: 'Tạo câu hỏi' },
    { id: 3, title: 'Confirm', description: 'Xác nhận & lưu' }
  ];
  const plannedQuestionCount = Number(form.totalQuestions);
  const hasPlannedQuestionCount = Boolean(form.totalQuestions) && !Number.isNaN(plannedQuestionCount);

  const filteredExams = exams.filter(exam => {
    // Apply filter rules
    if (filterRules.length > 0) {
      const matchesAllRules = filterRules.every(rule => {
        if (!rule.value) return true; // Skip empty rules
        
        const examValue = String(exam[rule.field] || '').toLowerCase();
        const filterValue = rule.value.toLowerCase();
        
        switch (rule.operator) {
          case 'contains':
            return examValue.includes(filterValue);
          case 'equals':
            return examValue === filterValue;
          case 'startsWith':
            return examValue.startsWith(filterValue);
          case 'endsWith':
            return examValue.endsWith(filterValue);
          default:
            return true;
        }
      });
      if (!matchesAllRules) return false;
    }
    
    // Apply search term (if no filter rules)
    if (filterRules.length === 0 && searchTerm) {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Apply status filter
    const matchesStatus = selectedStatus === 'all' || exam.status === selectedStatus;
    return matchesStatus;
  });

  // Sort exams
  const sortedExams = [...filteredExams].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedExams.map(exam => exam.id);
      setSelectedExams(prev => {
        const newSelection = [...prev];
        pageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      const pageIds = paginatedExams.map(exam => exam.id);
      setSelectedExams(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectExam = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Delete all selected exams
      await Promise.all(selectedExams.map(id => examService.deleteExam(id)));
      
      // Reload exams list
      await loadExams();
      
      // Clear selection and reset to first page
      setSelectedExams([]);
      setCurrentPage(1);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete exams:', err);
      setError(err.message || 'Failed to delete exams. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" />
      : <ArrowDown className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" />;
  };

  // Pagination calculations
  const totalPages = Math.ceil(sortedExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExams = sortedExams.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Clear selection when changing page
    setSelectedExams([]);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedExams([]);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      answer: '',
      explanation: '',
      tag: 'algebra',
      difficulty: 'medium',
      options: { ...emptyOptions },
      correctOption: 'A',
      useCustomOptions: false
    });
    setQuestionError('');
  };

  // Load questions from bank
  const loadBankQuestions = async () => {
    try {
      setLoadingBankQuestions(true);
      const params = {};
      if (bankSearchTerm) params.search = bankSearchTerm;
      if (bankTagFilter !== 'all') params.tag = bankTagFilter;
      if (bankDifficultyFilter !== 'all') params.difficulty = bankDifficultyFilter;
      
      const response = await questionService.listMyQuestions(params);
      const questionsList = response?.questions || response?.data?.questions || (Array.isArray(response) ? response : []);
      setBankQuestions(questionsList);
    } catch (err) {
      console.error('Error loading bank questions:', err);
      setQuestionError(err.message || 'Không thể tải câu hỏi từ ngân hàng');
    } finally {
      setLoadingBankQuestions(false);
    }
  };

  // Load bank questions when switching to select mode
  useEffect(() => {
    if (questionMode === 'select' && showCreateModal) {
      const loadQuestions = async () => {
        try {
          setLoadingBankQuestions(true);
          const params = {};
          if (bankSearchTerm) params.search = bankSearchTerm;
          if (bankTagFilter !== 'all') params.tag = bankTagFilter;
          if (bankDifficultyFilter !== 'all') params.difficulty = bankDifficultyFilter;
          
          const response = await questionService.listMyQuestions(params);
          const questionsList = response?.questions || response?.data?.questions || (Array.isArray(response) ? response : []);
          setBankQuestions(questionsList);
        } catch (err) {
          console.error('Error loading bank questions:', err);
          setQuestionError(err.message || 'Không thể tải câu hỏi từ ngân hàng');
        } finally {
          setLoadingBankQuestions(false);
        }
      };
      loadQuestions();
    }
  }, [questionMode, showCreateModal, bankSearchTerm, bankTagFilter, bankDifficultyFilter]);

  const openCreateModal = () => {
    setForm({ ...defaultFormState });
    setQuestionList([]);
    resetQuestionForm();
    setCurrentStep(1);
    setStepError('');
    setError('');
    setQuestionMode('create');
    setSelectedBankQuestions([]);
    setBankSearchTerm('');
    setBankTagFilter('all');
    setBankDifficultyFilter('all');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCurrentStep(1);
    setStepError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: {
        if (!form.title.trim()) {
          setStepError('Vui lòng nhập tiêu đề kỳ thi.');
          return false;
        }
        if (!form.subject) {
          setStepError('Vui lòng chọn môn học.');
          return false;
        }
        if (!form.className) {
          setStepError('Vui lòng chọn lớp.');
          return false;
        }
        if (!form.date) {
          setStepError('Vui lòng chọn ngày thi.');
          return false;
        }
        if (!form.time) {
          setStepError('Vui lòng chọn giờ thi.');
          return false;
        }
        const parsedDuration = Number(form.time_limit);
        if (!parsedDuration || parsedDuration <= 0) {
          setStepError('Thời lượng phải lớn hơn 0 phút.');
          return false;
        }
        const plannedQuestions = Number(form.totalQuestions);
        if (!plannedQuestions || plannedQuestions <= 0) {
          setStepError('Số câu hỏi dự kiến phải lớn hơn 0.');
          return false;
        }
        setStepError('');
        return true;
      }
      case 2: {
        if (questionList.length === 0) {
          setStepError('Vui lòng thêm ít nhất một câu hỏi.');
          return false;
        }
        setStepError('');
        return true;
      }
      default:
        setStepError('');
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, creationSteps.length));
    }
  };

  const prevStep = () => {
    setStepError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleCustomOptions = () => {
    setQuestionForm((prev) => {
      const toggled = !prev.useCustomOptions;
      const nextOptions = toggled ? { ...prev.options } : { ...emptyOptions };
      return {
        ...prev,
        useCustomOptions: toggled,
        options: nextOptions,
        correctOption: toggled ? prev.correctOption : 'A',
        answer: toggled && prev.correctOption
          ? (typeof nextOptions[prev.correctOption] === 'string'
              ? nextOptions[prev.correctOption].trim()
              : prev.answer)
          : prev.answer
      };
    });
  };

  const updateQuestionOption = (key, value) => {
    setQuestionForm((prev) => {
      const updatedOptions = { ...prev.options, [key]: value };
      const nextState = {
        ...prev,
        options: updatedOptions
      };
      if (prev.useCustomOptions && prev.correctOption === key) {
        nextState.answer = value;
      }
      return nextState;
    });
  };

  const selectCorrectOption = (key) => {
    setQuestionForm((prev) => {
      const optionValue = (prev.options?.[key] || '').trim();
      return {
        ...prev,
        correctOption: key,
        answer: prev.useCustomOptions && optionValue ? optionValue : prev.answer
      };
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const trimmedQuestion = questionForm.question.trim();
    let trimmedAnswer = questionForm.answer.trim();

    if (!trimmedQuestion || !trimmedAnswer) {
      setQuestionError('Please provide both a question and the correct answer.');
      return;
    }

    if (!questionTagOptions.includes(questionForm.tag)) {
      setQuestionError('Please choose a valid tag.');
      return;
    }

    if (!questionDifficultyOptions.some((option) => option.value === questionForm.difficulty)) {
      setQuestionError('Please select a difficulty level.');
      return;
    }

    let optionsPayload;
    if (questionForm.useCustomOptions) {
      const trimmedOptions = Object.entries(questionForm.options || {}).reduce((acc, [key, value]) => {
        acc[key] = (value || '').trim();
        return acc;
      }, { ...emptyOptions });

      const missingOption = Object.entries(trimmedOptions).find(([, value]) => !value);
      if (missingOption) {
        setQuestionError('Please complete all multiple choice options (A, B, C, D).');
        return;
      }

      const selectedOptionValue = trimmedOptions[questionForm.correctOption];
      if (!selectedOptionValue) {
        setQuestionError('Correct option must match one of the custom choices.');
        return;
      }

      trimmedAnswer = selectedOptionValue.trim();
      optionsPayload = trimmedOptions;
    }

    try {
      setIsQuestionSubmitting(true);
      setQuestionError('');

      const payload = {
        question: trimmedQuestion,
        answer: trimmedAnswer,
        tag: questionForm.tag,
        difficulty: questionForm.difficulty,
        explanation: questionForm.explanation?.trim() || undefined,
        options: optionsPayload,
        correctOption: optionsPayload ? questionForm.correctOption : undefined
      };

      const response = await questionService.createQuestion(payload);
      const created = response?.question || response?.data?.question || response;
      const createdId = created?._id || created?.id;
      if (!createdId) {
        throw new Error('Question created but no ID was returned.');
      }
      const normalizedQuestion = {
        id: createdId,
        question: created?.question || trimmedQuestion,
        tag: created?.tag || questionForm.tag,
        difficulty: created?.difficulty || questionForm.difficulty,
        options: created?.options || optionsPayload,
        correctOption: created?.correctOption || (optionsPayload ? questionForm.correctOption : undefined)
      };

      setQuestionList((prev) => [...prev, normalizedQuestion]);
      setStepError('');
      resetQuestionForm();
    } catch (err) {
      console.error('Failed to create question:', err);
      setQuestionError(err?.message || 'Failed to create question. Please try again.');
    } finally {
      setIsQuestionSubmitting(false);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestionList((prev) => prev.filter((question) => question.id !== questionId));
  };

  // Toggle bank question selection
  const toggleBankQuestionSelection = (questionId) => {
    setSelectedBankQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Add selected bank questions to exam
  const handleAddSelectedBankQuestions = () => {
    const questionsToAdd = bankQuestions
      .filter(q => selectedBankQuestions.includes(q._id || q.id))
      .map(q => ({
        id: q._id || q.id,
        question: q.question,
        tag: q.tag,
        difficulty: q.difficulty,
        options: q.options,
        correctOption: q.correctOption
      }));

    setQuestionList(prev => {
      const existingIds = prev.map(q => q.id);
      const newQuestions = questionsToAdd.filter(q => !existingIds.includes(q.id));
      return [...prev, ...newQuestions];
    });
    
    setSelectedBankQuestions([]);
  };

  // Filtered bank questions
  const filteredBankQuestions = bankQuestions.filter(q => {
    const matchesSearch = !bankSearchTerm || 
      q.question?.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
      q.answer?.toLowerCase().includes(bankSearchTerm.toLowerCase());
    return matchesSearch;
  });

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
      
      // Remove from selected if it was selected
      setSelectedExams(prev => prev.filter(id => id !== examToDelete.id));
      
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

  const handleCreateExam = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }

    const plannedQuestions = Number(form.totalQuestions);
    if (plannedQuestions > 0 && plannedQuestions !== questionList.length) {
      setStepError('Số câu hỏi thực tế chưa khớp với kế hoạch. Vui lòng điều chỉnh trước khi xác nhận.');
      setCurrentStep(3);
      return;
    }

    const questionIds = questionList.map((question) => question.id).filter(Boolean);
    if (questionIds.length !== questionList.length) {
      setStepError('Không xác định được ID của một số câu hỏi. Vui lòng thử lại.');
      setCurrentStep(2);
      return;
    }

    try {
      setIsSubmitting(true);
      setStepError('');
      setError('');

      await examService.createExam({
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject,
        'class': form.className,
        date: form.date,
        time: form.time,
        time_limit: Number(form.time_limit) || 90,
        isPublic: form.isPublic,
        totalQuestions: plannedQuestions || questionList.length,
        questions: questionIds
      });

      await loadExams();
      setForm({ ...defaultFormState });
      setQuestionList([]);
      resetQuestionForm();
      closeCreateModal();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to create exam');
      setCurrentStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Exam Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Create, schedule, and monitor examinations for your classes.
              </p>
            </div>
            <button
              onClick={openCreateModal}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
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

        {/* Filter Bar */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            In this view show records
          </h3>
          
          {filterRules.length === 0 ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Where</span>
                <select
                  value={tempFilter.field}
                  onChange={(e) => {
                    setTempFilter({ ...tempFilter, field: e.target.value });
                    if (tempFilter.value) {
                      setFilterRules([{ ...tempFilter, field: e.target.value }]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="title">Title</option>
                  <option value="subject">Subject</option>
                  <option value="status">Status</option>
                  <option value="type">Type</option>
                </select>
                <select
                  value={tempFilter.operator}
                  onChange={(e) => {
                    setTempFilter({ ...tempFilter, operator: e.target.value });
                    if (tempFilter.value) {
                      setFilterRules([{ ...tempFilter, operator: e.target.value }]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="startsWith">starts with</option>
                  <option value="endsWith">ends with</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter value..."
                  value={tempFilter.value}
                  onChange={(e) => {
                    const newTemp = { ...tempFilter, value: e.target.value };
                    setTempFilter(newTemp);
                    if (e.target.value.trim()) {
                      setFilterRules([newTemp]);
                    } else {
                      setFilterRules([]);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {filterRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {index === 0 ? 'Where' : 'And'}
                  </span>
                  <select
                    value={rule.field}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].field = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="subject">Subject</option>
                    <option value="status">Status</option>
                    <option value="type">Type</option>
                  </select>
              <select
                    value={rule.operator}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].operator = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="startsWith">starts with</option>
                    <option value="endsWith">ends with</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter value..."
                    value={rule.value}
                    onChange={(e) => {
                      const newRules = [...filterRules];
                      newRules[index].value = e.target.value;
                      setFilterRules(newRules);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newRules = filterRules.filter((_, i) => i !== index);
                      setFilterRules(newRules);
                      if (newRules.length === 0) {
                        setTempFilter({ field: 'title', operator: 'contains', value: '' });
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setFilterRules([...filterRules, { field: 'title', operator: 'contains', value: '' }]);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add filter
            </button>
            {filterRules.length > 0 && (
              <button
                onClick={() => {
                  setFilterRules([]);
                  setTempFilter({ field: 'title', operator: 'contains', value: '' });
                  setSearchTerm('');
                  setSelectedStatus('all');
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear all filters
              </button>
            )}
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
              <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Exams <span className="text-orange-600 dark:text-orange-400">({filteredExams.length})</span>
            </h2>
                {selectedExams.length > 0 && (
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedExams.length})
                  </button>
                )}
              </div>
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
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
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
                        <input
                          type="checkbox"
                          checked={selectedExams.length === paginatedExams.length && paginatedExams.length > 0 && paginatedExams.every(exam => selectedExams.includes(exam.id))}
                          onChange={handleSelectAll}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                    Exam Details
                          {getSortIcon('title')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Class
                  </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          {getSortIcon('date')}
                        </div>
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
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                    Status
                          {getSortIcon('status')}
                        </div>
                  </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedExams.map((exam) => (
                      <tr 
                        key={exam.id} 
                        className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                          selectedExams.includes(exam.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedExams.includes(exam.id)}
                        onChange={() => handleSelectExam(exam.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
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
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {exam.class || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatDate(exam.date)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.duration} minutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.completedStudents}/{exam.enrolledStudents}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      {exam.avgScore > 0 ? (
                        <span className={`text-sm font-medium ${getScoreColor(exam.avgScore)}`}>
                          {exam.avgScore}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}
                          className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}
                          className="w-9 h-9 flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Edit Exam"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(exam)}
                          className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {exam.status === 'completed' && (
                          <button className="w-9 h-9 flex items-center justify-center text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" title="Grade Exam">
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

            {/* Pagination */}
            {sortedExams.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                    {' - '}
                    <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, sortedExams.length)}</span>
                    {' of '}
                    <span className="font-medium text-gray-900 dark:text-white">{sortedExams.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        currentPage === 1
                          ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        currentPage === totalPages
                          ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
        )}

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={closeCreateModal}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Exam</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Fill in the details below</p>
                    </div>
                    <button
                      onClick={closeCreateModal}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {creationSteps.map((step) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${
                            isActive
                              ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/30'
                              : isCompleted
                                ? 'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/30'
                                : 'border-gray-200 dark:border-gray-600 bg-white/40 dark:bg-gray-800/40'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {step.id}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{step.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="px-6 py-4 space-y-5">
                  {stepError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {stepError}
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Exam Title
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter exam title"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject
                          </label>
                          <select
                            value={form.subject}
                            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
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
                          <select
                            value={form.className}
                            onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={form.time_limit}
                            onChange={(e) => setForm((prev) => ({ ...prev, time_limit: e.target.value }))}
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
                            min="1"
                            value={form.totalQuestions}
                            onChange={(e) => setForm((prev) => ({ ...prev, totalQuestions: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="25"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            We will verify against the actual questions in the final step.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Describe the exam content and requirements"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-5 bg-gray-50/60 dark:bg-gray-700/30">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Question Builder</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Add multiple-choice questions for this exam. Saved questions are stored in your bank for future use.
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                          {questionList.length} added
                        </span>
                      </div>

                      {/* Mode Tabs */}
                      <div className="mb-5 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setQuestionMode('create')}
                          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            questionMode === 'create'
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          Create New
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionMode('select')}
                          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            questionMode === 'select'
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          Select from Bank
                        </button>
                      </div>

                      {/* Create New Mode */}
                      {questionMode === 'create' && (
                      <form onSubmit={handleAddQuestion} className="space-y-5">
                        {questionError && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{questionError}</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Question Stem <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
                            placeholder="Type the full question prompt"
                            required
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Topic Tag <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {questionTagOptions.map((tag) => {
                                const isActive = questionForm.tag === tag;
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setQuestionForm({ ...questionForm, tag })}
                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                                      isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/60 dark:shadow-blue-900/40'
                                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-500'
                                    }`}
                                  >
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                              Difficulty <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {questionDifficultyOptions.map((option) => {
                                const isSelected = questionForm.difficulty === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setQuestionForm({ ...questionForm, difficulty: option.value })}
                                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40'
                                        : 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:border-emerald-400 dark:hover:border-emerald-500'
                                    }`}
                                  >
                                    <span>{option.label}</span>
                                    <span className="block text-[10px] sm:text-[11px] font-normal text-gray-500 dark:text-gray-400">
                                      {option.helper}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Explanation (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={questionForm.explanation}
                            onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
                            placeholder="Add solution notes or teaching tips"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Correct Answer <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={questionForm.answer}
                            onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                            disabled={questionForm.useCustomOptions}
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner ${questionForm.useCustomOptions ? 'opacity-70 cursor-not-allowed' : ''}`}
                            placeholder={questionForm.useCustomOptions ? 'Select a correct option below' : 'Enter the correct answer'}
                            required
                          />
                        </div>

                        <div className="border border-gray-200 dark:border-gray-600 rounded-2xl p-4 bg-white dark:bg-gray-800">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Custom Multiple Choice Options</h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle on to specify answer choices A–D.</p>
                            </div>
                            <button
                              type="button"
                              onClick={toggleCustomOptions}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                questionForm.useCustomOptions
                                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200/60 dark:shadow-rose-900/40'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {questionForm.useCustomOptions ? 'Disable choices' : 'Enable choices'}
                            </button>
                          </div>

                          {questionForm.useCustomOptions && (
                            <div className="mt-4 space-y-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                {optionKeys.map((key) => (
                                  <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                      Option {key}
                                    </label>
                                    <input
                                      type="text"
                                      value={questionForm.options?.[key] || ''}
                                      onChange={(e) => updateQuestionOption(key, e.target.value)}
                                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-inner"
                                      placeholder={`Enter option ${key}`}
                                      required
                                    />
                                  </div>
                                ))}
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Select correct option</p>
                                <div className="flex flex-wrap gap-2">
                                  {optionKeys.map((key) => {
                                    const optionValue = (questionForm.options?.[key] || '').trim();
                                    const isSelected = questionForm.correctOption === key;
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        disabled={!optionValue}
                                        onClick={() => selectCorrectOption(key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                          isSelected
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-emerald-200/60 dark:shadow-emerald-900/40'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        {key}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={resetQuestionForm}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Reset fields
                          </button>
                          <button
                            type="submit"
                            disabled={isQuestionSubmitting}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isQuestionSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Save Question
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                      )}

                      {/* Select from Bank Mode */}
                      {questionMode === 'select' && (
                        <div className="space-y-4">
                          {/* Search and Filters */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Tìm kiếm câu hỏi..."
                                value={bankSearchTerm}
                                onChange={(e) => setBankSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <select
                              value={bankTagFilter}
                              onChange={(e) => setBankTagFilter(e.target.value)}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="all">Tất cả thể loại</option>
                              {questionTagOptions.map(tag => (
                                <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                              ))}
                            </select>

                            <select
                              value={bankDifficultyFilter}
                              onChange={(e) => setBankDifficultyFilter(e.target.value)}
                              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="all">Tất cả độ khó</option>
                              {questionDifficultyOptions.map(diff => (
                                <option key={diff.value} value={diff.value}>{diff.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Selected Questions Actions */}
                          {selectedBankQuestions.length > 0 && (
                            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 flex items-center justify-between">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Đã chọn {selectedBankQuestions.length} câu hỏi
                              </span>
                              <button
                                type="button"
                                onClick={handleAddSelectedBankQuestions}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                              >
                                <Plus className="h-4 w-4" />
                                Thêm vào bài thi
                              </button>
                            </div>
                          )}

                          {/* Questions List */}
                          {loadingBankQuestions ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="text-center">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
                                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải câu hỏi...</p>
                              </div>
                            </div>
                          ) : filteredBankQuestions.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
                              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">Không có câu hỏi nào trong ngân hàng</p>
                            </div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                              {filteredBankQuestions.map((question) => {
                                const questionId = question._id || question.id;
                                const isSelected = selectedBankQuestions.includes(questionId);
                                const isAlreadyAdded = questionList.some(q => q.id === questionId);
                                
                                return (
                                  <div
                                    key={questionId}
                                    className={`rounded-lg border p-4 transition-all ${
                                      isSelected
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    } ${isAlreadyAdded ? 'opacity-50' : ''}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleBankQuestionSelection(questionId)}
                                        disabled={isAlreadyAdded}
                                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                          {question.question}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                            {question.tag}
                                          </span>
                                          <span className={`px-2 py-1 rounded-full ${
                                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' :
                                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                          }`}>
                                            {question.difficulty}
                                          </span>
                                          {question.correctOption && (
                                            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                                              Correct: {question.correctOption}
                                            </span>
                                          )}
                                          {isAlreadyAdded && (
                                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                              Đã thêm
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {questionList.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Questions in this exam</h5>
                          <ul className="space-y-3">
                            {questionList.map((question) => (
                              <li
                                key={question.id}
                                className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white/80 dark:bg-gray-800/70 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    {question.question}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                      {question.tag}
                                    </span>
                                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                      {question.difficulty}
                                    </span>
                                    {question.correctOption && (
                                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                                        Correct: {question.correctOption}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(question.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Exam overview</h4>
                        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Title</dt>
                            <dd className="text-gray-900 dark:text-white">{form.title || '-'}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Subject</dt>
                            <dd className="text-gray-900 dark:text-white">{form.subject || '-'}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Class</dt>
                            <dd className="text-gray-900 dark:text-white">{form.className || '-'}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Date & Time</dt>
                            <dd className="text-gray-900 dark:text-white">
                              {form.date || '-'} {form.time ? `• ${form.time}` : ''}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Duration</dt>
                            <dd className="text-gray-900 dark:text-white">{form.time_limit ? `${form.time_limit} minutes` : '-'}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Planned questions</dt>
                            <dd className="text-gray-900 dark:text-white">
                              {hasPlannedQuestionCount ? plannedQuestionCount : questionList.length}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-4 text-sm text-gray-600 dark:text-gray-300">
                          {form.description ? form.description : 'No additional description provided.'}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Question summary</h4>
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                            {questionList.length}
                            <span className="text-gray-500 dark:text-gray-400">
                              / {hasPlannedQuestionCount ? plannedQuestionCount : questionList.length}
                            </span>
                          </span>
                        </div>

                        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
                          {questionList.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No questions added yet.</p>
                          )}
                          {questionList.map((question, index) => (
                            <div
                              key={question.id}
                              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-3"
                            >
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {index + 1}. {question.question}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                  {question.tag}
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  {question.difficulty}
                                </span>
                                {question.correctOption && (
                                  <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                                    Correct: {question.correctOption}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasPlannedQuestionCount && plannedQuestionCount !== questionList.length && (
                          <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-xs text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200">
                            The number of questions added does not match the planned total. You can go back to adjust before confirming.
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? closeCreateModal : prevStep}
                    className="w-full sm:w-auto px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>
                  <div className="flex w-full sm:w-auto gap-3">
                    {currentStep < creationSteps.length && (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Next Step
                      </button>
                    )}
                    {currentStep === creationSteps.length && (
                      <button
                        type="button"
                        onClick={handleCreateExam}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Create Exam
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setShowBulkDeleteModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Delete {selectedExams.length} Exam{selectedExams.length > 1 ? 's' : ''}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to delete {selectedExams.length} selected exam{selectedExams.length > 1 ? 's' : ''}?
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
                      setShowBulkDeleteModal(false);
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
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
                        Delete {selectedExams.length} Exam{selectedExams.length > 1 ? 's' : ''}
                      </>
                    )}
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
