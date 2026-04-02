const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-driver')
        .setDescription('Register as a driver for this guild')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to register as a driver (leave empty for yourself)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Driver display name')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: 64 }); // ephemeral

            await F1Database.ensureGuildExists(interaction.guildId);

            const targetUser = interaction.options.getUser('user') || interaction.user;
            const customName = interaction.options.getString('name');
            const driverName = customName || targetUser.username;

            // Check if already registered
            const existingDriver = await F1Database.getDriversByGuild(interaction.guildId);
            if (existingDriver.some(d => d.user_id === targetUser.id)) {
                return interaction.editReply({
                    content: `❌ <@${targetUser.id}> is already registered as a driver.`
                });
            }

            // Register driver
            const driverId = await F1Database.createDriver(
                interaction.guildId,
                targetUser.id,
                driverName
            );

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Driver Registered!')
                .setDescription(`<@${targetUser.id}> is now registered as a driver`)
                .addFields(
                    { name: 'Driver Name', value: driverName, inline: true },
                    { name: 'Discord User', value: `<@${targetUser.id}>`, inline: true },
                    { name: '📋 Next Steps:', value: 'Wait for managers to assign you to a team via `/assign-drivers`', inline: false }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            client.logs.error(`[register-driver] ${error.message}`);
            // Check if it's a duplicate entry error
            if (error.message.includes('1062') || error.message.includes('Duplicate entry')) {
                const targetUser = interaction.options.getUser('user') || interaction.user;
                return await interaction.editReply({ 
                    content: `⚠️ <@${targetUser.id}> is already registered as a driver in this guild.` 
                }).catch(() => {});
            }
            await interaction.editReply({ content: '❌ Error registering driver.' }).catch(() => {});
        }
    }
};
