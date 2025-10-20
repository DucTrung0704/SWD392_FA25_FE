import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GraduationCap, AlertTriangle, User, Ticket, Mail, Lock, Check, Rocket, BookOpen, Target, Users } from 'lucide-react';

export default function RegisterStudent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.registerStudent(formData.name, formData.email, formData.password);
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          message: 'Please check your email to verify your account'
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = {
    weak: formData.password.length > 0 && formData.password.length < 6,
    medium: formData.password.length >= 6 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password),
    strong: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) && formData.password.length >= 8
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-lg mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center min-h-[90vh]">
        <Card className="w-full max-w-lg mx-4 shadow-2xl border-0">
          {/* Header Section */}
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Join as Student
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start your learning journey with us
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Nguyen Van A" 
                required
                icon={<User className="w-4 h-4" />}
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
              
              <Input 
                label="Student ID (Optional)" 
                value={formData.studentId} 
                onChange={(e) => handleChange('studentId', e.target.value)} 
                placeholder="SV001" 
                icon={<Ticket className="w-4 h-4" />}
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <Input 
              label="Email Address" 
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
              placeholder="you@example.com" 
              type="email"
              required
              icon={<Mail className="w-4 h-4" />}
              className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Password" 
                  value={formData.password} 
                  onChange={(e) => handleChange('password', e.target.value)} 
                  placeholder="••••••••" 
                  type="password"
                  required
                  icon={<Lock className="w-4 h-4" />}
                  className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`flex-1 h-1 rounded-full ${
                            passwordStrength.strong ? 'bg-green-500' :
                            passwordStrength.medium ? 'bg-yellow-500' :
                            passwordStrength.weak ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {passwordStrength.strong ? 'Strong password' :
                       passwordStrength.medium ? 'Medium strength' :
                       passwordStrength.weak ? 'Weak password' :
                       'At least 6 characters with uppercase, lowercase, and numbers'}
                    </p>
                  </div>
                )}
              </div>

              <Input 
                label="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={(e) => handleChange('confirmPassword', e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon={<Check className="w-4 h-4" />}
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Create Student Account
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
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <CardFooter className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors duration-200"
            >
              ← Back to Sign In
            </Link>
          </CardFooter>
        </Card>
        </div>

        {/* Student Benefits */}
        <div className="mt-8 sm:mt-12">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Why Join as a Student?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <BookOpen className="w-8 h-8 text-white" />,
              title: 'Access to Courses',
              description: 'Unlock unlimited access to all learning materials and flashcard decks'
            },
            {
              icon: <Target className="w-8 h-8 text-white" />,
              title: 'Track Progress',
              description: 'Monitor your learning journey with detailed analytics and insights'
            },
            {
              icon: <Users className="w-8 h-8 text-white" />,
              title: 'Join Community',
              description: 'Connect with fellow students and educators in our learning community'
            }
          ].map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {benefit.icon}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}