const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'finish_season_setup_button',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            console.log(`[finish_season_setup_button] Cache exists, roundsData: ${JSON.stringify(cache.roundsData)}`);

            // Create the season in database
            const seasonId = await F1Database.createSeason(
                interaction.guildId,
                cache.seasonNumber,
                cache.totalRounds
            );

            // Add all circuits for each round
            console.log(`[DEBUG finish] cache.roundsData: ${JSON.stringify(cache.roundsData)}`);
            console.log(`[DEBUG finish] cache.totalRounds: ${cache.totalRounds}`);
            
            if (cache.roundsData && cache.roundsData.length > 0) {
                await F1Database.addRoundsToSeason(seasonId, cache.roundsData);
                console.log(`[DEBUG finish] Added ${cache.roundsData.length} rounds`);
            } else {
                console.log(`[DEBUG finish] No roundsData to add`);
            }

            // Add steward and manager roles if provided
            if (cache.stewardRoles && cache.stewardRoles.length > 0) {
                for (const roleId of cache.stewardRoles) {
                    await F1Database.addTrustedRole(interaction.guildId, roleId, 'steward');
                }
            }

            if (cache.managerRoleId) {
                await F1Database.addTrustedRole(interaction.guildId, cache.managerRoleId, 'manager');
            }

            // Success embed
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Season Created Successfully!')
                .setDescription(`**Season ${cache.seasonNumber}** with **${cache.totalRounds} rounds** is now active!`)
                .addFields(
                    { name: 'Ready to:', value: '• `/assign-drivers` - Assign drivers to teams\n• `/attendance` - Set race attendance\n• `/enter-results` - Enter race results\n• `/report-incident` - File incident reports' }
                );

            // Clear cache
            delete interaction.client.seasonCreationCache[interaction.user.id];

            await interaction.reply({
                embeds: [successEmbed],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[finish_season_setup_button] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error finishing season setup.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
