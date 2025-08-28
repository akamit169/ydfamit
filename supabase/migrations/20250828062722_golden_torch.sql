/*
  # Create Demo Users and Sample Data

  1. New Demo Users
    - `student@demo.com` - Demo Student with academic profile
    - `admin@demo.com` - Demo Administrator with full permissions
    - `reviewer@demo.com` - Demo Reviewer for application evaluation
    - `donor@demo.com` - Demo Donor for funding scholarships

  2. Sample Scholarships
    - Merit Excellence Scholarship (₹50,000)
    - Rural Girls Education Grant (₹35,000) 
    - Technical Innovation Fund (₹75,000)

  3. Sample Announcements
    - Welcome message for new users
    - New scholarship program announcements
    - Application deadline reminders

  Note: This creates user profiles that will be linked when users sign up through Supabase Auth
*/

-- Insert demo users into users table
-- These will be linked when users sign up through Supabase Auth

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
),
-- Demo Admin User
(
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
),
-- Demo Reviewer User
(
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
),
-- Demo Donor User
(
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

-- Create sample announcements with correct type values
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
  'general',
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