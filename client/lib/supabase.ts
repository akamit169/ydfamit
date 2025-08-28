import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

// Create Supabase client with fallback values to prevent crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'youth-dreamers-foundation'
      }
    }
  }
);

// Database types (generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          user_type: 'student' | 'admin' | 'reviewer' | 'donor';
          is_active: boolean;
          email_verified: boolean;
          profile_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          user_type: 'student' | 'admin' | 'reviewer' | 'donor';
          is_active?: boolean;
          email_verified?: boolean;
          profile_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          user_type?: 'student' | 'admin' | 'reviewer' | 'donor';
          is_active?: boolean;
          email_verified?: boolean;
          profile_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      scholarships: {
        Row: {
          id: string;
          title: string;
          description: string;
          amount: number;
          currency: string;
          eligibility_criteria: any;
          required_documents: any;
          application_deadline: string;
          selection_deadline: string | null;
          max_applications: number | null;
          current_applications: number;
          status: 'active' | 'inactive' | 'closed';
          created_by: string | null;
          tags: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          amount: number;
          currency?: string;
          eligibility_criteria: any;
          required_documents: any;
          application_deadline: string;
          selection_deadline?: string | null;
          max_applications?: number | null;
          current_applications?: number;
          status?: 'active' | 'inactive' | 'closed';
          created_by?: string | null;
          tags?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          amount?: number;
          currency?: string;
          eligibility_criteria?: any;
          required_documents?: any;
          application_deadline?: string;
          selection_deadline?: string | null;
          max_applications?: number | null;
          current_applications?: number;
          status?: 'active' | 'inactive' | 'closed';
          created_by?: string | null;
          tags?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          student_id: string;
          scholarship_id: string;
          status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
          application_data: any;
          documents: any;
          score: number | null;
          review_notes: string | null;
          reviewed_by: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          scholarship_id: string;
          status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
          application_data: any;
          documents?: any;
          score?: number | null;
          review_notes?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          scholarship_id?: string;
          status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
          application_data?: any;
          documents?: any;
          score?: number | null;
          review_notes?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

export default supabase;