-- Add email column to users table
ALTER TABLE users ADD COLUMN email TEXT;

-- Make email unique and not null (after adding default values)
-- First, add a temporary unique email for existing users
UPDATE users SET email = username || '@example.com' WHERE email IS NULL;

-- Now make the column not null and unique
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);