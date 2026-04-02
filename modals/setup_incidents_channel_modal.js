const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'setup_incidents_channel_modal',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            const incidentsChannelId = interaction.fields.getTextInputValue('incidents_channel_id_setup').trim() || null;

            // Validate incidents channel if provided
            if (incidentsChannelId) {
                try {
                    const guild = await interaction.client.guilds.fetch(cache.guildId);
                    await guild.channels.fetch(incidentsChannelId);
                } catch (e) {
                    return interaction.reply({
                        content: `❌ Invalid Incidents channel ID: ${incidentsChannelId}. Please check the ID and try again.`,
                        flags: 64
                    });
                }
            }

            // Now create the season
            const seasonId = await F1Database.createSeason(
                cache.guildId,
                cache.seasonNumber,
                cache.totalRounds
            );

            // Add rounds
            console.log(`[DEBUG] cache.roundsData: ${JSON.stringify(cache.roundsData)}`);
            console.log(`[DEBUG] cache.totalRounds: ${cache.totalRounds}`);
            
            if (cache.roundsData && cache.roundsData.length > 0) {
                await F1Database.addRoundsToSeason(seasonId, cache.roundsData);
                console.log(`[DEBUG] Added ${cache.roundsData.length} rounds`);
            } else {
                console.log(`[DEBUG] No roundsData to add`);
            }

            // Add steward roles
            if (cache.stewardRoles && cache.stewardRoles.length > 0) {
                for (const roleId of cache.stewardRoles) {
                    await F1Database.addTrustedRole(cache.guildId, roleId, 'steward');
                }
            }

            // Add manager role if provided
            if (cache.managerRoleId) {
                try {
                    await F1Database.addTrustedRole(cache.guildId, cache.managerRoleId, 'manager');
                } catch (e) {
                    client.logs.error(`Error adding manager role: ${e.message}`);
                }
            }

            // Update incident channel in settings
            if (incidentsChannelId) {
                const pool = await (require('../utils/DatabasePool')).getPool();
                const conn = await pool.getConnection();
                try {
                    await conn.query(
                        `INSERT INTO settings (guild_id, incidents_channel_id) 
                         VALUES (?, ?) 
                         ON DUPLICATE KEY UPDATE incidents_channel_id = ?`,
                        [cache.guildId, incidentsChannelId, incidentsChannelId]
                    );
                } finally {
                    conn.release();
                }
            }

            // Clear cache
            delete interaction.client.seasonCreationCache[interaction.user.id];

            // Show success
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Season Setup Complete!')
                .setDescription('🎉 Your season is fully configured!')
                .addFields(
                    { name: '📊 Season Info', value: `Season: **${cache.seasonNumber}**\nRounds: **${cache.totalRounds}**`, inline: true },
                    { name: '🏛️ Step 3: Roles', value: 'Steward: ' + (cache.stewardRoles && cache.stewardRoles.length > 0 ? '✅ Set' : '⏭️ None') + '\nManager: ' + (cache.managerRoleId ? '✅ Set' : '⏭️ None'), inline: true },
                    { name: '🚨 Step 4: Incidents', value: incidentsChannelId ? `✅ <#${incidentsChannelId}>` : '⏭️ None', inline: true },
                    { name: '\n🚀 **READY FOR NEXT STEPS!**', value: '', inline: false },
                    { name: '1️⃣ Register Your Drivers', value: '```\n/register-driver\n```\nEach driver registers once', inline: false },
                    { name: '2️⃣ Setup Teams', value: '```\n/setup-teams\n```\nSelect F1 teams for season', inline: false },
                    { name: '3️⃣ Assign Drivers to Teams', value: '```\n/assign-drivers\n```\nAssign drivers to teams', inline: false },
                    { name: '4️⃣ Launch Your Season!', value: '```\n/attendance <round>\n```\nStart race weekend', inline: false },
                    { name: '💡 Quick Commands', value: '`/f1help` - Full guide\n`/manage-roles` - Add more roles\n`/configure-channels` - Adjust channels', inline: false }
                )
                .setFooter({ text: '✅ Ready to start your F1 season!' });

            await interaction.reply({
                embeds: [successEmbed],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[setup_incidents_channel_modal] ${error.message}`);
            await interaction.reply({
                content: `❌ Error setting up incidents channel: ${error.message}`,
                flags: 64
            }).catch(() => {});
        }
    }
};
