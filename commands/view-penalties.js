const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-penalties')
        .setDescription('View all penalties for a round or season')
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number (optional)')
                .setRequired(false)
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
            
            let penalties = [];
            let title = `Penalties - Season ${season.season_number}`;

            if (roundNum) {
                const round = await F1Database.getRoundByNumber(season.season_id, roundNum);
                if (!round) {
                    return interaction.editReply({
                        content: `❌ Round ${roundNum} not found.`,
                        ephemeral: true
                    });
                }
                penalties = await F1Database.getPenaltiesByRound(round.round_id);
                title = `Penalties - Round ${roundNum}`;
            } else {
                // Get all rounds and collect penalties
                const rounds = await F1Database.getSeasonRounds(season.season_id);
                for (const round of rounds) {
                    const roundPenalties = await F1Database.getPenaltiesByRound(round.round_id);
                    penalties = penalties.concat(roundPenalties);
                }
            }

            if (penalties.length === 0) {
                return interaction.editReply({
                    content: '✅ No penalties recorded.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(title)
                .setDescription(penalties.map(p => {
                    let penalty = `**${p.driver_name}** - ${p.reason}`;
                    const details = [];
                    if (p.points_penalty) details.push(`📍 -${p.points_penalty} pts`);
                    if (p.time_penalty) details.push(`⏱️ +${p.time_penalty}s`);
                    if (details.length > 0) penalty += `\n└─ ${details.join(' • ')}`;
                    return penalty;
                }).join('\n\n'));

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[view-penalties] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving penalties.', ephemeral: true }).catch(() => {});
        }
    }
};
