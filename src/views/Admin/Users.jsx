import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import { userService } from '../../services/userService';

export default function Users() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      
      // Log raw API data for debugging
      // console.log('Raw API users data:', data.users);
      
      // Transform API response to match component expectations
      const transformedUsers = (data.users || []).map(user => {
        let joinDate = 'Unknown';
        if (user.createdAt) {
          try {
            const date = new Date(user.createdAt);
            if (!isNaN(date.getTime())) {
              joinDate = date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('Invalid createdAt date:', user.createdAt);
          }
        }
        
        // Get progress from API if available, otherwise default to 0
        const progress = user.progress !== undefined ? user.progress : 
                        (user.role === 'Student' ? 0 : null);
        
        // Get students count for Teachers
        const students = user.students || user.studentCount || null;
        
        return {
          id: user._id || user.id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || (user.isActive !== undefined ? (user.isActive === false ? 'inactive' : 'active') : 'active'),
          joinDate: joinDate,
          lastActive: formatLastActive(user.lastActive || user.lastLogin || user.updatedAt || user.createdAt),
          progress: progress,
          students: students,
          verified: user.verified !== undefined ? user.verified : true,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastActiveDate: user.lastActive || user.lastLogin || user.updatedAt || user.createdAt
        };
      });
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format last active time
  const formatLastActive = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Calculate stats from users
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    teachers: users.filter(u => u.role === 'Teacher').length,
    students: users.filter(u => u.role === 'Student').length,
    moderators: users.filter(u => u.role === 'Moderator').length,
    newToday: users.filter(u => {
      const created = new Date(u.createdAt);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length
  };

  const tabs = [
    { id: 'all', name: 'All Users', count: userStats.total, icon: 'users' },
    { id: 'active', name: 'Active', count: userStats.active, icon: 'check' },
    { id: 'pending', name: 'Pending', count: userStats.pending, icon: 'clock' },
    { id: 'teachers', name: 'Teachers', count: userStats.teachers, icon: 'teacher' },
    { id: 'students', name: 'Students', count: userStats.students, icon: 'student' }
  ];

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Administrator' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });

  // Sorting function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filters.role === 'all' || user.role.toLowerCase() === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'joinDate') {
        return sortConfig.direction === 'asc'
          ? new Date(a.joinDate) - new Date(b.joinDate)
          : new Date(b.joinDate) - new Date(a.joinDate);
      }
      if (sortConfig.key === 'progress') {
        return sortConfig.direction === 'asc'
          ? (a.progress || 0) - (b.progress || 0)
          : (b.progress || 0) - (a.progress || 0);
      }
      return 0;
    });

  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    const actionText = action === 'activate' ? 'activate' : action === 'suspend' ? 'suspend' : 'export';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`)) {
      return;
    }

    if (action === 'export') {
      // console.log('Exporting users:', selectedUsers);
      setSelectedUsers([]);
      return;
    }

    try {
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      
      const updatePromises = selectedUsers.map(userId => {
        const user = users.find(u => u.id === userId);
        if (!user) return Promise.resolve();
        
        return userService.updateUserStatus(user._id || user.id, newStatus)
          .catch(() => {
            return null;
          });
      });

      await Promise.all(updatePromises);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: newStatus }
            : user
        )
      );
      
      setSelectedUsers([]);
      await fetchUsers();
    } catch (err) {
      console.error(`Error ${action}ing users:`, err);
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      setUsers(prevUsers => 
        prevUsers.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: newStatus }
            : user
        )
      );
      setSelectedUsers([]);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      // Refresh users list
      await fetchUsers();
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      await userService.updateUserRole(editingUser._id || editingUser.id, newRole);
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      setNewRole('');
    } catch (err) {
      console.error('Error updating user role:', err);
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim()) {
      setCreateError('Please enter full name');
      return;
    }
    if (!newUser.email.trim()) {
      setCreateError('Please enter email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setCreateError('Please enter a valid email address');
      return;
    }
    if (!newUser.password || newUser.password.length < 6) {
      setCreateError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      
      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role
      };

      await userService.createUser(userData);
      
      setNewUser({ name: '', email: '', password: '', role: 'Student' });
      setShowUserModal(false);
      setCreateError('');
      
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionText} ${user.name}?`)) {
      return;
    }

    try {
      await userService.updateUserStatus(user._id || user.id, newStatus);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      if (err.status === 404 || err.message?.includes('not found')) {
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, status: newStatus } : u
          )
        );
      } else {
        alert(err.message || 'Failed to update user status');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'teacher': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'moderator': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span>⬆️</span> : <span>⬇️</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage users, search, filter, and perform actions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">{userStats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.active}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.teachers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Teachers</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.students}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.moderators}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moderators</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userStats.newToday}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">New Today</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
              }`}
            >
              <Icon name={tab.icon} className="w-5 h-5" />
              {tab.name}
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400 text-lg">🔍</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2">
                {/* Temporarily hidden - Bulk Activate/Deactivate buttons */}
                {/* <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                >
                  Deactivate
                </button> */}
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-red-800 dark:text-red-300 text-sm font-medium">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {searchTerm ? 'Try adjusting your search terms or filters' : 'No users match the current criteria'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            User
                            <SortIcon columnKey="name" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Status
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => handleSort('joinDate')}
                        >
                          <div className="flex items-center gap-2">
                            Join Date
                            <SortIcon columnKey="joinDate" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Last Active
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => handleSort('progress')}
                        >
                          <div className="flex items-center gap-2">
                            Progress
                            <SortIcon columnKey="progress" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                  {user.verified && (
                                    <span className="ml-2 text-blue-500" title="Verified">✓</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {user.joinDate || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {user.lastActive || 'Unknown'}
                          </td>
                          <td className="px-6 py-4">
                            {user.role === 'Student' ? (
                              user.progress !== null && user.progress !== undefined ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(100, Math.max(0, user.progress))}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{user.progress}%</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                              )
                            ) : user.role === 'Teacher' ? (
                              user.students !== null && user.students !== undefined ? (
                                <span className="text-sm text-gray-600 dark:text-gray-400">{user.students} students</span>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                              )
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                                title="Edit Role"
                              >
                                <Icon name="edit" className="w-4 h-4" />
                              </button>
                              {/* Temporarily hidden - Active/Deactivate button */}
                              {/* <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.status === 'active' 
                                    ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                                title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {user.status === 'active' ? (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="4" width="4" height="16"/>
                                    <rect x="14" y="4" width="4" height="16"/>
                                  </svg>
                                ) : (
                                  <Icon name="check" className="w-4 h-4" />
                                )}
                              </button> */}
                              <button 
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                                title="Delete"
                              >
                                <Icon name="close" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Icon name="arrowLeft" className="w-4 h-4" />
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              2
            </button>
            <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              Next
              <Icon name="arrowRight" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New User</h3>
              
              {createError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-800 dark:text-red-300">{createError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setNewUser({ name: '', email: '', password: '', role: 'Student' });
                      setCreateError('');
                    }}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateUser}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icon name="plus" className="w-4 h-4" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Update User Role</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    User: <span className="font-medium text-gray-900 dark:text-white">{editingUser.name}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Email: <span className="font-medium text-gray-900 dark:text-white">{editingUser.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select New Role
                  </label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setNewRole('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateRole}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Icon name="save" className="w-4 h-4" />
                    Update Role
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