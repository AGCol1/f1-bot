const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: /^delete_season_confirm_.+$/,

    async execute(interaction, client) {
        try {
            const userId = interaction.customId.split('_')[3];
            const cache = interaction.client.deleteSeasonCache?.[userId];

            if (!cache || Date.now() - cache.timestamp > 300000) {
                return interaction.reply({
                    content: '❌ Session expired. Please run `/delete-season` again.',
                    ephemeral: true
                });
            }

            // Show modal for entering the answer
            const modal = new ModalBuilder()
                .setCustomId('delete_season_answer_modal')
                .setTitle('Delete Season - Math Verification')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('math_answer')
                            .setLabel('Enter the sum of the two numbers')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('e.g., 42')
                            .setRequired(true)
                            .setMinLength(1)
                            .setMaxLength(3)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[delete_season_confirm_button] ${error.message}`);
            await interaction.reply({ content: '❌ Error processing deletion.', ephemeral: true }).catch(() => {});
        }
    }
};
