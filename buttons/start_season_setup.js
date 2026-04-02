const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'start_season_setup',

    async execute(interaction, client) {
        try {
            // Show modal
            const modal = new ModalBuilder()
                .setCustomId('create_season_modal')
                .setTitle('Step 1️⃣/3️⃣ - Season Basics')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('season_number')
                            .setLabel('Season Number')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('e.g., 1')
                            .setRequired(true)
                            .setMinLength(1)
                            .setMaxLength(4)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('total_rounds')
                            .setLabel('Total Rounds')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('e.g., 24 (max 30)')
                            .setRequired(true)
                            .setMinLength(1)
                            .setMaxLength(2)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[start_season_setup_button] ${error.message}`);
            await interaction.reply({
                content: '❌ Error starting season setup.',
                flags: 64
            }).catch(() => {});
        }
    }
};
