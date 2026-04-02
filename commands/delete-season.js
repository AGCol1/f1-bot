const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-season')
        .setDescription('⚠️ PERMANENTLY DELETE the current season (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const season = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            if (!season) {
                return interaction.editReply({ content: '❌ No active season found to delete.' });
            }

            // Create math captcha
            const num1 = Math.floor(Math.random() * 50) + 1;
            const num2 = Math.floor(Math.random() * 50) + 1;
            const correctAnswer = num1 + num2;

            // Store in cache
            interaction.client.deleteSeasonCache = interaction.client.deleteSeasonCache || {};
            interaction.client.deleteSeasonCache[interaction.user.id] = {
                seasonId: season.season_id,
                correctAnswer: correctAnswer,
                attempts: 0,
                timestamp: Date.now()
            };

            const warningEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ DELETE SEASON - CONFIRMATION REQUIRED')
                .setDescription(`You are about to **PERMANENTLY DELETE** Season ${season.season_number}.`)
                .addFields(
                    { name: 'This will delete:', value: '• All rounds and circuits for this season\n• All race results\n• All driver standings\n• All penalties\n• All incident reports\n**This action CANNOT be undone!**', inline: false },
                    { name: 'Security Check - Solve the Math Problem:', value: `**${num1} + ${num2} = ?**\n\nClick the button below and enter the correct answer.`, inline: false }
                )
                .setFooter({ text: 'You have 5 minutes to complete this action.' });

            const confirmButton = new ButtonBuilder()
                .setCustomId(`delete_season_confirm_${interaction.user.id}`)
                .setLabel('I Understand - Enter Answer')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('delete_season_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const actionRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            await interaction.editReply({
                embeds: [warningEmbed],
                components: [actionRow]
            });

        } catch (error) {
            client.logs.error(`[delete-season] ${error.message}`);
            await interaction.editReply({ content: '❌ Error deleting season.' }).catch(() => {});
        }
    }
};
