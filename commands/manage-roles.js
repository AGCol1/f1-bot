const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manage-roles')
        .setDescription('Setup steward and manager roles (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            // Show modal for role setup
            const modal = new ModalBuilder()
                .setCustomId('manage_roles_modal')
                .setTitle('Manage Roles')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('steward_role_id')
                            .setLabel('Steward Role ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord role ID')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('manager_role_id')
                            .setLabel('Manager Role ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord role ID')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('admin_role_id')
                            .setLabel('Admin Role ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord role ID')
                            .setRequired(false)
                    )
                );

            // Store guild context
            interaction.client.roleSetupCache = interaction.client.roleSetupCache || {};
            interaction.client.roleSetupCache[interaction.guildId] = {
                userId: interaction.user.id
            };

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[manage-roles] ${error.message}`);
            await interaction.reply({ content: '❌ Error managing roles.', ephemeral: true }).catch(() => {});
        }
    }
};
