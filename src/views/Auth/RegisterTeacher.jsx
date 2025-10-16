import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../../components/ui/Container';
import { Card, CardHeader, CardFooter } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationInfo: '',
    specialization: '',
    experience: '',
    institution: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verificationType, setVerificationType] = useState('certificate');
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
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.verificationInfo.trim()) {
      setError('Please provide verification information');
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
      await authService.registerTeacher(
        formData.name, 
        formData.email, 
        formData.password, 
        formData.verificationInfo,
        formData.specialization,
        formData.experience,
        formData.institution
      );
      navigate('/pending-approval', { 
        state: { 
          email: formData.email,
          role: 'teacher',
          message: 'Your teacher account is pending admin approval. You will receive an email once approved.'
        }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const verificationTypes = [
    { value: 'certificate', label: 'Teaching Certificate', icon: '📜' },
    { value: 'degree', label: 'Academic Degree', icon: '🎓' },
    { value: 'phone', label: 'Phone Verification', icon: '📞' },
    { value: 'other', label: 'Other Document', icon: '📄' }
  ];

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Container size="2xl" padding="sm">
        <div className="flex items-center justify-center min-h-[90vh]">
        <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0">
          {/* Header Section */}
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-3xl text-white">👨‍🏫</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Join as Educator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Create and share knowledge with students worldwide
            </p>
          </CardHeader>

          {/* Approval Notice */}
          <div className="mx-6 mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⏳</span>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Admin Approval Required</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account will be reviewed by our team before you can create and manage flashcards. 
                  This process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5 px-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Tran Thi B" 
                required
                icon="👤"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
              
              <Input 
                label="Institution" 
                value={formData.institution} 
                onChange={(e) => handleChange('institution', e.target.value)} 
                placeholder="University / School" 
                icon="🏫"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Input 
              label="Email Address" 
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
              placeholder="you@example.com" 
              type="email"
              required
              icon="📧"
              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Specialization" 
                value={formData.specialization} 
                onChange={(e) => handleChange('specialization', e.target.value)} 
                placeholder="Mathematics, Science, etc." 
                icon="🎯"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
              
              <Input 
                label="Years of Experience" 
                value={formData.experience} 
                onChange={(e) => handleChange('experience', e.target.value)} 
                placeholder="5" 
                type="number"
                icon="📅"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Password" 
                value={formData.password} 
                onChange={(e) => handleChange('password', e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon="🔒"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />

              <Input 
                label="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={(e) => handleChange('confirmPassword', e.target.value)} 
                placeholder="••••••••" 
                type="password"
                required
                icon="✅"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Verification Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Verification Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {verificationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setVerificationType(type.value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                        verificationType === type.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Input 
                label="Verification Information" 
                value={formData.verificationInfo} 
                onChange={(e) => handleChange('verificationInfo', e.target.value)} 
                placeholder={
                  verificationType === 'certificate' ? 'Certificate number or upload reference' :
                  verificationType === 'degree' ? 'Degree details and institution' :
                  verificationType === 'phone' ? 'Phone number for verification' :
                  'Please provide relevant verification details'
                }
                required
                icon="📋"
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Application...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>👨‍🏫</span>
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

        {/* Teacher Benefits */}
        <div className="mt-8 sm:mt-12">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Benefits for Educators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📚',
              title: 'Create Content',
              description: 'Build and share your own flashcard decks with students'
            },
            {
              icon: '📊',
              title: 'Track Performance',
              description: 'Monitor student progress and engagement with your materials'
            },
            {
              icon: '👥',
              title: 'Build Reputation',
              description: 'Establish yourself as an expert educator in your field'
            }
          ].map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">{benefit.icon}</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
        </div>
      </Container>
    </div>
  );
}