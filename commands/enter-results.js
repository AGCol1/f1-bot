const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enter-results')
        .setDescription('Enter race results for a round with lap times (Manager only)')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option.setName('round')
                .setDescription('Round number')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(30)
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

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.reply({ content: '❌ No active season found.', flags: 64 });
            }

            const roundNum = interaction.options.getInteger('round');
            const round = await F1Database.getRoundByNumber(season.season_id, roundNum);

            if (!round) {
                return interaction.reply({ content: `❌ Round ${roundNum} not found.`, flags: 64 });
            }

            // Get attending drivers for this round
            const drivers = await F1Database.getAttendingDriversForRound(round.round_id);
            
            if (drivers.length === 0) {
                return interaction.reply({
                    content: '❌ No drivers marked attending for this round. Use `/attendance` first.',
                    flags: 64
                });
            }

            // Store in cache for multi-step process
            interaction.client.resultsEntryCache = interaction.client.resultsEntryCache || {};
            interaction.client.resultsEntryCache[interaction.user.id] = {
                roundId: round.round_id,
                seasonId: season.season_id,
                roundNum: roundNum,
                drivers: drivers,
                results: [],
                currentIndex: 0
            };

            // Show intro
            const introEmbed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`🏁 Race Results Entry - Round ${roundNum}`)
                .setDescription(`**${drivers.length} drivers** to enter.\n\nYou'll select each driver and enter their:\n• **Finishing position** (1-${drivers.length})\n• **Lap time delta** from winner (format examples below)`)
                .addFields(
                    { name: '📋 Lap Time Format', value: '• Winner (1st place): `0:00.000`\n• 2nd place: `+1:23.456` (1 min 23.456 sec behind)\n• 3rd place: `+2:15.789` (2 min 15.789 sec behind)', inline: false },
                    { name: '⏱️ Format: `+MM:SS.SSS`', value: 'Use `+` prefix\nSeparate minutes:seconds with `:`\nInclude 3 decimal places for milliseconds', inline: false },
                    { name: '✅ Ready?', value: 'Click "Start Entering Results" to begin', inline: false }
                );

            const startBtn = new ButtonBuilder()
                .setCustomId(`start_results_entry_${round.round_id}`)
                .setLabel('Start Entering Results')
                .setStyle(3)
                .setEmoji('🏁');

            const actionRow = new ActionRowBuilder().addComponents(startBtn);

            await interaction.reply({
                embeds: [introEmbed],
                components: [actionRow],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[enter-results] ${error.message}`);
            await interaction.reply({ content: '❌ Error entering results.', flags: 64 }).catch(() => {});
        }
    }
};
