-- Add thumbnail_url column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN events.thumbnail_url IS 'AI-generated thumbnail URL for event cards and previews';
