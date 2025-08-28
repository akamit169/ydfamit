import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import { User, CreateUserInput } from '../../shared/types/database';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

class AuthService {
  // Demo credentials for testing
  private readonly DEMO_CREDENTIALS = {
    student: { email: 'student@demo.com', password: 'student123' },
    admin: { email: 'admin@demo.com', password: 'admin123' },
    reviewer: { email: 'reviewer@demo.com', password: 'reviewer123' },
    donor: { email: 'donor@demo.com', password: 'donor123' }
  };

  // Login with email and password
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        return { 
          success: false, 
          error: this.getReadableError(error.message) 
        };
      }

      if (!data.user) {
        return { 
          success: false, 
          error: 'Login failed - no user data received' 
        };
      }

      console.log('Auth successful, fetching user profile...');

      // Get user profile from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userError) {
        console.error('User profile error:', userError);
        return { 
          success: false, 
          error: 'Failed to load user profile' 
        };
      }

      // If no user profile found, try to create one from auth metadata
      if (!userData) {
        console.log('User profile not found, attempting to create from auth metadata');
        
        const userMetadata = data.user.user_metadata;
        if (userMetadata && userMetadata.user_type) {
          try {
            // First check if a profile exists with this email but different ID
            const { data: existingProfile, error: existingError } = await supabase
              .from('users')
              .select('*')
              .eq('email', data.user.email || email)
              .maybeSingle();

            if (existingError) {
              console.error('Error checking existing profile:', existingError);
              return { 
                success: false, 
                error: 'Failed to check existing user profile' 
              };
            }

            // If profile exists with different ID, update the ID to match auth user
            if (existingProfile && existingProfile.id !== data.user.id) {
              console.log('Found existing profile with different ID, updating...');
              const { data: updatedProfile, error: updateError } = await supabase
                .from('users')
                .update({ id: data.user.id })
                .eq('email', data.user.email || email)
                .select()
                .single();

              if (updateError) {
                console.error('Profile update error:', updateError);
                return { 
                  success: false, 
                  error: 'Failed to update user profile' 
                };
              }

              console.log('Profile updated successfully');
              return {
                success: true,
                user: updatedProfile,
                message: 'Login successful'
              };
            }

            // If profile exists with same ID, return it
            if (existingProfile && existingProfile.id === data.user.id) {
              console.log('Found existing profile with matching ID');
              return {
                success: true,
                user: existingProfile,
                message: 'Login successful'
              };
            }

            // No existing profile found, create new one
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                first_name: userMetadata.first_name || 'Demo',
                last_name: userMetadata.last_name || 'User',
                phone: userMetadata.phone || null,
                user_type: userMetadata.user_type,
                is_active: true,
                email_verified: true,
                profile_data: {}
              })
              .select()
              .single();

            if (createError) {
              console.error('Profile creation error:', createError);
              return { 
                success: false, 
                error: 'Failed to create user profile' 
              };
            }

            console.log('Profile created from auth metadata');
            return {
              success: true,
              user: newProfile,
              message: 'Login successful'
            };
          } catch (createErr) {
            console.error('Profile creation exception:', createErr);
            return { 
              success: false, 
              error: 'Failed to create user profile' 
            };
          }
        }
        
        return { 
          success: false, 
          error: 'User profile not found. Please try creating demo users first.' 
        };
      }

      console.log('Login successful for user:', userData.email, 'Role:', userData.user_type);
      
      return {
        success: true,
        user: userData,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Register new user
  async register(userData: CreateUserInput): Promise<AuthResult> {
    try {
      console.log('Attempting registration for:', userData.email);

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
        console.error('Auth registration error:', authError);
        return { 
          success: false, 
          error: this.getReadableError(authError.message) 
        };
      }

      if (!authData.user) {
        return { 
          success: false, 
          error: 'Registration failed - no user created' 
        };
      }

      // Create user profile in our users table
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
          email_verified: true,
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { 
          success: false, 
          error: 'Failed to create user profile' 
        };
      }

      console.log('Registration successful for user:', profileData.email, 'Role:', profileData.user_type);

      return {
        success: true,
        user: profileData,
        message: 'Account created successfully'
      };
    } catch (error) {
      console.error('Registration exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Create demo users via edge function
  async createDemoUsers(): Promise<{ success: boolean; error?: string; message?: string }> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase is not configured. Please set up your Supabase connection first.'
      };
    }

    try {
      console.log('Creating demo users via edge function...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-demo-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Demo users creation result:', result);

      return {
        success: result.success,
        message: result.message || 'Demo users processed',
        error: result.success ? undefined : (result.error || 'Failed to create demo users')
      };
    } catch (error) {
      console.error('Error creating demo users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create demo users'
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check environment variables first
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('Supabase environment variables not configured');
        return null;
      }

      // First check if we have an authenticated session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      
      if (sessionError) {
        // Don't log network errors as they're expected when Supabase isn't configured
        if (!sessionError.message.includes('Failed to fetch')) {
          console.error('Session error:', sessionError);
        }
        return null;
      }
      
      if (!user) return null;

      // Try to get user profile - use maybeSingle() to handle 0 rows gracefully
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Don't log PGRST116 errors as they're expected when no profile exists
        if (error.code !== 'PGRST116') {
          console.error('Get current user error:', error);
        }
        return null;
      }

      // If no user profile found, return null (don't create here)
      if (!userData) {
        // Only log if we have a valid session but no profile
        if (user) {
          console.log('No user profile found for authenticated user');
        }
        return null;
      }

      return userData;
    } catch (error) {
      // Only log non-network errors
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Get current user exception:', error);
      }
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, profileData: Partial<User>): Promise<AuthResult> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          profile_data: profileData.profile_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      return {
        success: true,
        user: data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Get user role
  getUserRole(user: User | null): string {
    return user?.user_type || 'student';
  }

  // Check if user has specific role
  hasRole(user: User | null, role: string): boolean {
    return this.getUserRole(user) === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(user: User | null, roles: string[]): boolean {
    const userRole = this.getUserRole(user);
    return roles.includes(userRole);
  }

  // Get dashboard path for user role
  getDashboardPath(user: User | null): string {
    const role = this.getUserRole(user);
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'reviewer':
        return '/reviewer-dashboard';
      case 'donor':
        return '/donor-dashboard';
      case 'student':
      default:
        return '/student-dashboard';
    }
  }

  // Get demo credentials
  getDemoCredentials() {
    return this.DEMO_CREDENTIALS;
  }

  // Convert Supabase errors to user-friendly messages
  private getReadableError(errorMessage: string): string {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please make sure you have created the demo users first by clicking "Create Demo Users" button.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (errorMessage.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('infinite recursion')) {
      return 'Database configuration issue. Please contact support.';
    }
    
    return errorMessage;
  }
}

export const authService = new AuthService();
export default authService;