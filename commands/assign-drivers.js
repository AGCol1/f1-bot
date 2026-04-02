const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign-drivers')
        .setDescription('Assign drivers to teams for the current season (Manager only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            const { hasManagerRole, areRolesConfigured } = require('../../utils/PermissionHelper');
            
            await interaction.deferReply({ ephemeral: true });

            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.editReply({ content: roleError });
            }

            if (!await hasManagerRole(interaction)) {
                return interaction.editReply({
                    content: '❌ You need Manager role to use this command.'
                });
            }

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({ content: '❌ No active season found.' });
            }

            // Get teams
            const teams = await F1Database.getTeamsByGuild(interaction.guildId);
            if (teams.length === 0) {
                return interaction.editReply({ content: '❌ No teams found. Create teams first.' });
            }

            // Create team selector
            const teamMenu = new StringSelectMenuBuilder()
                .setCustomId('assign_driver_team_select')
                .setPlaceholder('Select a team')
                .setMaxValues(1);

            teams.forEach(team => {
                teamMenu.addOptions({
                    label: team.name,
                    value: team.team_id.toString()
                });
            });

            // Store season context
            interaction.client.driverAssignCache = interaction.client.driverAssignCache || {};
            interaction.client.driverAssignCache[interaction.user.id] = {
                seasonId: season.season_id,
                guildId: interaction.guildId
            };

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle('Assign Drivers to Teams')
                .setDescription('Select a team first, then select drivers to assign');

            const actionRow = new ActionRowBuilder().addComponents(teamMenu);

            return interaction.editReply({ embeds: [embed], components: [actionRow] });

        } catch (error) {
            client.logs.error(`[assign-drivers] ${error.message}`);
            await interaction.editReply({ content: '❌ Error assigning drivers.' }).catch(() => {});
        }
    }
};
