-- Remove the password_hash column from user_profiles table to fix security vulnerability
-- Password authentication is handled by Supabase Auth, so this column is not needed
-- and poses a security risk by exposing password hashes to users who can view profiles

ALTER TABLE public.user_profiles 
DROP COLUMN password_hash;