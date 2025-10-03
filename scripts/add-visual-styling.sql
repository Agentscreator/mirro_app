-- Add visual_styling column to events table
ALTER TABLE events ADD COLUMN visual_styling TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN events.visual_styling IS 'JSON data containing AI-generated visual styling information';