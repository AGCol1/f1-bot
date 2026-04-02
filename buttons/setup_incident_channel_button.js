const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'setup_incident_channel_button',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            console.log(`[setup_incident_channel_button] Cache exists, roundsData: ${JSON.stringify(cache.roundsData)}`);

            const incidentsChannelInput = new TextInputBuilder()
                .setCustomId('incidents_channel_id_setup')
                .setLabel('Incidents Channel ID (or leave blank)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g., 1234567890123456789 or leave blank')
                .setRequired(false);

            const incidentModal = new ModalBuilder()
                .setCustomId('setup_incidents_channel_modal')
                .setTitle('Step 4️⃣/4️⃣ - Incident Channel')
                .addComponents(
                    new ActionRowBuilder().addComponents(incidentsChannelInput)
                );

            await interaction.showModal(incidentModal);

        } catch (error) {
            client.logs.error(`[setup_incident_channel_button] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error setting up incident channel.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
