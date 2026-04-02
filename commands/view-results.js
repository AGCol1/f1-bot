const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-results')
        .setDescription('View race results for a specific round')
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        ),

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

            const roundNum = interaction.options.getInteger('round');
            const round = await F1Database.getRoundByNumber(season.season_id, roundNum);

            if (!round) {
                return interaction.editReply({
                    content: `❌ Round ${roundNum} not found.`,
                    ephemeral: true
                });
            }

            const results = await F1Database.getRaceResultsByRound(round.round_id);

            if (results.length === 0) {
                return interaction.editReply({
                    content: `📊 No results entered for Round ${roundNum} yet.`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Round ${roundNum} Results`)
                .setDescription(results.map((r, idx) => {
                    let icon = '';
                    if (r.fastest_lap) icon += '⚡ ';
                    if (r.dnf) icon += '🏁 ';
                    return `**${r.position}. ${r.driver_name}** - ${r.points} pts ${icon}`;
                }).join('\n'));

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[view-results] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving results.', ephemeral: true }).catch(() => {});
        }
    }
};
