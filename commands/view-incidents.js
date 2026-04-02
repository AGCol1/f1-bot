const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-incidents')
        .setDescription('View open incident reports for stewards')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            const { hasStewardRole, hasManagerRole, areRolesConfigured } = require('../../utils/PermissionHelper');
            
            await interaction.deferReply({ ephemeral: true });

            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.editReply({ content: roleError });
            }

            if (!await hasStewardRole(interaction) && !await hasManagerRole(interaction)) {
                return interaction.editReply({
                    content: '❌ You need Steward or Manager role to view incidents.'
                });
            }

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);

            if (!season) {
                return interaction.editReply({
                    content: '❌ No active season found.',
                });
            }

            const incidents = await F1Database.getIncidentsBySeason(season.season_id);

            if (incidents.length === 0) {
                return interaction.editReply({
                    content: '✅ No open incidents reported.',
                });
            }

            const embeds = incidents.map((incident, idx) => 
                new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`Incident #${incident.incident_id}`)
                    .addFields(
                        { name: 'Reporter', value: incident.reporter_name || 'Anonymous', inline: true },
                        { name: 'Involved Driver', value: incident.involved_name || 'N/A', inline: true },
                        { name: 'Description', value: incident.description },
                        { name: 'Context', value: incident.context || 'None', inline: false },
                        { name: 'Evidence', value: incident.evidence_links || 'None', inline: false },
                        { name: 'Reported', value: `<t:${Math.floor(new Date(incident.created_at).getTime() / 1000)}:f>`, inline: false }
                    )
            );

            return interaction.editReply({ embeds: embeds.slice(0, 10) });

        } catch (error) {
            client.logs.error(`[view-incidents] ${error.message}`);
            await interaction.editReply({ content: '❌ Error retrieving incidents.', ephemeral: true }).catch(() => {});
        }
    }
};
