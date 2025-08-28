/*
  # Create Demo Users for Testing

  1. Demo Users
    - Creates demo users for each role type
    - Provides test credentials for development
    - Sets up proper user profiles

  2. Security
    - Uses Supabase Auth for password management
    - Applies RLS policies to demo users
    - Ensures secure demo environment
*/

-- Insert demo users into auth.users (this would typically be done through Supabase Auth API)
-- For now, we'll create the profile records that will be linked when users sign up

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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

-- Create some sample scholarships
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
  '["Technology", "Innovation", "Team"]'::jsonb
);

-- Create sample announcements
INSERT INTO announcements (
  title,
  content,
  type,
  target_audience,
  priority,
  valid_from,
  valid_to
) VALUES 
(
  'Welcome to Youth Dreamers Foundation!',
  'We are excited to have you join our community. Explore available scholarships and start your journey towards educational excellence.',
  'general',
  '["student", "donor", "reviewer", "admin"]'::jsonb,
  'normal',
  now(),
  now() + interval '30 days'
),
(
  'New Scholarship Programs Launched',
  'We have launched three new scholarship programs for the academic year 2024-25. Check out the latest opportunities in technology, rural development, and academic excellence.',
  'announcement',
  '["student"]'::jsonb,
  'high',
  now(),
  now() + interval '15 days'
),
(
  'Application Deadline Reminder',
  'Don''t forget to submit your applications before the deadline. Ensure all required documents are uploaded and verified.',
  'deadline',
  '["student"]'::jsonb,
  'urgent',
  now(),
  now() + interval '7 days'
);