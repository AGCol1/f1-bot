const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configure-channels')
        .setDescription('Configure bot announcement channels (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('configure_channels_modal')
                .setTitle('Configure Channels')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('results_channel_id')
                            .setLabel('Results Channel ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord channel ID')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('incidents_channel_id')
                            .setLabel('Incidents Channel ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord channel ID')
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('standings_channel_id')
                            .setLabel('Standings Channel ID')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Discord channel ID')
                            .setRequired(false)
                    )
                );

            await interaction.showModal(modal);

        } catch (error) {
            client.logs.error(`[configure-channels] ${error.message}`);
            await interaction.reply({ content: '❌ Error configuring channels.', ephemeral: true }).catch(() => {});
        }
    }
};
