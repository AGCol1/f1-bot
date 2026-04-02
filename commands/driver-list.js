const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('driver-list')
        .setDescription('View all drivers and their team assignments'),

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

            const drivers = await F1Database.getDriversByGuild(interaction.guildId);
            if (drivers.length === 0) {
                return interaction.editReply({
                    content: '📋 No drivers found.',
                    ephemeral: true
                });
            }

            // Get team assignments
            const teams = await F1Database.getTeamsByGuild(interaction.guildId);
            const teamDriverMap = {};
            const assignedDriverIds = new Set();

            for (const team of teams) {
                const teamDrivers = await F1Database.getTeamDriversBySeasonAndTeam(season.season_id, team.team_id);
                teamDriverMap[team.team_id] = {
                    name: team.name,
                    drivers: []
                };
                
                for (const td of teamDrivers) {
                    const driver = drivers.find(d => d.driver_id === td.driver_id);
                    if (driver) {
                        teamDriverMap[team.team_id].drivers.push({
                            name: driver.name,
                            isReserve: td.is_reserve
                        });
                        assignedDriverIds.add(driver.driver_id);
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Driver List - Season ${season.season_number}`);

            // Add teams with their drivers
            for (const [teamId, teamData] of Object.entries(teamDriverMap)) {
                if (teamData.drivers.length > 0) {
                    const driverList = teamData.drivers
                        .map(d => `${d.name}${d.isReserve ? ' (Reserve)' : ''}`)
                        .join('\n');
                    embed.addFields({
                        name: teamData.name,
                        value: driverList,
                        inline: false
                    });
                }
            }

            // Add unassigned drivers
            const unassignedDrivers = drivers.filter(d => !assignedDriverIds.has(d.driver_id));
            
            if (unassignedDrivers.length > 0) {
                embed.addFields({
                    name: 'Unassigned',
                    value: unassignedDrivers.map(d => d.name).join('\n'),
                    inline: true
                });
            }

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[driver-list] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving driver list.', ephemeral: true }).catch(() => {});
        }
    }
};
