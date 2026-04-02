const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('attendance-sheet')
        .setDescription('View attendance for a specific round')
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        ),

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({
                    content: '❌ No active season found.',
                    ephemeral: true
                });
            }

            const roundNum = interaction.options.getInteger('round');
            const round = await F1Database.getRoundByNumber(season.season_id, roundNum);

            if (!round) {
                return interaction.editReply({
                    content: `❌ Round ${roundNum} not found.`,
                    ephemeral: true
                });
            }

            const attendance = await F1Database.getAttendanceByRound(round.round_id);

            if (attendance.length === 0) {
                return interaction.editReply({
                    content: `📋 No attendance data for Round ${roundNum} yet.`,
                    ephemeral: true
                });
            }

            const attending = attendance.filter(a => a.status === 'attending').map(a => a.driver_name).join('\n') || 'None';
            const tentative = attendance.filter(a => a.status === 'tentative').map(a => a.driver_name).join('\n') || 'None';
            const reserves = attendance.filter(a => a.status === 'reserve').map(a => a.driver_name).join('\n') || 'None';
            const absent = attendance.filter(a => a.status === 'absent').map(a => a.driver_name).join('\n') || 'None';
            const retired = attendance.filter(a => a.status === 'retired').map(a => a.driver_name).join('\n') || 'None';

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Attendance - Round ${roundNum}`)
                .addFields(
                    { name: '✅ Attending', value: attending, inline: false },
                    { name: '❓ Tentative', value: tentative, inline: false },
                    { name: '⚠️ Reserve', value: reserves, inline: false },
                    { name: '❌ Absent', value: absent, inline: false },
                    { name: '🏁 Retired', value: retired, inline: false }
                );

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[attendance-sheet] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving attendance.', ephemeral: true }).catch(() => {});
        }
    }
};
