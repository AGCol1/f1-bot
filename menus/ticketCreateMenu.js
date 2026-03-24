const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, PermissionsBitField, ButtonStyle, } = require("discord.js");

module.exports = {
    customID: 'ticketCreateSelect',
    async execute(interaction, client) {

        if (interaction.customId == 'ticketCreateSelect') {

            const blacklist_role = client.config.BLACKLIST_ID

            if (interaction.member.roles.cache.has(blacklist_role)) {
             interaction.reply({ content: 'You are Blacklisted from creating a ticket.', ephemeral: true })
            } else {

                const ticket_type = `${interaction.values[0]}`

                const modal = new ModalBuilder()
                    .setTitle(`Create A Ticket`)
                    .setCustomId(`${ticket_type}`)

                // GENERL QUESTION FOR EVERY TICKET TYPE
                const ign = new TextInputBuilder()
                    .setCustomId('ignticket')
                    .setRequired(true)
                    .setPlaceholder('Please provide your IGN...')
                    .setLabel('Please provide your IGN')
                    .setStyle(TextInputStyle.Short);

                // GENERAL SUPPORT QUESTIONS

                const why = new TextInputBuilder()
                    .setCustomId('whyticket')
                    .setRequired(true)
                    .setPlaceholder('Enter your issue...')
                    .setLabel('What is the issue?')
                    .setStyle(TextInputStyle.Paragraph);

                // BUG REPORT QUESTIONS

                const bug = new TextInputBuilder()
                    .setCustomId('bugticket')
                    .setRequired(true)
                    .setPlaceholder('Please describe the bug...')
                    .setLabel('What is the bug?')
                    .setStyle(TextInputStyle.Paragraph);

                //PLAYER REPORT QUESTIONS 

                const reported_player = new TextInputBuilder()
                    .setCustomId('reportedticket')
                    .setRequired(true)
                    .setPlaceholder('Players IGN...')
                    .setLabel('What is the players IGN?')
                    .setStyle(TextInputStyle.Short);

                const reported_player_reason = new TextInputBuilder()
                    .setCustomId('whyreportedticket')
                    .setRequired(true)
                    .setPlaceholder('Reason for the report...')
                    .setLabel('Why are you reporting this player?')
                    .setStyle(TextInputStyle.Paragraph);

                // PUNISHMENT APPEAL QUESTION

                const why_appeal = new TextInputBuilder()
                    .setCustomId('whypunish')
                    .setRequired(true)
                    .setPlaceholder('State why you are appealing...')
                    .setLabel('Explain why you are appealing')
                    .setStyle(TextInputStyle.Paragraph);

                const which_punish = new TextInputBuilder()
                    .setCustomId('whichpunish')
                    .setRequired(true)
                    .setPlaceholder('Enter the punishment you are appealing...')
                    .setLabel('Which punishment are you appealing?')
                    .setStyle(TextInputStyle.Short);

                const punish_left = new TextInputBuilder()
                    .setCustomId('punishleft')
                    .setRequired(true)
                    .setPlaceholder('Length of the punishment remaining...')
                    .setLabel('Length of punishment remaining?')
                    .setStyle(TextInputStyle.Short);

                // PURCHASE SUPPORT QUESTIONS

                const package = new TextInputBuilder()
                    .setCustomId('packageticket')
                    .setRequired(false)
                    .setPlaceholder('Enter the name of the package...')
                    .setLabel('Package you are enquiring?')
                    .setStyle(TextInputStyle.Short);

                const tebex = new TextInputBuilder()
                    .setCustomId('tebexid')
                    .setRequired(false)
                    .setPlaceholder('Provide a Tebex ID if necessary...')
                    .setLabel('What is the Tebex ID?')
                    .setStyle(TextInputStyle.Paragraph);

                // STAFF REPORT QUESTIONS

                const staff_member = new TextInputBuilder()
                    .setCustomId('staffmember')
                    .setRequired(true)
                    .setPlaceholder('Enter the IGN of the staff member...')
                    .setLabel('What is the IGN of the staff member?')
                    .setStyle(TextInputStyle.Short);

                const staff_reason = new TextInputBuilder()
                    .setCustomId('staffreason')
                    .setRequired(true)
                    .setPlaceholder('Enter the reason for the report...')
                    .setLabel('Why are you making this report?')
                    .setStyle(TextInputStyle.Paragraph);

                const staff_evidence = new TextInputBuilder()
                    .setCustomId('staffevidence')
                    .setRequired(false)
                    .setPlaceholder('Provide any evidence to support this report...')
                    .setLabel('Do you have any evidence?')
                    .setStyle(TextInputStyle.Short);

                // Add every possible actionrowbuilder components - only use the ones you need which are added through the if statements below this
                const one = new ActionRowBuilder().addComponents(ign);
                const two = new ActionRowBuilder().addComponents(why);
                const three = new ActionRowBuilder().addComponents(bug);
                const four = new ActionRowBuilder().addComponents(reported_player);
                const five = new ActionRowBuilder().addComponents(reported_player_reason);
                const six = new ActionRowBuilder().addComponents(why_appeal);
                const seven = new ActionRowBuilder().addComponents(which_punish);
                const eight = new ActionRowBuilder().addComponents(punish_left);
                const nine = new ActionRowBuilder().addComponents(tebex);
                const ten = new ActionRowBuilder().addComponents(package);
                const eleven = new ActionRowBuilder().addComponents(staff_member);
                const twelve = new ActionRowBuilder().addComponents(staff_reason);
                const thirteen = new ActionRowBuilder().addComponents(staff_evidence);


                // add the relevant components based on what the ticket_type is 
                if (ticket_type === 'generalSupport') {
                    modal.addComponents(one, two);
                    interaction.showModal(modal);
                }
                else if (ticket_type === 'bugReport') {
                    modal.addComponents(one, three);
                    interaction.showModal(modal);       // i know i could of just had one interaction.showModal after the if statements
                }                                       // but tbh i was already half way thru copy and pasting and i cba changing it   
                else if (ticket_type === 'playerReport') {  // i might change it one day but i cba, i probably could have done it instead
                    modal.addComponents(one, four, five); // of wasting my time typing all of this out lol.
                    interaction.showModal(modal);
                }
                else if (ticket_type === 'punishAppeal') {
                    modal.addComponents(one, seven, eight, six);
                    interaction.showModal(modal);
                }
                else if (ticket_type === 'purchaseSupport') {
                    modal.addComponents(one, ten, nine, two);
                    interaction.showModal(modal);
                } else if (ticket_type === 'staffReport') {
                    modal.addComponents(one, eleven, twelve, thirteen);
                    interaction.showModal(modal);
                }
                else {
                    console.log('there has been an issue somewhere lol')
                    console.log(ticket_type)
                }

            }
        }
    }
}

