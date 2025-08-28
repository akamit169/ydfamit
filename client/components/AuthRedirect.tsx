import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // If user is authenticated and on auth page, redirect to dashboard
    if (isAuthenticated && user && location.pathname === '/auth') {
      const userType = user.user_type;
      const dashboardPath = `/${userType}-dashboard`;
      console.log('Redirecting authenticated user to:', dashboardPath);
      navigate(dashboardPath, { replace: true });
    }

    // If user is not authenticated and trying to access protected routes
    if (!isAuthenticated && location.pathname !== '/auth' && location.pathname !== '/') {
      const protectedRoutes = [
        '/student-dashboard',
        '/admin-dashboard', 
        '/reviewer-dashboard',
        '/donor-dashboard',
        '/profile',
        '/progress',
        '/scholarships',
        '/support'
      ];

      if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
        console.log('Redirecting unauthenticated user to auth');
        navigate('/auth', { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    }
  }, [user, isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRedirect;