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
    customID: 'acceptApplication',
    async execute(interaction, client) {
        const db = await getPool();
        const conn = await db.getConnection();

        try {
            // Extract application_id from the embed title
            const embed = interaction.message.embeds[0];
            if (!embed) return interaction.reply({ content: "No embed found.", ephemeral: true });

            const title = embed.title; // "Application #1"
            const appId = title.split('#')[1].trim(); // gets "1"

            // Update status in the database
            await conn.query(
                "UPDATE staff_applications SET status = 'accepted' WHERE application_id = ?",
                [appId]
            );

            // Get the discord_id to message the user
            const rows = await conn.query(
                "SELECT discord_id FROM staff_applications WHERE application_id = ?",
                [appId]
            );

            if (rows.length) {
                const userId = rows[0].discord_id;
                const user = await client.users.fetch(userId).catch(() => null);
                if (user) {
                    user.send(`Congratulations! Your staff application (#${appId}) has been accepted.`)
                        .catch(() => console.log(`Could not DM user ${userId}`));
                }
            }

            // Update the message to show it’s been accepted
            await interaction.update({ content: `Application #${appId} accepted.`, components: [], embeds: [] });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "Failed to update application.", ephemeral: true });
        } finally {
            conn.release();
        }
    }
};