-- Add backgroundUrl column to events table
ALTER TABLE events ADD COLUMN background_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN events.background_url IS 'Store AI-generated background URL for event preview modal';
