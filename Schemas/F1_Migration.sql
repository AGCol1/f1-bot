-- F1 Bot - SQL Migration & Setup Script
-- Run this to initialize everything at once

-- ====================================
-- 1. CREATE ALL TABLES
-- ====================================

-- Execute F1_Schema.sql first
-- Then run the initialization below

-- ====================================
-- 2. INSERT OFFICIAL F1 TEAMS
-- ====================================

INSERT IGNORE INTO f1_teams (name, country) VALUES 
('Red Bull Racing', 'Austria'),
('Mercedes-AMG Petronas', 'Germany'),
('McLaren Formula 1 Team', 'United Kingdom'),
('Ferrari', 'Italy'),
('Alpine F1 Team', 'France'),
('Aston Martin F1 Team', 'United Kingdom'),
('RB F1 Team', 'Italy'),
('Haas F1 Team', 'United States'),
('Alfa Romeo Racing', 'Switzerland'),
('Williams Racing', 'United Kingdom');

-- ====================================
-- 3. INSERT OFFICIAL F1 DRIVERS
-- ====================================

INSERT IGNORE INTO f1_drivers (first_name, last_name, number) VALUES
-- Red Bull Racing
('Max', 'Verstappen', 1),
('Sergio', 'Pérez', 11),
-- Mercedes
('Lewis', 'Hamilton', 44),
('George', 'Russell', 63),
-- McLaren
('Lando', 'Norris', 81),
('Oscar', 'Piastri', 81),
-- Ferrari
('Charles', 'Leclerc', 16),
('Carlos', 'Sainz', 55),
-- Alpine
('Esteban', 'Ocon', 31),
('Pierre', 'Gasly', 10),
-- Aston Martin
('Fernando', 'Alonso', 14),
('Lance', 'Stroll', 18),
-- RB
('Yuki', 'Tsunoda', 22),
('Daniel', 'Ricciardo', 3),
-- Haas
('Nico', 'Hulkenberg', 27),
('Kevin', 'Magnussen', 20),
-- Alfa Romeo
('Valtteri', 'Bottas', 77),
('Guanyu', 'Zhou', 24),
-- Williams
('Alexander', 'Albon', 23),
('Logan', 'Sargeant', 2);

-- ====================================
-- 4. INSERT OFFICIAL F1 CIRCUITS
-- ====================================

INSERT IGNORE INTO circuits (name, country) VALUES
('Albert Park Circuit', 'Australia'),
('Jeddah Corniche Circuit', 'Saudi Arabia'),
('Bahrain International Circuit', 'Bahrain'),
('Miami International Autodrome', 'United States'),
('Circuit de Barcelona-Catalunya', 'Spain'),
('Circuit de Monaco', 'Monaco'),
('Baku City Circuit', 'Azerbaijan'),
('Circuit Gilles Villeneuve', 'Canada'),
('Silverstone Circuit', 'United Kingdom'),
('Hungaroring', 'Hungary'),
('Spa-Francorchamps', 'Belgium'),
('Circuit Zandvoort', 'Netherlands'),
('Autodromo Nazionale di Monza', 'Italy'),
('Marina Bay Street Circuit', 'Singapore'),
('Suzuka International Racing Course', 'Japan'),
('Lusail International Circuit', 'Qatar'),
('Circuit of the Americas', 'United States'),
('Autodromo Hermanos Rodriguez', 'Mexico'),
('Autodromo José Maria Reyes', 'Brazil'),
('Las Vegas Street Circuit', 'United States'),
('Yas Marina Circuit', 'United Arab Emirates'),
('Melbourne Grand Prix Circuit', 'Australia');

-- ====================================
-- 5. VERIFICATION QUERIES
-- ====================================

-- Check teams were inserted
SELECT COUNT(*) as f1_teams_count FROM f1_teams;

-- Check drivers were inserted
SELECT COUNT(*) as f1_drivers_count FROM f1_drivers;

-- Check circuits were inserted
SELECT COUNT(*) as circuits_count FROM circuits;

-- ====================================
-- 6. SAMPLE: CREATE GUILD & SEASON
-- ====================================

-- Example: Insert a test guild
-- Replace YOUR_GUILD_ID with actual Discord guild ID
-- INSERT INTO guilds (guild_id) VALUES (YOUR_GUILD_ID);

-- Example: Create a test season
-- INSERT INTO seasons (guild_id, season_number, total_rounds, is_active) 
-- VALUES (YOUR_GUILD_ID, 2024, 24, TRUE);

-- ====================================
-- 7. SAMPLE: CREATE TEAMS & DRIVERS
-- ====================================

-- Example: Add teams to a guild
-- INSERT INTO teams (guild_id, name, is_f1_team, f1_team_id) VALUES
-- (YOUR_GUILD_ID, 'Red Bull Racing', TRUE, 1),
-- (YOUR_GUILD_ID, 'Mercedes-AMG Petronas', TRUE, 2);

-- Example: Add drivers to a guild
-- INSERT INTO drivers (guild_id, user_id, name, is_f1_driver, f1_driver_id) VALUES
-- (YOUR_GUILD_ID, 123456789, 'Max Verstappen', TRUE, 1),
-- (YOUR_GUILD_ID, NULL, 'Custom Driver', FALSE, NULL);

-- ====================================
-- END OF MIGRATION SCRIPT
-- ====================================

-- All tables created and pre-loaded data inserted!
-- Bot is ready for use.
