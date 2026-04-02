const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-incident')
        .setDescription('Report an incident or driving infraction')
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        ),

    async execute(interaction, client) {
        try {
            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.reply({
                    content: '❌ No active season found.',
                    ephemeral: true
                });
            }

            const roundNum = interaction.options.getInteger('round');
            const round = await F1Database.getRoundByNumber(season.season_id, roundNum);

            if (!round) {
                return interaction.reply({
                    content: `❌ Round ${roundNum} not found.`,
                    ephemeral: true
                });
            }

            // Store context
            interaction.client.incidentCache = interaction.client.incidentCache || {};
            interaction.client.incidentCache[interaction.user.id] = {
                seasonId: season.season_id,
                roundId: round.round_id,
                reporterId: interaction.user.id,
                guildId: interaction.guildId
            };

            const modal = new ModalBuilder()
                .setCustomId('report_incident_modal')
                .setTitle(`Report Incident - Round ${roundNum}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('incident_description')
                            .setLabel('Incident Description')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('Describe what happened...')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('incident_context')
                            .setLabel('Additional Context')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('Any additional details...')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('incident_evidence')
                            .setLabel('Evidence Links (URLs, timestamps)')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('e.g., YouTube timestamp, screenshot URL')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('involved_driver')
                            .setLabel('Involved Driver Name')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[report-incident] ${error.message}`);
            await interaction.reply({ content: '❌ Error creating incident report.', ephemeral: true }).catch(() => {});
        }
    }
};
