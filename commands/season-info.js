const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('season-info')
        .setDescription('View information about the current season'),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);

            if (!season) {
                return interaction.editReply({
                    content: '❌ No active season found. Use `/create-season` to create one.',
                    ephemeral: true
                });
            }

            const rounds = await F1Database.getSeasonRounds(season.season_id);
            const teams = await F1Database.getTeamsByGuild(interaction.guildId);
            const drivers = await F1Database.getDriversByGuild(interaction.guildId);

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Season ${season.season_number}`)
                .addFields(
                    { name: 'Status', value: season.is_active ? '🟢 Active' : '🔴 Inactive', inline: true },
                    { name: 'Rounds', value: `${rounds.length} / ${season.total_rounds}`, inline: true },
                    { name: 'Teams', value: `${teams.length}`, inline: true },
                    { name: 'Drivers', value: `${drivers.length}`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(new Date(season.created_at).getTime() / 1000)}:f>`, inline: false }
                );

            if (rounds.length > 0) {
                const roundsList = rounds.map(r => `**Round ${r.round_number}**: ${r.circuit_name} (${r.country})`).join('\n');
                embed.addFields({ name: 'Scheduled Rounds', value: roundsList || 'None' });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[season-info] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving season information.', ephemeral: true }).catch(() => {});
        }
    }
};
