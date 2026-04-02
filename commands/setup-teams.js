const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-teams')
        .setDescription('Select which F1 teams will compete in this season (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({ content: '❌ No active season found. Run `/create-season` first.' });
            }

            // Get all F1 teams
            const f1Teams = await F1Database.getAllF1Teams();
            if (f1Teams.length === 0) {
                return interaction.editReply({ content: '❌ No F1 teams found in database.' });
            }

            // Check how many teams are already set up for this season
            const existingTeams = await F1Database.getTeamsByGuild(interaction.guildId);

            let info = 'Select which F1 teams will compete in this season.\n\n';
            if (existingTeams.length > 0) {
                info += `**Currently set up:** ${existingTeams.map(t => t.name).join(', ')}\n\n`;
                info += 'Select teams again to replace them, or select ✅ Continue if happy with current selection.';
            } else {
                info += '**Typical F1 grid has 10 teams.** You can select any number of teams.';
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('setup_teams_select')
                .setPlaceholder('Select teams (hold Shift/Ctrl to select multiple)')
                .setMinValues(1)
                .setMaxValues(Math.min(20, f1Teams.length));

            f1Teams.forEach(team => {
                selectMenu.addOptions({
                    label: team.name,
                    value: team.f1_team_id.toString(),
                    description: team.country || 'F1 Team'
                });
            });

            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle('🏁 Setup Teams for Season')
                .setDescription(info);

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            // Store season context
            interaction.client.teamsSetupCache = interaction.client.teamsSetupCache || {};
            interaction.client.teamsSetupCache[interaction.user.id] = {
                seasonId: season.season_id,
                guildId: interaction.guildId
            };

            return interaction.editReply({ embeds: [embed], components: [actionRow] });

        } catch (error) {
            client.logs.error(`[setup-teams] ${error.message}`);
            await interaction.editReply({ content: '❌ Error setting up teams.' }).catch(() => {});
        }
    }
};
