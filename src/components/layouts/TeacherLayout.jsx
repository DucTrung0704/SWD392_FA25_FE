import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle';
import Icon from '../ui/Icon';

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: 'stats', current: location.pathname === '/dashboard/teacher' },
    { name: 'Students', href: '/dashboard/teacher/students', icon: 'users', current: location.pathname.startsWith('/dashboard/teacher/students') },
    { name: 'Flashcards', href: '/dashboard/teacher/flashcards', icon: 'flashcards', current: location.pathname.startsWith('/dashboard/teacher/flashcards') },
    { name: 'Exams', href: '/dashboard/teacher/exams', icon: 'exams', current: location.pathname.startsWith('/dashboard/teacher/exams') },
    { name: 'Classes', href: '/dashboard/teacher/classes', icon: 'home', current: location.pathname.startsWith('/dashboard/teacher/classes') },
    { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: 'stats', current: location.pathname.startsWith('/dashboard/teacher/analytics') },
    { name: 'Settings', href: '/dashboard/teacher/settings', icon: 'settings', current: location.pathname.startsWith('/dashboard/teacher/settings') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Teacher</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.current
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon name={item.icon} className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-white font-bold text-sm">${user?.name?.charAt(0) || 'T'}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'T'}</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Teacher'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Educator</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Teacher Dashboard
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;