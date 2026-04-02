const { getPool } = require('../../utils/DatabasePool');

module.exports = {
    customId: 'select_points_system',

    async execute(interaction, client) {
        try {
            const pointsSystem = interaction.values[0];
            const cache = interaction.client.pointsSetupCache?.[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired.',
                    ephemeral: true
                });
            }

            const pool = await getPool();
            const conn = await pool.getConnection();

            try {
                if (pointsSystem === 'standard_f1') {
                    // Standard F1 points: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
                    await conn.query(
                        `UPDATE season_settings SET points_system = ?, custom_points_json = NULL, fastest_lap_points = 1
                         WHERE season_id = ?`,
                        ['standard_f1', cache.seasonId]
                    );

                    await interaction.reply({
                        content: `✅ **Standard F1 Points System** configured:\n\n` +
                                `1st: 25pts\n2nd: 18pts\n3rd: 15pts\n4th: 12pts\n5th: 10pts\n` +
                                `6th: 8pts\n7th: 6pts\n8th: 4pts\n9th: 2pts\n10th: 1pt\n\n` +
                                `⚡ Fastest Lap: 1pt`,
                        ephemeral: true
                    });
                } else if (pointsSystem === 'custom') {
                    await interaction.reply({
                        content: `📝 Custom points configuration coming soon!`,
                        ephemeral: true
                    });
                }

            } finally {
                conn.release();
            }

            // Clean up cache
            delete interaction.client.pointsSetupCache[interaction.user.id];

        } catch (error) {
            client.logs.error(`[select_points_system] ${error.message}`);
            await interaction.reply({ content: '❌ Error setting points system.', ephemeral: true }).catch(() => {});
        }
    }
};
