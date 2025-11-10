import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle';
import Icon from '../ui/Icon';

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('teacherSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current route is study page - hide navbar
  const isStudyPage = location.pathname.includes('/decks/') && location.pathname.includes('/study');

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('teacherSidebarCollapsed', JSON.stringify(newState));
  };

  const navigation = [
    { name: 'Bảng điều khiển', href: '/dashboard/teacher', icon: 'stats', current: location.pathname === '/dashboard/teacher' },
    { name: 'Thẻ ghi nhớ', href: '/dashboard/teacher/flashcards', icon: 'flashcards', current: location.pathname.startsWith('/dashboard/teacher/flashcards') },
    { name: 'Bài thi', href: '/dashboard/teacher/exams', icon: 'exams', current: location.pathname.startsWith('/dashboard/teacher/exams') },
    { name: 'Ngân hàng câu hỏi', href: '/dashboard/teacher/question-bank', icon: 'file-text', current: location.pathname.startsWith('/dashboard/teacher/question-bank') },
    { name: 'Lớp học', href: '/dashboard/teacher/classes', icon: 'home', current: location.pathname.startsWith('/dashboard/teacher/classes') },
    { name: 'Hồ sơ', href: '/dashboard/teacher/profile', icon: 'profile', current: location.pathname.startsWith('/dashboard/teacher/profile') },
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
            <Link 
              to="/dashboard/teacher" 
              className={`flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent transition-all duration-300 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">FL</span>
              </div>
              {!sidebarCollapsed && <span className="whitespace-nowrap">FlashLearn</span>}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
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
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'
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
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Icon name="logout" className="w-4 h-4 mr-2" />
                Đăng xuất
              </button>
            )}
            {sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
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
        {/* Top bar - Hide on study page */}
        {!isStudyPage && (
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
                  Bảng điều khiển giáo viên
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Trực tuyến</span>
              </div>

              {/* Profile and Theme Toggle */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Giáo viên'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Giáo viên</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;