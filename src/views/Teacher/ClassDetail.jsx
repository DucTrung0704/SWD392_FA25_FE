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
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
      if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
      return `${Math.floor(seconds / 2592000)} months ago`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
      <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/teacher/classes')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Classes
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
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {classData.description || 'No description available'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Class Code: <span className="font-semibold text-gray-900 dark:text-white">{classData.classCode}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Created {getTimeAgo(classData.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={openEditModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Class
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classData.students.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classData.exams.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {classData.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                {classData.isActive ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Students ({classData.students.length})
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
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
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
                          Member
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRemoveStudentModal(studentIdStr);
                      }}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      title="Remove student from class"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No students enrolled
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Students can join this class using the class code: <span className="font-semibold text-gray-900 dark:text-white">{classData.classCode}</span>
              </p>
            </div>
          )}
        </div>

        {/* Exams Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Exams ({classData.exams.length})
            </h2>
            <button
              onClick={openAddExamModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Exam
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
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => navigate(`/dashboard/teacher/exams/${examId}`)}
                        >
                          {exam?.title || `Exam ${index + 1}`}
                        </p>
                        {exam && (
                          <div className="mt-1 space-y-1">
                            {exam.totalQuestions > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exam.totalQuestions} questions
                              </p>
                            )}
                            {exam.timeLimit && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {exam.timeLimit} min
                              </p>
                            )}
                          </div>
                        )}
                        {!exam && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Loading...
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
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRemoveExamModal(examId);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        title="Remove exam from class"
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
                No exams assigned
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This class doesn't have any exams yet. Create exams to assign them to this class.
              </p>
              <button
                onClick={() => navigate('/dashboard/teacher/exams')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Create Exam
              </button>
            </div>
          )}
        </div>

        {/* Submissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Submissions ({submissionsData?.total || 0})
            </h2>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filterExamId}
                onChange={(e) => setFilterExamId(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Exams</option>
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
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Submissions</p>
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
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Students</p>
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
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Average Score</p>
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
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">Completed</p>
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
                <span>Total Questions: {submissionsData.exam.total_questions || 0}</span>
                <span>Time Limit: {submissionsData.exam.time_limit || 0} min</span>
              </div>
            </div>
          )}

          {isLoadingSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No submissions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterExamId 
                  ? 'No submissions for this exam yet. Students need to take the exam first.'
                  : 'No submissions in this class yet. Students need to take exams first.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time Spent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
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
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Class Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Class Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {classData.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Class Code</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                {classData.classCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created At</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(classData.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(classData.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {classData.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teacher ID</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Class</h3>
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
                        Class Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Mathematics 10A"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Describe the class content and objectives"
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
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="isActiveEdit" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active (Class is currently active and visible to students)
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
                          Update Class
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
                    Delete Class
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to delete "{classData?.name}"?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    This action cannot be undone. All students and exams associated with this class will be affected.
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
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteClass}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Class
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Exam to Class</h3>
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
                          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading available exams...</p>
                        </div>
                      </div>
                    ) : availableExams.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No exams available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {classData?.exams.length > 0 
                            ? 'All your exams are already assigned to this class.'
                            : 'You need to create exams first before adding them to this class.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddExamModal(false);
                            navigate('/dashboard/teacher/exams');
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          Create Exam
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Exam <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedExamId}
                          onChange={(e) => setSelectedExamId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                          disabled={isAddingExam}
                        >
                          <option value="">-- Select an exam --</option>
                          {availableExams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.title} ({exam.totalQuestions} questions, {exam.timeLimit} min)
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
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.title}</p>
                                  </div>
                                  {selectedExam.description && (
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedExam.description}</p>
                                    </div>
                                  )}
                                  <div className="flex gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.subject}</p>
                                  </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Questions</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.totalQuestions}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time Limit</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedExam.timeLimit} min</p>
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
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isAddingExam || !selectedExamId}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingExam ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Exam
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
                    Remove Exam from Class
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to remove "{examToRemove?.title || 'this exam'}" from this class?
                  </p>
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    Students will no longer have access to this exam through this class. The exam itself will not be deleted.
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
                    Remove Student from Class
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-1">
                    Are you sure you want to remove "{studentToRemove?.name || 'this student'}" from this class?
                  </p>
                  
                  {studentToRemove?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      {studentToRemove.email}
                    </p>
                  )}
                  
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">
                    The student will lose access to this class and all its exams. They can rejoin using the class code if needed.
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
                  {/* Submission Info */}
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

                  {/* Student Info */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student</p>
                    {(() => {
                      // Ensure student_id is a string
                      const studentIdStr = typeof selectedSubmission.student_id === 'string' 
                        ? selectedSubmission.student_id 
                        : (selectedSubmission.student_id?._id || selectedSubmission.student_id?.id || String(selectedSubmission.student_id) || 'unknown');
                      const student = studentDetails[studentIdStr];
                      
                      return (
                        <>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {student?.name || `Student ${(studentIdStr || 'unknown').substring(0, 8)}...`}
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
                            {answer.answered_at && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Answered at: {formatDate(answer.answered_at)}
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
                          <span className="text-gray-500 dark:text-gray-400">Started:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {formatDate(selectedSubmission.started_at)}
                          </span>
                        </div>
                      )}
                      {selectedSubmission.submitted_at && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
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
                    Close
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

