import { supabase } from '../lib/supabase';
import { 
  User, 
  CreateUserInput, 
  LoginInput, 
  AuthResponse, 
  ApiResponse,
  Scholarship,
  Application,
  CreateApplicationInput
} from '../../shared/types/database';

class SupabaseService {
  // Authentication methods
  async register(userData: CreateUserInput): Promise<ApiResponse<AuthResponse>> {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: userData.userType,
            phone: userData.phone
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }

      // Create user profile in our users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
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
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      return {
        success: true,
        data: {
          user: profileData,
          token: authData.session?.access_token || '',
          expiresIn: '1h'
        },
        message: 'Account created successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async login(loginData: LoginInput): Promise<ApiResponse<AuthResponse>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user || !authData.session) {
        return {
          success: false,
          error: 'Login failed'
        };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          error: 'Failed to load user profile'
        };
      }

      return {
        success: true,
        data: {
          user: profileData,
          token: authData.session.access_token,
          expiresIn: '1h'
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async logout(): Promise<ApiResponse> {
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

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return profileData;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          profile_data: profileData.profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
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
        data,
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

  // Scholarship methods
  async getScholarships(filters?: any): Promise<ApiResponse<Scholarship[]>> {
    try {
      let query = supabase
        .from('scholarships')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.contains('tags', [filters.category]);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Scholarships retrieved successfully'
      };
    } catch (error) {
      console.error('Get scholarships error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scholarships'
      };
    }
  }

  async getScholarshipById(id: string): Promise<ApiResponse<Scholarship>> {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data,
        message: 'Scholarship retrieved successfully'
      };
    } catch (error) {
      console.error('Get scholarship error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scholarship'
      };
    }
  }

  // Application methods
  async createApplication(applicationData: CreateApplicationInput): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          student_id: user.id,
          scholarship_id: applicationData.scholarshipId,
          application_data: applicationData.applicationData,
          documents: applicationData.documents || [],
          status: 'submitted'
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Update scholarship application count
      await supabase.rpc('increment_application_count', {
        scholarship_id: applicationData.scholarshipId
      });

      return {
        success: true,
        data,
        message: 'Application submitted successfully'
      };
    } catch (error) {
      console.error('Create application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application'
      };
    }
  }

  async getUserApplications(): Promise<ApiResponse<Application[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (
            title,
            amount,
            application_deadline
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Applications retrieved successfully'
      };
    } catch (error) {
      console.error('Get user applications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications'
      };
    }
  }

  // Notification methods
  async getNotifications(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Notifications retrieved successfully'
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification'
      };
    }
  }

  // File upload methods
  async uploadDocument(file: File, documentType: string, applicationId?: string): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${documentType}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        return {
          success: false,
          error: uploadError.message
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save document metadata
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          application_id: applicationId,
          file_name: fileName,
          original_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          document_type: documentType
        })
        .select()
        .single();

      if (documentError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([fileName]);
        return {
          success: false,
          error: documentError.message
        };
      }

      return {
        success: true,
        data: documentData,
        message: 'Document uploaded successfully'
      };
    } catch (error) {
      console.error('Upload document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Test connection
  async testConnection(): Promise<ApiResponse> {
    try {
      // Simple ping to test connection
      const { error } = await supabase.auth.getSession();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Connection test failed'
      };
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!supabase.auth.getSession();
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Real-time subscriptions
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToApplicationUpdates(studentId: string, callback: (payload: any) => void) {
    return supabase
      .channel('applications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `student_id=eq.${studentId}`
        },
        callback
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;