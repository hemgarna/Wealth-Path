-- Reset CEO password to: CEO@2024
-- This is a temporary password that should be changed after first login

-- Update the password for the CEO account
-- Password hash for 'CEO@2024' generated with bcrypt
UPDATE auth.users
SET encrypted_password = crypt('CEO@2024', gen_salt('bf'))
WHERE email = 'nithyavananda8@gmail.com';
