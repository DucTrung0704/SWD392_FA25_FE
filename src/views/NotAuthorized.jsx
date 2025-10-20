import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div className="py-20 text-center space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">403 · Not Authorized</h1>
      <p className="text-gray-600 dark:text-gray-400">Bạn không có quyền truy cập trang này.</p>
      <Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link>
    </div>
  );
}


