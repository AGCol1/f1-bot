const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'assign_penalty_modal',

    async execute(interaction, client) {
        try {
            const driverName = interaction.fields.getTextInputValue('penalty_driver');
            const roundNum = parseInt(interaction.fields.getTextInputValue('penalty_round'));
            const reason = interaction.fields.getTextInputValue('penalty_reason');
            const pointsPenalty = parseInt(interaction.fields.getTextInputValue('penalty_points')) || 0;
            const timePenalty = parseInt(interaction.fields.getTextInputValue('penalty_time')) || 0;

            const cache = interaction.client.penaltyCache?.[interaction.user.id];
            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired. Try again.',
                    ephemeral: true
                });
            }

            // Find driver
            const drivers = await F1Database.getDriversByGuild(cache.guildId);
            const driver = drivers.find(d => d.name.toLowerCase() === driverName.toLowerCase());

            if (!driver) {
                return interaction.reply({
                    content: `❌ Driver "${driverName}" not found.`,
                    ephemeral: true
                });
            }

            // Find round
            const round = await F1Database.getRoundByNumber(cache.seasonId, roundNum);
            if (!round) {
                return interaction.reply({
                    content: `❌ Round ${roundNum} not found.`,
                    ephemeral: true
                });
            }

            // Assign penalty
            await F1Database.assignPenalty(
                round.round_id,
                driver.driver_id,
                interaction.user.id,
                timePenalty || null,
                pointsPenalty || null,
                reason
            );

            await interaction.reply({
                content: `✅ Penalty assigned to **${driver.name}** for **${reason}** (${pointsPenalty} pts penalty).`,
                ephemeral: true
            });

            // Clean up cache
            delete interaction.client.penaltyCache[interaction.user.id];

        } catch (error) {
            client.logs.error(`[assign_penalty_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error assigning penalty.', ephemeral: true }).catch(() => {});
        }
    }
};
