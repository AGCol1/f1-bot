const { ButtonBuilder, ActionRowBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: /^assign_driver_confirm_\d+$/,

    async execute(interaction, client) {
        try {
            const teamId = parseInt(interaction.customId.split('_')[3]);
            const driverIds = interaction.values.map(v => parseInt(v));
            const cache = interaction.client.driverAssignCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired.',
                    ephemeral: true
                });
            }

            // Store driver selection in cache for next step
            cache.selectedDriverIds = driverIds;
            cache.selectedTeamId = teamId;

            // Get driver names
            const drivers = await F1Database.getDriversByGuild(cache.guildId);
            const selectedDrivers = drivers.filter(d => driverIds.includes(d.driver_id));
            const driverList = selectedDrivers.map(d => d.name).join(', ');

            // Create Primary/Reserve buttons
            const primaryBtn = new ButtonBuilder()
                .setCustomId('assign_drivers_as_primary')
                .setLabel('🏁 Assign as Primary')
                .setStyle(1);

            const reserveBtn = new ButtonBuilder()
                .setCustomId('assign_drivers_as_reserve')
                .setLabel('🔄 Assign as Reserve')
                .setStyle(2);

            const actionRow = new ActionRowBuilder().addComponents(primaryBtn, reserveBtn);

            await interaction.reply({
                content: `📋 **Selected Drivers:** ${driverList}\n\nAssign them as **Primary** drivers or **Reserve** drivers?`,
                components: [actionRow],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[assign_driver_confirm] ${error.message}`);
            await interaction.reply({ content: '❌ Error assigning drivers.', ephemeral: true }).catch(() => {});
        }
    }
};
