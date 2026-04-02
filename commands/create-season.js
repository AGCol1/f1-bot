const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-season')
        .setDescription('🏁 Complete F1 season setup walkthrough (Admin only)')
        .setDefaultMemberPermissions(8),

    async execute(interaction, client) {
        try {
            await F1Database.ensureGuildExists(interaction.guildId);

            // Check for existing active season
            const existingActive = await F1Database.getActiveSeasonByGuild(interaction.guildId);
            
            if (existingActive) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Active Season Already Running')
                    .setDescription(`Season **${existingActive.season_number}** is currently active in this guild.`)
                    .addFields(
                        { name: 'To create a new season:', value: 'You must first archive or complete the current season.\n\nUse `/manage-season` to view options or contact an admin.', inline: false }
                    );

                return interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }

            // Show setup guide with button
            const setupGuide = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle('🏁 F1 Season Setup Walkthrough')
                .setDescription('Let\'s create a new season! Follow these steps:\n')
                .addFields(
                    { name: '📝 Step 1: Basic Info', value: 'Enter season number & total rounds', inline: false },
                    { name: '🏆 Step 2: Select Tracks', value: 'Choose a circuit for each round', inline: false },
                    { name: '👮 Step 3: Stewards (Optional)', value: 'Assign steward roles', inline: false },
                    { name: '✅ Step 4: Complete Setup', value: 'Review and start racing!', inline: false }
                )
                .setFooter({ text: 'Ready to create your season?' });

            const { ButtonBuilder } = require('discord.js');
            const startBtn = new ButtonBuilder()
                .setCustomId('start_season_setup')
                .setLabel('Start Season Setup')
                .setStyle(3)
                .setEmoji('🚀');

            const actionRow = new (require('discord.js')).ActionRowBuilder().addComponents(startBtn);

            if (existingActive) {
                // Send as follow-up if we already replied
                await interaction.followUp({ embeds: [setupGuide], components: [actionRow], flags: 64 });
            } else {
                // Send as main reply if this is the first message
                await interaction.reply({ embeds: [setupGuide], components: [actionRow], flags: 64 });
            }

        } catch (error) {
            client.logs.error(`[create-season] ${error.message}`);
            try {
                await interaction.reply({ content: '❌ Error creating season.', flags: 64 });
            } catch (e) {
                // Already replied, use follow-up
                await interaction.followUp({ content: '❌ Error creating season.', flags: 64 }).catch(() => {});
            }
        }
    }
};
