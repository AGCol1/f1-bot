const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: 'create_season_modal',

    async execute(interaction, client) {
        try {
            const seasonNumber = interaction.fields.getTextInputValue('season_number');
            const totalRounds = parseInt(interaction.fields.getTextInputValue('total_rounds'));

            // Validate inputs
            if (isNaN(totalRounds) || totalRounds < 1 || totalRounds > 30) {
                return interaction.reply({
                    content: '❌ Total rounds must be between 1 and 30.',
                    ephemeral: true
                });
            }

            // Store in interaction data for next step
            interaction.client.seasonCreationCache = interaction.client.seasonCreationCache || {};
            interaction.client.seasonCreationCache[interaction.user.id] = {
                guildId: interaction.guildId,
                seasonNumber: parseInt(seasonNumber),
                totalRounds: totalRounds,
                currentRound: 1,
                roundsData: []
            };

            // Show modal to select steward roles
            const modal = new ModalBuilder()
                .setCustomId('season_steward_roles_modal')
                .setTitle('Select Steward Roles (Optional)')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('steward_role_ids')
                            .setLabel('Steward Role IDs (comma-separated)')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('e.g., 123456789, 987654321')
                            .setRequired(false)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[create_season_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error processing season creation.', ephemeral: true }).catch(() => {});
        }
    }
};
