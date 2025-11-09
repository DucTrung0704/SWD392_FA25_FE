import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { classService } from '../../services/classService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import { Search, Users, BookOpen, Calendar, User, X, LogOut, Plus } from 'lucide-react';

export default function Classes() {
  const [activeTab, setActiveTab] = useState('my-classes');
  const [myClasses, setMyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [leavingClassId, setLeavingClassId] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [classToLeave, setClassToLeave] = useState(null);

  // Load classes based on active tab
  const loadClasses = useCallback(async (loadBoth = false) => {
    try {
      setLoading(true);
      setError('');
      
      if (loadBoth || activeTab === 'my-classes') {
        // Load my enrolled classes
        const myData = await classService.getMyClasses();
        setMyClasses(Array.isArray(myData) ? myData : []);
      }
      
      if (loadBoth || activeTab === 'all-classes') {
        // Load all available classes (including enrolled ones)
        const allData = await classService.getAllClasses();
        setAllClasses(Array.isArray(allData) ? allData : []);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err.message || 'Failed to load classes');
      toast.error(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load both tabs on initial mount to show correct counts
  useEffect(() => {
    loadClasses(true);
  }, []);

  // Load classes when tab changes
  useEffect(() => {
    loadClasses(false);
  }, [activeTab]);

  // Handle join class
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      toast.error('Please enter a class code');
      return;
    }

    setJoinLoading(true);
    try {
      await classService.joinClass(classCode.trim());
      toast.success('Successfully joined class!');
      setShowJoinModal(false);
      setClassCode('');
      // Refresh both my classes and all classes to update UI
      setLoading(true);
      try {
        const [myData, allData] = await Promise.all([
          classService.getMyClasses(),
          classService.getAllClasses()
        ]);
        setMyClasses(Array.isArray(myData) ? myData : []);
        setAllClasses(Array.isArray(allData) ? allData : []);
      } catch (refreshErr) {
        console.error('Error refreshing classes:', refreshErr);
      } finally {
        setLoading(false);
      }
      // Switch to my-classes tab to show the newly joined class
      setActiveTab('my-classes');
    } catch (err) {
      console.error('Error joining class:', err);
      toast.error(err.message || 'Failed to join class');
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle leave class confirmation
  const handleLeaveClassClick = (classId, className) => {
    setClassToLeave({ id: classId, name: className });
    setShowLeaveModal(true);
  };

  // Handle leave class
  const handleLeaveClass = async () => {
    if (!classToLeave) return;

    setLeavingClassId(classToLeave.id);
    try {
      await classService.leaveClass(classToLeave.id);
      toast.success('Successfully left class');
      // Refresh both my classes and all classes to update UI
      setLoading(true);
      try {
        const [myData, allData] = await Promise.all([
          classService.getMyClasses(),
          classService.getAllClasses()
        ]);
        setMyClasses(Array.isArray(myData) ? myData : []);
        setAllClasses(Array.isArray(allData) ? allData : []);
      } catch (refreshErr) {
        console.error('Error refreshing classes:', refreshErr);
      } finally {
        setLoading(false);
      }
      setShowLeaveModal(false);
      setClassToLeave(null);
    } catch (err) {
      console.error('Error leaving class:', err);
      toast.error(err.message || 'Failed to leave class');
    } finally {
      setLeavingClassId(null);
    }
  };

  // Filter classes based on search term
  const filterClasses = (classes) => {
    if (!searchTerm.trim()) return classes;
    
    const term = searchTerm.toLowerCase();
    return classes.filter((cls) => {
      const name = (cls.name || cls.className || '').toLowerCase();
      const description = (cls.description || '').toLowerCase();
      const teacherName = (cls.teacher_id?.name || cls.teacher?.name || cls.teacherName || '').toLowerCase();
      const classCode = (cls.class_code || cls.classCode || cls.code || '').toLowerCase();
      
      return (
        name.includes(term) ||
        description.includes(term) ||
        teacherName.includes(term) ||
        classCode.includes(term)
      );
    });
  };

  const filteredMyClasses = filterClasses(myClasses);
  const filteredAllClasses = filterClasses(allClasses);

  // Format class data for display
  // API response: { name, description, teacher_id: { name }, class_code, students: [...] }
  const formatClass = (cls) => ({
    id: cls._id || cls.id,
    name: cls.name || cls.className || 'Unnamed Class',
    description: cls.description || '',
    // API returns teacher_id object with name property, not teacher
    teacherName: cls.teacher_id?.name || cls.teacher?.name || cls.teacherName || 'Unknown Teacher',
    // API returns students as array
    studentCount: Array.isArray(cls.students) ? cls.students.length : (cls.studentCount || 0),
    // API returns class_code (with underscore), not classCode
    classCode: cls.class_code || cls.classCode || cls.code || '',
    schedule: cls.schedule || '',
    createdAt: cls.createdAt || cls.created_at,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Classes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Join and manage your classes
            </p>
          </div>
          <Button
            onClick={() => setShowJoinModal(true)}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Join Class
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('my-classes')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'my-classes'
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              My Classes ({myClasses.length})
            </button>
            <button
              onClick={() => setActiveTab('all-classes')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'all-classes'
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Classes ({allClasses.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classes by name, subject, teacher, or code..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading classes...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Classes Grid */}
        {!loading && (
          <>
            {activeTab === 'my-classes' && (
              <>
                {filteredMyClasses.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No classes enrolled
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Join a class using a class code to get started
                    </p>
                    <Button
                      onClick={() => setShowJoinModal(true)}
                      className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                    >
                      Join Your First Class
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMyClasses.map((cls) => {
                      const formatted = formatClass(cls);
                      return (
                        <Card key={formatted.id} className="hover:shadow-xl transition-all duration-300">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                  {formatted.name}
                                </h3>
                              </div>
                              <button
                                onClick={() => handleLeaveClassClick(formatted.id, formatted.name)}
                                disabled={leavingClassId === formatted.id}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Leave class"
                              >
                                {leavingClassId === formatted.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <LogOut className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {formatted.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {formatted.description}
                              </p>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <User className="w-4 h-4 mr-2" />
                                <span>{formatted.teacherName}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{formatted.studentCount} students</span>
                              </div>
                              {formatted.schedule && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{formatted.schedule}</span>
                                </div>
                              )}
                              {formatted.classCode && (
                                <div className="flex items-center text-sm">
                                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                                    Code: {formatted.classCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'all-classes' && (
              <>
                {filteredAllClasses.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
                    <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No classes available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new classes'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAllClasses.map((cls) => {
                      const formatted = formatClass(cls);
                      const isEnrolled = myClasses.some(
                        (c) => (c._id || c.id) === formatted.id
                      );
                      return (
                        <Card key={formatted.id} className="hover:shadow-xl transition-all duration-300">
                          <CardHeader>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {formatted.name}
                            </h3>
                          </CardHeader>
                          <CardContent>
                            {formatted.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {formatted.description}
                              </p>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <User className="w-4 h-4 mr-2" />
                                <span>{formatted.teacherName}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{formatted.studentCount} students</span>
                              </div>
                              {formatted.schedule && (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{formatted.schedule}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            {isEnrolled ? (
                              <div className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium text-center">
                                Already Enrolled
                              </div>
                            ) : (
                              <Button
                                onClick={() => {
                                  setClassCode(formatted.classCode);
                                  setShowJoinModal(true);
                                }}
                                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                              >
                                Join Class
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Join Class Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Join Class
                  </h2>
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setClassCode('');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <form onSubmit={handleJoinClass}>
                <CardContent>
                  <Input
                    label="Class Code"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Enter class code"
                    required
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Ask your teacher for the class code to join
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowJoinModal(false);
                        setClassCode('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={joinLoading || !classCode.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                    >
                      {joinLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Joining...
                        </div>
                      ) : (
                        'Join'
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* Leave Class Confirmation Modal */}
        {showLeaveModal && classToLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Leave Class
                  </h2>
                  <button
                    onClick={() => {
                      setShowLeaveModal(false);
                      setClassToLeave(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                    <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Are you sure you want to leave this class?
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {classToLeave.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You will lose access to all class materials, exams, and submissions. This action cannot be undone.
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLeaveModal(false);
                      setClassToLeave(null);
                    }}
                    className="flex-1"
                    disabled={leavingClassId === classToLeave.id}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLeaveClass}
                    disabled={leavingClassId === classToLeave.id}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                  >
                    {leavingClassId === classToLeave.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Leaving...
                      </div>
                    ) : (
                      'Leave Class'
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

