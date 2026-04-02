const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: /^attendance_select_\d+$/,

    async execute(interaction, client) {
        try {
            const roundId = parseInt(interaction.customId.split('_')[2]);
            const driverId = parseInt(interaction.values[0]);

            // Create status selector
            const statusMenu = new StringSelectMenuBuilder()
                .setCustomId(`attendance_status_${roundId}_${driverId}`)
                .setPlaceholder('Select attendance status')
                .setMaxValues(1)
                .addOptions([
                    { label: '✅ Attending', value: 'attending' },
                    { label: '❌ Absent', value: 'absent' },
                    { label: '⚠️ Reserve', value: 'reserve' },
                    { label: '🏁 Retired', value: 'retired' }
                ]);

            const actionRow = new ActionRowBuilder().addComponents(statusMenu);

            await interaction.reply({
                content: 'Select the attendance status:',
                components: [actionRow],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[attendance_select] ${error.message}`);
            await interaction.reply({ content: '❌ Error selecting driver.', ephemeral: true }).catch(() => {});
        }
    }
};
