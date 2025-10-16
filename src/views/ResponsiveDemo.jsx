import React from 'react';
import Container, { 
  ContainerSmall, 
  ContainerMedium, 
  ContainerLarge, 
  ContainerNarrow,
  ContainerFluid 
} from '../components/ui/Container';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function ResponsiveDemo() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Container size="6xl" padding="sm">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2 sm:mb-4">
            Responsive Design Demo
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Container component với responsive design và nhiều size options
          </p>
        </div>

        {/* Container Sizes Demo */}
        <div className="space-y-6 sm:space-y-8 mb-8">
          <Card>
            <CardHeader title="Container Sizes" subtitle="Các kích thước khác nhau của Container" />
            <CardContent>
              <div className="space-y-4">
                {/* Small Container */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Small (md - 448px)</h3>
                  <ContainerSmall>
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ContainerSmall - Perfect for forms and narrow content
                      </p>
                    </div>
                  </ContainerSmall>
                </div>

                {/* Medium Container */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Medium (4xl - 896px)</h3>
                  <ContainerMedium>
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ContainerMedium - Good for articles and main content
                      </p>
                    </div>
                  </ContainerMedium>
                </div>

                {/* Large Container */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Large (6xl - 1152px)</h3>
                  <ContainerLarge>
                    <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        ContainerLarge - Ideal for dashboards and wide layouts
                      </p>
                    </div>
                  </ContainerLarge>
                </div>

                {/* Narrow Container */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Narrow (2xl - 672px)</h3>
                  <ContainerNarrow>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ContainerNarrow - Great for reading content with extra padding
                      </p>
                    </div>
                  </ContainerNarrow>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Grid Demo */}
          <Card>
            <CardHeader title="Responsive Grid" subtitle="Grid layout thích ứng với màn hình" />
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div 
                    key={item}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white"
                  >
                    <h3 className="text-lg font-semibold mb-2">Card {item}</h3>
                    <p className="text-sm opacity-90">
                      Responsive card that adapts to screen size
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responsive Typography */}
          <Card>
            <CardHeader title="Responsive Typography" subtitle="Text sizes thích ứng với màn hình" />
            <CardContent>
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  Responsive Heading 1
                </h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                  Responsive Heading 2
                </h2>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-700 dark:text-gray-300">
                  Responsive Heading 3
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                  Responsive paragraph text that scales beautifully across all screen sizes.
                  On mobile devices, text is smaller and more compact. On larger screens,
                  text becomes more readable and spacious.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Buttons */}
          <Card>
            <CardHeader title="Responsive Buttons" subtitle="Buttons với responsive design" />
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="primary" className="w-full sm:w-auto">
                  Primary Button
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Secondary Button
                </Button>
                <Button variant="success" className="w-full sm:w-auto">
                  Success Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fluid Container Demo */}
          <Card>
            <CardHeader title="Fluid Container" subtitle="Container không giới hạn width" />
            <CardContent>
              <ContainerFluid>
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 rounded-xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Full Width Container</h3>
                  <p className="text-sm opacity-90">
                    This container spans the full width of its parent
                  </p>
                </div>
              </ContainerFluid>
            </CardContent>
          </Card>
        </div>

        {/* Breakpoint Info */}
        <Card>
          <CardHeader title="Breakpoint Information" subtitle="Tailwind CSS breakpoints" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">sm</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">≥ 640px</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">md</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">≥ 768px</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">lg</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">≥ 1024px</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">xl</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">≥ 1280px</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
