const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resolve-incident')
        .setDescription('Resolve incident by assigning a penalty (Stewards only)')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option.setName('incident')
                .setDescription('Incident ID')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            const { hasStewardRole, areRolesConfigured } = require('../utils/PermissionHelper');
            
            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.reply({
                    content: roleError,
                    flags: 64
                });
            }
            
            if (!await hasStewardRole(interaction)) {
                return interaction.reply({
                    content: '❌ You need Steward role to use this command.',
                    flags: 64
                });
            }

            // Get incident
            const incident = await F1Database.getIncidentById(incidentId);
            if (!incident) {
                return interaction.reply({
                    content: `❌ Incident #${incidentId} not found.`,
                    flags: 64
                });
            }

            if (incident.status === 'closed') {
                return interaction.reply({
                    content: `❌ Incident #${incidentId} is already closed.`,
                    flags: 64
                });
            }

            // Store context
            interaction.client.resolveIncidentCache = interaction.client.resolveIncidentCache || {};
            interaction.client.resolveIncidentCache[interaction.user.id] = {
                incidentId: incidentId,
                guildId: interaction.guildId
            };

            // Show penalty modal
            const modal = new ModalBuilder()
                .setCustomId('resolve_incident_modal')
                .setTitle(`Resolve Incident #${incidentId}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('time_penalty')
                            .setLabel('Time Penalty (seconds, or 0 for none)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('e.g., 10')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('points_penalty')
                            .setLabel('Points Penalty (or 0 for none)')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('e.g., 3')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('reason')
                            .setLabel('Reason for Penalty')
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder('e.g., Unsafe driving, cutting track limits')
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[resolve-incident] ${error.message}`);
            await interaction.reply({
                content: '❌ Error resolving incident.',
                flags: 64
            }).catch(() => {});
        }
    }
};
