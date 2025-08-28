import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Chrome, Linkedin, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import DatabaseStatus from '../components/DatabaseStatus';
import DemoSetup from '../components/DemoSetup';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register, isAuthenticated, redirectToDashboard } = useAuth();
  const navigate = useNavigate();

  // Get demo credentials from auth service
  const DEMO_CREDENTIALS = authService.getDemoCredentials();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'student'
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, redirectToDashboard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (mode === 'signup') {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your full name');
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else if (mode === 'login' && !formData.password) {
      setError('Please enter your password');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        // Handle password reset
        setSuccess('Password reset functionality will be available soon');
      } else if (mode === 'signup') {
        const userData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          userType: formData.userType as 'student' | 'admin' | 'reviewer' | 'donor',
          profileData: {}
        };

        const result = await register(userData);
        if (result.success) {
          setSuccess('Account created successfully! Redirecting...');
          // Redirection is handled automatically by AuthContext
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          // Redirection is handled automatically by AuthContext
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: keyof typeof DEMO_CREDENTIALS) => {
    const credentials = DEMO_CREDENTIALS[role];
    setError('');
    setSuccess('');
    
    setIsLoading(true);
    
    try {
      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        setSuccess(`Demo ${role} login successful! Redirecting...`);
        // Redirection is handled automatically by AuthContext
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (error) {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setError(`${provider} authentication will be available soon`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="mb-6 text-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F3b1b952ac06b422687ab6f8265e647a7%2F209099442e6c42e883b3d324b2f06354?format=webp&width=800"
            alt="Youth Dreamers Foundation"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Youth Dreamers Foundation
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Welcome back! Sign in to your account'}
            {mode === 'signup' && 'Create your account to get started'}
            {mode === 'forgot-password' && 'Reset your password'}
          </p>
        </div>

        {/* Database Status */}
        <div className="mb-4">
          <DatabaseStatus />
        </div>

        {/* Demo Setup */}
        <div className="mb-4">
          <DemoSetup />
        </div>

        {/* Demo Credentials */}
        {mode === 'login' && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">Demo Credentials</CardTitle>
              <CardDescription className="text-xs text-blue-600">
                Click any role below to login with demo credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DEMO_CREDENTIALS).map(([role, creds]) => (
                  <Button
                    key={role}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(role as keyof typeof DEMO_CREDENTIALS)}
                    disabled={isLoading}
                    className="text-xs capitalize border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {role}
                  </Button>
                ))}
              </div>
              <div className="mt-2 text-xs text-blue-600">
                <p><strong>Student:</strong> {DEMO_CREDENTIALS.student.email}</p>
                <p><strong>Admin:</strong> {DEMO_CREDENTIALS.admin.email}</p>
                <p><strong>Reviewer:</strong> {DEMO_CREDENTIALS.reviewer.email}</p>
                <p><strong>Donor:</strong> {DEMO_CREDENTIALS.donor.email}</p>
                <p className="mt-1 text-blue-500">Password for all: respective role + "123"</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Auth Card */}
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              {mode !== 'login' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('login')}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-xl">
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot-password' && 'Reset Password'}
              </CardTitle>
            </div>
            <CardDescription>
              {mode === 'login' && 'Enter your credentials to access your dashboard'}
              {mode === 'signup' && 'Fill in your details to create a new account'}
              {mode === 'forgot-password' && 'Enter your email to receive a reset link'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {mode !== 'forgot-password' && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('Google')}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2"
                >
                  <Chrome className="h-4 w-4" />
                  <span>Google</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('LinkedIn')}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </Button>
              </div>
            )}

            {mode !== 'forgot-password' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Student - Apply for scholarships</option>
                      <option value="admin">Administrator - Manage programs</option>
                      <option value="reviewer">Reviewer - Evaluate applications</option>
                      <option value="donor">Donor - Fund education</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot-password' && 'Send Reset Link'}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              {mode === 'login' && (
                <>
                  <Button
                    variant="link"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot your password?
                  </Button>
                  <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      onClick={() => setMode('signup')}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                    >
                      Sign up
                    </Button>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to Youth Dreamers Foundation's{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </div>
      </motion.div>
    </div>
  );
}