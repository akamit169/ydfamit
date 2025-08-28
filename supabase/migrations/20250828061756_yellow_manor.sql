/*
  # Create Demo Users and Sample Data

  1. Demo Users
    - Creates demo user profiles for testing each role
    - Student, Admin, Reviewer, and Donor accounts
    - Pre-filled profile data for realistic testing

  2. Sample Scholarships
    - Merit Excellence Scholarship (Academic)
    - Rural Girls Education Grant (Gender Equity)
    - Technical Innovation Fund (Technology)

  3. Sample Announcements
    - Welcome message for new users
    - New scholarship program announcements
    - Application deadline reminders

  4. Security
    - All tables have RLS enabled
    - Demo data follows security policies
*/

-- Insert demo users into users table
-- Note: Auth users will be created through Supabase Auth API when they first sign in

-- Demo Student User
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  user_type,
  is_active,
  email_verified,
  profile_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'student@demo.com',
  'Demo',
  'Student',
  '+91 9876543210',
  'student',
  true,
  true,
  '{
    "course": "B.Tech Computer Science",
    "college": "Demo University",
    "year": "3rd Year",
    "cgpa": "8.5",
    "category": "General",
    "family_income": "500000"
  }'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  profile_data = EXCLUDED.profile_data;

-- Demo Admin User
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  user_type,
  is_active,
  email_verified,
  profile_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@demo.com',
  'Demo',
  'Administrator',
  '+91 9876543211',
  'admin',
  true,
  true,
  '{
    "department": "Operations",
    "role": "System Administrator",
    "permissions": ["all"]
  }'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  profile_data = EXCLUDED.profile_data;

-- Demo Reviewer User
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  user_type,
  is_active,
  email_verified,
  profile_data
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'reviewer@demo.com',
  'Demo',
  'Reviewer',
  '+91 9876543212',
  'reviewer',
  true,
  true,
  '{
    "specialization": "Academic Excellence",
    "experience": "5 years",
    "institution": "Demo Review Board"
  }'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  profile_data = EXCLUDED.profile_data;

-- Demo Donor User
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  user_type,
  is_active,
  email_verified,
  profile_data
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'donor@demo.com',
  'Demo',
  'Donor',
  '+91 9876543213',
  'donor',
  true,
  true,
  '{
    "organization": "Demo Foundation",
    "contribution_type": "Individual",
    "interests": ["Education", "Technology"]
  }'::jsonb
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  profile_data = EXCLUDED.profile_data;

-- Create sample scholarships
INSERT INTO scholarships (
  title,
  description,
  amount,
  currency,
  eligibility_criteria,
  required_documents,
  application_deadline,
  max_applications,
  status,
  created_by,
  tags
) VALUES 
(
  'Merit Excellence Scholarship',
  'Supporting academically excellent students with financial assistance to pursue their educational goals.',
  50000,
  'INR',
  '["CGPA above 8.0", "Annual family income below ₹5 lakhs", "Currently enrolled in UG/PG program"]'::jsonb,
  '["Academic transcripts", "Income certificate", "Aadhaar card", "Bank account details"]'::jsonb,
  '2024-06-30 23:59:59+00',
  100,
  'active',
  '22222222-2222-2222-2222-222222222222',
  '["Academic", "Merit-based", "UG/PG"]'::jsonb
),
(
  'Rural Girls Education Grant',
  'Empowering rural girls through education by providing financial support for higher studies.',
  35000,
  'INR',
  '["Female candidates only", "From rural areas", "Family income below ₹3 lakhs", "Age between 18-25 years"]'::jsonb,
  '["Income certificate", "Rural residence proof", "Academic records", "Aadhaar card"]'::jsonb,
  '2024-07-15 23:59:59+00',
  50,
  'active',
  '22222222-2222-2222-2222-222222222222',
  '["Gender", "Rural", "Empowerment"]'::jsonb
),
(
  'Technical Innovation Fund',
  'Supporting innovative technology projects that solve real-world problems.',
  75000,
  'INR',
  '["Engineering/Technology students", "Innovative project proposal required", "CGPA above 7.5", "Team project (2-4 members)"]'::jsonb,
  '["Project proposal", "Technical documentation", "Team details", "Academic transcripts"]'::jsonb,
  '2024-08-30 23:59:59+00',
  25,
  'active',
  '22222222-2222-2222-2222-222222222222',
  '["Technology", "Innovation", "Team"]'::jsonb
);

-- Create sample announcements (using correct type values)
INSERT INTO announcements (
  title,
  content,
  type,
  target_audience,
  priority,
  valid_from,
  valid_to,
  created_by
) VALUES 
(
  'Welcome to Youth Dreamers Foundation!',
  'We are excited to have you join our community. Explore available scholarships and start your journey towards educational excellence.',
  'general',
  '["student", "donor", "reviewer", "admin"]'::jsonb,
  'normal',
  now(),
  now() + interval '30 days',
  '22222222-2222-2222-2222-222222222222'
),
(
  'New Scholarship Programs Launched',
  'We have launched three new scholarship programs for the academic year 2024-25. Check out the latest opportunities in technology, rural development, and academic excellence.',
  'general',
  '["student"]'::jsonb,
  'high',
  now(),
  now() + interval '15 days',
  '22222222-2222-2222-2222-222222222222'
),
(
  'Application Deadline Reminder',
  'Don''t forget to submit your applications before the deadline. Ensure all required documents are uploaded and verified.',
  'deadline',
  '["student"]'::jsonb,
  'urgent',
  now(),
  now() + interval '7 days',
  '22222222-2222-2222-2222-222222222222'
);

-- Create sample applications for demo student
INSERT INTO applications (
  student_id,
  scholarship_id,
  status,
  application_data,
  documents
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM scholarships WHERE title = 'Merit Excellence Scholarship' LIMIT 1),
  'under_review',
  '{
    "personal_info": {
      "name": "Demo Student",
      "age": 20,
      "address": "123 Demo Street, Demo City"
    },
    "academic_info": {
      "current_cgpa": "8.5",
      "previous_marks": "85%",
      "achievements": ["Dean''s List", "Academic Excellence Award"]
    },
    "financial_info": {
      "family_income": "500000",
      "income_source": "Father - Government Employee"
    }
  }'::jsonb,
  '["aadhaar_card.pdf", "income_certificate.pdf", "academic_transcripts.pdf"]'::jsonb
);

-- Update scholarship application count
UPDATE scholarships 
SET current_applications = 1 
WHERE title = 'Merit Excellence Scholarship';

-- Create sample notifications for demo users
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  related_id,
  related_type
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Application Submitted Successfully',
  'Your application for Merit Excellence Scholarship has been submitted and is under review.',
  'application',
  (SELECT id FROM applications WHERE student_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  'application'
),
(
  '11111111-1111-1111-1111-111111111111',
  'New Scholarship Available',
  'A new scholarship program "Technical Innovation Fund" is now available. Check if you are eligible!',
  'announcement',
  (SELECT id FROM scholarships WHERE title = 'Technical Innovation Fund' LIMIT 1),
  'scholarship'
),
(
  '22222222-2222-2222-2222-222222222222',
  'New Application Received',
  'A new application has been submitted for Merit Excellence Scholarship and requires review.',
  'application',
  (SELECT id FROM applications WHERE student_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  'application'
);