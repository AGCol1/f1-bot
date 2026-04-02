-- F1 Bot Database Schema
-- This script creates all necessary tables for the F1 Bot system

-- ===== CORE TABLES =====

-- Guilds
CREATE TABLE IF NOT EXISTS `guilds` (
    `guild_id` BIGINT NOT NULL PRIMARY KEY,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seasons
CREATE TABLE IF NOT EXISTS `seasons` (
    `season_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guild_id` BIGINT NOT NULL,
    `season_number` INT NOT NULL,
    `total_rounds` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_guild_season` (`guild_id`, `season_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Circuits (Race Tracks)
CREATE TABLE IF NOT EXISTS `circuits` (
    `circuit_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `country` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rounds
CREATE TABLE IF NOT EXISTS `rounds` (
    `round_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season_id` INT NOT NULL,
    `round_number` INT NOT NULL,
    `circuit_id` INT NOT NULL,
    `race_date` DATETIME,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE,
    FOREIGN KEY (`circuit_id`) REFERENCES `circuits`(`circuit_id`),
    UNIQUE KEY `unique_season_round` (`season_id`, `round_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- F1 Teams (Pre-loaded Official)
CREATE TABLE IF NOT EXISTS `f1_teams` (
    `team_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `country` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- F1 Drivers (Pre-loaded Official)
CREATE TABLE IF NOT EXISTS `f1_drivers` (
    `driver_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `number` INT,
    UNIQUE KEY `unique_driver` (`first_name`, `last_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guild Teams (Custom Teams per Guild)
CREATE TABLE IF NOT EXISTS `teams` (
    `team_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guild_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `is_f1_team` BOOLEAN DEFAULT FALSE,
    `f1_team_id` INT,
    FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE CASCADE,
    FOREIGN KEY (`f1_team_id`) REFERENCES `f1_teams`(`team_id`),
    UNIQUE KEY `unique_team_per_guild` (`guild_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guild Drivers (Custom Drivers per Guild)
CREATE TABLE IF NOT EXISTS `drivers` (
    `driver_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guild_id` BIGINT NOT NULL,
    `user_id` BIGINT,
    `name` VARCHAR(255) NOT NULL,
    `is_f1_driver` BOOLEAN DEFAULT FALSE,
    `f1_driver_id` INT,
    FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE CASCADE,
    FOREIGN KEY (`f1_driver_id`) REFERENCES `f1_drivers`(`driver_id`),
    UNIQUE KEY `unique_driver_per_guild_user` (`guild_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== SEASON ASSIGNMENT TABLES =====

-- Team Drivers Assignment (Season-specific)
CREATE TABLE IF NOT EXISTS `team_drivers` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season_id` INT NOT NULL,
    `team_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `is_reserve` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE,
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON DELETE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_driver_per_season` (`season_id`, `driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance (Per Round)
CREATE TABLE IF NOT EXISTS `attendance` (
    `attendance_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `round_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `status` ENUM('attending','absent','tentative','reserve','retired') DEFAULT 'attending',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`round_id`) REFERENCES `rounds`(`round_id`) ON DELETE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_round_driver_attendance` (`round_id`, `driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== RESULTS & STANDINGS =====

-- Race Results
CREATE TABLE IF NOT EXISTS `race_results` (
    `result_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `round_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `position` INT,
    `lap_time_delta` VARCHAR(20),
    `points` INT DEFAULT 0,
    `fastest_lap` BOOLEAN DEFAULT FALSE,
    `dnf` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`round_id`) REFERENCES `rounds`(`round_id`) ON DELETE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_result_per_round` (`round_id`, `driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Driver Standings
CREATE TABLE IF NOT EXISTS `driver_standings` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `points` INT DEFAULT 0,
    `wins` INT DEFAULT 0,
    `podiums` INT DEFAULT 0,
    `dnf_count` INT DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_driver_season_standing` (`season_id`, `driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Constructor Standings
CREATE TABLE IF NOT EXISTS `constructor_standings` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season_id` INT NOT NULL,
    `team_id` INT NOT NULL,
    `points` INT DEFAULT 0,
    `wins` INT DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE,
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_team_season_standing` (`season_id`, `team_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== PENALTIES & INCIDENTS =====

-- Penalties (Assigned by Stewards)
CREATE TABLE IF NOT EXISTS `penalties` (
    `penalty_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `round_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `steward_id` BIGINT NOT NULL,
    `time_penalty` INT COMMENT 'Time penalty in seconds',
    `points_penalty` INT,
    `reason` TEXT NOT NULL,
    `status` ENUM('active','appealed','overturned') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`round_id`) REFERENCES `rounds`(`round_id`) ON DELETE CASCADE,
    FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident Reports (From Drivers)
CREATE TABLE IF NOT EXISTS `incident_reports` (
    `incident_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `season_id` INT NOT NULL,
    `round_id` INT NOT NULL,
    `reporter_id` BIGINT NOT NULL,
    `reporter_driver_id` INT,
    `involved_driver_id` INT,
    `description` TEXT NOT NULL,
    `context` TEXT,
    `evidence_links` TEXT,
    `status` ENUM('open','under_review','closed') DEFAULT 'open',
    `decision` TEXT,
    `decision_made_by` BIGINT,
    `ticket_channel_id` BIGINT COMMENT 'Discord channel ID for this ticket',
    `ticket_message_id` BIGINT COMMENT 'Initial embed message in ticket channel',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE,
    FOREIGN KEY (`round_id`) REFERENCES `rounds`(`round_id`) ON DELETE CASCADE,
    FOREIGN KEY (`reporter_driver_id`) REFERENCES `drivers`(`driver_id`),
    FOREIGN KEY (`involved_driver_id`) REFERENCES `drivers`(`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Penalty Appeals
CREATE TABLE IF NOT EXISTS `penalty_appeals` (
    `appeal_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `penalty_id` INT NOT NULL,
    `appellant_id` BIGINT NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending','approved','denied') DEFAULT 'pending',
    `decided_by` BIGINT,
    `decision_reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `decided_at` DATETIME,
    FOREIGN KEY (`penalty_id`) REFERENCES `penalties`(`penalty_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== SETTINGS & CONFIG =====

-- Guild Settings
CREATE TABLE IF NOT EXISTS `settings` (
    `guild_id` BIGINT NOT NULL PRIMARY KEY,
    `results_channel_id` BIGINT,
    `incidents_channel_id` BIGINT,
    `standings_channel_id` BIGINT,
    `admin_role_id` BIGINT,
    `steward_role_id` BIGINT,
    `manager_role_id` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Season Settings (Points System, Rules)
CREATE TABLE IF NOT EXISTS `season_settings` (
    `season_id` INT NOT NULL PRIMARY KEY,
    `points_system` VARCHAR(50) DEFAULT 'standard_f1',
    `custom_points_json` JSON,
    `fastest_lap_points` INT DEFAULT 1,
    `podium_threshold` INT DEFAULT 3,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`season_id`) REFERENCES `seasons`(`season_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trusted Roles (Stewards & Managers)
CREATE TABLE IF NOT EXISTS `trusted_roles` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `guild_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `role_type` ENUM('steward','manager','admin') DEFAULT 'steward',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`guild_id`) REFERENCES `guilds`(`guild_id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_role_per_guild` (`guild_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== INDEXES FOR PERFORMANCE =====

CREATE INDEX idx_season_guild ON `seasons`(`guild_id`);
CREATE INDEX idx_season_active ON `seasons`(`is_active`);
CREATE INDEX idx_round_season ON `rounds`(`season_id`);
CREATE INDEX idx_team_guild ON `teams`(`guild_id`);
CREATE INDEX idx_driver_guild ON `drivers`(`guild_id`);
CREATE INDEX idx_driver_user ON `drivers`(`user_id`);
CREATE INDEX idx_team_drivers_season ON `team_drivers`(`season_id`);
CREATE INDEX idx_attendance_round ON `attendance`(`round_id`);
CREATE INDEX idx_attendance_driver ON `attendance`(`driver_id`);
CREATE INDEX idx_race_results_round ON `race_results`(`round_id`);
CREATE INDEX idx_race_results_driver ON `race_results`(`driver_id`);
CREATE INDEX idx_driver_standing_season ON `driver_standings`(`season_id`);
CREATE INDEX idx_constructor_standing_season ON `constructor_standings`(`season_id`);
CREATE INDEX idx_penalty_round ON `penalties`(`round_id`);
CREATE INDEX idx_penalty_driver ON `penalties`(`driver_id`);
CREATE INDEX idx_incident_season ON `incident_reports`(`season_id`);
CREATE INDEX idx_incident_round ON `incident_reports`(`round_id`);
