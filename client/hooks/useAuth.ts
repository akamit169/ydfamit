import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../shared/types/database';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const redirectToDashboard = (userType?: string) => {
    const type = userType || user?.user_type;
    console.log('Redirecting user type:', type);
    
    switch (type) {
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
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (userData: any) => {
    const result = await authService.register(userData);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
      navigate('/', { replace: true });
    }
    return result;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    redirectToDashboard,
    checkAuthStatus,
  };
};

export default useAuth;