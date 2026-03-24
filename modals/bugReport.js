const { ChannelType, EmbedBuilder, ButtonBuilder, PermissionsBitField, ButtonStyle, ActionRowBuilder } = require("discord.js");
const ticket = require("../Schemas/ticketSchema");

module.exports = {
    customID: "bugReport",
    async execute(interaction, client) {
        const ign = interaction.fields.getTextInputValue("ignticket");
        const bug = interaction.fields.getTextInputValue("bugticket");

        const ids = [
            { id: interaction.user.id, allow: true },
            { id: client.config.HELPER_ID, allow: true },
            { id: client.config.MOD_ID, allow: true },
            { id: client.config.SRMOD_ID, allow: true },
            { id: client.config.JRADMIN_ID, allow: true },
            { id: client.config.ADMIN_ID, allow: true },
            { id: client.config.MANAGER_ID, allow: true }
        ];

        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            ...ids.map(({ id, allow }) => ({
                id,
                ...(allow
                    ? {
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                    : {
                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    })
            }))
        ];

        // Create ticket in DB first to get ticketId
        const ticketId = await ticket.createTicket(interaction.user.id, null, "bug");

        // Create the channel using ticketId
        const channel = await interaction.guild.channels.create({
            name: `bug-${ticketId}`,
            type: ChannelType.GuildText,
            topic: interaction.user.id,
            parent: client.config.TICKET_CATEGORY,
            permissionOverwrites
        });

        // Update the ticket row with the real channel ID
        await ticket.updateChannelId(ticketId, channel.id);

        const embed = new EmbedBuilder()
            .setColor("#19ecf7")
            .setDescription(`<@${interaction.user.id}>\n\n**Username**\n\`\`\`\n${ign}\n\`\`\`\n**Bug**\n\`\`\`\n${bug}\n\`\`\``);

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("claimTicket")
                .setLabel("Claim")
                .setEmoji("🛎️")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("deleteTicket")
                .setLabel("Delete")
                .setEmoji("🗑️")
                .setStyle(ButtonStyle.Secondary)
        );

        const message = await channel.send({ embeds: [embed], components: [button] });
        await message.pin();

        await interaction.reply({
            content: `Your ticket has been opened in ${channel}`,
            ephemeral: true
        });
    }
};