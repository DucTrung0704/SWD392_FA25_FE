import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle';
import Icon from '../ui/Icon';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const navigation = [
    { name: 'Bảng điều khiển', href: '/dashboard/admin', icon: 'stats', current: location.pathname === '/dashboard/admin' },
    { name: 'Người dùng', href: '/dashboard/admin/users', icon: 'users', current: location.pathname.startsWith('/dashboard/admin/users') },
    { name: 'Vai trò', href: '/dashboard/admin/roles', icon: 'lock', current: location.pathname.startsWith('/dashboard/admin/roles') },
    { name: 'Nội dung', href: '/dashboard/admin/content', icon: 'file', current: location.pathname.startsWith('/dashboard/admin/content') },
    { name: 'Phân tích', href: '/dashboard/admin/analytics', icon: 'stats', current: location.pathname.startsWith('/dashboard/admin/analytics') },
    { name: 'Hệ thống', href: '/dashboard/admin/system', icon: 'settings', current: location.pathname.startsWith('/dashboard/admin/system') },
    { name: 'Báo cáo', href: '/dashboard/admin/reports', icon: 'file', current: location.pathname.startsWith('/dashboard/admin/reports') },
    { name: 'Cài đặt', href: '/dashboard/admin/settings', icon: 'settings', current: location.pathname.startsWith('/dashboard/admin/settings') },
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
      <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              {!sidebarCollapsed && (
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">Quản trị viên</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                title={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              >
                <svg className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Đóng thanh bên</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.current
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon name={item.icon} className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Logout button at bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Icon name="logout" className="w-4 h-4 mr-2" />
                Đăng xuất
              </button>
            )}
            {sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Đăng xuất"
              >
                <Icon name="logout" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Mở thanh bên</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Quản trị viên hệ thống
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Hệ thống trực tuyến</span>
            </div>

            {/* Profile and Theme Toggle */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Quản trị viên'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </div>
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

export default AdminLayout;