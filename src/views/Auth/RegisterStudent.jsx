import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GraduationCap, AlertTriangle, User, Mail, Lock, Check, Rocket, BookOpen, Target, Users, Sparkles, Award, TrendingUp, CheckCircle } from 'lucide-react';

export default function RegisterStudent() {
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
      await authService.registerStudent(formData.name, formData.email, formData.password);
      
      // Show success message
      setSuccess(true);
      
      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.',
            email: formData.email
          }
        });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  const passwordStrength = {
    weak: formData.password.length > 0 && formData.password.length < 6,
    medium: formData.password.length >= 6 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password),
    strong: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) && formData.password.length >= 8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-8 pt-12">
            {/* Main Heading */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">FlashLearn</div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Start Your Learning<br/>Journey Today
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Join thousands of students already learning with our interactive flashcards and smart study tools.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Students</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">5K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Decks</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Teachers</div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="space-y-4">
              {[
                { icon: <Sparkles className="w-6 h-6" />, title: 'Interactive Learning', desc: 'Engage with AI-powered study tools' },
                { icon: <Target className="w-6 h-6" />, title: 'Track Progress', desc: 'Monitor your learning journey' },
                { icon: <TrendingUp className="w-6 h-6" />, title: 'Improve Performance', desc: 'Boost your grades with smart revision' },
                { icon: <Users className="w-6 h-6" />, title: 'Join Community', desc: 'Connect with fellow learners' }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
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
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-3xl text-white shadow-xl">
              <div className="flex items-start gap-4">
                <Award className="w-8 h-8 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg font-medium mb-2">"The best investment you can make is in yourself."</p>
                  <p className="text-orange-100 text-sm">Start learning today and unlock your potential.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full">
            <Card className="w-full shadow-2xl border-0 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90" style={{ boxShadow: '0 25px 50px -12px rgba(251, 146, 60, 0.5)' }}>
              <CardHeader className="text-center pb-6 pt-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-yellow-900" />
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                  Create Student Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Join thousands of students already learning
                </p>
              </CardHeader>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm font-medium">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mx-6 mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    Account created successfully! Redirecting to login...
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
                <Input 
                  label="Full Name" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)} 
                  placeholder="Nguyen Van A" 
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

                <div>
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
                  
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.strong ? 'bg-orange-500' :
                              passwordStrength.medium ? 'bg-yellow-500' :
                              passwordStrength.weak ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        passwordStrength.strong ? 'text-orange-600 dark:text-orange-400' :
                        passwordStrength.medium ? 'text-yellow-600 dark:text-yellow-400' :
                        passwordStrength.weak ? 'text-red-600 dark:text-red-400' :
                        'text-gray-500'
                      }`}>
                        {passwordStrength.strong ? '✓ Strong password' :
                         passwordStrength.medium ? '⚠ Medium strength' :
                         passwordStrength.weak ? '✗ Weak password' :
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
                  className="transition-all duration-200"
                />

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={loading || success}
                >
                  {loading || success ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {success ? 'Success! Redirecting...' : 'Creating Account...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Create Student Account
                    </div>
                  )}
                </Button>
              </form>

              <div className="px-6 pb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Already have an account?</span>
                  </div>
                </div>
              </div>

              <CardFooter className="text-center pb-8">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
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