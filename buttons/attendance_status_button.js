const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: /^attendance_confirm_\d+_(attending|absent|tentative)$/,

    async execute(interaction, client) {
        try {
            const parts = interaction.customId.split('_');
            const roundId = parseInt(parts[2]);
            const status = parts[3];

            // Get round and season info from database
            const round = await F1Database.getRoundById(roundId);
            if (!round) {
                return interaction.reply({
                    content: '❌ Round not found.',
                    flags: 64
                });
            }

            const season = await F1Database.getSeasonById(round.season_id);
            if (!season) {
                return interaction.reply({
                    content: '❌ Season not found.',
                    flags: 64
                });
            }

            // Get driver info - include ALL drivers (F1 pre-loaded + user-registered)
            const drivers = await F1Database.getDriversByGuild(season.guild_id, true);
            const userDriver = drivers.find(d => String(d.user_id) === String(interaction.user.id));

            if (!userDriver) {
                return interaction.reply({
                    content: '❌ You are not registered as a driver.',
                    flags: 64
                });
            }

            // Store attendance in database
            await F1Database.setAttendance(roundId, userDriver.driver_id, status);

            // Get current attendance from database
            const pool = await require('../utils/DatabasePool').getPool();
            const conn = await pool.getConnection();
            try {
                const attendanceRecords = await conn.query(
                    'SELECT driver_id, status FROM attendance WHERE round_id = ?',
                    [roundId]
                );

                // Build embeds from database attendance data
                const teams = await F1Database.getTeamsByGuild(season.guild_id);
                const embeds = [];
                
                for (const team of teams) {
                    const teamDrivers = await F1Database.getTeamDriversBySeasonAndTeam(season.season_id, team.team_id);
                    let attendingMembers = [];
                    let absentMembers = [];
                    let tentativeMembers = [];
                    let unconfirmedMembers = [];

                    for (const td of teamDrivers) {
                        const driver = drivers.find(d => d.driver_id === td.driver_id);
                        if (!driver) continue;
                        
                        const attendance = attendanceRecords.find(a => a.driver_id === td.driver_id);
                        if (!attendance) {
                            unconfirmedMembers.push(driver.name);
                        } else if (attendance.status === 'attending') {
                            attendingMembers.push(driver.name);
                        } else if (attendance.status === 'absent') {
                            absentMembers.push(driver.name);
                        } else if (attendance.status === 'tentative') {
                            tentativeMembers.push(driver.name);
                        }
                    }

                    // Only create embed if team has drivers
                    if (teamDrivers.length > 0) {
                        const teamEmbed = new EmbedBuilder()
                            .setColor('#FF1801')
                            .setTitle(`🏁 ${team.name}`);

                        if (attendingMembers.length > 0) {
                            teamEmbed.addFields({ name: '✅ Attending', value: attendingMembers.join('\n'), inline: false });
                        }
                        if (absentMembers.length > 0) {
                            teamEmbed.addFields({ name: '❌ Not Attending', value: absentMembers.join('\n'), inline: false });
                        }
                        if (tentativeMembers.length > 0) {
                            teamEmbed.addFields({ name: '❓ Tentative', value: tentativeMembers.join('\n'), inline: false });
                        }
                        if (unconfirmedMembers.length > 0) {
                            teamEmbed.addFields({ name: '⏳ Awaiting Response', value: unconfirmedMembers.join('\n'), inline: false });
                        }

                        embeds.push(teamEmbed);
                    }
                }

                // Add header embed
                const headerEmbed = new EmbedBuilder()
                    .setColor('#FF1801')
                    .setTitle(`🏎️ Round ${round.round_number} - Driver Attendance`)
                    .setDescription('Drivers: Click a button below to confirm your attendance status')
                    .setFooter({ text: `${drivers.length} drivers registered • Updated by ${interaction.user.username}` });

                // Update the original message with all embeds
                await interaction.message.edit({ embeds: [headerEmbed, ...embeds] });

                // Send confirmation to user
                await interaction.reply({
                    content: `✅ Marked as **${status}** for Round ${round.round_number}`,
                    flags: 64
                });
            } finally {
                conn.release();
            }

        } catch (error) {
            client.logs.error(`[attendance_status_button] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error updating attendance.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
