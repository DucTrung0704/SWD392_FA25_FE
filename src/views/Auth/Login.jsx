import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { getDashboardPathForRole } from '../../config/constants';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock, AlertTriangle, Mail, Rocket, GraduationCap, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Google Logo Component
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const loggedIn = await authService.loginWithCredentials(email, password);
      refresh(); // Refresh auth state
      navigate(getDashboardPathForRole(loggedIn.role));
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      const loggedIn = await authService.loginWithGoogle();
      refresh(); // Refresh auth state
      navigate(getDashboardPathForRole(loggedIn.role));
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
          {/* Header Section */}
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Sign in to continue your learning journey
            </p>
          </CardHeader>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 px-6">
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                type="email"
                required
                icon={<Mail className="w-4 h-4" />}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <Input 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon={<Lock className="w-4 h-4" />}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="px-6 my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Login */}
          <div className="px-6">
            <Button 
              variant="outline"
              onClick={handleGoogle}
              className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-medium rounded-xl transition-all duration-200"
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <GoogleIcon className="w-5 h-5" />
                  Sign in with Google
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <CardFooter className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account? Choose your role:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/register/student" 
                  className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 text-sm font-medium text-center flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </Link>
                <Link 
                  to="/register/teacher" 
                  className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-sm font-medium text-center flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Teacher
                </Link>
              </div>
              
              {/* Guest Access */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  Just want to explore?
                </p>
                <Link 
                  to="/demo" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm font-medium"
                >
                  Try Demo Mode →
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your data is securely encrypted and protected
          </p>
        </div>
      </div>
    </div>
  );
}