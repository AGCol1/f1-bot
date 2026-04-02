-- Migration: Add lap time tracking to race results
-- This allows steward time penalties to automatically recalculate positions

-- Add lap_time_delta column if it doesn't exist
ALTER TABLE race_results 
ADD COLUMN lap_time_delta VARCHAR(20) COMMENT 'Time delta from winner (format: +MM:SS.SSS or +0:00.000 for winner)' 
AFTER position;

-- Update comment on time_penalty in penalties table for clarity
ALTER TABLE penalties 
MODIFY COLUMN time_penalty INT COMMENT 'Time penalty in seconds (added to lap time for recalculation)';

-- Note: If table already has this column, this will fail gracefully (that''s ok)
-- The bot initialization will check if column exists before adding it
