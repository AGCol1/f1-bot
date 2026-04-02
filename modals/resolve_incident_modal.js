const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'resolve_incident_modal',

    async execute(interaction, client) {
        try {
            const cache = interaction.client.resolveIncidentCache?.[interaction.user.id];
            if (!cache) {
                return interaction.reply({
                    content: '❌ Session expired. Use `/resolve-incident` again.',
                    flags: 64
                });
            }

            const timePenaltyStr = interaction.fields.getTextInputValue('time_penalty').trim();
            const pointsPenaltyStr = interaction.fields.getTextInputValue('points_penalty').trim();
            const reason = interaction.fields.getTextInputValue('reason').trim();

            const timePenalty = parseInt(timePenaltyStr);
            const pointsPenalty = parseInt(pointsPenaltyStr);

            if (isNaN(timePenalty) || isNaN(pointsPenalty)) {
                return interaction.reply({
                    content: '❌ Invalid penalty amounts. Must be numbers.',
                    flags: 64
                });
            }

            // Get incident
            const incident = await F1Database.getIncidentById(cache.incidentId);
            if (!incident) {
                return interaction.reply({
                    content: `❌ Incident #${cache.incidentId} not found.`,
                    flags: 64
                });
            }

            // Assign penalty to involved driver if they exist
            if (incident.involved_driver_id && (timePenalty > 0 || pointsPenalty > 0)) {
                await F1Database.assignPenalty(
                    incident.round_id,
                    incident.involved_driver_id,
                    interaction.user.id,
                    timePenalty > 0 ? timePenalty : null,
                    pointsPenalty > 0 ? pointsPenalty : null,
                    `[Incident #${cache.incidentId}] ${reason}`
                );
            }

            // Close incident
            const decision = `${incident.involved_name || 'Unknown'}: `;
            let decisionText = [];
            if (timePenalty > 0) decisionText.push(`${timePenalty}s time penalty`);
            if (pointsPenalty > 0) decisionText.push(`${pointsPenalty} point penalty`);
            if (decisionText.length === 0) decisionText.push('No penalty');
            
            await F1Database.closeIncident(
                cache.incidentId,
                decision + decisionText.join(' + '),
                interaction.user.id
            );

            // Update embed in ticket channel if it exists
            if (incident.ticket_channel_id && incident.ticket_message_id) {
                try {
                    const guild = await interaction.client.guilds.fetch(cache.guildId);
                    const channel = await guild.channels.fetch(incident.ticket_channel_id);
                    const message = await channel.messages.fetch(incident.ticket_message_id);

                    const updatedEmbed = message.embeds[0].toJSON();
                    updatedEmbed.color = 0x00AA00; // Green
                    updatedEmbed.title = `✅ Incident Report #${cache.incidentId} - RESOLVED`;
                    updatedEmbed.fields.push(
                        { name: '⚖️ Resolution', value: `${timePenalty}s time + ${pointsPenalty} points penalty`, inline: false },
                        { name: '📝 Reason', value: reason, inline: false }
                    );

                    await message.edit({ embeds: [updatedEmbed] });

                    // Send resolution message
                    await channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#00AA00')
                                .setTitle('✅ Incident Resolved')
                                .setDescription(`**Resolved by:** <@${interaction.user.id}>\n**Penalty:** ${timePenalty}s time + ${pointsPenalty} points\n**Reason:** ${reason}`)
                                .setTimestamp()
                        ]
                    });
                } catch (e) {
                    client.logs.error(`Error updating ticket channel: ${e.message}`);
                }
            }

            // Reply to steward
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00AA00')
                        .setTitle(`✅ Incident #${cache.incidentId} Resolved`)
                        .addFields(
                            { name: '👤 Driver', value: incident.involved_name || 'Unknown', inline: true },
                            { name: '⏱️ Time Penalty', value: `${timePenalty}s`, inline: true },
                            { name: '📊 Points Penalty', value: pointsPenalty.toString(), inline: true },
                            { name: '📝 Reason', value: reason, inline: false }
                        )
                        .setFooter({ text: 'Penalty applied and standings updated' })
                ],
                flags: 64
            });

            // Clean up
            delete interaction.client.resolveIncidentCache[interaction.user.id];

        } catch (error) {
            client.logs.error(`[resolve_incident_modal] ${error.message}`);
            await interaction.reply({
                content: `❌ Error resolving incident: ${error.message}`,
                flags: 64
            }).catch(() => {});
        }
    }
};
