import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import authService from '../services/authService';
import { User, CreateUserInput } from '../../shared/types/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: CreateUserInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  redirectToDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }
        
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If we have a session but no user profile, sign out
          console.log('Session exists but no user profile found, signing out');
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const redirectToDashboard = () => {
    if (!user) return;
    
    const dashboardPath = authService.getDashboardPath(user);
    console.log(`Redirecting ${user.user_type} to ${dashboardPath}`);
    navigate(dashboardPath, { replace: true });
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Immediate redirection after successful login
        const dashboardPath = authService.getDashboardPath(result.user);
        console.log(`Login successful, redirecting to: ${dashboardPath}`);
        navigate(dashboardPath, { replace: true });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: CreateUserInput) => {
    try {
      setIsLoading(true);
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        
        // Immediate redirection after successful registration
        const dashboardPath = authService.getDashboardPath(result.user);
        console.log(`Registration successful, redirecting to: ${dashboardPath}`);
        navigate(dashboardPath, { replace: true });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        redirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};