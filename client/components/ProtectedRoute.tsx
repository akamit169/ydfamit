import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'admin' | 'reviewer' | 'donor')[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['student', 'admin', 'reviewer', 'donor'],
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, redirectToDashboard } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to auth page if not authenticated
      window.location.href = '/auth';
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      const userType = user.user_type || user.userType;
      
      // Check if user has permission for this route
      if (!allowedRoles.includes(userType)) {
        // Redirect to appropriate dashboard if user doesn't have permission
        redirectToDashboard(userType);
        return;
      }

      // If redirectTo is specified and user is on wrong dashboard, redirect
      if (redirectTo && window.location.pathname !== redirectTo) {
        window.location.href = redirectTo;
      }
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, redirectTo, redirectToDashboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to access this page.
          </p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </motion.div>
      </div>
    );
  }

  const userType = user?.user_type || user?.userType;
  if (!allowedRoles.includes(userType)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => redirectToDashboard(userType)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;