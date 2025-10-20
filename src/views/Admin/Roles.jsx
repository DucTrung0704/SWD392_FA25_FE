import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';

export default function Roles() {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for roles and permissions
  const roles = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      userCount: 3,
      permissions: ['all'],
      color: 'from-red-500 to-pink-600',
      icon: 'admin',
      createdAt: '2023-12-01'
    },
    {
      id: 2,
      name: 'Teacher',
      description: 'Can create content, manage students, and view analytics',
      userCount: 47,
      permissions: ['content_create', 'students_manage', 'analytics_view', 'exams_manage'],
      color: 'from-purple-500 to-blue-600',
      icon: 'teacher',
      createdAt: '2023-12-01'
    },
    {
      id: 3,
      name: 'Student',
      description: 'Can study flashcards, take exams, and view progress',
      userCount: 2847,
      permissions: ['content_study', 'exams_take', 'progress_view'],
      color: 'from-green-500 to-teal-600',
      icon: 'student',
      createdAt: '2023-12-01'
    },
    {
      id: 4,
      name: 'Moderator',
      description: 'Can review and moderate user content',
      userCount: 8,
      permissions: ['content_moderate', 'users_view', 'reports_view'],
      color: 'from-orange-500 to-yellow-600',
      icon: 'lock',
      createdAt: '2024-01-05'
    },
    {
      id: 5,
      name: 'Analyst',
      description: 'Can view analytics and generate reports',
      userCount: 5,
      permissions: ['analytics_view', 'reports_generate', 'data_export'],
      color: 'from-blue-500 to-cyan-600',
      icon: 'stats',
      createdAt: '2024-01-08'
    }
  ];

  const permissionCategories = [
    {
      category: 'User Management',
      permissions: [
        { id: 'users_view', name: 'View Users', description: 'Can view user profiles and lists' },
        { id: 'users_manage', name: 'Manage Users', description: 'Can create, edit, and delete users' },
        { id: 'users_roles', name: 'Assign Roles', description: 'Can assign roles to users' }
      ]
    },
    {
      category: 'Content Management',
      permissions: [
        { id: 'content_view', name: 'View Content', description: 'Can view all content' },
        { id: 'content_create', name: 'Create Content', description: 'Can create new content' },
        { id: 'content_edit', name: 'Edit Content', description: 'Can edit existing content' },
        { id: 'content_delete', name: 'Delete Content', description: 'Can delete content' },
        { id: 'content_moderate', name: 'Moderate Content', description: 'Can review and moderate content' }
      ]
    },
    {
      category: 'Analytics & Reports',
      permissions: [
        { id: 'analytics_view', name: 'View Analytics', description: 'Can access analytics dashboard' },
        { id: 'reports_generate', name: 'Generate Reports', description: 'Can generate system reports' },
        { id: 'data_export', name: 'Export Data', description: 'Can export system data' }
      ]
    },
    {
      category: 'System Administration',
      permissions: [
        { id: 'system_settings', name: 'Manage Settings', description: 'Can modify system settings' },
        { id: 'roles_manage', name: 'Manage Roles', description: 'Can create and edit roles' },
        { id: 'api_manage', name: 'Manage API', description: 'Can manage API access and keys' }
      ]
    }
  ];

  const roleStats = {
    totalRoles: 5,
    totalUsers: 2910,
    mostCommon: 'Student',
    recentlyCreated: 2
  };

  const tabs = [
    { id: 'roles', name: 'Roles', icon: 'users' },
    { id: 'permissions', name: 'Permissions', icon: 'lock' },
    { id: 'assignments', name: 'Assignments', icon: 'file' }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handlePermissionToggle = (permissionId) => {
    if (selectedRole && selectedRole.permissions.includes('all')) return;
    
    // In a real app, this would update the role's permissions
    console.log('Toggling permission:', permissionId);
  };

  const RoleCard = ({ role }) => (
    <div 
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        selectedRole?.id === role.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => handleRoleSelect(role)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon name={role.icon} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{role.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
          {role.userCount} users
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Permissions:</span>
          <span className="font-medium">
            {role.permissions.includes('all') ? 'All permissions' : `${role.permissions.length} permissions`}
          </span>
        </div>

        {!role.permissions.includes('all') && (
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 3).map(permission => (
              <span
                key={permission}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
              >
                {permission.replace('_', ' ')}
              </span>
            ))}
            {role.permissions.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                +{role.permissions.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created: {role.createdAt}</span>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2">
            <Icon name="edit" className="w-4 h-4" />
            Edit Role
          </button>
        </div>
      </div>
    </div>
  );

  const PermissionCategory = ({ category }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">{category.category}</h3>
      <div className="space-y-3">
        {category.permissions.map(permission => (
          <div key={permission.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{permission.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{permission.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {permission.id}</span>
              <input
                type="checkbox"
                checked={selectedRole?.permissions.includes('all') || selectedRole?.permissions.includes(permission.id)}
                onChange={() => handlePermissionToggle(permission.id)}
                disabled={selectedRole?.permissions.includes('all')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'roles':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Roles</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                + Create New Role
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Permission Management</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRole ? `Editing: ${selectedRole.name}` : 'Select a role to edit permissions'}
              </div>
            </div>

            {selectedRole ? (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${selectedRole.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-xl">{selectedRole.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{selectedRole.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRole.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Change Role
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {permissionCategories.map(category => (
                    <PermissionCategory key={category.category} category={category} />
                  ))}
                </div>

                <div className="flex gap-3 justify-end">
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Icon name="close" className="w-4 h-4" />
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2">
                    <Icon name="save" className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Role</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Choose a role from the list to view and modify its permissions. You can manage what each role can access and do within the system.
                </p>
              </div>
            )}
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Role Assignments</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                User role assignment interface will be implemented here...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Role Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Define roles and assign permissions across the system
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">{roleStats.totalRoles}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Roles</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2">
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
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {renderContent()}
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{roleStats.totalRoles}</div>
            <div className="text-blue-100 text-sm">System Roles</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{roleStats.totalUsers}</div>
            <div className="text-green-100 text-sm">Total Users</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{roleStats.mostCommon}</div>
            <div className="text-purple-100 text-sm">Most Common Role</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="text-2xl font-bold">{roleStats.recentlyCreated}</div>
            <div className="text-orange-100 text-sm">New Roles (30d)</div>
          </div>
        </div>

        {/* Create Role Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Role</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter role name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the role's purpose and permissions"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <Icon name="plus" className="w-4 h-4" />
                    Create Role
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