const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('driver-standings')
        .setDescription('View current driver championship standings'),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);

            if (!season) {
                return interaction.editReply({
                    content: '❌ No active season found.',
                    ephemeral: true
                });
            }

            const standings = await F1Database.getDriverStandings(season.season_id);

            if (standings.length === 0) {
                return interaction.editReply({
                    content: '📊 No driver standings yet. Races need to be completed first.',
                    ephemeral: true
                });
            }

            const medals = ['🥇', '🥈', '🥉'];
            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`🏎️ Driver Championship - Season ${season.season_number}`)
                .setDescription(standings.map((s, idx) => {
                    const medal = medals[idx] || `#${idx + 1}`;
                    return `${medal} **${s.driver_name}**\n└─ ${s.points} pts • ${s.wins}W • ${s.podiums}P`;
                }).join('\n\n'));

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[driver-standings] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving standings.', ephemeral: true }).catch(() => {});
        }
    }
};
