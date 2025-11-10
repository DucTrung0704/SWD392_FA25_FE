import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Calendar, Clock, Home, FileText, AlertCircle, CheckCircle, XCircle, Trash2, Plus, Eye, BarChart3, Filter, Award, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { examService } from '../../services/examService';

export default function TeacherClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [availableExams, setAvailableExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [addExamError, setAddExamError] = useState('');
  const [showRemoveExamModal, setShowRemoveExamModal] = useState(false);
  const [examToRemove, setExamToRemove] = useState(null);
  const [isRemovingExam, setIsRemovingExam] = useState(false);
  const [removeExamError, setRemoveExamError] = useState('');
  const [examDetails, setExamDetails] = useState({}); // Store exam details by ID
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [removeStudentError, setRemoveStudentError] = useState('');
  const [studentDetails, setStudentDetails] = useState({}); // Store student details by ID
  const [submissions, setSubmissions] = useState([]);
  const [submissionsData, setSubmissionsData] = useState(null); // Full API response
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [filterExamId, setFilterExamId] = useState(''); // Filter by exam_id
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      
      if (seconds < 60) return 'Vừa xong';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
      if (seconds < 2592000) return `${Math.floor(seconds / 604800)} tuần trước`;
      return `${Math.floor(seconds / 2592000)} tháng trước`;
    } catch (e) {
      return 'Unknown';
    }
  };

  const loadExamDetails = useCallback(async (examIds) => {
    try {
      const details = {};
      // Load details for each exam
      for (const examIdItem of examIds) {
        // Normalize examId - extract ID if it's an object
        const examId = typeof examIdItem === 'string' 
          ? examIdItem 
          : (examIdItem?._id || examIdItem?.id || String(examIdItem));
        
        if (!examId || examId === 'undefined' || examId === 'null') {
          console.warn('Skipping invalid exam ID:', examIdItem);
          continue;
        }
        
        try {
          const examData = await examService.getExamById(examId);
          if (examData && examData.exam) {
            details[examId] = {
              id: examData.exam._id || examData.exam.id || examId,
              title: examData.exam.title || 'Untitled Exam',
              description: examData.exam.description || '',
              timeLimit: examData.exam.time_limit || examData.exam.duration || 60,
              totalQuestions: Array.isArray(examData.exam.flashcards) ? examData.exam.flashcards.length : (examData.exam.totalQuestions || 0)
            };
          }
        } catch (err) {
          console.error(`Failed to load exam ${examId}:`, err);
          // Use fallback if exam details can't be loaded
          details[examId] = {
            id: examId,
            title: 'Exam',
            description: '',
            timeLimit: 60,
            totalQuestions: 0
          };
        }
      }
      setExamDetails(prev => ({ ...prev, ...details }));
    } catch (err) {
      console.error('Failed to load exam details:', err);
    }
  }, []);

  const fetchClassDetail = useCallback(async () => {
    if (!id) {
      setError('Class ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching class details for ID:', id);
      const data = await api.get(`/class/teacher/${id}`);
      
      console.log('Class detail response:', data);
      
      if (data && data.class) {
        // Normalize teacher_id - extract ID if it's an object
        let teacherId = data.class.teacher_id;
        if (teacherId && typeof teacherId === 'object') {
          teacherId = teacherId._id || teacherId.id || teacherId;
        }
        
        // Normalize students - extract IDs if they are objects, and store student details
        const studentsArray = Array.isArray(data.class.students) ? data.class.students : [];
        const studentIds = [];
        const initialStudentDetails = {};
        
        studentsArray.forEach((student, index) => {
          if (typeof student === 'string') {
            // It's already an ID
            studentIds.push(student);
          } else if (student && typeof student === 'object') {
            // It's an object, extract ID and store details
            const studentId = student._id || student.id || `student-${index}`;
            studentIds.push(studentId);
            // Store student details if available
            if (student.name || student.email) {
              initialStudentDetails[studentId] = {
                id: studentId,
                name: student.name || `Student ${studentId.substring(0, 8)}...`,
                email: student.email || '',
                role: student.role || 'student'
              };
            }
          }
        });
        
        // Normalize exams - extract IDs if they are objects
        const examsArray = Array.isArray(data.class.exams) ? data.class.exams : [];
        const examIds = [];
        const initialExamDetails = {};
        
        examsArray.forEach((exam, index) => {
          if (typeof exam === 'string') {
            // It's already an ID
            examIds.push(exam);
          } else if (exam && typeof exam === 'object') {
            // It's an object, extract ID and store details
            const examId = exam._id || exam.id || `exam-${index}`;
            examIds.push(examId);
            // Store exam details if available
            if (exam.title || exam.description) {
              initialExamDetails[examId] = {
                id: examId,
                title: exam.title || 'Untitled Exam',
                description: exam.description || '',
                timeLimit: exam.time_limit || exam.duration || 60,
                totalQuestions: Array.isArray(exam.flashcards) ? exam.flashcards.length : (exam.totalQuestions || 0)
              };
            }
          }
        });
        
        // Transform API response
        const transformedClass = {
          id: data.class._id || data.class.id,
          name: data.class.name || 'Unnamed Class',
          description: data.class.description || 'No description',
          classCode: data.class.class_code || 'N/A',
          teacher_id: teacherId,
          students: studentIds,
          exams: examIds,
          isActive: data.class.isActive !== undefined ? data.class.isActive : true,
          createdAt: data.class.created_at,
          updatedAt: data.class.updated_at
        };
        
        setClassData(transformedClass);
        
        // Store initial student details if any were provided
        if (Object.keys(initialStudentDetails).length > 0) {
          setStudentDetails(prev => ({ ...prev, ...initialStudentDetails }));
        }
        
        // Store initial exam details if any were provided
        if (Object.keys(initialExamDetails).length > 0) {
          setExamDetails(prev => ({ ...prev, ...initialExamDetails }));
        }
        
        // Load exam details for each exam in the class (async, non-blocking)
        // Only load details for exams that don't already have details
        if (transformedClass.exams && transformedClass.exams.length > 0) {
          const examsToLoad = transformedClass.exams.filter(examId => !initialExamDetails[examId]);
          if (examsToLoad.length > 0) {
            loadExamDetails(examsToLoad).catch(err => {
              console.error('Failed to load exam details:', err);
            });
          }
        } else {
          setExamDetails({});
        }
      } else {
        setError('Class not found');
      }
    } catch (err) {
      console.error('Failed to fetch class details:', err);
      setError(err.message || 'Failed to load class details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id, loadExamDetails]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  const openEditModal = () => {
    if (!classData) return;
    
    setEditForm({
      name: classData.name || '',
      description: classData.description || '',
      isActive: classData.isActive !== undefined ? classData.isActive : true
    });
    setShowEditModal(true);
    setEditError('');
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setEditError('');

    // Validation
    if (!editForm.name.trim()) {
      setEditError('Class name is required');
      return;
    }

    if (!editForm.description.trim()) {
      setEditError('Description is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setEditError('');
      
      console.log('Updating class with ID:', id);
      console.log('Update data:', editForm);
      
      const data = await api.put(`/class/teacher/update/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        isActive: editForm.isActive
      });

      console.log('Update class response:', data);
      
      // Reload class data
      await fetchClassDetail();
      
      // Close modal
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update class:', err);
      setEditError(err.message || 'Failed to update class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      console.log('Deleting class with ID:', id);
      
      await api.delete(`/class/teacher/delete/${id}`);

      console.log('Class deleted successfully');
      
      // Navigate back to classes list
      navigate('/dashboard/teacher/classes');
    } catch (err) {
      console.error('Failed to delete class:', err);
      setDeleteError(err.message || 'Failed to delete class. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadAvailableExams = useCallback(async () => {
    try {
      setIsLoadingExams(true);
      setAddExamError('');
      
      console.log('Loading available exams...');
      const res = await examService.listMyExams();
      
      // Handle different response formats
      const examsList = Array.isArray(res?.exams) ? res.exams : (Array.isArray(res) ? res : []);
      
      // Filter out exams that are already in the class
      // Normalize class exam IDs to strings for comparison
      const classExamIds = (classData?.exams || []).map(examIdItem => {
        return typeof examIdItem === 'string' 
          ? examIdItem 
          : (examIdItem?._id || examIdItem?.id || String(examIdItem));
      });
      
      const filteredExams = examsList.filter(exam => {
        const examId = exam._id || exam.id;
        return examId && !classExamIds.includes(examId);
      });
      
      // Transform to a simpler format
      const transformedExams = filteredExams.map(exam => ({
        id: exam._id || exam.id,
        title: exam.title || 'Untitled Exam',
        description: exam.description || '',
        subject: exam.subject || 'General',
        timeLimit: exam.time_limit || exam.duration || 60,
        totalQuestions: Array.isArray(exam.flashcards) ? exam.flashcards.length : (exam.totalQuestions || 0)
      }));
      
      setAvailableExams(transformedExams);
      console.log(`Loaded ${transformedExams.length} available exams`);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setAddExamError(err.message || 'Failed to load available exams. Please try again.');
    } finally {
      setIsLoadingExams(false);
    }
  }, [classData]);

  const openAddExamModal = useCallback(async () => {
    setShowAddExamModal(true);
    setSelectedExamId('');
    setAddExamError('');
    await loadAvailableExams();
  }, [loadAvailableExams]);

  const handleAddExam = async (e) => {
    e.preventDefault();
    setAddExamError('');

    // Validation
    if (!selectedExamId) {
      setAddExamError('Please select an exam');
      return;
    }

    try {
      setIsAddingExam(true);
      setAddExamError('');
      
      console.log('Adding exam to class:', { classId: id, examId: selectedExamId });
      
      const data = await api.post(`/class/teacher/${id}/add-exam`, {
        exam_id: selectedExamId
      });

      console.log('Add exam response:', data);
      
      // Reload class data
      await fetchClassDetail();
      
      // Close modal
      setShowAddExamModal(false);
      setSelectedExamId('');
    } catch (err) {
      console.error('Failed to add exam:', err);
      setAddExamError(err.message || 'Failed to add exam to class. Please try again.');
    } finally {
      setIsAddingExam(false);
    }
  };

  const openRemoveExamModal = (examId) => {
    // Ensure examId is a string
    const examIdStr = typeof examId === 'string' 
      ? examId 
      : (examId?._id || examId?.id || String(examId) || 'unknown');
    
    const exam = examDetails[examIdStr];
    setExamToRemove({
      id: examIdStr,
      title: exam?.title || 'Exam',
      description: exam?.description || ''
    });
    setShowRemoveExamModal(true);
    setRemoveExamError('');
  };

  const handleRemoveExam = async () => {
    if (!examToRemove) return;

    try {
      setIsRemovingExam(true);
      setRemoveExamError('');
      
      console.log('Removing exam from class:', { classId: id, examId: examToRemove.id });
      
      const data = await api.post(`/class/teacher/${id}/remove-exam`, {
        exam_id: examToRemove.id
      });

      console.log('Remove exam response:', data);
      
      // Reload class data
      await fetchClassDetail();
      
      // Close modal
      setShowRemoveExamModal(false);
      setExamToRemove(null);
    } catch (err) {
      console.error('Failed to remove exam:', err);
      setRemoveExamError(err.message || 'Failed to remove exam from class. Please try again.');
    } finally {
      setIsRemovingExam(false);
    }
  };

  const openRemoveStudentModal = (studentId) => {
    // Ensure studentId is a string
    const studentIdStr = typeof studentId === 'string' 
      ? studentId 
      : (studentId?._id || studentId?.id || String(studentId) || 'unknown');
    
    const student = studentDetails[studentIdStr];
    setStudentToRemove({
      id: studentIdStr,
      name: student?.name || `Student ${studentIdStr.substring(0, 8)}...`,
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
      
      console.log('Removing student from class:', { classId: id, studentId: studentToRemove.id });
      
      const data = await api.post(`/class/teacher/${id}/remove-student`, {
        student_id: studentToRemove.id
      });

      console.log('Remove student response:', data);
      
      // Reload class data
      await fetchClassDetail();
      
      // Close modal
      setShowRemoveStudentModal(false);
      setStudentToRemove(null);
    } catch (err) {
      console.error('Failed to remove student:', err);
      setRemoveStudentError(err.message || 'Failed to remove student from class. Please try again.');
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingSubmissions(true);
      setSubmissionsError('');
      
      console.log('Fetching submissions for class:', id, 'with exam filter:', filterExamId || 'all');
      
      const params = filterExamId ? { exam_id: filterExamId } : {};
      const data = await api.get(`/class/teacher/${id}/submissions`, { params });

      console.log('Submissions response:', data);
      
      if (data) {
        // Normalize submissions - ensure student_id is always a string
        const submissionsArray = Array.isArray(data.submissions) ? data.submissions : [];
        const normalizedSubmissions = [];
        const submissionStudentDetails = {};
        
        submissionsArray.forEach((submission) => {
          const normalizedSubmission = { ...submission };
          
          // Normalize student_id - extract ID if it's an object
          if (normalizedSubmission.student_id) {
            if (typeof normalizedSubmission.student_id === 'object') {
              // Store student details if available BEFORE modifying student_id
              const studentObj = normalizedSubmission.student_id;
              const studentId = studentObj._id || studentObj.id;
              if (studentId) {
                normalizedSubmission.student_id = studentId;
                // Store student details if available in the object
                if (studentObj.name || studentObj.email) {
                  submissionStudentDetails[studentId] = {
                    id: studentId,
                    name: studentObj.name || `Student ${studentId.substring(0, 8)}...`,
                    email: studentObj.email || '',
                    role: studentObj.role || 'student'
                  };
                }
              }
            }
          }
          
          normalizedSubmissions.push(normalizedSubmission);
        });
        
        // Store student details from submissions
        if (Object.keys(submissionStudentDetails).length > 0) {
          setStudentDetails(prev => ({ ...prev, ...submissionStudentDetails }));
        }
        
        setSubmissionsData(data);
        setSubmissions(normalizedSubmissions);
      } else {
        setSubmissions([]);
        setSubmissionsData(null);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setSubmissionsError(err.message || 'Failed to load submissions. Please try again.');
      setSubmissions([]);
      setSubmissionsData(null);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [id, filterExamId]);

  useEffect(() => {
    if (classData) {
      fetchSubmissions();
    }
  }, [fetchSubmissions, classData]);

  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
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
            Đã hoàn thành
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400 rounded-full">
            Đang làm
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
            {status || 'Không xác định'}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading class details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/dashboard/teacher/classes')}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to Classes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/teacher/classes')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Lớp học
        </button>

        {/* Class Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {classData.name}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      classData.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                    }`}>
                      {classData.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Không hoạt động
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {classData.description || 'Chưa có mô tả'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Mã lớp: <span className="font-semibold text-gray-900 dark:text-white">{classData.classCode}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Tạo {getTimeAgo(classData.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={openEditModal}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng số học sinh</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classData.students.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng số bài thi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classData.exams.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-orange-100 dark:border-orange-900/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trạng thái</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {classData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                {classData.isActive ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-100 dark:border-orange-900/50 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Học sinh ({classData.students.length})
            </h2>
          </div>

          {classData.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.students.map((studentId, index) => {
                // Ensure studentId is a string
                const studentIdStr = typeof studentId === 'string' 
                  ? studentId 
                  : (studentId?._id || studentId?.id || String(studentId) || `student-${index}`);
                
                const student = studentDetails[studentIdStr];
                const studentInitials = student?.name 
                  ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : (studentIdStr || 'ST').substring(0, 2).toUpperCase();
                
                return (
                  <div
                    key={studentIdStr || index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{studentInitials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {student?.name || `Student ${index + 1}`}
                        </p>
                        {student?.email ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                            ID: {studentIdStr.substring(0, 12)}...
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Thành viên
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRemoveStudentModal(studentIdStr);
                      }}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      title="Xóa học sinh khỏi lớp"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có học sinh
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Học sinh có thể tham gia lớp này bằng mã lớp: <span className="font-semibold text-gray-900 dark:text-white">{classData.classCode}</span>
              </p>
            </div>
          )}
        </div>

        {/* Exams Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-100 dark:border-orange-900/50 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Bài thi ({classData.exams.length})
            </h2>
            <button
              onClick={openAddExamModal}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm bài thi
            </button>
          </div>

          {classData.exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.exams.map((examIdItem, index) => {
                // Ensure examId is a string
                const examId = typeof examIdItem === 'string' 
                  ? examIdItem 
                  : (examIdItem?._id || examIdItem?.id || String(examIdItem) || `exam-${index}`);
                
                const exam = examDetails[examId];
                return (
                  <div
                    key={examId || index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                          onClick={() => navigate(`/dashboard/teacher/exams/${examId}`)}
                        >
                          {exam?.title || `Bài thi ${index + 1}`}
                        </p>
                        {exam && (
                          <div className="mt-1 space-y-1">
                            {exam.totalQuestions > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exam.totalQuestions} câu hỏi
                              </p>
                            )}
                            {exam.timeLimit && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exam.timeLimit} phút
                              </p>
                            )}
                          </div>
                        )}
                        {!exam && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Đang tải...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/teacher/exams/${examId}`);
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRemoveExamModal(examId);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        title="Xóa bài thi khỏi lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có bài thi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Lớp này chưa có bài thi nào. Tạo bài thi để gán cho lớp này.
              </p>
              <button
                onClick={() => navigate('/dashboard/teacher/exams')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                Tạo bài thi
              </button>
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-100 dark:border-orange-900/50 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Bài nộp ({submissionsData?.total || 0})
            </h2>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filterExamId}
                onChange={(e) => setFilterExamId(e.target.value)}
                className="px-4 py-2 border border-orange-200 dark:border-orange-500/40 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all text-sm"
              >
                <option value="">Tất cả bài thi</option>
                {classData.exams.map((examIdItem, index) => {
                  // Ensure examId is a string
                  const examId = typeof examIdItem === 'string' 
                    ? examIdItem 
                    : (examIdItem?._id || examIdItem?.id || String(examIdItem) || `exam-${index}`);
                  
                  const exam = examDetails[examId];
                  return (
                    <option key={examId} value={examId}>
                      {exam?.title || `Exam ${(examId || 'unknown').substring(0, 8)}...`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {submissionsError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-5 h-5" />
                {submissionsError}
              </div>
            </div>
          )}

          {/* Statistics */}
          {submissionsData && submissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Tổng bài nộp</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {submissionsData.total || 0}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Học sinh</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {submissionsData.total_students || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Điểm trung bình</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {submissions.length > 0 
                        ? Math.round(
                            submissions.reduce((sum, s) => {
                              const total = s.total_questions || 1;
                              return sum + ((s.score || 0) / total * 100);
                            }, 0) / submissions.length
                          )
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Đã hoàn thành</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {submissions.filter(s => s.status === 'completed').length}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          )}

          {/* Exam Info */}
          {submissionsData?.exam && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {submissionsData.exam.title || 'Exam'}
                </h3>
              </div>
              {submissionsData.exam.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {submissionsData.exam.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Tổng câu hỏi: {submissionsData.exam.total_questions || 0}</span>
                <span>Thời gian: {submissionsData.exam.time_limit || 0} phút</span>
              </div>
            </div>
          )}

          {isLoadingSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải bài nộp...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có bài nộp
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterExamId 
                  ? 'Chưa có bài nộp cho bài thi này. Học sinh cần làm bài thi trước.'
                  : 'Chưa có bài nộp trong lớp này. Học sinh cần làm bài thi trước.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Học sinh
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thời gian làm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Đã nộp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission) => {
                    // Ensure student_id is a string
                    const studentIdStr = typeof submission.student_id === 'string' 
                      ? submission.student_id 
                      : (submission.student_id?._id || submission.student_id?.id || String(submission.student_id) || 'unknown');
                    
                    const student = studentDetails[studentIdStr];
                    const scorePercentage = submission.total_questions > 0
                      ? Math.round((submission.score || 0) / submission.total_questions * 100)
                      : 0;
                    
                    return (
                      <tr key={submission._id || submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                              <span className="text-white font-bold text-xs">
                                {student?.name 
                                  ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                  : (studentIdStr || 'ST').substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {student?.name || `Student ${(studentIdStr || 'unknown').substring(0, 8)}...`}
                              </div>
                              {student?.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(submission.score || 0, submission.total_questions || 1)}`}>
                              {submission.score || 0}/{submission.total_questions || 0}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({scorePercentage}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatTimeSpent(submission.time_spent)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {submission.submitted_at ? formatDate(submission.submitted_at) : submission.started_at ? formatDate(submission.started_at) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openSubmissionModal(submission)}
                            className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Class Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-orange-100 dark:border-orange-900/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Thông tin lớp học
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tên lớp</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {classData.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mã lớp</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                {classData.classCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ngày tạo</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(classData.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cập nhật lần cuối</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(classData.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trạng thái</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {classData.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID Giáo viên</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">
                {typeof classData.teacher_id === 'object' 
                  ? (classData.teacher_id._id || classData.teacher_id.id || 'N/A')
                  : (classData.teacher_id || 'N/A')}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Class Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉnh sửa lớp học</h3>
                </div>
                
                <form onSubmit={handleEditClass}>
                  <div className="px-6 py-4 space-y-4">
                    {/* Error Message */}
                    {editError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                          <AlertCircle className="w-5 h-5" />
                          {editError}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tên lớp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-orange-200 dark:border-orange-500/40 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                        placeholder="Ví dụ: Toán 10A"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-orange-200 dark:border-orange-500/40 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-400 resize-none"
                        placeholder="Mô tả nội dung và mục tiêu của lớp học"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActiveEdit"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="isActiveEdit" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hoạt động (Lớp học hiện đang hoạt động và hiển thị cho học sinh)
                      </label>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditError('');
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Cập nhật lớp học
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
                    Xóa lớp học
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa "{classData?.name}"?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    Hành động này không thể hoàn tác. Tất cả học sinh và bài thi liên quan đến lớp này sẽ bị ảnh hưởng.
                  </p>
                  
                  {deleteError && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-red-700 dark:text-red-400 text-sm text-center">{deleteError}</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError('');
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleDeleteClass}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa lớp học
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Exam Modal */}
        {showAddExamModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddExamModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm bài thi vào lớp</h3>
                </div>
                
                <form onSubmit={handleAddExam}>
                  <div className="px-6 py-4 space-y-4">
                    {/* Error Message */}
                    {addExamError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                          <AlertCircle className="w-5 h-5" />
                          {addExamError}
                        </div>
                      </div>
                    )}

                    {isLoadingExams ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Đang tải danh sách bài thi...</p>
                        </div>
                      </div>
                    ) : availableExams.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Không có bài thi
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {classData?.exams.length > 0 
                            ? 'Tất cả bài thi của bạn đã được gán cho lớp này.'
                            : 'Bạn cần tạo bài thi trước khi thêm vào lớp này.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddExamModal(false);
                            navigate('/dashboard/teacher/exams');
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          Tạo bài thi
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Chọn bài thi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedExamId}
                          onChange={(e) => setSelectedExamId(e.target.value)}
                          className="w-full px-4 py-2 border border-orange-200 dark:border-orange-500/40 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                          required
                          disabled={isAddingExam}
                        >
                          <option value="">-- Chọn bài thi --</option>
                          {availableExams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.title} ({exam.totalQuestions} câu hỏi, {exam.timeLimit} phút)
                            </option>
                          ))}
                        </select>
                        
                        {selectedExamId && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            {(() => {
                              const selectedExam = availableExams.find(e => e.id === selectedExamId);
                              return selectedExam ? (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tiêu đề</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.title}</p>
                                  </div>
                                  {selectedExam.description && (
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mô tả</p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedExam.description}</p>
                                    </div>
                                  )}
                                  <div className="flex gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Môn học</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.subject}</p>
                                  </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Câu hỏi</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.totalQuestions}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thời gian</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.timeLimit} phút</p>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {availableExams.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddExamModal(false);
                          setSelectedExamId('');
                          setAddExamError('');
                        }}
                        disabled={isAddingExam}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit"
                        disabled={isAddingExam || !selectedExamId}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingExam ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Thêm bài thi
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Remove Exam Confirmation Modal */}
        {showRemoveExamModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRemoveExamModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Xóa bài thi khỏi lớp
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa "{examToRemove?.title || 'bài thi này'}" khỏi lớp này?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    Học sinh sẽ không còn quyền truy cập bài thi này thông qua lớp này. Bài thi sẽ không bị xóa.
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
                    Hủy
                  </button>
                  <button 
                    onClick={handleRemoveExam}
                    disabled={isRemovingExam}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemovingExam ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa bài thi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Student Confirmation Modal */}
        {showRemoveStudentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRemoveStudentModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                    Xóa học sinh khỏi lớp
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Bạn có chắc chắn muốn xóa "{studentToRemove?.name || 'học sinh này'}" khỏi lớp này?
                  </p>
                  
                  {studentToRemove?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      {studentToRemove.email}
                    </p>
                  )}
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    Học sinh sẽ mất quyền truy cập vào lớp này và tất cả bài thi của lớp. Họ có thể tham gia lại bằng mã lớp nếu cần.
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
                    Hủy
                  </button>
                  <button 
                    onClick={handleRemoveStudent}
                    disabled={isRemovingStudent}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRemovingStudent ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Xóa học sinh
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
                      Chi tiết bài nộp
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
                  {/* Submission Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Điểm</p>
                      <p className={`text-lg font-bold ${getScoreColor(selectedSubmission.score || 0, selectedSubmission.total_questions || 1)}`}>
                        {selectedSubmission.score || 0}/{selectedSubmission.total_questions || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Đúng</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedSubmission.correct_answers || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thời gian làm</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatTimeSpent(selectedSubmission.time_spent)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trạng thái</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Học sinh</p>
                    {(() => {
                      // Ensure student_id is a string
                      const studentIdStr = typeof selectedSubmission.student_id === 'string' 
                        ? selectedSubmission.student_id 
                        : (selectedSubmission.student_id?._id || selectedSubmission.student_id?.id || String(selectedSubmission.student_id) || 'unknown');
                      const student = studentDetails[studentIdStr];
                      
                      return (
                        <>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {student?.name || `Học sinh ${(studentIdStr || 'unknown').substring(0, 8)}...`}
                          </p>
                          {student?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {student.email}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Answers */}
                  {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Câu trả lời</p>
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
                                Câu hỏi {index + 1}
                              </span>
                              {answer.is_correct ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Đã chọn:</span>
                                <span className={`ml-2 font-medium ${
                                  answer.is_correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}>
                                  {answer.selected_option || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Đúng:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {answer.correct_option || 'N/A'}
                                </span>
                              </div>
                            </div>
                            {answer.answered_at && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Trả lời lúc: {formatDate(answer.answered_at)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedSubmission.started_at && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Bắt đầu:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {formatDate(selectedSubmission.started_at)}
                          </span>
                        </div>
                      )}
                      {selectedSubmission.submitted_at && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Đã nộp:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {formatDate(selectedSubmission.submitted_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Đóng
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

