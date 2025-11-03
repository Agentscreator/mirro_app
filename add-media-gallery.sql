-- Add media_gallery column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS media_gallery TEXT;
