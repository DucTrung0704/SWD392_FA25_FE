import React from 'react';
import { useThemeContext } from '../components/ThemeProvider';
import Container from '../components/ui/Container';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ThemeDemo() {
  const { theme, isDark, setTheme } = useThemeContext();

  return (
    <Container className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Dark Mode Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Chức năng dark/light mode đã được hoàn thiện
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Theme Toggle Card */}
          <Card>
            <CardHeader 
              title="Theme Toggle" 
              subtitle="Chuyển đổi giữa dark và light mode"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Theme:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark 
                      ? 'bg-gray-800 text-gray-200' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {theme}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Toggle Theme:
                  </span>
                  <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Switch to {isDark ? 'Light' : 'Dark'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UI Components Card */}
          <Card>
            <CardHeader 
              title="UI Components" 
              subtitle="Các component hỗ trợ dark mode"
            />
            <CardContent>
              <div className="space-y-4">
                <Input 
                  label="Sample Input"
                  placeholder="Type something..."
                />
                
                <div className="flex gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader 
            title="Color Palette" 
            subtitle="Bảng màu cho dark mode"
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"></div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">Surface</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-blue-600 rounded-lg"></div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400">Secondary</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader title="🎨 Smooth Transitions" />
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tất cả components có transition mượt mà khi chuyển đổi theme
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="💾 Persistent Storage" />
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Theme được lưu trong localStorage và tự động khôi phục
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="♿ Accessibility" />
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hỗ trợ đầy đủ screen readers và keyboard navigation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
