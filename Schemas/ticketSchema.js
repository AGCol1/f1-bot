let pool;

async function getPool() {
    if (!pool) {
        const mariadb = await import("mariadb");
        const config = require("../config.json");

        pool = mariadb.createPool({
            host: config.MySQL.host,
            user: config.MySQL.user,
            password: config.MySQL.password,
            database: config.MySQL.database,
            connectionLimit: 10
        });
    }
    return pool;
}

module.exports = {

    // Create ticket with channelId and ticketType
    async createTicket(userId, channelId, ticketType) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            const res = await conn.query(
                "INSERT INTO tickets (user_id, channel_id, ticket_type) VALUES (?, ?, ?)",
                [userId, channelId, ticketType]
            );
            return res.insertId;
        } finally {
            conn.release();
        }
    },

    // Get a single ticket
    async getTicket(ticketId) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            const rows = await conn.query(
                "SELECT * FROM tickets WHERE ticket_id = ?",
                [ticketId]
            );
            return rows[0] || null;
        } finally {
            conn.release();
        }
    },

    // Get all tickets for a user
    async getUserTickets(userId) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            const rows = await conn.query(
                "SELECT * FROM tickets WHERE user_id = ?",
                [userId]
            );
            return rows;
        } finally {
            conn.release();
        }
    },

    // Close a ticket
    async closeTicket(ticketId) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            await conn.query(
                "UPDATE tickets SET closed_at = NOW() WHERE ticket_id = ?",
                [ticketId]
            );
        } finally {
            conn.release();
        }
    },

    // Claim a ticket
    async claimTicket(ticketId, staffId) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            await conn.query(
                "UPDATE tickets SET claimed_by = ? WHERE ticket_id = ?",
                [staffId, ticketId]
            );
        } finally {
            conn.release();
        }
    },

    // Update the channel ID of a ticket
    async updateChannelId(ticketId, channelId) {
        const db = await getPool();
        const conn = await db.getConnection();
        try {
            await conn.query(
                "UPDATE tickets SET channel_id = ? WHERE ticket_id = ?",
                [channelId, ticketId]
            );
        } finally {
            conn.release();
        }
    }

};