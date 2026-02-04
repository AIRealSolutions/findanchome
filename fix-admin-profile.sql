-- Fix Admin User Profile for marcspencer28461@gmail.com
-- Run this in Supabase SQL Editor

-- First, let's check if the profile exists
SELECT id, email FROM auth.users WHERE email = 'marcspencer28461@gmail.com';

-- Check if profile exists in fanc_user_profiles
SELECT * FROM fanc_user_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'marcspencer28461@gmail.com'
);

-- If profile doesn't exist, create it
-- Replace 'USER_ID_HERE' with the actual user ID from the first query above
INSERT INTO fanc_user_profiles (id, role, first_name, last_name, is_active)
SELECT 
  id,
  'admin' as role,
  'Marc' as first_name,
  'Spencer' as last_name,
  true as is_active
FROM auth.users 
WHERE email = 'marcspencer28461@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_active = true;

-- Verify the profile was created/updated
SELECT up.*, au.email 
FROM fanc_user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'marcspencer28461@gmail.com';
