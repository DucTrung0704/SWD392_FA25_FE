import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  
  // Initialize with user data or empty strings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);

  // Debug log
  console.log('Profile component - user:', user);

  // Load user data when component mounts or user changes
  useEffect(() => {
    // Check localStorage directly for immediate data
    const storedUser = authService.currentUser();
    console.log('Profile useEffect - stored user:', storedUser);
    
    if (storedUser) {
      setName(storedUser.name || '');
      setEmail(storedUser.email || '');
      setBio(storedUser.bio || '');
      setIsLoading(false);
    } else if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setIsLoading(false);
    }
    // Also set loading to false after a short delay if still loading
    const timeout = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timeout);
  }, [user]);

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

  // Use stored user if hook user is not available yet
  const currentUser = user || authService.currentUser();
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      // Mock update profile
      const updated = { 
        ...currentUser, 
        name,
        email,
        bio,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('app_auth_user', JSON.stringify(updated));
      
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setIsEditing(false);
      refresh();
      
      // Auto hide message
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
    }
  }

  async function handleLogout() {
    await authService.logout();
    refresh();
    navigate('/', { replace: true });
  }

  const cancelEdit = () => {
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setBio(currentUser.bio || '');
    setIsEditing(false);
    setMessage('');
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
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl text-white font-bold">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentUser.name || 'User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {currentUser.email || 'user@example.com'}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: 'profile' },
                  { id: 'stats', label: 'Statistics', icon: 'stats' },
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
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="save" className="w-4 h-4 mr-2" />
                        Save Changes
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 resize-none transition-colors duration-200"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

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

                <div className="space-y-6">
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