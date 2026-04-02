const { getPool } = require('../../utils/DatabasePool');

module.exports = {
    customId: 'configure_channels_modal',

    async execute(interaction, client) {
        try {
            const resultsChannelId = interaction.fields.getTextInputValue('results_channel_id') || null;
            const incidentsChannelId = interaction.fields.getTextInputValue('incidents_channel_id') || null;
            const standingsChannelId = interaction.fields.getTextInputValue('standings_channel_id') || null;

            const pool = await getPool();
            const conn = await pool.getConnection();

            try {
                // Ensure settings record exists
                await conn.query(
                    `INSERT INTO settings (guild_id) VALUES (?) ON DUPLICATE KEY UPDATE guild_id = guild_id`,
                    [interaction.guildId]
                );

                // Update settings
                await conn.query(
                    `UPDATE settings SET 
                     results_channel_id = ?, incidents_channel_id = ?, standings_channel_id = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE guild_id = ?`,
                    [resultsChannelId, incidentsChannelId, standingsChannelId, interaction.guildId]
                );

                let response = '✅ Channels configured:\n';
                if (resultsChannelId) response += `📊 Results Channel: <#${resultsChannelId}>\n`;
                if (incidentsChannelId) response += `🚨 Incidents Channel: <#${incidentsChannelId}>\n`;
                if (standingsChannelId) response += `🏆 Standings Channel: <#${standingsChannelId}>\n`;

                await interaction.reply({
                    content: response || '⚠️ No channels configured.',
                    ephemeral: true
                });

            } finally {
                conn.release();
            }

        } catch (error) {
            client.logs.error(`[configure_channels_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error updating channels.', ephemeral: true }).catch(() => {});
        }
    }
};
