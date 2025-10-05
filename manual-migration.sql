-- Manual migration to add visual_styling_url column
-- Run this SQL command in your database console

ALTER TABLE events ADD COLUMN IF NOT EXISTS visual_styling_url text;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;