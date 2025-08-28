/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Current RLS policies on users table are causing infinite recursion
    - The admin policy is trying to check user_type from the same table it's protecting

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Use auth.uid() directly without table lookups in policies

  3. New Policies
    - Users can read their own profile (auth.uid() = id)
    - Users can update their own profile (auth.uid() = id)
    - Users can insert their own profile during registration
    - Remove admin policy that causes recursion
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;