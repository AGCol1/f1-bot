const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'setup_teams_select',

    async execute(interaction, client) {
        try {
            const selectedTeamIds = interaction.values.map(v => parseInt(v));
            const cache = interaction.client.teamsSetupCache?.[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired. Please run `/setup-teams` again.',
                    flags: 64
                });
            }

            // Get F1 teams data
            const f1Teams = await F1Database.getAllF1Teams();
            const selectedTeams = f1Teams.filter(t => selectedTeamIds.includes(t.team_id));

            // Delete existing teams for this guild (to replace them)
            const existingTeams = await F1Database.getTeamsByGuild(cache.guildId);
            for (const team of existingTeams) {
                await F1Database.deleteTeam(team.team_id);
            }

            // Create new team entries for this guild
            const createdTeams = [];
            for (const f1Team of selectedTeams) {
                const teamId = await F1Database.createTeamForGuild(
                    cache.guildId,
                    f1Team.name,
                    true, // is_f1_team
                    f1Team.team_id // f1_team_id
                );
                createdTeams.push({ id: teamId, name: f1Team.name });
            }

            delete interaction.client.teamsSetupCache[interaction.user.id];

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Teams Setup Complete!')
                .setDescription(`**${createdTeams.length} teams** have been selected for this season.`)
                .addFields(
                    { name: 'Teams:', value: createdTeams.map(t => `• ${t.name}`).join('\n'), inline: false },
                    { name: '📋 Next Step:', value: 'Use `/assign-drivers` to assign drivers to these teams', inline: false }
                )
                .setFooter({ text: 'Team setup is complete!' });

            await interaction.reply({
                embeds: [successEmbed],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[setup_teams_select] ${error.message}`);
            await interaction.reply({ content: '❌ Error setting up teams.', flags: 64 }).catch(() => {});
        }
    }
};
