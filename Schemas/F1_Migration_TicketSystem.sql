-- Migration: Add ticket system support to incident reports
-- This enables Discord channel tickets for incident management

-- Add ticket channel tracking columns to incident_reports
ALTER TABLE incident_reports 
ADD COLUMN ticket_channel_id BIGINT COMMENT 'Discord channel ID for this ticket' AFTER decision_made_by;

ALTER TABLE incident_reports 
ADD COLUMN ticket_message_id BIGINT COMMENT 'Initial embed message in ticket channel' AFTER ticket_channel_id;

-- Note: If columns already exist, this will fail gracefully (that's ok)
-- The bot will check if columns exist before using them
