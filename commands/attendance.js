const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('attendance')
        .setDescription('Post attendance sheet for a round - drivers respond with buttons (Manager/Steward only)')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
        )
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Race date (e.g., 2026-04-19)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Race time in UTC (e.g., 15:00)')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const { hasManagerRole, areRolesConfigured } = require('../utils/PermissionHelper');
            
            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.reply({
                    content: roleError,
                    flags: 64
                });
            }
            
            if (!await hasManagerRole(interaction)) {
                return interaction.reply({
                    content: '❌ You need Manager role to use this command.',
                    flags: 64
                });
            }

            const roundNum = interaction.options.getInteger('round');
            const raceDate = interaction.options.getString('date');
            const raceTime = interaction.options.getString('time');

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.reply({ 
                    content: '❌ No active season found.', 
                    flags: 64 
                });
            }

            const round = await F1Database.getRoundByNumber(season.season_id, roundNum);
            if (!round) {
                return interaction.reply({ 
                    content: `❌ Round ${roundNum} not found.`, 
                    flags: 64 
                });
            }

            // Format race datetime if provided
            let raceDateTime = null;
            let dateTimeDisplay = '';
            if (raceDate && raceTime) {
                try {
                    raceDateTime = new Date(`${raceDate}T${raceTime}:00Z`);
                    dateTimeDisplay = `\n🕐 **Race Time:** <t:${Math.floor(raceDateTime.getTime() / 1000)}:F>`;
                    
                    // Update database with race date
                    await F1Database.updateRaceDate(round.round_id, raceDateTime);
                } catch (e) {
                    dateTimeDisplay = '\n⚠️ Invalid date/time format. Use YYYY-MM-DD and HH:MM';
                }
            } else if (raceDate || raceTime) {
                dateTimeDisplay = '\n⚠️ Both date and time required (use format: date: 2026-04-19, time: 15:00)';
            }

            // Get all drivers assigned to teams this season
            const drivers = await F1Database.getDriversByGuild(interaction.guildId, true);
            if (drivers.length === 0) {
                return interaction.reply({ 
                    content: '❌ No drivers registered for this guild.', 
                    flags: 64 
                });
            }

            // Create initial attendance embed
            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`🏎️ Round ${roundNum} - Driver Attendance${raceDateTime ? ` - ${new Date(raceDateTime).toLocaleDateString()}` : ''}`)
                .setDescription('Drivers: Click a button below to confirm your attendance status' + dateTimeDisplay)
                .addFields(
                    { name: '✅ Attending', value: 'None yet', inline: true },
                    { name: '❌ Not Attending', value: 'None yet', inline: true },
                    { name: '❓ Tentative', value: 'None yet', inline: true }
                )
                .setFooter({ text: `${drivers.length} drivers registered • React to confirm your attendance` });

            // Create buttons
            const attendingBtn = new ButtonBuilder()
                .setCustomId(`attendance_confirm_${round.round_id}_attending`)
                .setLabel('✅ Attending')
                .setStyle(ButtonStyle.Success);

            const absentBtn = new ButtonBuilder()
                .setCustomId(`attendance_confirm_${round.round_id}_absent`)
                .setLabel('❌ Not Attending')
                .setStyle(ButtonStyle.Danger);

            const tentativeBtn = new ButtonBuilder()
                .setCustomId(`attendance_confirm_${round.round_id}_tentative`)
                .setLabel('❓ Tentative')
                .setStyle(ButtonStyle.Secondary);

            const actionRow = new ActionRowBuilder().addComponents(attendingBtn, absentBtn, tentativeBtn);

            // Initialize cache for tracking responses
            client.attendanceSheets = client.attendanceSheets || {};
            client.attendanceSheets[round.round_id] = {
                roundId: round.round_id,
                seasonId: season.season_id,
                guildId: interaction.guildId,
                attending: [],
                absent: [],
                tentative: []
            };

            await interaction.reply({
                embeds: [embed],
                components: [actionRow]
            });

        } catch (error) {
            client.logs.error(`[attendance] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error posting attendance sheet.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
