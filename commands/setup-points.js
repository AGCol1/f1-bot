const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-points')
        .setDescription('Configure points system for the season (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({ content: '❌ No active season found.' });
            }

            const menu = new StringSelectMenuBuilder()
                .setCustomId('select_points_system')
                .setPlaceholder('Select points system')
                .setMaxValues(1)
                .addOptions([
                    {
                        label: 'Standard F1 2026',
                        value: 'standard_f1',
                        description: '25, 18, 15, 12, 10, 8, 6, 4, 2, 1'
                    },
                    {
                        label: 'Custom Points',
                        value: 'custom',
                        description: 'Configure custom points distribution'
                    }
                ]);

            const actionRow = new ActionRowBuilder().addComponents(menu);
            const embed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle('Points System Configuration')
                .setDescription('Select a points system for Season ' + season.season_number);

            // Store season context
            interaction.client.pointsSetupCache = interaction.client.pointsSetupCache || {};
            interaction.client.pointsSetupCache[interaction.user.id] = {
                seasonId: season.season_id
            };

            return interaction.editReply({ embeds: [embed], components: [actionRow] });

        } catch (error) {
            client.logs.error(`[setup-points] ${error.message}`);
            await interaction.editReply({ content: '❌ Error configuring points.' }).catch(() => {});
        }
    }
};
