import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Home, Users, Clock, TrendingUp, Search, Eye, Edit, Settings, Calendar, AlertCircle, Trash2, ChevronDown, ChevronUp, BarChart3, Filter, Award, XCircle, CheckCircle, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { examService } from '../../services/examService';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  
  // Create class form state
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Expanded class and details
  const [expandedClass, setExpandedClass] = useState(null);
  const [classDetails, setClassDetails] = useState({}); // { classId: { students, exams, submissions } }
  const [examDetails, setExamDetails] = useState({}); // { examId: { title, description, ... } }
  const [studentDetails, setStudentDetails] = useState({}); // { studentId: { name, email } }
  const [loadingDetails, setLoadingDetails] = useState({}); // { classId: boolean }
  const [submissionsFilter, setSubmissionsFilter] = useState({}); // { classId: examId }
  
  // Modals
  const [showRemoveExamModal, setShowRemoveExamModal] = useState(false);
  const [examToRemove, setExamToRemove] = useState(null);
  const [isRemovingExam, setIsRemovingExam] = useState(false);
  const [removeExamError, setRemoveExamError] = useState('');
  
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [removeStudentError, setRemoveStudentError] = useState('');
  
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Function to fetch classes from API (reusable)
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await api.get('/class/teacher/my-classes');
      
      console.log('API Response:', data);
      
      if (data) {
        // Handle both array and object response formats
        const classesArray = Array.isArray(data) ? data : (data.classes || []);
        const totalCount = data.total !== undefined ? data.total : classesArray.length;
        
        // Map API response to component format
        const mappedClasses = classesArray.map((cls) => ({
          id: cls._id,
          name: cls.name || 'Unnamed Class',
          description: cls.description || 'No description',
          classCode: cls.class_code || 'N/A',
          students: Array.isArray(cls.students) ? cls.students.length : 0,
          exams: Array.isArray(cls.exams) ? cls.exams.length : 0,
          status: cls.isActive ? 'active' : 'inactive',
          createdAt: cls.created_at,
          updatedAt: cls.updated_at,
          teacher_id: cls.teacher_id,
          // Default values for fields not in API
          subject: 'General',
          grade: '10',
          schedule: 'TBD',
          room: 'TBD',
          teacher: 'Current Teacher',
          avgGrade: 0,
          attendance: 0,
          nextClass: null,
          assignments: 0
        }));
        
        setClasses(mappedClasses);
        setTotal(totalCount);
      } else {
        console.warn('No data received from API');
        setClasses([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError(err.message || 'Failed to load classes. Please try again.');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Generate class code from class name
  const generateClassCode = (name) => {
    if (!name || !name.trim()) {
      // Fallback: generate random code
      return 'CLASS' + Math.floor(1000 + Math.random() * 9000);
    }
    
    // Remove special characters but keep alphanumeric and spaces
    const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    
    let code = '';
    let hasNumbers = false;
    
    if (words.length === 0) {
      // Fallback if no valid words
      return 'CLASS' + Math.floor(1000 + Math.random() * 9000);
    } else if (words.length === 1) {
      // Single word: check if it contains numbers
      const word = words[0];
      const letterPart = word.replace(/\d/g, '');
      const numberPart = word.match(/\d+/g);
      
      if (letterPart.length > 0) {
        code = letterPart.substring(0, Math.min(6, letterPart.length)).toUpperCase();
      } else {
        code = 'CLASS';
      }
      
      if (numberPart && numberPart.length > 0) {
        code += numberPart[0].substring(0, 4);
        hasNumbers = true;
      }
    } else {
      // Multiple words: take first 2-3 chars of first few words (letters only)
      code = words.slice(0, 3).map(word => {
        const letters = word.replace(/\d/g, '').substring(0, Math.min(3, word.length));
        return letters.toUpperCase();
      }).join('');
      
      // Check if any word contains numbers
      const allNumbers = name.match(/\d+/g);
      if (allNumbers && allNumbers.length > 0) {
        code += allNumbers[0].substring(0, 4);
        hasNumbers = true;
      }
      
      // Limit code part to 6 characters
      code = code.substring(0, 6) + (hasNumbers ? '' : code.substring(6));
    }
    
    // Add random 4-digit number only if no numbers were found in the name
    if (!hasNumbers) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      code += randomNum.toString();
    }
    
    // Ensure code is reasonable length (8-12 characters)
    return code.substring(0, 12).toUpperCase();
  };

  // Handle create class
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);

    // Validation
    if (!createFormData.name.trim()) {
      setCreateError('Class name is required');
      return;
    }

    if (!createFormData.description.trim()) {
      setCreateError('Description is required');
      return;
    }

    setIsCreating(true);
    try {
      // Generate class code from name
      const classCode = generateClassCode(createFormData.name);
      console.log('Generated class code:', classCode, 'from name:', createFormData.name);
      
      const requestData = {
        name: createFormData.name.trim(),
        description: createFormData.description.trim(),
        class_code: classCode
      };
      
      console.log('Creating class with data:', requestData);
      const data = await api.post('/class/teacher/create', requestData);

      console.log('Create class response:', data);
      
      setCreateSuccess(true);
      
      // Reset form
      setCreateFormData({
        name: '',
        description: ''
      });
      
      // Refresh classes list after a short delay
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
        fetchClasses();
      }, 1500);
    } catch (err) {
      console.error('Failed to create class:', err);
      setCreateError(err.message || 'Failed to create class. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      name: '',
      description: ''
    });
    setCreateError('');
    setCreateSuccess(false);
  };

  const grades = ['all', '10', '11', '12'];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 8.5) return 'text-green-600 dark:text-green-400';
    if (grade >= 8.0) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 7.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatNextClass = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays < 0) return 'Past due';
      return `In ${diffDays} days`;
    } catch (e) {
      return 'Not scheduled';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score, total) => {
    if (total === 0) return 'text-gray-500';
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400 rounded-full">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400 rounded-full">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Load class details when expanded
  const loadClassDetails = useCallback(async (classId) => {
    if (!classId) return;
    
    try {
      setLoadingDetails(prev => ({ ...prev, [classId]: true }));
      
      // Load class detail
      const classData = await api.get(`/class/teacher/${classId}`);
      
      if (classData && classData.class) {
        const students = Array.isArray(classData.class.students) ? classData.class.students : [];
        const exams = Array.isArray(classData.class.exams) ? classData.class.exams : [];
        
        setClassDetails(prev => ({
          ...prev,
          [classId]: {
            students,
            exams,
            submissions: []
          }
        }));
        
        // Load exam details
        if (exams.length > 0) {
          const examDetailsMap = {};
          for (const examId of exams) {
            try {
              const examData = await examService.getExamById(examId);
              if (examData && examData.exam) {
                examDetailsMap[examId] = {
                  id: examData.exam._id || examData.exam.id,
                  title: examData.exam.title || 'Untitled Exam',
                  description: examData.exam.description || '',
                  timeLimit: examData.exam.time_limit || examData.exam.duration || 60,
                  totalQuestions: Array.isArray(examData.exam.flashcards) ? examData.exam.flashcards.length : (examData.exam.totalQuestions || 0)
                };
              }
            } catch (err) {
              console.error(`Failed to load exam ${examId}:`, err);
              examDetailsMap[examId] = {
                id: examId,
                title: 'Exam',
                description: '',
                timeLimit: 60,
                totalQuestions: 0
              };
            }
          }
          setExamDetails(prev => ({ ...prev, ...examDetailsMap }));
        }
        
        // Load submissions
        try {
          const submissionsData = await api.get(`/class/teacher/${classId}/submissions`);
          if (submissionsData && submissionsData.submissions) {
            setClassDetails(prev => ({
              ...prev,
              [classId]: {
                ...prev[classId],
                submissions: Array.isArray(submissionsData.submissions) ? submissionsData.submissions : []
              }
            }));
          }
        } catch (err) {
          console.error('Failed to load submissions:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load class details:', err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [classId]: false }));
    }
  }, []);

  // Load submissions with filter
  const loadSubmissions = useCallback(async (classId, examId = null) => {
    try {
      const params = examId ? { exam_id: examId } : {};
      const submissionsData = await api.get(`/class/teacher/${classId}/submissions`, { params });
      
      if (submissionsData && submissionsData.submissions) {
        setClassDetails(prev => ({
          ...prev,
          [classId]: {
            ...prev[classId],
            submissions: Array.isArray(submissionsData.submissions) ? submissionsData.submissions : [],
            submissionsData: submissionsData
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  }, []);

  // Toggle expand class
  const toggleExpandClass = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      loadClassDetails(classId);
    }
  };

  // Handle remove exam
  const openRemoveExamModal = (classId, examId) => {
    const exam = examDetails[examId];
    setExamToRemove({
      classId,
      examId,
      title: exam?.title || 'Exam'
    });
    setShowRemoveExamModal(true);
    setRemoveExamError('');
  };

  const handleRemoveExam = async () => {
    if (!examToRemove) return;

    try {
      setIsRemovingExam(true);
      setRemoveExamError('');
      
      await api.post(`/class/teacher/${examToRemove.classId}/remove-exam`, {
        exam_id: examToRemove.examId
      });
      
      // Clear and reload class details
      setClassDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[examToRemove.classId];
        return newDetails;
      });
      await loadClassDetails(examToRemove.classId);
      
      // Update classes list
      await fetchClasses();
      
      setShowRemoveExamModal(false);
      setExamToRemove(null);
    } catch (err) {
      console.error('Failed to remove exam:', err);
      setRemoveExamError(err.message || 'Failed to remove exam from class. Please try again.');
    } finally {
      setIsRemovingExam(false);
    }
  };

  // Handle remove student
  const openRemoveStudentModal = (classId, studentId) => {
    const student = studentDetails[studentId];
    setStudentToRemove({
      classId,
      studentId,
      name: student?.name || `Student ${studentId.substring(0, 8)}...`,
      email: student?.email || ''
    });
    setShowRemoveStudentModal(true);
    setRemoveStudentError('');
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      setIsRemovingStudent(true);
      setRemoveStudentError('');
      
      await api.post(`/class/teacher/${studentToRemove.classId}/remove-student`, {
        student_id: studentToRemove.studentId
      });
      
      // Clear and reload class details
      setClassDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[studentToRemove.classId];
        return newDetails;
      });
      await loadClassDetails(studentToRemove.classId);
      
      // Update classes list
      await fetchClasses();
      
      setShowRemoveStudentModal(false);
      setStudentToRemove(null);
    } catch (err) {
      console.error('Failed to remove student:', err);
      setRemoveStudentError(err.message || 'Failed to remove student from class. Please try again.');
    } finally {
      setIsRemovingStudent(false);
    }
  };

  // Handle submission filter change
  const handleSubmissionFilterChange = (classId, examId) => {
    setSubmissionsFilter(prev => ({ ...prev, [classId]: examId }));
    loadSubmissions(classId, examId || null);
  };

  // Open submission modal
  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Class Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Manage your classes, track student progress, and organize course materials.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Class
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Classes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{classes.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {classes.reduce((sum, cls) => sum + cls.students, 0)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Exams</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {classes.reduce((sum, cls) => sum + cls.exams, 0)}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Classes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {classes.filter(cls => cls.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {!isLoading && !error && (
          <>
            {filteredClasses.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 dark:border-gray-700 text-center">
                <Home className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No classes found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedGrade !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating your first class.'}
                </p>
                {!searchTerm && selectedGrade === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Class
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(cls.status)}`}>
                        {cls.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {cls.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Class Code: {cls.classCode}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Students:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{cls.students}</span>
                  </div>
                  {cls.exams > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Exams:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{cls.exams}</span>
                    </div>
                  )}
                  {cls.createdAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white text-xs">
                        {new Date(cls.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {cls.exams > 0 && (
                  <div className="mb-4">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{cls.exams}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Exams</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/dashboard/teacher/classes/${cls.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => toggleExpandClass(cls.id)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedClass === cls.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Details
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedClass === cls.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
                  {loadingDetails[cls.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading details...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Students Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Students ({classDetails[cls.id]?.students?.length || 0})
                        </h4>
                        {classDetails[cls.id]?.students?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {classDetails[cls.id].students.map((studentId, idx) => {
                              const student = studentDetails[studentId];
                              const initials = student?.name 
                                ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                : studentId.substring(0, 2).toUpperCase();
                              
                              return (
                                <div key={studentId || idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold text-xs">{initials}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {student?.name || `Student ${idx + 1}`}
                                      </p>
                                      {student?.email && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => openRemoveStudentModal(cls.id, studentId)}
                                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                    title="Remove student"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No students enrolled</p>
                        )}
                      </div>

                      {/* Exams Section */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Exams ({classDetails[cls.id]?.exams?.length || 0})
                        </h4>
                        {classDetails[cls.id]?.exams?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {classDetails[cls.id].exams.map((examId, idx) => {
                              const exam = examDetails[examId];
                              return (
                                <div key={examId || idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {exam?.title || `Exam ${idx + 1}`}
                                    </p>
                                    {exam && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {exam.totalQuestions} questions • {exam.timeLimit} min
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => openRemoveExamModal(cls.id, examId)}
                                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                    title="Remove exam"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No exams assigned</p>
                        )}
                      </div>

                      {/* Submissions Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Submissions ({classDetails[cls.id]?.submissions?.length || 0})
                          </h4>
                          {classDetails[cls.id]?.exams?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Filter className="w-4 h-4 text-gray-500" />
                              <select
                                value={submissionsFilter[cls.id] || ''}
                                onChange={(e) => handleSubmissionFilterChange(cls.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">All Exams</option>
                                {classDetails[cls.id].exams.map((examId) => {
                                  const exam = examDetails[examId];
                                  return (
                                    <option key={examId} value={examId}>
                                      {exam?.title || `Exam ${examId.substring(0, 8)}...`}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          )}
                        </div>
                        {classDetails[cls.id]?.submissions?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Student</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Score</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Time</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {classDetails[cls.id].submissions.map((submission, idx) => {
                                  const student = studentDetails[submission.student_id];
                                  const scorePercentage = submission.total_questions > 0
                                    ? Math.round((submission.score || 0) / submission.total_questions * 100)
                                    : 0;
                                  
                                  return (
                                    <tr key={submission._id || submission.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-xs">
                                              {student?.name 
                                                ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                                : submission.student_id.substring(0, 2).toUpperCase()}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-900 dark:text-white truncate">
                                            {student?.name || `Student ${idx + 1}`}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className={`text-xs font-bold ${getScoreColor(submission.score || 0, submission.total_questions || 1)}`}>
                                          {submission.score || 0}/{submission.total_questions || 0} ({scorePercentage}%)
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        {getStatusBadge(submission.status)}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                                        {formatTimeSpent(submission.time_spent)}
                                      </td>
                                      <td className="px-3 py-2">
                                        <button
                                          onClick={() => openSubmissionModal(submission)}
                                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No submissions found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
              </div>
            )}
          </>
        )}

        {/* Remove Exam Modal */}
        {showRemoveExamModal && examToRemove && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRemoveExamModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Remove Exam from Class
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to remove "{examToRemove.title}" from this class?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    Students will no longer have access to this exam through this class.
                  </p>
                  
                  {removeExamError && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm text-center">{removeExamError}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRemoveExamModal(false);
                      setExamToRemove(null);
                      setRemoveExamError('');
                    }}
                    disabled={isRemovingExam}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRemoveExam}
                    disabled={isRemovingExam}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemovingExam ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove Exam
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Student Modal */}
        {showRemoveStudentModal && studentToRemove && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRemoveStudentModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Remove Student from Class
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to remove "{studentToRemove.name}" from this class?
                  </p>
                  
                  {studentToRemove.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      {studentToRemove.email}
                    </p>
                  )}
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    The student will lose access to this class and all its exams.
                  </p>
                  
                  {removeStudentError && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm text-center">{removeStudentError}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRemoveStudentModal(false);
                      setStudentToRemove(null);
                      setRemoveStudentError('');
                    }}
                    disabled={isRemovingStudent}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRemoveStudent}
                    disabled={isRemovingStudent}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemovingStudent ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Remove Student
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Detail Modal */}
        {showSubmissionModal && selectedSubmission && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSubmissionModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Submission Details
                    </h3>
                    <button
                      onClick={() => setShowSubmissionModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</p>
                      <p className={`text-lg font-bold ${getScoreColor(selectedSubmission.score || 0, selectedSubmission.total_questions || 1)}`}>
                        {selectedSubmission.score || 0}/{selectedSubmission.total_questions || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correct</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSubmission.correct_answers || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Spent</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatTimeSpent(selectedSubmission.time_spent)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                  </div>

                  {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Answers</p>
                      <div className="space-y-3">
                        {selectedSubmission.answers.map((answer, index) => (
                          <div
                            key={answer.question_id || index}
                            className={`p-4 rounded-xl border-2 ${
                              answer.is_correct
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Question {index + 1}
                              </span>
                              {answer.is_correct ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Selected:</span>
                                <span className={`ml-2 font-medium ${
                                  answer.is_correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}>
                                  {answer.selected_option || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Correct:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {answer.correct_option || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Class</h3>
                </div>
                
                <form onSubmit={handleCreateClass}>
                  <div className="px-6 py-4 space-y-4">
                    {/* Success Message */}
                    {createSuccess && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Class created successfully! Closing...
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {createError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                          <AlertCircle className="w-5 h-5" />
                          {createError}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Class Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Mathematics 10A"
                        required
                        disabled={isCreating || createSuccess}
                      />
                    </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the class content and objectives"
                        required
                        disabled={isCreating || createSuccess}
                      />
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isCreating}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating || createSuccess}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : createSuccess ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Created!
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Class
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
