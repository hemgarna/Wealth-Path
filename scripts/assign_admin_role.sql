-- Assign advisor (admin) role to a user
-- Replace 'user@example.com' with the actual user's email address

UPDATE profiles
SET role = 'advisor'
WHERE email = 'user@example.com';

-- Verify the role was updated
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE email = 'user@example.com';
