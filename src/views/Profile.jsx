import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Initialize with user data or empty strings
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  
  // Change password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Debug log
  console.log('Profile component - user:', user);

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    // If it's already a full URL (http/https), return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    // If it's a relative path starting with /, add base URL
    if (avatarPath.startsWith('/')) {
      return `${window.location.origin}${avatarPath}`;
    }
    // Otherwise return as is
    return avatarPath;
  };

  // Load user data from API when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await authService.getUserProfile();
        const avatarUrl = getAvatarUrl(profile.avatar);
        
        setProfileData(profile);
        setName(profile.name || '');
        setEmail(profile.email || '');
        setAvatar(profile.avatar || '');
        setAvatarPreview(avatarUrl);
        setRole(profile.role || '');
        setCreatedAt(profile.createdAt || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback to stored user
        const storedUser = authService.currentUser();
        if (storedUser) {
          const avatarUrl = getAvatarUrl(storedUser.avatar);
          
          setProfileData(storedUser);
          setName(storedUser.name || '');
          setEmail(storedUser.email || '');
          setAvatar(storedUser.avatar || '');
          setAvatarPreview(avatarUrl);
          setRole(storedUser.role || '');
          setCreatedAt(storedUser.createdAt || '');
        }
        setIsLoading(false);
        setMessage('Failed to load profile from server. Showing cached data.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    };

    fetchProfile();
  }, []);

  // Show loading only briefly
  if (isLoading && !user && !authService.currentUser()) {
    return (
      <div className="min-h-screen py-10 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Use profileData from API or fallback to stored user
  const currentUser = profileData || user || authService.currentUser();
  
  if (!currentUser && !isLoading) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  async function handleUpdate(e) {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      
      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      // Only append avatar if a new file was selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      // Call API to update profile
      const data = await authService.updateUserProfile(formData);
      
      // Update local state with new data
      if (data.user) {
        const avatarUrl = getAvatarUrl(data.user.avatar);
        
        setProfileData(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setAvatar(data.user.avatar);
        setAvatarPreview(avatarUrl);
        setRole(data.user.role);
        setCreatedAt(data.user.createdAt);
      }
      
      // Refresh auth state to update navbar
      refresh();
      
      setMessage(data.message || 'Profile updated successfully!');
      setMessageType('success');
      setIsEditing(false);
      setAvatarFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Auto hide message
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(error.message || 'Failed to update profile. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage('');
    setMessageType('success');

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('Please fill in all password fields');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New password and confirm password do not match');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      setMessage('Password changed successfully! Please login again with your new password.');
      setMessageType('success');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'Failed to change password. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  }

  const cancelEdit = () => {
    const avatarUrl = getAvatarUrl(currentUser.avatar);
    
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setAvatar(currentUser.avatar || '');
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
    setIsEditing(false);
    setMessage('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mock user stats
  const userStats = {
    flashcardsCreated: 24,
    decksCompleted: 12,
    streak: 7,
    accuracy: 85
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Manage your account and track your learning progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
              {/* User Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          setAvatarPreview(''); // Clear preview to show fallback
                        }}
                      />
                    ) : (
                      <span className="text-2xl text-white font-bold">
                        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Icon name="camera" className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentUser.name || 'User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {currentUser.email || 'user@example.com'}
                </p>
                {role && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {role}
                    </span>
                  </div>
                )}
                {createdAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Member since {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: 'profile' },
                  // { id: 'stats', label: 'Statistics', icon: 'stats' },
                  { id: 'settings', label: 'Settings', icon: 'settings' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon name={item.icon} className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-center text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Icon name="logout" className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Success/Error Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border ${
                messageType === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="edit" className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon name="save" className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 transition-colors duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        value={role}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors duration-200"
                        placeholder="Role"
                      />
                    </div>

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Change Avatar
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 border border-gray-300 dark:border-gray-600"
                          >
                            <Icon name="upload" className="w-4 h-4" />
                            Choose File
                          </button>
                          {avatarFile && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {avatarFile.name}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Max file size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                      </div>
                    )}
                  </div>

                  {createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Member Since
                      </label>
                      <input
                        value={new Date(createdAt).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors duration-200"
                      />
                    </div>
                  )}

                  {isEditing && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <Icon name="info" className="w-4 h-4 mr-2" /> Make sure to save your changes before leaving this page.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Learning Statistics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Flashcards Created', value: userStats.flashcardsCreated, icon: 'flashcards', color: 'blue' },
                    { label: 'Decks Completed', value: userStats.decksCompleted, icon: 'check', color: 'green' },
                    { label: 'Current Streak', value: `${userStats.streak} days`, icon: 'clock', color: 'orange' },
                    { label: 'Accuracy', value: `${userStats.accuracy}%`, icon: 'progress', color: 'purple' }
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center"
                    >
                      <div className="mb-2 flex justify-center">
                        <Icon name={stat.icon} className="w-6 h-6" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Weekly Progress
                  </h4>
                  {[
                    { day: 'Mon', progress: 80 },
                    { day: 'Tue', progress: 60 },
                    { day: 'Wed', progress: 90 },
                    { day: 'Thu', progress: 75 },
                    { day: 'Fri', progress: 85 },
                    { day: 'Sat', progress: 50 },
                    { day: 'Sun', progress: 70 }
                  ].map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {day.day}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${day.progress}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">
                        {day.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Settings
                </h3>

                {/* Change Password Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Change Password
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    {!showChangePassword && (
                      <Button
                        onClick={() => setShowChangePassword(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Icon name="lock" className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    )}
                  </div>

                  {showChangePassword && (
                    <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="Enter new password (min 6 characters)"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowChangePassword(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          disabled={isChangingPassword}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isChangingPassword}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isChangingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Icon name="save" className="w-4 h-4 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Other Settings */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Other Settings
                  </h4>
                  {[
                    {
                      title: 'Notifications',
                      description: 'Manage how you receive notifications',
                      icon: 'settings',
                      action: 'Configure'
                    },
                    {
                      title: 'Privacy',
                      description: 'Control your privacy settings',
                      icon: 'lock',
                      action: 'Manage'
                    },
                    {
                      title: 'Language',
                      description: 'Change your preferred language',
                      icon: 'settings',
                      action: 'Select'
                    },
                    {
                      title: 'Appearance',
                      description: 'Switch between light and dark mode',
                      icon: 'settings',
                      action: 'Customize'
                    }
                  ].map((setting, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                          <Icon name={setting.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {setting.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {setting.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}