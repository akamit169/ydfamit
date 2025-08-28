import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../shared/types/database';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  redirectToDashboard: (userType?: string) => void;
  checkAuthStatus: () => Promise<void>;
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setUser(null);
        return;
      }

      if (session?.user) {
        // Get user profile from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('User fetch error:', userError);
          setUser(null);
        } else {
          setUser(userData);
          console.log('User authenticated:', userData.email, 'Role:', userData.user_type);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            setUser(userData);
            console.log('Setting user and redirecting:', userData.user_type);
            // Auto-redirect on successful sign in
            setTimeout(() => {
              redirectToDashboard(userData.user_type);
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/', { replace: true });
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed - no user data' };
      }

      console.log('Auth login successful, getting user profile...');
      
      // The auth state change listener will handle the redirection
      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: userData.userType,
            phone: userData.phone
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account' };
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email.trim().toLowerCase(),
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          user_type: userData.userType,
          profile_data: userData.profileData || {},
          email_verified: false
        })
        .select()
        .single();

      if (profileError) {
        return { success: false, error: 'Failed to create user profile' };
      }

      setUser(profileData);
      
      // Redirect after successful registration
      setTimeout(() => {
        redirectToDashboard(profileData.user_type);
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
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
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;