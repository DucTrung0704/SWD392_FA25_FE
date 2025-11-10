import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Users, BookOpen, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { classService } from '../../services/classService';
import { examService } from '../../services/examService';
import { submissionService } from '../../services/submissionService';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import ExamCard from '../../components/student/ExamCard';

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({});

  // Load class details
  const loadClassDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await classService.getClassById(id);
      
      if (data) {
        // Format class data
        const formattedClass = {
          id: data._id || data.id,
          name: data.name || 'Unnamed Class',
          description: data.description || '',
          classCode: data.class_code || data.classCode || '',
          teacherName: data.teacher_id?.name || data.teacher?.name || 'Unknown Teacher',
          studentCount: Array.isArray(data.students) ? data.students.length : (data.studentCount || 0),
          examIds: Array.isArray(data.exams) ? data.exams : [],
          createdAt: data.created_at || data.createdAt,
        };
        
        setClassData(formattedClass);
        
        // Load exam details if there are exams
        if (formattedClass.examIds && formattedClass.examIds.length > 0) {
          await loadExams(formattedClass.examIds);
        } else {
          setExams([]);
        }
      } else {
        setError('Không tìm thấy lớp học');
      }
    } catch (err) {
      console.error('Error loading class detail:', err);
      setError(err.message || 'Không thể tải thông tin lớp học');
      toast.error(err.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load exam details
  const loadExams = useCallback(async (examIds) => {
    try {
      const examDetails = [];
      
      for (const examIdItem of examIds) {
        // Normalize exam ID
        const examId = typeof examIdItem === 'string' 
          ? examIdItem 
          : (examIdItem?._id || examIdItem?.id || String(examIdItem));
        
        if (!examId || examId === 'undefined' || examId === 'null') {
          continue;
        }
        
        try {
          // Get exam details
          const examData = await examService.getStudentExamById(examId);
          const exam = examData?.exam || examData;
          
          if (exam) {
            // Get submission for this exam
            let submission = null;
            try {
              const submissions = await submissionService.getMySubmissions();
              const examSubmissions = Array.isArray(submissions) 
                ? submissions 
                : (submissions?.submissions || submissions?.data || []);
              
              submission = examSubmissions.find(
                (s) => (s.exam_id?._id || s.exam_id?.id || s.exam_id) === examId
              );
            } catch (subErr) {
              console.warn('Could not load submission for exam:', examId, subErr);
            }
            
            // Format exam data
            const submissionStatus = (submission?.status || '').toLowerCase();
            const canContinue = ['in-progress', 'pending', 'started'].includes(submissionStatus);
            const canReview = ['completed', 'submitted', 'graded'].includes(submissionStatus);
            const score = submission?.score ?? submission?.result?.score ?? submission?.summary?.score ?? submission?.finalScore ?? null;
            const maxScore = submission?.result?.maxScore ?? submission?.maxScore ?? null;
            
            examDetails.push({
              id: exam._id || exam.id,
              title: exam.title || 'Chưa đặt tên',
              subject: exam.subject || 'General',
              duration: exam.time_limit || exam.duration || exam.durationMinutes || 60,
              date: exam.date || exam.scheduled_at || exam.startTime || exam.createdAt,
              description: exam.description,
              status: canContinue ? 'in-progress' : canReview ? submissionStatus : (exam.status || 'scheduled'),
              progress: submission?.progress ?? submission?.percentage ?? null,
              score: score != null && maxScore != null ? `${score}/${maxScore}` : score,
              canContinue,
              canReview,
            });
          }
        } catch (examErr) {
          console.warn('Could not load exam:', examId, examErr);
          // Continue loading other exams even if one fails
        }
      }
      
      setExams(examDetails);
    } catch (err) {
      console.error('Error loading exams:', err);
      toast.error('Không thể tải danh sách bài kiểm tra');
    }
  }, []);

  useEffect(() => {
    loadClassDetail();
  }, [loadClassDetail]);

  // Handle start exam
  const handleStartExam = async (examId) => {
    if (!examId) return;
    try {
      setActionState({ type: 'start', id: examId });
      
      // Start the exam
      const res = await submissionService.startExam(examId);
      const submissionId = res?.submission?._id || res?.submissionId || res?._id;
      
      if (submissionId) {
        navigate(`/dashboard/student/exams/${submissionId}`);
      } else {
        throw new Error('Không xác định được bài làm');
      }
    } catch (err) {
      console.error('Error starting exam:', err);
      
      // Parse error message
      let errorMessage = err.message || 
                        err.data?.message || 
                        err.response?.data?.message || 
                        err.error?.message ||
                        'Không thể bắt đầu kỳ thi';
      
      toast.error(errorMessage);
    } finally {
      setActionState({});
    }
  };

  // Handle continue exam
  const handleContinueExam = async (examId, action) => {
    if (!examId) return;
    try {
      setActionState({ type: 'continue', id: examId });
      
      if (action === 'review') {
        // Find submission ID from my submissions
        try {
          const submissions = await submissionService.getMySubmissions();
          const examSubmissions = Array.isArray(submissions) 
            ? submissions 
            : (submissions?.submissions || submissions?.data || []);
          
          const submission = examSubmissions.find(
            (s) => {
              const sExamId = s.exam_id?._id || s.exam_id?.id || s.exam_id;
              return sExamId === examId;
            }
          );
          
          if (submission) {
            const submissionId = submission._id || submission.id;
            navigate(`/dashboard/student/exams/${submissionId}`);
          } else {
            throw new Error('Không tìm thấy bài nộp');
          }
        } catch (subErr) {
          console.error('Error finding submission:', subErr);
          throw new Error('Không thể tìm bài nộp');
        }
      } else {
        // Continue/resume exam - get submission by exam
        const submission = await submissionService.getSubmissionByExam(examId);
        const submissionId = submission?._id || submission?.submissionId || submission?.submission?._id;
        
        if (submissionId) {
          navigate(`/dashboard/student/exams/${submissionId}`);
        } else {
          throw new Error('Chưa có bài nộp cho kỳ thi này');
        }
      }
    } catch (err) {
      console.error('Error continuing exam:', err);
      toast.error(err.message || 'Không thể tiếp tục bài kiểm tra');
    } finally {
      setActionState({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải thông tin lớp học...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard/student/class')}
            variant="outline"
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách lớp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            onClick={() => navigate('/dashboard/student/class')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          {classData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                {classData.name}
              </h1>
              {classData.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
                  {classData.description}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="font-medium">Giáo viên:</span>
                  <span className="ml-2">{classData.teacherName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="font-medium">Số học sinh:</span>
                  <span className="ml-2">{classData.studentCount}</span>
                </div>
                {classData.classCode && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="font-medium">Mã lớp:</span>
                    <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                      {classData.classCode}
                    </span>
                  </div>
                )}
                {classData.createdAt && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="font-medium">Ngày tạo:</span>
                    <span className="ml-2">
                      {new Date(classData.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && classData && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Exams Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              Bài kiểm tra ({exams.length})
            </h2>
          </div>

          {exams.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có bài kiểm tra
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lớp học này chưa có bài kiểm tra nào
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onStart={handleStartExam}
                  onContinue={handleContinueExam}
                  actionState={actionState}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

