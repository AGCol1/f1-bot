const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('f1help')
        .setDescription('Show F1 Bot commands and help'),

    async execute(interaction, client) {
        try {
            const embeds = [
                new EmbedBuilder()
                    .setColor('#FF1801')
                    .setTitle('🏎️ F1 Bot - Command Guide')
                    .setDescription('Complete guide to all available commands')
                    .addFields(
                        { name: '📋 **Season Setup**', value: '`/create-season` - Create new season\n`/season-info` - View season details', inline: false },
                        { name: '👥 **Team & Driver Management**', value: '`/assign-drivers` - Assign drivers to teams\n`/driver-list` - View all drivers', inline: false },
                        { name: '📍 **Race Operations**', value: '`/attendance` - Set driver attendance\n`/attendance-sheet` - View attendance\n`/enter-results` - Enter race results\n`/view-results` - View race results', inline: false }
                    ),

                new EmbedBuilder()
                    .setColor('#FF1801')
                    .setTitle('🏆 **Standings & Penalties**')
                    .addFields(
                        { name: '📊 Standings', value: '`/driver-standings` - Driver championship\n`/constructor-standings` - Team championship', inline: false },
                        { name: '⚖️ Penalties', value: '`/assign-penalty` - Assign penalty (Steward)\n`/view-penalties` - View penalties', inline: false },
                        { name: '🚨 Incidents', value: '`/report-incident` - Report incident\n`/view-incidents` - View incidents (Steward)', inline: false }
                    ),

                new EmbedBuilder()
                    .setColor('#FF1801')
                    .setTitle('⚙️ **Configuration**')
                    .addFields(
                        { name: 'Admin Commands', value: '`/manage-roles` - Setup steward/manager roles\n`/configure-channels` - Setup announcement channels\n`/setup-points` - Configure points system', inline: false },
                        { name: '💡 Tips', value: '• Use `/create-season` first before any other commands\n• Stewards can assign penalties\n• Managers can enter results\n• Drivers can report incidents', inline: false }
                    )
            ];

            await interaction.reply({ embeds, ephemeral: true });

        } catch (error) {
            client.logs.error(`[f1help] ${error.message}`);
            await interaction.reply({ content: '❌ Error displaying help.', ephemeral: true }).catch(() => {});
        }
    }
};
