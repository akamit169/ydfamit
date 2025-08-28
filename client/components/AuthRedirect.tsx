import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If user is authenticated and on auth page, redirect to dashboard
    if (isAuthenticated && user && location.pathname === '/auth') {
      const userType = user.user_type;
      console.log('User authenticated on auth page, redirecting to dashboard for:', userType);
      
      switch (userType) {
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'reviewer':
          navigate('/reviewer-dashboard', { replace: true });
          break;
        case 'donor':
          navigate('/donor-dashboard', { replace: true });
          break;
        case 'student':
        default:
          navigate('/student-dashboard', { replace: true });
          break;
      }
    }
  }, [user, isAuthenticated, isLoading, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthRedirect;