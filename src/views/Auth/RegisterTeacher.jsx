import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UserCheck, AlertTriangle, User, Mail, Lock, Check, BookOpen, BarChart3, Users, Sparkles, Award, TrendingUp, Star, Rocket, CheckCircle } from 'lucide-react';

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.registerTeacher(formData.name, formData.email, formData.password);
      
      // Show success message
      setSuccess(true);
      
      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Teacher registration successful! Please login with your credentials.',
            email: formData.email
          }
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-8 pt-12">
            {/* Main Heading */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">FlashLearn</div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Share Your Knowledge<br/>With Students Worldwide
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join our community of educators and create interactive learning experiences for your students.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Teachers</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">5K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Courses</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Students</div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="space-y-4">
              {[
                { icon: <BookOpen className="w-6 h-6" />, title: 'Create Content', desc: 'Build and share interactive courses' },
                { icon: <BarChart3 className="w-6 h-6" />, title: 'Track Performance', desc: 'Monitor student progress' },
                { icon: <Star className="w-6 h-6" />, title: 'Build Reputation', desc: 'Establish your expertise' },
                { icon: <Users className="w-6 h-6" />, title: 'Engage Students', desc: 'Connect with your learners' }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-3xl text-white shadow-xl">
              <div className="flex items-start gap-4">
                <Award className="w-8 h-8 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-medium mb-2">"Teaching is the greatest act of optimism."</p>
                  <p className="text-purple-100 text-sm">Join us and make a difference in student learning.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full">
            <Card className="w-full shadow-2xl border-0 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90">
              {/* Header Section */}
              <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Join as Educator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Create and share knowledge with students worldwide
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

          {/* Success Message */}
          {success && (
            <div className="mx-6 mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Teacher account created successfully! Redirecting to login...
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5 px-6">
            {/* Personal Information */}
            <Input 
              label="Full Name" 
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
              placeholder="Tran Thi B" 
              required
              icon={<User className="w-4 h-4" />}
              className="transition-all duration-200"
            />

            <Input 
              label="Email Address" 
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
              placeholder="you@example.com" 
              type="email"
              required
              icon={<Mail className="w-4 h-4" />}
              className="transition-all duration-200"
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Password" 
                value={formData.password} 
                onChange={(e) => handleChange('password', e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon={<Lock className="w-4 h-4" />}
                className="transition-all duration-200"
              />

              <Input 
                label="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={(e) => handleChange('confirmPassword', e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon={<Check className="w-4 h-4" />}
                className="transition-all duration-200"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Privacy Policy
                </Link>
                , and confirm that I am a qualified educator
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading || success}
            >
              {loading || success ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {success ? 'Success! Redirecting...' : 'Submitting Application...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Apply for Teacher Account
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
              className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
            >
              ← Back to Sign In
            </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}