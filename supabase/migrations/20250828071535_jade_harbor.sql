/*
  # Disable RLS on users table

  1. Changes
    - Disable Row Level Security on users table
    - Drop all existing RLS policies
    - Allow direct access to users table without policy restrictions

  2. Security
    - RLS disabled as requested
    - Application-level security will handle access control
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON users;

-- Disable Row Level Security
ALTER TABLE users DISABLE ROW LEVEL SECURITY;