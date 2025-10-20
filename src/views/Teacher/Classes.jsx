import React, { useState } from 'react';
import { Plus, Home, Users, Clock, TrendingUp, Search, Eye, Edit, Settings, Calendar } from 'lucide-react';

export default function TeacherClasses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for classes
  const classes = [
    {
      id: 1,
      name: 'Mathematics 10A',
      subject: 'Mathematics',
      grade: '10',
      classCode: 'MATH10A',
      students: 28,
      schedule: 'Mon, Wed, Fri 9:00-10:00',
      room: 'Room 201',
      teacher: 'Ms. Nguyen',
      avgGrade: 8.2,
      attendance: 94,
      status: 'active',
      description: 'Advanced mathematics course covering algebra, geometry, and trigonometry.',
      nextClass: '2024-01-20T09:00:00',
      assignments: 5,
      exams: 2
    },
    {
      id: 2,
      name: 'Biology 11B',
      subject: 'Biology',
      grade: '11',
      classCode: 'BIO11B',
      students: 32,
      schedule: 'Tue, Thu 10:30-11:30',
      room: 'Lab 105',
      teacher: 'Dr. Tran',
      avgGrade: 7.8,
      attendance: 91,
      status: 'active',
      description: 'Comprehensive biology course with laboratory sessions.',
      nextClass: '2024-01-21T10:30:00',
      assignments: 3,
      exams: 1
    },
    {
      id: 3,
      name: 'Physics 12A',
      subject: 'Physics',
      grade: '12',
      classCode: 'PHY12A',
      students: 25,
      schedule: 'Mon, Wed, Fri 14:00-15:00',
      room: 'Lab 203',
      teacher: 'Mr. Le',
      avgGrade: 8.5,
      attendance: 96,
      status: 'active',
      description: 'Advanced physics course preparing students for university.',
      nextClass: '2024-01-20T14:00:00',
      assignments: 4,
      exams: 3
    },
    {
      id: 4,
      name: 'Chemistry 10B',
      subject: 'Chemistry',
      grade: '10',
      classCode: 'CHEM10B',
      students: 30,
      schedule: 'Tue, Thu 11:00-12:00',
      room: 'Lab 102',
      teacher: 'Ms. Pham',
      avgGrade: 7.9,
      attendance: 89,
      status: 'active',
      description: 'Introduction to chemistry with practical experiments.',
      nextClass: '2024-01-21T11:00:00',
      assignments: 6,
      exams: 2
    },
    {
      id: 5,
      name: 'English Literature 11A',
      subject: 'English',
      grade: '11',
      classCode: 'ENG11A',
      students: 27,
      schedule: 'Mon, Wed 13:00-14:00',
      room: 'Room 305',
      teacher: 'Ms. Hoang',
      avgGrade: 8.1,
      attendance: 93,
      status: 'active',
      description: 'Advanced English literature and composition course.',
      nextClass: '2024-01-20T13:00:00',
      assignments: 4,
      exams: 2
    }
  ];

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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Past due';
    return `In ${diffDays} days`;
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Attendance</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length)}%
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
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Grade</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {(classes.reduce((sum, cls) => sum + cls.avgGrade, 0) / classes.length).toFixed(1)}
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

        {/* Classes Grid */}
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Schedule:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">{cls.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      Room:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{cls.room}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Avg Grade:
                    </span>
                    <span className={`font-medium ${getGradeColor(cls.avgGrade)}`}>
                      {cls.avgGrade}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Attendance:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{cls.attendance}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Next Class:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatNextClass(cls.nextClass)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.assignments}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Assignments</div>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.exams}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Exams</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Class</h3>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mathematics 10A"
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
                        <option value="History">History</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grade Level
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Room
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Room 201"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Students
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mon, Wed, Fri 9:00-10:00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe the class content and objectives"
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
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Class
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
