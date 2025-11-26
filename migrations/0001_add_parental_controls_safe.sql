-- Safe migration: Only add new columns and tables, don't drop anything

-- Add age-related fields to users table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='date_of_birth') THEN
    ALTER TABLE users ADD COLUMN date_of_birth TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='age_category') THEN
    ALTER TABLE users ADD COLUMN age_category TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='guardian_email') THEN
    ALTER TABLE users ADD COLUMN guardian_email TEXT;
  END IF;
END $$;

-- Add content flags to events table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='is_public') THEN
    ALTER TABLE events ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='is_mature') THEN
    ALTER TABLE events ADD COLUMN is_mature BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create parental_controls table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS parental_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pin TEXT NOT NULL,
  messaging_restricted BOOLEAN DEFAULT true,
  event_creation_restricted BOOLEAN DEFAULT true,
  content_filtering_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create pin_attempts table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS pin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  attempt_count INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_attempt_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create pin_reset_tokens table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS pin_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_parental_controls_user_id ON parental_controls(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_attempts_user_id ON pin_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_reset_tokens_token ON pin_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_pin_reset_tokens_user_id ON pin_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_is_mature ON events(is_mature);
CREATE INDEX IF NOT EXISTS idx_users_age_category ON users(age_category);
