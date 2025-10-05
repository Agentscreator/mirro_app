-- Add visual_styling_url column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS visual_styling_url text;