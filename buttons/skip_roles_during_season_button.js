const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'skip_roles_modal_button',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            console.log(`[skip_roles] Cache exists, roundsData: ${JSON.stringify(cache.roundsData)}`);

            // Skip roles setup, move to incident setup
            cache.stewardRoles = [];
            cache.managerRoleId = null;

            // Store cache
            interaction.client.seasonCreationCache[interaction.user.id] = cache;

            // Move to incident setup - use button bridge
            const nextStepEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Skipped Roles Setup')
                .setDescription('Proceeding to Step 4️⃣/4️⃣ - Incident Channel Setup\n\nWould you like to setup an incident reporting channel?');

            const setupIncidentBtn = new ButtonBuilder()
                .setCustomId('setup_incident_channel_button')
                .setLabel('Setup Incident Channel')
                .setStyle(1);

            const finishBtn = new ButtonBuilder()
                .setCustomId('finish_season_setup_button')
                .setLabel('Finish Setup')
                .setStyle(3);

            const actionRow = new ActionRowBuilder().addComponents(setupIncidentBtn, finishBtn);

            await interaction.reply({
                embeds: [nextStepEmbed],
                components: [actionRow],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[skip_roles_modal_button] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error skipping roles setup.', 
                flags: 64 
            }).catch(() => {});
        }
    }
};
