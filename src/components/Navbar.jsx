import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import RoleBadge from './RoleBadge';
import Icon from './ui/Icon';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Flashcards', href: '/flashcards', icon: 'flashcards' },
    { name: 'Exams', href: '/exams', icon: 'exams' },
    ...(user?.role === 'Teacher' ? [{ name: 'Teacher', href: '/dashboard/teacher', icon: 'teacher' }] : []),
    ...(user?.role === 'Admin' ? [{ name: 'Admin', href: '/dashboard/admin', icon: 'admin' }] : []),
    ...(user?.role === 'Student' ? [{ name: 'Student', href: '/dashboard/student', icon: 'student' }] : []),
  ];

  const isActiveLink = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70 dark:bg-gray-900/80 dark:border-gray-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">FL</span>
          </div>
          FlashLearn
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActiveLink(item.href)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              {/* Desktop User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <RoleBadge role={user.role} />
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user.avatar ? (
                      <img 
                        src={user.avatar.startsWith('http') ? user.avatar : user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-white">${user.name?.charAt(0).toUpperCase() || 'U'}</span>`;
                        }}
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                    {user.name || 'User'}
                  </span>
                </Link>
              </div>

              {/* Mobile User Avatar Only */}
              <Link 
                to="/profile" 
                className="sm:hidden w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-sm font-bold text-white">${user.name?.charAt(0).toUpperCase() || 'U'}</span>`;
                    }}
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="relative w-5 h-5">
              <span className={`absolute w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${
                isMobileMenuOpen ? 'top-2 rotate-45' : 'top-1'
              }`} />
              <span className={`absolute top-2 w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`} />
              <span className={`absolute w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${
                isMobileMenuOpen ? 'top-2 -rotate-45' : 'top-3'
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActiveLink(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon name={item.icon} className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Icon name="login" className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Icon name="register" className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}