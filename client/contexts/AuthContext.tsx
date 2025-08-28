import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../shared/types/database';
import { supabase } from '../lib/supabase';
import supabaseService from '../services/supabaseService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  redirectToDashboard: (userType?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const redirectToDashboard = (userType?: string) => {
    const type = userType || user?.user_type || user?.userType;
    switch (type) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'reviewer':
        navigate('/reviewer-dashboard');
        break;
      case 'donor':
        navigate('/donor-dashboard');
        break;
      case 'student':
      default:
        navigate('/student-dashboard');
        break;
    }
  };
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const currentUser = await supabaseService.getCurrentUser();
          setUser(currentUser);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const currentUser = await supabaseService.getCurrentUser();
              setUser(currentUser);
              // Auto-redirect on successful auth
              if (currentUser && window.location.pathname === '/auth') {
                redirectToDashboard(currentUser.user_type || currentUser.userType);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              navigate('/');
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await supabaseService.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        redirectToDashboard(response.data.user.user_type || response.data.user.userType);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await supabaseService.register(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        redirectToDashboard(response.data.user.user_type || response.data.user.userType);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabaseService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    redirectToDashboard,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
