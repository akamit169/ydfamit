/*
  # Initial Database Schema for Youth Dreamers Foundation

  1. New Tables
    - `users` - All user accounts (students, admins, reviewers, donors)
    - `scholarships` - Scholarship programs and schemes  
    - `applications` - Student applications for scholarships
    - `reviews` - Application evaluations by reviewers
    - `notifications` - System notifications for users
    - `documents` - File uploads and document management
    - `announcements` - System-wide announcements
    - `contributions` - Donor contributions and payments
    - `settings` - Application configuration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Secure data access based on user roles

  3. Features
    - UUID primary keys for security
    - Timestamps for audit trails
    - JSON fields for flexible data storage
    - Proper foreign key relationships
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - for all user types (students, admins, reviewers, donors)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('student', 'admin', 'reviewer', 'donor')),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  profile_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scholarship schemes table
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  eligibility_criteria jsonb NOT NULL,
  required_documents jsonb NOT NULL,
  application_deadline timestamptz NOT NULL,
  selection_deadline timestamptz,
  max_applications integer,
  current_applications integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  created_by uuid REFERENCES users(id),
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scholarship applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id),
  scholarship_id uuid NOT NULL REFERENCES scholarships(id),
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'waitlisted')),
  application_data jsonb NOT NULL,
  documents jsonb DEFAULT '[]',
  score decimal(5,2),
  review_notes text,
  reviewed_by uuid REFERENCES users(id),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Reviews and evaluations table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id),
  reviewer_id uuid NOT NULL REFERENCES users(id),
  criteria jsonb NOT NULL,
  overall_score decimal(5,2) NOT NULL,
  comments text,
  recommendation text CHECK (recommendation IN ('approve', 'reject', 'conditionally_approve')),
  is_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('application', 'deadline', 'announcement', 'message')),
  is_read boolean DEFAULT false,
  related_id uuid,
  related_type text,
  created_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  application_id uuid REFERENCES applications(id),
  file_name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  document_type text NOT NULL,
  is_verified boolean DEFAULT false,
  verification_notes text,
  uploaded_at timestamptz DEFAULT now()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'general' CHECK (type IN ('general', 'deadline', 'result', 'maintenance')),
  target_audience jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  valid_from timestamptz DEFAULT now(),
  valid_to timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donor contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES users(id),
  scholarship_id uuid REFERENCES scholarships(id),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  payment_method text,
  payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  contribution_type text DEFAULT 'one_time' CHECK (contribution_type IN ('one_time', 'recurring')),
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for scholarships table
CREATE POLICY "Anyone can read active scholarships"
  ON scholarships
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage scholarships"
  ON scholarships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for applications table
CREATE POLICY "Students can read own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Reviewers can read assigned applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type IN ('reviewer', 'admin')
    )
  );

CREATE POLICY "Reviewers can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type IN ('reviewer', 'admin')
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Reviewers can manage own reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Admins can read all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for documents table
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can upload own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Reviewers can read application documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type IN ('reviewer', 'admin')
    )
  );

-- RLS Policies for announcements table
CREATE POLICY "Anyone can read active announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_to IS NULL OR valid_to > now()));

CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for contributions table
CREATE POLICY "Donors can read own contributions"
  ON contributions
  FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Donors can create contributions"
  ON contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Admins can read all contributions"
  ON contributions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for settings table
CREATE POLICY "Admins can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON scholarships(status);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_scholarship ON applications(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON documents(application_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();