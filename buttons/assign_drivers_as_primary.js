const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'assign_drivers_as_primary',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.driverAssignCache[interaction.user.id];

            if (!cache || !cache.selectedDriverIds || !cache.selectedTeamId) {
                return interaction.reply({
                    content: '❌ Session expired.',
                    ephemeral: true
                });
            }

            // Assign drivers as PRIMARY (is_reserve = false)
            for (const driverId of cache.selectedDriverIds) {
                await F1Database.assignDriverToTeam(cache.seasonId, driverId, cache.selectedTeamId, false);
            }

            // Get driver names for confirmation
            const drivers = await F1Database.getDriversByGuild(cache.guildId);
            const assignedNames = drivers
                .filter(d => cache.selectedDriverIds.includes(d.driver_id))
                .map(d => d.name)
                .join(', ');

            await interaction.reply({
                content: `✅ Assigned **${assignedNames}** as **Primary** drivers.\n\n📋 **Continue Setup:** Keep assigning all drivers to their teams, then use \`/attendance\` to mark attendance for Round 1!`,
                ephemeral: true
            });

            // Clear cache
            delete cache.selectedDriverIds;
            delete cache.selectedTeamId;

        } catch (error) {
            client.logs.error(`[assign_drivers_as_primary] ${error.message}`);
            await interaction.reply({ content: '❌ Error assigning drivers.', ephemeral: true }).catch(() => {});
        }
    }
};
