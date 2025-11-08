import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, TrendingUp, Search, FileText, Users, Clock, CheckCircle, Trash2, X, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MoreVertical, Sparkles, Loader2, Check } from 'lucide-react';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { aiService } from '../../services/aiService';

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
    { value: 'easy', label: 'Dễ', helper: 'Nhớ lại và kiến thức cơ bản' },
    { value: 'medium', label: 'Trung Bình', helper: 'Mức độ luyện tập cân bằng' },
    { value: 'hard', label: 'Khó', helper: 'Nâng cao để thành thạo' }
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
    useCustomOptions: true
  });
  const [questionList, setQuestionList] = useState([]);
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const [questionMode, setQuestionMode] = useState('create'); // 'create', 'select', or 'ai-generate'
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBankQuestions, setLoadingBankQuestions] = useState(false);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [bankTagFilter, setBankTagFilter] = useState('all');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('all');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
  const [aiGenerateForm, setAiGenerateForm] = useState({
    topic: '',
    subject: form.subject || 'Mathematics',
    difficulty: 'medium',
    count: 5,
    tag: 'other'
  });

  useEffect(() => {
    loadExams();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, filterRules]);

  const statuses = ['all', 'draft', 'scheduled', 'completed', 'graded'];
  const creationSteps = [
    { id: 1, title: 'Thông Tin Bài Thi', description: 'Nhập thông tin bài thi' },
    { id: 2, title: 'Câu Hỏi', description: 'Tạo câu hỏi' },
    { id: 3, title: 'Xác Nhận', description: 'Xác nhận & lưu' }
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
      useCustomOptions: true
    });
    setQuestionError('');
    setQuestionSuccess('');
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
          setStepError('Vui lòng nhập tiêu đề bài thi.');
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
        // Kiểm tra ngày không được trong quá khứ
        const selectedDate = new Date(form.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset giờ về 00:00:00 để so sánh chỉ ngày
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          setStepError('Ngày thi không được trong quá khứ. Vui lòng chọn ngày hôm nay hoặc ngày trong tương lai.');
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
      // Nếu đang chỉnh sửa option đã được chọn làm đáp án đúng, cập nhật answer
      if (prev.correctOption === key) {
        nextState.answer = value.trim();
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
        answer: optionValue // Luôn lấy answer từ giá trị option đã chọn
      };
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const trimmedQuestion = questionForm.question.trim();

    if (!trimmedQuestion) {
      setQuestionError('Vui lòng nhập câu hỏi.');
      return;
    }

    if (!questionTagOptions.includes(questionForm.tag)) {
      setQuestionError('Vui lòng chọn thể loại hợp lệ.');
      return;
    }

    if (!questionDifficultyOptions.some((option) => option.value === questionForm.difficulty)) {
      setQuestionError('Vui lòng chọn độ khó.');
      return;
    }

    // Luôn dùng multiple choice
    const trimmedOptions = Object.entries(questionForm.options || {}).reduce((acc, [key, value]) => {
      acc[key] = (value || '').trim();
      return acc;
    }, { ...emptyOptions });

    const missingOption = Object.entries(trimmedOptions).find(([, value]) => !value);
    if (missingOption) {
      setQuestionError('Vui lòng điền đầy đủ tất cả các lựa chọn (A, B, C, D).');
      return;
    }

    // Đảm bảo đã chọn đáp án đúng
    if (!questionForm.correctOption) {
      setQuestionError('Vui lòng chọn đáp án đúng.');
      return;
    }

    const selectedOptionValue = trimmedOptions[questionForm.correctOption];
    if (!selectedOptionValue || !selectedOptionValue.trim()) {
      setQuestionError('Vui lòng chọn đáp án đúng.');
      return;
    }

    // Lấy answer từ giá trị option đã chọn
    const trimmedAnswer = selectedOptionValue.trim();
    const optionsPayload = trimmedOptions;

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
        correctOption: questionForm.correctOption
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
      setQuestionSuccess('Câu hỏi đã được tạo và lưu vào Question Bank thành công!');
      resetQuestionForm();
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setQuestionSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to create question:', err);
      setQuestionError(err?.message || 'Không thể tạo câu hỏi. Vui lòng thử lại.');
      setQuestionSuccess('');
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

  // Handle AI generation
  const handleAIGenerate = async () => {
    try {
      setIsAIGenerating(true);
      setQuestionError('');

      if (!aiGenerateForm.topic.trim()) {
        setQuestionError('Vui lòng nhập chủ đề');
        return;
      }

      const response = await aiService.generateQuestions(aiGenerateForm);
      const generated = response?.questions || response?.data?.questions || [];
      setAiGeneratedQuestions(generated);
    } catch (err) {
      console.error('Error generating questions:', err);
      setQuestionError(err.message || 'Không thể tạo câu hỏi bằng AI. Vui lòng thử lại.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Add AI generated questions to exam
  const handleAddAIGeneratedQuestions = (selectedIndices) => {
    const questionsToAdd = aiGeneratedQuestions
      .filter((_, index) => selectedIndices.includes(index))
      .map(q => {
        // Create question first, then add to list
        const questionId = `ai-${Date.now()}-${Math.random()}`;
        return {
          id: questionId,
          question: q.question,
          tag: q.tag,
          difficulty: q.difficulty,
          options: q.options,
          correctOption: q.correctOption,
          _temp: true, // Mark as temporary until saved
          _aiData: q // Store full data for saving
        };
      });

    setQuestionList(prev => {
      const existingIds = prev.map(q => q.id);
      const newQuestions = questionsToAdd.filter(q => !existingIds.includes(q.id));
      return [...prev, ...newQuestions];
    });
    
    setAiGeneratedQuestions([]);
    setQuestionMode('create');
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

    try {
      setIsSubmitting(true);
      setStepError('');
      setError('');

      // Save AI-generated questions to question bank first
      const aiQuestions = questionList.filter(q => q._temp && q._aiData);
      if (aiQuestions.length > 0) {
        try {
          await Promise.all(aiQuestions.map(q => questionService.createQuestion(q._aiData)));
        } catch (aiError) {
          console.error('Error saving AI questions:', aiError);
          // Continue anyway, questions might already exist
        }
      }

      // Reload questions to get IDs for AI-generated ones
      const questionIds = [];
      for (const question of questionList) {
        if (question._temp && question._aiData) {
          // Try to find the question we just created
          try {
            const response = await questionService.listMyQuestions({ 
              search: question.question.substring(0, 50) 
            });
            const found = (response?.questions || []).find(
              q => q.question === question.question
            );
            if (found) {
              questionIds.push(found._id || found.id);
            }
          } catch (err) {
            console.error('Error finding AI question:', err);
          }
        } else if (question.id && !question.id.startsWith('ai-')) {
          questionIds.push(question.id);
        }
      }

      if (questionIds.length !== questionList.length) {
        setStepError('Không thể lưu tất cả câu hỏi. Vui lòng thử lại.');
        setCurrentStep(2);
        return;
      }

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
                Quản Lý Bài Thi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Tạo, lên lịch và theo dõi các bài thi cho lớp học của bạn.
              </p>
            </div>
            <button
              onClick={openCreateModal}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo Bài Thi
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tổng Số Bài Thi</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Đã Lên Lịch</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Đã Hoàn Thành</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Điểm Trung Bình</p>
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
            Hiển thị bản ghi trong chế độ xem này
          </h3>
          
          {filterRules.length === 0 ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Trong đó</span>
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
                  <option value="title">Tiêu đề</option>
                  <option value="subject">Môn học</option>
                  <option value="status">Trạng thái</option>
                  <option value="type">Loại</option>
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
                  <option value="contains">chứa</option>
                  <option value="equals">bằng</option>
                  <option value="startsWith">bắt đầu bằng</option>
                  <option value="endsWith">kết thúc bằng</option>
                </select>
                <input
                  type="text"
                  placeholder="Nhập giá trị..."
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
                    {index === 0 ? 'Trong đó' : 'Và'}
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
                    <option value="title">Tiêu đề</option>
                    <option value="subject">Môn học</option>
                    <option value="status">Trạng thái</option>
                    <option value="type">Loại</option>
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
                    placeholder="Nhập giá trị..."
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
              Thêm bộ lọc
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
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải bài thi...</p>
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
                  Bài Thi <span className="text-orange-600 dark:text-orange-400">({filteredExams.length})</span>
            </h2>
                {selectedExams.length > 0 && (
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa ({selectedExams.length})
                  </button>
                )}
              </div>
          </div>
          
            {filteredExams.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Không tìm thấy bài thi</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Hãy điều chỉnh bộ lọc để xem thêm kết quả.'
                    : 'Bắt đầu bằng cách tạo bài thi đầu tiên của bạn.'}
                </p>
                {!searchTerm && selectedStatus === 'all' && (
                  <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Tạo Bài Thi Đầu Tiên
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
                    Chi Tiết Bài Thi
                          {getSortIcon('title')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Lớp
                  </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Ngày
                          {getSortIcon('date')}
                        </div>
                  </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Thời Lượng
                  </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Học Sinh
                  </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Điểm TB
                  </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                    Trạng Thái
                          {getSortIcon('status')}
                        </div>
                  </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Thao Tác
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
                            {exam.subject} • {exam.totalQuestions} câu hỏi
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
                        {exam.duration} phút
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {exam.completedStudents}/{exam.enrolledStudents}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        đã hoàn thành
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
                          title="Xem Chi Tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}`)}
                          className="w-9 h-9 flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Chỉnh Sửa Bài Thi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(exam)}
                          className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                          title="Xóa Bài Thi"
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
                    Hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                    {' - '}
                    <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, sortedExams.length)}</span>
                    {' trong '}
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
                      Trước
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
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
                      Sau
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
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 via-orange-50 to-amber-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Tạo Bài Thi Mới</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Điền thông tin bên dưới để tạo bài thi của bạn</p>
                    </div>
                    <button
                      onClick={closeCreateModal}
                      className="p-2 hover:bg-orange-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {creationSteps.map((step) => {
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-200 ${
                            isActive
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-400 dark:from-orange-900/30 dark:to-orange-800/20 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
                              : isCompleted
                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-500 dark:from-green-900/30 dark:to-green-800/20'
                                : 'border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60'
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 scale-110'
                                : isCompleted
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {step.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${
                              isActive 
                                ? 'text-orange-700 dark:text-orange-300' 
                                : isCompleted
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-700 dark:text-gray-300'
                            }`}>{step.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="px-6 py-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50">
                  {stepError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {stepError}
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-orange-800/5 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30">
                        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">Thông Tin Bài Thi</h4>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Cung cấp thông tin cơ bản về bài thi của bạn</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Tiêu Đề Bài Thi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                          placeholder="Nhập tiêu đề bài thi"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Môn Học <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.subject}
                            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                          >
                            <option value="">Chọn môn học</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Biology">Biology</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="English">English</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Lớp <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.className}
                            onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                          >
                            <option value="">Chọn lớp</option>
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
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Ngày <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={form.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              const today = new Date().toISOString().split('T')[0];
                              if (selectedDate < today) {
                                setStepError('Ngày thi không được trong quá khứ. Vui lòng chọn ngày hôm nay hoặc ngày trong tương lai.');
                              } else {
                                setStepError('');
                              }
                              setForm((prev) => ({ ...prev, date: selectedDate }));
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Giờ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Thời Lượng (phút) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={form.time_limit}
                            onChange={(e) => setForm((prev) => ({ ...prev, time_limit: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                            placeholder="90"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Tổng Số Câu Hỏi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={form.totalQuestions}
                            onChange={(e) => setForm((prev) => ({ ...prev, totalQuestions: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                            placeholder="25"
                          />
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2 py-1.5">
                            Chúng tôi sẽ xác minh với số câu hỏi thực tế ở bước cuối cùng.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Mô Tả
                        </label>
                        <textarea
                          rows={3}
                          value={form.description}
                          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-500 resize-none"
                          placeholder="Mô tả nội dung và yêu cầu của bài thi"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-2xl p-6 bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-orange-50/30 dark:from-orange-900/10 dark:via-orange-800/5 dark:to-orange-900/10">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                        <div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Tạo Câu Hỏi</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Thêm câu hỏi trắc nghiệm cho bài thi này. Các câu hỏi đã lưu sẽ được lưu vào ngân hàng để sử dụng sau này.
                          </p>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200/50 dark:shadow-orange-900/30">
                          Đã thêm {questionList.length}
                        </span>
                      </div>

                      {/* Mode Tabs */}
                      <div className="mb-6 flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setQuestionMode('create')}
                          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-3 relative ${
                            questionMode === 'create'
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                              : 'border-transparent text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50/30 dark:hover:bg-orange-900/10'
                          }`}
                        >
                          Tạo Mới
                          {questionMode === 'create' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionMode('select')}
                          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-3 relative ${
                            questionMode === 'select'
                              ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                              : 'border-transparent text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50/30 dark:hover:bg-orange-900/10'
                          }`}
                        >
                          Chọn Từ Ngân Hàng
                          {questionMode === 'select' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionMode('ai-generate');
                            setAiGenerateForm({
                              topic: '',
                              subject: form.subject || 'Mathematics',
                              difficulty: 'medium',
                              count: 5,
                              tag: 'other'
                            });
                            setAiGeneratedQuestions([]);
                          }}
                          className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-3 relative flex items-center gap-1.5 ${
                            questionMode === 'ai-generate'
                              ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                              : 'border-transparent text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-900/10'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                          Tạo Bằng AI
                          {questionMode === 'ai-generate' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600"></span>
                          )}
                        </button>
                      </div>

                      {/* Create New Mode */}
                      {questionMode === 'create' && (
                      <form onSubmit={handleAddQuestion} className="space-y-6">
                        {questionError && (
                          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 shadow-md">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">{questionError}</p>
                          </div>
                        )}

                        {questionSuccess && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4 shadow-md">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {questionSuccess}
                            </p>
                          </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" />
                            Nội Dung Câu Hỏi <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-inner hover:border-gray-300 dark:hover:border-gray-500 resize-none"
                            placeholder="Nhập nội dung câu hỏi đầy đủ..."
                            required
                          />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                              Thể Loại <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2.5">
                              {questionTagOptions.map((tag) => {
                                const isActive = questionForm.tag === tag;
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setQuestionForm({ ...questionForm, tag })}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 transform ${
                                      isActive
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 dark:shadow-orange-900/50 scale-105 ring-2 ring-orange-300 dark:ring-orange-700'
                                        : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-105'
                                    }`}
                                  >
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Độ Khó <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2.5">
                              {questionDifficultyOptions.map((option) => {
                                const isSelected = questionForm.difficulty === option.value;
                                const difficultyColors = {
                                  easy: 'from-green-500 to-emerald-500',
                                  medium: 'from-yellow-500 to-orange-500',
                                  hard: 'from-red-500 to-rose-600'
                                };
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setQuestionForm({ ...questionForm, difficulty: option.value })}
                                    className={`px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 transform ${
                                      isSelected
                                        ? `bg-gradient-to-r ${difficultyColors[option.value]} text-white shadow-lg scale-105 ring-2 ring-opacity-50 ${
                                            option.value === 'easy' ? 'ring-green-300 dark:ring-green-700' :
                                            option.value === 'medium' ? 'ring-yellow-300 dark:ring-yellow-700' :
                                            'ring-red-300 dark:ring-red-700'
                                          }`
                                        : 'border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-105'
                                    }`}
                                  >
                                    <span className="block">{option.label}</span>
                                    <span className="block text-[10px] sm:text-[11px] font-normal mt-0.5 opacity-90">
                                      {option.helper}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                            <span className="text-gray-400">💡</span>
                            Giải Thích <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(tùy chọn)</span>
                          </label>
                          <textarea
                            rows={3}
                            value={questionForm.explanation}
                            onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-inner hover:border-gray-300 dark:hover:border-gray-500 resize-none"
                            placeholder="Thêm ghi chú giải đáp hoặc mẹo giảng dạy..."
                          />
                        </div>

                        <div className="bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-orange-50/50 dark:from-orange-900/10 dark:via-orange-800/5 dark:to-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-5 shadow-md">
                          <div className="mb-4">
                            <h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                              <span className="text-orange-500">📋</span>
                              Multiple Choice Options <span className="text-red-500">*</span>
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Nhập các lựa chọn A–D và chọn đáp án đúng.</p>
                          </div>

                          <div className="mt-5 space-y-5 bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-orange-200 dark:border-orange-800">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {optionKeys.map((key) => (
                                <div key={key} className="space-y-2">
                                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      questionForm.correctOption === key
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {key}
                                    </span>
                                    Lựa Chọn {key} <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={questionForm.options?.[key] || ''}
                                    onChange={(e) => updateQuestionOption(key, e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400 transition-all shadow-inner hover:border-gray-300 dark:hover:border-gray-500"
                                    placeholder={`Nhập lựa chọn ${key}...`}
                                    required
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Chọn đáp án đúng <span className="text-red-500">*</span>
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {optionKeys.map((key) => {
                                  const optionValue = (questionForm.options?.[key] || '').trim();
                                  const isSelected = questionForm.correctOption === key;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      disabled={!optionValue}
                                      onClick={() => selectCorrectOption(key)}
                                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 transform ${
                                        isSelected
                                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/50 dark:shadow-emerald-900/50 scale-110 ring-2 ring-green-300 dark:ring-green-700'
                                          : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-105'
                                      } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                    >
                                      {key}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4 -mx-1">
                          <button
                            type="button"
                            onClick={resetQuestionForm}
                            className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            ↻ Đặt Lại
                          </button>
                          <button
                            type="submit"
                            disabled={isQuestionSubmitting}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/50 dark:hover:shadow-orange-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                          >
                            {isQuestionSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Lưu Câu Hỏi
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
                                              Đúng: {question.correctOption}
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

                      {/* AI Generate Mode */}
                      {questionMode === 'ai-generate' && (
                        <div className="space-y-4">
                          {aiGeneratedQuestions.length === 0 ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Chủ đề <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={aiGenerateForm.topic}
                                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, topic: e.target.value })}
                                    placeholder="Ví dụ: Quadratic Equations, Geometry..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Môn học
                                  </label>
                                  <select
                                    value={aiGenerateForm.subject}
                                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="English">English</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Độ khó
                                  </label>
                                  <select
                                    value={aiGenerateForm.difficulty}
                                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, difficulty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="easy">Dễ</option>
                                    <option value="medium">Trung Bình</option>
                                    <option value="hard">Khó</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Số lượng (1-10)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={aiGenerateForm.count}
                                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, count: parseInt(e.target.value) || 5 })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Thể loại
                                  </label>
                                  <select
                                    value={aiGenerateForm.tag}
                                    onChange={(e) => setAiGenerateForm({ ...aiGenerateForm, tag: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    {questionTagOptions.map(tag => (
                                      <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {questionError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                                  <p className="text-sm text-red-700 dark:text-red-300">{questionError}</p>
                                </div>
                              )}

                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={handleAIGenerate}
                                  disabled={isAIGenerating || !aiGenerateForm.topic.trim()}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isAIGenerating ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Đang tạo...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4" />
                                      Tạo Câu Hỏi
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                  ✅ Đã tạo {aiGeneratedQuestions.length} câu hỏi thành công!
                                </p>
                              </div>

                              <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                                {aiGeneratedQuestions.map((question, index) => (
                                  <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4"
                                  >
                                    <div className="mb-2 flex items-start justify-between">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {index + 1}. {question.question}
                                      </p>
                                      <input
                                        type="checkbox"
                                        defaultChecked
                                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        id={`ai-exam-q-${index}`}
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
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAiGeneratedQuestions([]);
                                    setQuestionError('');
                                  }}
                                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Tạo lại
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const selectedIndices = aiGeneratedQuestions.map((_, i) => i);
                                    handleAddAIGeneratedQuestions(selectedIndices);
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                                >
                                  <Check className="w-4 h-4" />
                                  Thêm vào bài thi
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {questionList.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Câu hỏi trong bài thi này</h5>
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
                                        Đúng: {question.correctOption}
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
                                  Xóa
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
                      <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-orange-800/5 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800">
                        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">Xem Lại & Xác Nhận</h4>
                        <p className="text-xs text-orange-600 dark:text-orange-400">Vui lòng xem lại tất cả chi tiết trước khi tạo bài thi</p>
                      </div>

                      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">Tổng Quan Bài Thi</h4>
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Tiêu Đề</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">{form.title || '-'}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Môn Học</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">{form.subject || '-'}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Lớp</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">{form.className || '-'}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Ngày & Giờ</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">
                              {form.date || '-'} {form.time ? `• ${form.time}` : ''}
                            </dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Thời Lượng</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">{form.time_limit ? `${form.time_limit} phút` : '-'}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Số Câu Hỏi Dự Kiến</dt>
                            <dd className="text-gray-900 dark:text-white font-medium">
                              {hasPlannedQuestionCount ? plannedQuestionCount : questionList.length}
                            </dd>
                          </div>
                        </dl>
                        {form.description && (
                          <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-700/60 p-4 border border-gray-200 dark:border-gray-600">
                            <dt className="font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide mb-2">Mô Tả</dt>
                            <dd className="text-sm text-gray-700 dark:text-gray-300">{form.description}</dd>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">Tóm Tắt Câu Hỏi</h4>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-200/50 dark:shadow-orange-900/30">
                            {questionList.length}
                            <span className="text-orange-100">
                              / {hasPlannedQuestionCount ? plannedQuestionCount : questionList.length}
                            </span>
                          </span>
                        </div>

                        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
                          {questionList.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có câu hỏi nào được thêm.</p>
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
                                    Đúng: {question.correctOption}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasPlannedQuestionCount && plannedQuestionCount !== questionList.length && (
                          <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-xs text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-200">
                            Số câu hỏi đã thêm không khớp với tổng số dự kiến. Bạn có thể quay lại để điều chỉnh trước khi xác nhận.
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
                
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-orange-50/30 dark:from-gray-800 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? closeCreateModal : prevStep}
                    className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {currentStep === 1 ? 'Hủy' : '← Quay Lại'}
                  </button>
                  <div className="flex w-full sm:w-auto gap-3">
                    {currentStep < creationSteps.length && (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 dark:hover:shadow-orange-900/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Sau Step →
                      </button>
                    )}
                    {currentStep === creationSteps.length && (
                      <button
                        type="button"
                        onClick={handleCreateExam}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 dark:hover:shadow-orange-900/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Tạo Bài Thi
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
                    Xóa {selectedExams.length} Bài Thi
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa {selectedExams.length} bài thi đã chọn không?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Hành động này không thể hoàn tác.
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
                    Hủy
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa {selectedExams.length} Bài Thi
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
                    Xóa Bài Thi
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa "{examToDelete.title}" không?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Hành động này không thể hoàn tác.
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
                    Hủy
                  </button>
                  <button 
                    onClick={handleDeleteExam}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa Bài Thi
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
