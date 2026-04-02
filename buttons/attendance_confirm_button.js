const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'attendance_confirm_button',

    async execute(interaction, client) {
        try {
            console.log(`[DEBUG] Attendance button clicked: ${interaction.customId}`);
            
            // This button shouldn't be used with this customID
            // The actual buttons are created dynamically with pattern-based IDs
            return interaction.reply({
                content: '❌ This button is outdated. Please use /attendance to get the latest attendance sheet.',
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[attendance_confirm] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error updating attendance.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
