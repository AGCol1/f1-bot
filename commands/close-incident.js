const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-incident')
        .setDescription('Close an incident without penalty (Stewards only)')
        .setDefaultMemberPermissions(8)
        .addIntegerOption(option =>
            option.setName('incident')
                .setDescription('Incident ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for closure (e.g., "Not substantiated")')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            const { hasStewardRole, areRolesConfigured } = require('../utils/PermissionHelper');
            
            const roleError = await areRolesConfigured(interaction.guildId);
            if (roleError) {
                return interaction.reply({
                    content: roleError,
                    flags: 64
                });
            }
            
            if (!await hasStewardRole(interaction)) {
                return interaction.reply({
                    content: '❌ You need Steward role to use this command.',
                    flags: 64
                });
            }

            const incidentId = interaction.options.getInteger('incident');
            const reason = interaction.options.getString('reason');
            
            // Get incident
            const incident = await F1Database.getIncidentById(incidentId);
            if (!incident) {
                return interaction.reply({
                    content: `❌ Incident #${incidentId} not found.`,
                    flags: 64
                });
            }

            if (incident.status === 'closed') {
                return interaction.reply({
                    content: `❌ Incident #${incidentId} is already closed.`,
                    flags: 64
                });
            }

            // Close incident
            await F1Database.closeIncident(
                incidentId,
                `No penalty: ${reason}`,
                interaction.user.id
            );

            // Update ticket channel if exists
            if (incident.ticket_channel_id && incident.ticket_message_id) {
                try {
                    const guild = await interaction.client.guilds.fetch(interaction.guildId);
                    const channel = await guild.channels.fetch(incident.ticket_channel_id);
                    const message = await channel.messages.fetch(incident.ticket_message_id);

                    const updatedEmbed = message.embeds[0].toJSON();
                    updatedEmbed.color = 0x888888; // Gray
                    updatedEmbed.title = `✅ Incident Report #${incidentId} - CLOSED`;

                    await message.edit({ embeds: [updatedEmbed] });

                    await channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#888888')
                                .setTitle('✅ Incident Closed')
                                .setDescription(`**Closed by:** <@${interaction.user.id}>\n**Reason:** ${reason}`)
                                .setTimestamp()
                        ]
                    });

                    // Delete channel after 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await channel.delete('Incident resolved');
                } catch (e) {
                    client.logs.error(`Error with ticket channel: ${e.message}`);
                }
            }

            // Reply to steward
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#888888')
                        .setTitle(`✅ Incident #${incidentId} Closed`)
                        .addFields(
                            { name: '📝 Reason', value: reason, inline: false },
                            { name: '💬 Note', value: 'No penalty was assigned. Ticket channel deleted.' }
                        )
                ],
                flags: 64
            });

        } catch (error) {
            client.logs.error(`[close-incident] ${error.message}`);
            await interaction.reply({
                content: '❌ Error closing incident.',
                flags: 64
            }).catch(() => {});
        }
    }
};
