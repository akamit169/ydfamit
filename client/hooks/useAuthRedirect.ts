import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UseAuthRedirectOptions {
  requireAuth?: boolean;
  allowedRoles?: ('student' | 'admin' | 'reviewer' | 'donor')[];
  redirectTo?: string;
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    requireAuth = true,
    allowedRoles = ['student', 'admin', 'reviewer', 'donor'],
    redirectTo
  } = options;

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // If user is authenticated but on auth page, redirect to dashboard
    if (isAuthenticated && location.pathname === '/auth') {
      const userType = user?.user_type || user?.userType || 'student';
      const dashboardPath = `/${userType}-dashboard`;
      navigate(dashboardPath, { replace: true });
      return;
    }

    // If user is authenticated but doesn't have required role
    if (isAuthenticated && user && allowedRoles.length > 0) {
      const userType = user.user_type || user.userType;
      if (!allowedRoles.includes(userType)) {
        const dashboardPath = `/${userType}-dashboard`;
        navigate(dashboardPath, { replace: true });
        return;
      }
    }

    // If specific redirect is needed
    if (redirectTo && location.pathname !== redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [
    user, 
    isAuthenticated, 
    isLoading, 
    requireAuth, 
    allowedRoles, 
    redirectTo, 
    navigate, 
    location.pathname
  ]);

  return {
    user,
    isAuthenticated,
    isLoading,
    userType: user?.user_type || user?.userType
  };
};

export default useAuthRedirect;