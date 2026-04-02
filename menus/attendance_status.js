const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: /^attendance_status_\d+_\d+$/,

    async execute(interaction, client) {
        try {
            const parts = interaction.customId.split('_');
            const roundId = parseInt(parts[2]);
            const driverId = parseInt(parts[3]);
            const status = interaction.values[0];

            // Set attendance
            await F1Database.setAttendance(roundId, driverId, status);

            // Get driver name
            const attendance = await F1Database.getAttendanceByRound(roundId);
            const record = attendance.find(a => a.driver_id === driverId);

            await interaction.reply({
                content: `✅ Set ${record.driver_name} as **${status}** for this round.`,
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[attendance_status] ${error.message}`);
            await interaction.reply({ content: '❌ Error updating attendance.', ephemeral: true }).catch(() => {});
        }
    }
};
