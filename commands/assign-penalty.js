const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign-penalty')
        .setDescription('Assign penalty to a driver (Steward only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            const { hasStewardRole, areRolesConfigured } = require('../utils/PermissionHelper');
            
            await interaction.deferReply({ ephemeral: true });

            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.editReply({ content: roleError });
            }

            if (!await hasStewardRole(interaction)) {
                return interaction.editReply({
                    content: '❌ You need Steward role to use this command.'
                });
            }

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({ content: '❌ No active season found.' });
            }

            // Show modal for penalty details
            const modal = new ModalBuilder()
                .setCustomId('assign_penalty_modal')
                .setTitle('Assign Penalty')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('penalty_driver')
                            .setLabel('Driver Name')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('penalty_round')
                            .setLabel('Round Number')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('penalty_reason')
                            .setLabel('Reason for Penalty')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('penalty_points')
                            .setLabel('Points Penalty (e.g., 0)')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('penalty_time')
                            .setLabel('Time Penalty in Seconds (e.g., 0)')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                    )
                );

            // Store season context
            interaction.client.penaltyCache = interaction.client.penaltyCache || {};
            interaction.client.penaltyCache[interaction.user.id] = {
                seasonId: season.season_id,
                guildId: interaction.guildId,
                stewardId: interaction.user.id
            };

            await interaction.editReply({ content: 'Opening penalty assignment form...' });
            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[assign-penalty] ${error.message}`);
            await interaction.editReply({ content: '❌ Error assigning penalty.' }).catch(() => {});
        }
    }
};
