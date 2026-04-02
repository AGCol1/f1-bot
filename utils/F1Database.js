const { getPool } = require('./DatabasePool');

class F1Database {
    // ===== GUILD FUNCTIONS =====
    
    static async ensureGuildExists(guildId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            const result = await conn.query('SELECT guild_id FROM guilds WHERE guild_id = ?', [guildId]);
            if (result.length === 0) {
                await conn.query('INSERT INTO guilds (guild_id) VALUES (?)', [guildId]);
            }
        } finally {
            conn.release();
        }
    }

    static async getActiveSeasonByGuild(guildId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            const result = await conn.query(
                'SELECT * FROM seasons WHERE guild_id = ? AND is_active = TRUE ORDER BY season_id DESC LIMIT 1',
                [guildId]
            );
            return result.length > 0 ? result[0] : null;
        } finally {
            conn.release();
        }
    }

    static async hasActiveSeason(guildId) {
        const season = await this.getActiveSeasonByGuild(guildId);
        return season !== null;
    }

    // ===== SEASON FUNCTIONS =====

    static async createSeason(guildId, seasonNumber, totalRounds, stewardRoles = []) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Create season
            const seasonResult = await conn.query(
                'INSERT INTO seasons (guild_id, season_number, total_rounds, is_active) VALUES (?, ?, ?, TRUE)',
                [guildId, seasonNumber, totalRounds]
            );
            const seasonId = seasonResult.insertId;

            // Create season settings with default F1 points
            await conn.query(
                'INSERT INTO season_settings (season_id, points_system) VALUES (?, ?)',
                [seasonId, 'standard_f1']
            );

            // Create trusted roles
            for (const roleId of stewardRoles) {
                await conn.query(
                    'INSERT INTO trusted_roles (guild_id, role_id, role_type) VALUES (?, ?, ?)',
                    [guildId, roleId, 'steward']
                );
            }

            await conn.commit();
            return seasonId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async addRoundsToSeason(seasonId, roundsData) {
        // roundsData: [{roundNumber, circuitId}, ...]
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            for (const round of roundsData) {
                await conn.query(
                    'INSERT INTO rounds (season_id, round_number, circuit_id) VALUES (?, ?, ?)',
                    [seasonId, round.roundNumber, round.circuitId]
                );
            }
        } finally {
            conn.release();
        }
    }

    // ===== CIRCUIT FUNCTIONS =====

    static async getAllCircuits() {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query('SELECT * FROM circuits ORDER BY name');
        } finally {
            conn.release();
        }
    }

    static async getCircuitsByCountry(country) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query('SELECT * FROM circuits WHERE country = ? ORDER BY name', [country]);
        } finally {
            conn.release();
        }
    }

    // ===== TEAM & DRIVER FUNCTIONS =====

    static async assignDriverToTeam(seasonId, driverId, teamId, isReserve = false) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.query(
                'INSERT INTO team_drivers (season_id, team_id, driver_id, is_reserve) VALUES (?, ?, ?, ?)',
                [seasonId, teamId, driverId, isReserve]
            );
        } finally {
            conn.release();
        }
    }

    static async getTeamDriversBySeasonAndTeam(seasonId, teamId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT td.*, d.name as driver_name FROM team_drivers td
                 JOIN drivers d ON td.driver_id = d.driver_id
                 WHERE td.season_id = ? AND td.team_id = ?`,
                [seasonId, teamId]
            );
        } finally {
            conn.release();
        }
    }

    static async getDriversByGuild(guildId, includeF1 = true) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            let query = 'SELECT * FROM drivers WHERE guild_id = ?';
            if (!includeF1) {
                query += ' AND is_f1_driver = FALSE';
            }
            return await conn.query(query + ' ORDER BY name', [guildId]);
        } finally {
            conn.release();
        }
    }

    static async getTeamsByGuild(guildId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query('SELECT * FROM teams WHERE guild_id = ? ORDER BY name', [guildId]);
        } finally {
            conn.release();
        }
    }

    // ===== ATTENDANCE FUNCTIONS =====

    static async setAttendance(roundId, driverId, status) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `INSERT INTO attendance (round_id, driver_id, status) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = ?, updated_at = CURRENT_TIMESTAMP`,
                [roundId, driverId, status, status]
            );
        } finally {
            conn.release();
        }
    }

    static async getAttendanceByRound(roundId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT a.*, d.name as driver_name FROM attendance a
                 JOIN drivers d ON a.driver_id = d.driver_id
                 WHERE a.round_id = ? ORDER BY d.name`,
                [roundId]
            );
        } finally {
            conn.release();
        }
    }

    // ===== RACE RESULTS FUNCTIONS =====

    static async enterRaceResult(roundId, driverId, position, points, fastestLap = false, dnf = false, lapTimeDelta = null) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `INSERT INTO race_results (round_id, driver_id, position, lap_time_delta, points, fastest_lap, dnf)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE position = ?, lap_time_delta = ?, points = ?, fastest_lap = ?, dnf = ?, updated_at = CURRENT_TIMESTAMP`,
                [roundId, driverId, position, lapTimeDelta, points, fastestLap, dnf, position, lapTimeDelta, points, fastestLap, dnf]
            );
        } finally {
            conn.release();
        }
    }

    static async getRaceResultsByRound(roundId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT r.*, d.name as driver_name, t.name as team_name FROM race_results r
                 JOIN drivers d ON r.driver_id = d.driver_id
                 LEFT JOIN team_drivers td ON r.round_id = (
                     SELECT round_id FROM rounds WHERE season_id = (
                         SELECT season_id FROM rounds WHERE round_id = r.round_id
                     ) AND round_id = r.round_id
                 ) AND td.driver_id = d.driver_id
                 LEFT JOIN teams t ON td.team_id = t.team_id
                 WHERE r.round_id = ? ORDER BY r.position`,
                [roundId]
            );
        } finally {
            conn.release();
        }
    }

    // ===== STANDINGS FUNCTIONS =====

    static async updateDriverStandings(seasonId, driverId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            // Get all results for this driver in this season
            const results = await conn.query(
                `SELECT r.* FROM race_results r
                 JOIN rounds rd ON r.round_id = rd.round_id
                 WHERE rd.season_id = ? AND r.driver_id = ?`,
                [seasonId, driverId]
            );

            let totalPoints = 0;
            let wins = 0;
            let podiums = 0;
            let dnfCount = 0;

            for (const result of results) {
                totalPoints += result.points || 0;
                if (result.position === 1) wins++;
                if (result.position <= 3) podiums++;
                if (result.dnf) dnfCount++;
            }

            // Apply penalties
            const penalties = await conn.query(
                `SELECT * FROM penalties WHERE driver_id = ? AND round_id IN (
                    SELECT round_id FROM rounds WHERE season_id = ?
                ) AND status = 'active'`,
                [driverId, seasonId]
            );

            for (const penalty of penalties) {
                totalPoints -= penalty.points_penalty || 0;
            }

            // Update or insert standing
            await conn.query(
                `INSERT INTO driver_standings (season_id, driver_id, points, wins, podiums, dnf_count)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE points = ?, wins = ?, podiums = ?, dnf_count = ?`,
                [seasonId, driverId, totalPoints, wins, podiums, dnfCount, totalPoints, wins, podiums, dnfCount]
            );
        } finally {
            conn.release();
        }
    }

    static async getDriverStandings(seasonId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT ds.*, d.name as driver_name FROM driver_standings ds
                 JOIN drivers d ON ds.driver_id = d.driver_id
                 WHERE ds.season_id = ?
                 ORDER BY ds.points DESC, ds.wins DESC, d.name`,
                [seasonId]
            );
        } finally {
            conn.release();
        }
    }

    static async updateConstructorStandings(seasonId, teamId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            // Get all drivers in this team for this season
            const drivers = await conn.query(
                `SELECT DISTINCT driver_id FROM team_drivers WHERE season_id = ? AND team_id = ?`,
                [seasonId, teamId]
            );

            let totalPoints = 0;
            let wins = 0;

            for (const driver of drivers) {
                const standing = await conn.query(
                    `SELECT points, wins FROM driver_standings WHERE season_id = ? AND driver_id = ?`,
                    [seasonId, driver.driver_id]
                );
                if (standing.length > 0) {
                    totalPoints += standing[0].points || 0;
                    wins += standing[0].wins || 0;
                }
            }

            // Update or insert standing
            await conn.query(
                `INSERT INTO constructor_standings (season_id, team_id, points, wins)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE points = ?, wins = ?`,
                [seasonId, teamId, totalPoints, wins, totalPoints, wins]
            );
        } finally {
            conn.release();
        }
    }

    static async getConstructorStandings(seasonId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT cs.*, t.name as team_name FROM constructor_standings cs
                 JOIN teams t ON cs.team_id = t.team_id
                 WHERE cs.season_id = ?
                 ORDER BY cs.points DESC, cs.wins DESC, t.name`,
                [seasonId]
            );
        } finally {
            conn.release();
        }
    }

    // ===== PENALTY FUNCTIONS =====

    static async assignPenalty(roundId, driverId, stewardId, timePenalty, pointsPenalty, reason) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Insert penalty
            await conn.query(
                `INSERT INTO penalties (round_id, driver_id, steward_id, time_penalty, points_penalty, reason)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [roundId, driverId, stewardId, timePenalty, pointsPenalty, reason]
            );

            // Update standings
            const roundData = await conn.query('SELECT season_id FROM rounds WHERE round_id = ?', [roundId]);
            if (roundData.length > 0) {
                await this.updateDriverStandings(roundData[0].season_id, driverId);
                
                // Get team for constructor update
                const teamDriver = await conn.query(
                    `SELECT team_id FROM team_drivers WHERE season_id = ? AND driver_id = ?`,
                    [roundData[0].season_id, driverId]
                );
                if (teamDriver.length > 0) {
                    await this.updateConstructorStandings(roundData[0].season_id, teamDriver[0].team_id);
                }
            }

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async getPenaltiesByRound(roundId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT p.*, d.name as driver_name FROM penalties p
                 JOIN drivers d ON p.driver_id = d.driver_id
                 WHERE p.round_id = ? AND p.status = 'active'
                 ORDER BY p.created_at DESC`,
                [roundId]
            );
        } finally {
            conn.release();
        }
    }

    // ===== INCIDENT FUNCTIONS =====

    static async reportIncident(seasonId, roundId, reporterId, driverId, involvedDriverId, description, context, evidence) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            const result = await conn.query(
                `INSERT INTO incident_reports (season_id, round_id, reporter_id, reporter_driver_id, involved_driver_id, description, context, evidence_links)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [seasonId, roundId, reporterId, driverId, involvedDriverId, description, context, evidence]
            );
            return result.insertId;
        } finally {
            conn.release();
        }
    }

    static async getIncidentsBySeason(seasonId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT i.*, d1.name as reporter_name, d2.name as involved_name FROM incident_reports i
                 LEFT JOIN drivers d1 ON i.reporter_driver_id = d1.driver_id
                 LEFT JOIN drivers d2 ON i.involved_driver_id = d2.driver_id
                 WHERE i.season_id = ? AND i.status = 'open'
                 ORDER BY i.created_at DESC`,
                [seasonId]
            );
        } finally {
            conn.release();
        }
    }

    static async closeIncident(incidentId, decision, decidedBy) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE incident_reports SET status = 'closed', decision = ?, decision_made_by = ? WHERE incident_id = ?`,
                [decision, decidedBy, incidentId]
            );
        } finally {
            conn.release();
        }
    }

    // ===== UTILITY FUNCTIONS =====

    static async getSeasonRounds(seasonId) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            return await conn.query(
                `SELECT r.*, c.name as circuit_name, c.country FROM rounds r
                 JOIN circuits c ON r.circuit_id = c.circuit_id
                 WHERE r.season_id = ?
                 ORDER BY r.round_number`,
                [seasonId]
            );
        } finally {
            conn.release();
        }
    }

    static async getRoundByNumber(seasonId, roundNumber) {
        const pool = await getPool();
        const conn = await pool.getConnection();
        try {
            const result = await conn.query(
                `SELECT * FROM rounds WHERE season_id = ? AND round_number = ?`,
                [seasonId, roundNumber]
            );
            return result.length > 0 ? result[0] : null;
        } finally {
            conn.release();
        }
    }
}

module.exports = F1Database;
