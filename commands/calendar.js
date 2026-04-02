const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calendar')
        .setDescription('View the F1 season race calendar'),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({
                    content: '❌ No active season found. Create one with `/create-season`.',
                    ephemeral: true
                });
            }

            // Get all rounds for this season
            const pool = await require('../utils/DatabasePool').getPool();
            const conn = await pool.getConnection();
            try {
                const rounds = await conn.query(
                    `SELECT r.*, c.name as circuit_name, c.country 
                     FROM rounds r
                     JOIN circuits c ON r.circuit_id = c.circuit_id
                     WHERE r.season_id = ?
                     ORDER BY r.round_number ASC`,
                    [season.season_id]
                );

                if (rounds.length === 0) {
                    return interaction.editReply({
                        content: '❌ No rounds scheduled for this season.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('#FF1801')
                    .setTitle(`🏁 F1 Season ${season.season_number} - Race Calendar`)
                    .setDescription(`${rounds.length} rounds scheduled\n`)
                    .setFooter({ text: `Use /attendance <round> to mark drivers for each race` });

                for (const round of rounds) {
                    let raceInfo = `**${round.circuit_name}** (${round.country})`;
                    
                    if (round.race_date) {
                        const raceDate = new Date(round.race_date);
                        raceInfo += `\n📅 <t:${Math.floor(raceDate.getTime() / 1000)}:F>`;
                    } else {
                        raceInfo += '\n📅 Date TBA';
                    }

                    embed.addFields({
                        name: `Round ${round.round_number}`,
                        value: raceInfo,
                        inline: false
                    });
                }

                return interaction.editReply({ embeds: [embed] });

            } finally {
                conn.release();
            }

        } catch (error) {
            client.logs.error(`[calendar] ${error.message}`);
            await interaction.editReply({ 
                content: '❌ Error retrieving calendar.', 
                ephemeral: true 
            }).catch(() => {});
        }
    }
};
