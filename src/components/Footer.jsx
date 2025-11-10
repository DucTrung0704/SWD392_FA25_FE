import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Thẻ Ghi Nhớ', href: '/flashcards' },
      { name: 'Bài Kiểm Tra', href: '/exams' },
      { name: 'Chế Độ Học Tập', href: '/study' },
      { name: 'Theo Dõi Tiến Độ', href: '/progress' }
    ],
    support: [
      { name: 'Trung Tâm Trợ Giúp', href: '/help' },
      { name: 'Liên Hệ', href: '/contact' },
      { name: 'Câu Hỏi Thường Gặp', href: '/faq' },
      { name: 'Báo Lỗi', href: '/bug-report' }
    ],
    company: [
      { name: 'Về Chúng Tôi', href: '/about' },
      { name: 'Chính Sách Bảo Mật', href: '/privacy' },
      { name: 'Điều Khoản Dịch Vụ', href: '/terms' },
      { name: 'Tuyển Dụng', href: '/careers' }
    ],
    social: [
      { name: 'Facebook', href: '#', icon: Facebook },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'LinkedIn', href: '#', icon: Linkedin },
      { name: 'YouTube', href: '#', icon: Youtube }
    ]
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-4"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">FL</span>
                </div>
                FlashLearn
              </Link>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 max-w-md">
                Làm chủ việc học của bạn với các thẻ ghi nhớ thông minh và bài kiểm tra thực hành toàn diện. 
                Học thông minh hơn, không phải chăm chỉ hơn.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {footerLinks.social.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 text-gray-600 dark:text-gray-400 transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
                Sản Phẩm
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
                Hỗ Trợ
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
                Công Ty
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-6 sm:py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Cập Nhật
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Nhận các tính năng mới nhất và mẹo học tập được gửi đến hộp thư của bạn.
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 sm:w-64 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-200 font-medium text-sm whitespace-nowrap">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 sm:py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                © {currentYear} FlashLearn. Bảo lưu mọi quyền.
              </p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                to="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-xs sm:text-sm"
              >
                Chính Sách Bảo Mật
              </Link>
              <Link
                to="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-xs sm:text-sm"
              >
                Điều Khoản Dịch Vụ
              </Link>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Tiếng Việt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        
      </div>
    </footer>
  );
}
