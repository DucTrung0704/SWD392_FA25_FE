import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Settings as SettingsIcon, Shield } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export default function TeacherSettings() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  
  // Profile data from API
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  
  // Keep existing states
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Mathematics');
  const [bio, setBio] = useState('');
  const [office, setOffice] = useState('');
  const [officeHours, setOfficeHours] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    examAlerts: true,
    studentMessages: true,
    weeklyReports: false,
    gradeUpdates: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showContactInfo: false,
    showSchedule: true,
    allowStudentMessages: true,
    showGradeHistory: false
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('success');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'profile' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'privacy', label: 'Privacy', icon: 'lock' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'shield' }
  ];

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    if (avatarPath.startsWith('/')) {
      return `${window.location.origin}${avatarPath}`;
    }
    return avatarPath;
  };

  // Load profile from API on mount
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

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const data = await authService.updateUserProfile(formData);
      
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
      
      refresh();
      
      setMessage(data.message || 'Profile updated successfully!');
      setMessageType('success');
      setIsEditing(false);
      setAvatarFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(error.message || 'Failed to update profile. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    const currentUser = profileData || user || authService.currentUser();
    const avatarUrl = getAvatarUrl(currentUser?.avatar);
    
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setAvatar(currentUser?.avatar || '');
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
    setIsEditing(false);
    setMessage('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordMessageType('success');

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('Please fill in all password fields');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New password and confirm password do not match');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      
      setPasswordMessage('Password changed successfully! Please login again with your new password.');
      setPasswordMessageType('success');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      setPasswordMessage(error.message || 'Failed to change password. Please try again.');
      setPasswordMessageType('error');
      setTimeout(() => setPasswordMessage(''), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Manage your account settings, preferences, and privacy options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon === 'profile' && <User className="w-4 h-4" />}
                    {tab.icon === 'notifications' && <Bell className="w-4 h-4" />}
                    {tab.icon === 'privacy' && <Lock className="w-4 h-4" />}
                    {tab.icon === 'preferences' && <SettingsIcon className="w-4 h-4" />}
                    {tab.icon === 'security' && <Shield className="w-4 h-4" />}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
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

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              setAvatarPreview('');
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold text-2xl">
                            {name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
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
                    <div>
                      {isEditing ? (
                        <>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Choose File
                          </button>
                          {avatarFile && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {avatarFile.name}
                            </p>
                          )}
                        </>
                      ) : null}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Member Since
                        </label>
                        <input
                          type="text"
                          value={new Date(createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'assignmentReminders' && 'Get reminded about upcoming assignments'}
                            {key === 'examAlerts' && 'Receive alerts for scheduled exams'}
                            {key === 'studentMessages' && 'Get notified when students send messages'}
                            {key === 'weeklyReports' && 'Receive weekly performance reports'}
                            {key === 'gradeUpdates' && 'Get notified when grades are updated'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Visibility</h3>
                    {Object.entries(privacySettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {key === 'showProfile' && 'Make your profile visible to students'}
                            {key === 'showContactInfo' && 'Show contact information to students'}
                            {key === 'showSchedule' && 'Display your schedule to students'}
                            {key === 'allowStudentMessages' && 'Allow students to send you messages'}
                            {key === 'showGradeHistory' && 'Show grade history to students'}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePrivacyToggle(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Zone
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="UTC+7">UTC+7 (Vietnam)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC-5">UTC-5 (EST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Page Size
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="10">10 items per page</option>
                      <option value="25">25 items per page</option>
                      <option value="50">50 items per page</option>
                      <option value="100">100 items per page</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  {/* Password Change Message */}
                  {passwordMessage && (
                    <div className={`p-4 rounded-xl border ${
                      passwordMessageType === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    }`}>
                      {passwordMessage}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                          required
                          disabled={isChangingPassword}
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
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password (min 6 characters)"
                          required
                          disabled={isChangingPassword}
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
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                          required
                          disabled={isChangingPassword}
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating Password...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Enable 2FA</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Login Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Current Session</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Chrome on Windows • Last active now
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400 rounded-full text-xs">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Mobile App</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            iOS App • Last active 2 hours ago
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
