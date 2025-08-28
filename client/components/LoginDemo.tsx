import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  Heart, 
  LogIn,
  Eye,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

interface DemoUser {
  role: string;
  email: string;
  password: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
}

const LoginDemo = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
  const { login, redirectToDashboard } = useAuth();

  // Get demo credentials from auth service
  const DEMO_CREDENTIALS = authService.getDemoCredentials();

  const demoUsers: DemoUser[] = [
    {
      role: 'student',
      email: DEMO_CREDENTIALS.student.email,
      password: DEMO_CREDENTIALS.student.password,
      name: 'Demo Student',
      description: 'Apply for scholarships and track progress',
      icon: GraduationCap,
      color: 'bg-blue-600',
      features: ['Browse scholarships', 'Submit applications', 'Track progress', 'Access mentorship']
    },
    {
      role: 'admin',
      email: DEMO_CREDENTIALS.admin.email,
      password: DEMO_CREDENTIALS.admin.password,
      name: 'Demo Administrator',
      description: 'Manage programs and oversee operations',
      icon: Shield,
      color: 'bg-red-600',
      features: ['Manage scholarships', 'User management', 'Analytics dashboard', 'System settings']
    },
    {
      role: 'reviewer',
      email: DEMO_CREDENTIALS.reviewer.email,
      password: DEMO_CREDENTIALS.reviewer.password,
      name: 'Demo Reviewer',
      description: 'Evaluate applications and score candidates',
      icon: Users,
      color: 'bg-purple-600',
      features: ['Review applications', 'Score candidates', 'Provide feedback', 'Collaboration tools']
    },
    {
      role: 'donor',
      email: DEMO_CREDENTIALS.donor.email,
      password: DEMO_CREDENTIALS.donor.password,
      name: 'Demo Donor',
      description: 'Fund scholarships and track impact',
      icon: Heart,
      color: 'bg-green-600',
      features: ['Create scholarships', 'Track contributions', 'View impact reports', 'Student progress']
    }
  ];

  const handleDemoLogin = async (user: DemoUser) => {
    setIsLoading(user.role);
    
    try {
      const result = await login(user.email, user.password);
      if (result.success) {
        setTimeout(() => {
          redirectToDashboard();
        }, 1000);
      } else {
        console.error('Demo login failed:', result.error);
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const copyCredentials = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredential(type);
    setTimeout(() => setCopiedCredential(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Try Demo Accounts
        </h2>
        <p className="text-gray-600">
          Experience different user roles with pre-configured demo accounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoUsers.map((user, index) => (
          <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${user.color} rounded-lg flex items-center justify-center`}>
                    <user.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {user.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Credentials */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Email:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs bg-white px-2 py-1 rounded">{user.email}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCredentials(user.email, `${user.role}-email`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCredential === `${user.role}-email` ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Password:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs bg-white px-2 py-1 rounded">{user.password}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCredentials(user.password, `${user.role}-password`)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCredential === `${user.role}-password` ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  onClick={() => handleDemoLogin(user)}
                  disabled={!!isLoading}
                  className={`w-full ${user.color} hover:opacity-90`}
                >
                  {isLoading === user.role ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Login as {user.role}</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          These are demo accounts for testing purposes. In production, users would create their own accounts.
        </p>
      </div>
    </div>
  );
};

export default LoginDemo;