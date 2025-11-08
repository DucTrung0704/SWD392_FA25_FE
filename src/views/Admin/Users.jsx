import React, { useState, useEffect } from 'react';
import Icon from '../../components/ui/Icon';
import { userService } from '../../services/userService';
import { Users as UsersIcon, Search, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, X, Eye, Plus, MoreVertical } from 'lucide-react';

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterRules, setFilterRules] = useState([]);
  const [tempFilter, setTempFilter] = useState({ field: 'name', operator: 'contains', value: '' });

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      console.log({data});
      
      
      
      const transformedUsers = (data.users || []).map(user => {
        let joinDate = 'Unknown';
        if (user.created_at || user.createdAt) {
          try {
            const date = new Date(user.created_at || user.createdAt);
            if (!isNaN(date.getTime())) {
              joinDate = date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('Invalid created_at date:', user.created_at || user.createdAt);
          }
        }
        
        return {
          id: user._id || user.id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || (user.isActive !== undefined ? (user.isActive === false ? 'inactive' : 'active') : 'active'),
          joinDate: joinDate,
          lastActive: formatLastActive(user.lastLogin || user.lastActive || user.updated_at || user.updatedAt || user.created_at || user.createdAt),
          progress: user.progress !== undefined ? user.progress : null,
          students: user.students || user.studentCount || null,
          verified: user.verified !== undefined ? user.verified : false,
          avatar: user.avatar,
          createdAt: user.created_at || user.createdAt,
          updatedAt: user.updated_at || user.updatedAt,
          lastActiveDate: user.lastLogin || user.lastActive || user.updated_at || user.updatedAt || user.created_at || user.createdAt,
          isActive: user.isActive !== undefined ? user.isActive : true,
          lastLogin: user.lastLogin
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
    admins: users.filter(u => u.role === 'Admin').length,
    newToday: users.filter(u => {
      const created = new Date(u.createdAt || u.created_at);
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
      // Apply filter rules
      if (filterRules.length > 0) {
        const matchesAllRules = filterRules.every(rule => {
          if (!rule.value) return true; // Skip empty rules
          
          let userValue;
          if (rule.field === 'role') {
            userValue = user.role.toLowerCase();
          } else if (rule.field === 'status') {
            userValue = user.status.toLowerCase();
          } else {
            userValue = String(user[rule.field] || '').toLowerCase();
          }
          const filterValue = rule.value.toLowerCase();
          
          switch (rule.operator) {
            case 'contains':
              return userValue.includes(filterValue);
            case 'equals':
              return userValue === filterValue;
            case 'startsWith':
              return userValue.startsWith(filterValue);
            case 'endsWith':
              return userValue.endsWith(filterValue);
            default:
              return true;
          }
        });
        if (!matchesAllRules) return false;
      }
      
      // Apply search term (if no filter rules)
      if (filterRules.length === 0 && searchTerm) {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }
      
      // Apply role and status filters
      const matchesRole = filters.role === 'all' || user.role.toLowerCase() === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      
      return matchesRole && matchesStatus;
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
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedUsers([]);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, filterRules]);

  const handleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedUsers.map(user => user.id);
      setSelectedUsers(prev => {
        const newSelection = [...prev];
        pageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      const pageIds = paginatedUsers.map(user => user.id);
      setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
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

  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
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
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" />
      : <ArrowDown className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage users, search, filter, and perform actions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {userStats.total}
                </p>
          </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {userStats.active}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Teachers</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {userStats.teachers}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Students</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {userStats.students}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
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
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
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
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                    <option value="status">Status</option>
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
                        setTempFilter({ field: 'name', operator: 'contains', value: '' });
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
                setFilterRules([...filterRules, { field: 'name', operator: 'contains', value: '' }]);
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
                  setTempFilter({ field: 'name', operator: 'contains', value: '' });
                  setSearchTerm('');
                  setFilters({ role: 'all', status: 'all' });
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear all filters
              </button>
            )}
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
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || filters.role !== 'all' || filters.status !== 'all' || filterRules.length > 0
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by creating your first user.'}
                  </p>
                  {!searchTerm && filters.role === 'all' && filters.status === 'all' && filterRules.length === 0 && (
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                      <Icon name="plus" className="w-5 h-5" />
                      Create Your First User
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Users <span className="text-orange-600 dark:text-orange-400">({filteredUsers.length})</span>
                      </h2>
                    </div>
                  </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          <input
                            type="checkbox"
                              checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0 && paginatedUsers.every(user => selectedUsers.includes(user.id))}
                            onChange={handleSelectAll}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            User
                            <SortIcon columnKey="name" />
                          </div>
                        </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => handleSort('joinDate')}
                        >
                          <div className="flex items-center gap-2">
                            Join Date
                            <SortIcon columnKey="joinDate" />
                          </div>
                        </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Last Active
                        </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedUsers.map((user) => (
                        <tr 
                          key={user.id} 
                            className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                            selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                  {user.name}
                                  {user.verified && (
                                    <CheckCircle className="w-4 h-4 text-blue-500" title="Verified" />
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
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleViewUser(user)}
                                className="w-9 h-9 flex items-center justify-center text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="w-9 h-9 flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
                                title="Edit Role"
                              >
                                <Icon name="edit" className="w-4 h-4" />
                              </button>
                              {/* Temporarily hidden - Active/Deactivate button */}
                              {/* <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                                  user.status === 'active' 
                                    ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 border border-orange-200 dark:border-orange-800' 
                                    : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'
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
                                className="w-9 h-9 flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95" 
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

        {/* Pagination */}
                  {filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
                          Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span>
                          {' - '}
                          <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, filteredUsers.length)}</span>
                          {' of '}
                          <span className="font-medium text-gray-900 dark:text-white">{filteredUsers.length}</span>
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
                </>
              )}
            </>
          )}
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Icon name="save" className="w-4 h-4" />
                    Update Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* View User Detail Modal */}
        {showViewModal && viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingUser(null);
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {viewingUser.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {viewingUser.name}
                      </h4>
                      {viewingUser.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500" title="Verified" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{viewingUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(viewingUser.role)}`}>
                        {viewingUser.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingUser.status)}`}>
                        {viewingUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Join Date</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingUser.joinDate || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Active</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {viewingUser.lastActive || 'Unknown'}
                    </p>
                  </div>
                  {viewingUser.role === 'Student' && viewingUser.progress !== null && viewingUser.progress !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, viewingUser.progress))}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                          {viewingUser.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                  {viewingUser.role === 'Teacher' && viewingUser.students !== null && viewingUser.students !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Students</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {viewingUser.students} students
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {viewingUser.createdAt && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Created</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(viewingUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditUser(viewingUser);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}