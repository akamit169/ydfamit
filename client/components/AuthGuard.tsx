import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'reviewer' | 'donor';
  fallbackComponent?: React.ReactNode;
}

const AuthGuard = ({ children, requiredRole, fallbackComponent }: AuthGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized' | 'wrong-role'>('checking');

  useEffect(() => {
    if (isLoading) {
      setAuthStatus('checking');
      return;
    }

    if (!isAuthenticated || !user) {
      setAuthStatus('unauthorized');
      return;
    }

    if (requiredRole) {
      const userType = user.user_type || user.userType;
      if (userType !== requiredRole) {
        setAuthStatus('wrong-role');
        return;
      }
    }

    setAuthStatus('authorized');
  }, [user, isAuthenticated, isLoading, requiredRole]);

  const renderStatus = () => {
    switch (authStatus) {
      case 'checking':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying Access
              </h2>
              <p className="text-gray-600">Please wait while we check your permissions...</p>
            </motion.div>
          </div>
        );

      case 'unauthorized':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need to sign in to access this page.
              </p>
              <a
                href="/auth"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Sign In
              </a>
            </motion.div>
          </div>
        );

      case 'wrong-role':
        const userType = user?.user_type || user?.userType;
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600 mb-6">
                This page is only accessible to {requiredRole} users. 
                You are currently signed in as a {userType}.
              </p>
              <a
                href={`/${userType}-dashboard`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Your Dashboard
              </a>
            </motion.div>
          </div>
        );

      case 'authorized':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        );

      default:
        return fallbackComponent || null;
    }
  };

  return renderStatus();
};

export default AuthGuard;