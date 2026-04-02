const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'setup_roles_modal_season',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    flags: 64
                });
            }

            console.log(`[setup_roles_modal] Cache exists, roundsData: ${JSON.stringify(cache.roundsData)}`);
            
            const stewardRoleId = interaction.fields.getTextInputValue('steward_role_id').trim();
            const managerRoleId = interaction.fields.getTextInputValue('manager_role_id').trim();

            const stewardRoles = [];

            // Validate and add steward role if provided
            if (stewardRoleId) {
                try {
                    await interaction.guild.roles.fetch(stewardRoleId);
                    stewardRoles.push(stewardRoleId);
                } catch (e) {
                    return interaction.reply({
                        content: `❌ Invalid Steward role ID: ${stewardRoleId}. Please check the ID and try again.`,
                        flags: 64
                    });
                }
            }

            // Validate and add manager role if provided
            if (managerRoleId) {
                try {
                    await interaction.guild.roles.fetch(managerRoleId);
                    // Can add manager role separately if needed
                } catch (e) {
                    return interaction.reply({
                        content: `❌ Invalid Manager role ID: ${managerRoleId}. Please check the ID and try again.`,
                        flags: 64
                    });
                }
            }

            // Update cache with steward roles
            cache.stewardRoles = stewardRoles;
            cache.managerRoleId = managerRoleId;

            // Store cache
            interaction.client.seasonCreationCache[interaction.user.id] = cache;

            // Move to incident setup - use button bridge since we can't show modal after modal submit
            const { ButtonBuilder } = require('discord.js');
            const nextStepEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Roles Setup Complete')
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
            client.logs.error(`[setup_roles_modal_season] ${error.message}`);
            await interaction.reply({ 
                content: '❌ Error setting up roles.',
                flags: 64 
            }).catch(() => {});
        }
    }
};
