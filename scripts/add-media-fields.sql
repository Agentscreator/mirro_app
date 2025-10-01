-- Add media fields to events table
ALTER TABLE events 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT;