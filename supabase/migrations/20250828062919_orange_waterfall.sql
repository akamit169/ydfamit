/*
  # Create Demo Users and Sample Data

  1. Demo Users
    - Creates demo user profiles for testing all roles
    - Student, Admin, Reviewer, and Donor accounts
    - Pre-filled profile data for realistic testing

  2. Sample Scholarships
    - Merit Excellence Scholarship
    - Rural Girls Education Grant  
    - Technical Innovation Fund

  3. Sample Announcements
    - Welcome message for new users
    - New scholarship program notifications
    - Application deadline reminders

  4. Security
    - All demo users have proper RLS policies
    - Sample data follows existing constraints
*/

-- Insert demo users (these will be linked when Supabase Auth users are created)
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
) VALUES 
-- Demo Student User
(
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
),
-- Demo Admin User
(
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
),
-- Demo Reviewer User
(
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
),
-- Demo Donor User
(
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
)
ON CONFLICT (email) DO NOTHING;

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
  tags,
  created_by
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
  '["Academic", "Merit-based", "UG/PG"]'::jsonb,
  '22222222-2222-2222-2222-222222222222'
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
  '["Gender", "Rural", "Empowerment"]'::jsonb,
  '22222222-2222-2222-2222-222222222222'
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
  '["Technology", "Innovation", "Team"]'::jsonb,
  '22222222-2222-2222-2222-222222222222'
);

-- Create sample announcements (using valid types from constraint)
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