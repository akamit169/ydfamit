/*
  # Fix RLS Infinite Recursion Error

  1. Security Changes
    - Drop problematic RLS policies causing infinite recursion
    - Create simple, safe RLS policies for users table
    - Ensure no circular dependencies in policy evaluation

  2. Policy Updates
    - Users can read their own profile data
    - Admins can read all user data
    - Users can update their own profile
*/

-- Drop all existing policies on users table to prevent conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create simple, safe RLS policies without recursion
CREATE POLICY "users_select_own" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "users_select_admin" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'user_type' = 'admin'
    )
  );

CREATE POLICY "users_update_own" 
  ON users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" 
  ON users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);