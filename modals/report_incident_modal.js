const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'report_incident_modal',

    async execute(interaction, client) {
        try {
            const description = interaction.fields.getTextInputValue('incident_description');
            const context = interaction.fields.getTextInputValue('incident_context') || null;
            const evidence = interaction.fields.getTextInputValue('incident_evidence') || null;
            const involvedDriverName = interaction.fields.getTextInputValue('involved_driver') || null;

            const cache = interaction.client.incidentCache?.[interaction.user.id];
            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired. Try again.',
                    ephemeral: true
                });
            }

            // Find involved driver if provided
            let involvedDriverId = null;
            if (involvedDriverName) {
                const drivers = await F1Database.getDriversByGuild(cache.guildId);
                const driver = drivers.find(d => d.name.toLowerCase() === involvedDriverName.toLowerCase());
                if (driver) {
                    involvedDriverId = driver.driver_id;
                }
            }

            // Find reporter driver (if they are a driver in the guild)
            const drivers = await F1Database.getDriversByGuild(cache.guildId);
            const reporterDriver = drivers.find(d => d.user_id === cache.reporterId);

            // Create incident report
            const incidentId = await F1Database.reportIncident(
                cache.seasonId,
                cache.roundId,
                cache.reporterId,
                reporterDriver?.driver_id || null,
                involvedDriverId,
                description,
                context,
                evidence
            );

            await interaction.reply({
                content: `✅ Incident report #${incidentId} submitted. Stewards will review it.`,
                ephemeral: true
            });

            // Clean up cache
            delete interaction.client.incidentCache[interaction.user.id];

        } catch (error) {
            client.logs.error(`[report_incident_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error submitting incident report.', ephemeral: true }).catch(() => {});
        }
    }
};
