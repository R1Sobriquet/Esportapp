import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Account info
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    // Profile info
    region: '',
    date_of_birth: '',
    bio: '',
    discord_username: '',
    skill_level: 'beginner',
    looking_for: 'teammates'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const registrationData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      profile: {
        region: formData.region,
        date_of_birth: formData.date_of_birth,
        bio: formData.bio,
        discord_username: formData.discord_username,
        skill_level: formData.skill_level,
        looking_for: formData.looking_for,
        profile_visibility: 'public',
        show_stats: true,
        allow_friend_requests: true
      }
    };

    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Know the basics' },
    { value: 'advanced', label: 'Advanced', description: 'Competitive player' },
    { value: 'expert', label: 'Expert', description: 'Pro level' }
  ];

  const lookingForOptions = [
    { value: 'teammates', label: 'Teammates', icon: '🎮' },
    { value: 'mentor', label: 'Mentor', icon: '🎓' },
    { value: 'casual_friends', label: 'Casual Friends', icon: '😊' },
    { value: 'competitive_team', label: 'Competitive Team', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join the gaming community
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            <div className={`h-2 w-16 rounded ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-600'}`} />
            <div className={`h-2 w-16 rounded ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`} />
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            /* Step 1: Account Information */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a unique username"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/50 rounded-md p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next Step
              </button>
            </div>
          ) : (
            /* Step 2: Profile Information */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
              
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-300">
                  Region
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={formData.region}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Europe, NA, Asia"
                />
              </div>
              
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300">
                  Date of Birth
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="discord_username" className="block text-sm font-medium text-gray-300">
                  Discord Username (Optional)
                </label>
                <input
                  id="discord_username"
                  name="discord_username"
                  type="text"
                  value={formData.discord_username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YourName#1234"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself and your gaming style..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {skillLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, skill_level: level.value }))}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.skill_level === level.value
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-gray-400">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Looking For
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {lookingForOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, looking_for: option.value }))}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.looking_for === option.value
                          ? 'bg-green-600 border-green-600'
                          : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/50 rounded-md p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}