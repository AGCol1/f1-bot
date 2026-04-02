const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: 'assign_driver_team_select',

    async execute(interaction, client) {
        try {
            const teamId = parseInt(interaction.values[0]);
            const cache = interaction.client.driverAssignCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired. Try /assign-drivers again.',
                    ephemeral: true
                });
            }

            // Get drivers
            const drivers = await F1Database.getDriversByGuild(cache.guildId);

            if (drivers.length === 0) {
                return interaction.reply({
                    content: '❌ No drivers available.',
                    ephemeral: true
                });
            }

            // Create driver selector (multi-select)
            const driverMenu = new StringSelectMenuBuilder()
                .setCustomId(`assign_driver_confirm_${teamId}`)
                .setPlaceholder('Select drivers to assign (can select multiple)')
                .setMaxValues(Math.min(drivers.length, 25));

            drivers.forEach(driver => {
                driverMenu.addOptions({
                    label: driver.name,
                    value: driver.driver_id.toString()
                });
            });

            const actionRow = new ActionRowBuilder().addComponents(driverMenu);

            await interaction.reply({
                content: 'Select drivers to assign to this team:',
                components: [actionRow],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[assign_driver_team_select] ${error.message}`);
            await interaction.reply({ content: '❌ Error selecting team.', ephemeral: true }).catch(() => {});
        }
    }
};
