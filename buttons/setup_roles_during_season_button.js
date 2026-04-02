const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'setup_roles_modal_button',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            const stewardInput = new TextInputBuilder()
                .setCustomId('steward_role_id')
                .setLabel('Steward Role ID (or leave blank)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 1234567890123456789 or leave blank')
                .setRequired(false);

            const managerInput = new TextInputBuilder()
                .setCustomId('manager_role_id')
                .setLabel('Manager Role ID (or leave blank)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 1234567890123456789 or leave blank')
                .setRequired(false);

            const modal = new ModalBuilder()
                .setCustomId('setup_roles_modal_season')
                .setTitle('Step 3️⃣/4️⃣ - Setup Roles')
                .addComponents(
                    new ActionRowBuilder().addComponents(stewardInput),
                    new ActionRowBuilder().addComponents(managerInput)
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[setup_roles_modal_button] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error setting up roles.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
