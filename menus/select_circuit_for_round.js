const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'select_circuit_for_round',

    async execute(interaction, client) {
        try {
            const circuitId = interaction.values[0];
            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Season creation session expired. Please start over with /create-season.',
                    ephemeral: true
                });
            }

            // Get circuit name
            const circuits = await F1Database.getAllCircuits();
            const circuit = circuits.find(c => c.circuit_id.toString() === circuitId);

            // Add to rounds data
            cache.roundsData.push({
                roundNumber: cache.currentRound,
                circuitId: parseInt(circuitId)
            });

            // Check if all rounds selected
            if (cache.currentRound >= cache.totalRounds) {
                // Show role setup option FIRST
                const roleSetupEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('Step 3️⃣/3️⃣ - Setup Roles (Optional)')
                    .setDescription('🏛️ Would you like to designate Steward and Manager roles now?\n\n**What they do:**\n• **Stewards** - Assign penalties, view incidents\n• **Managers** - Enter results, setup teams, assign drivers\n\n**Can set up later** - Use `/manage-roles` anytime');

                const { ButtonBuilder, ActionRowBuilder } = require('discord.js');
                const setupRolesBtn = new ButtonBuilder()
                    .setCustomId('setup_roles_modal_button')
                    .setLabel('Setup Roles Now')
                    .setStyle(1);

                const skipRolesBtn = new ButtonBuilder()
                    .setCustomId('skip_roles_modal_button')
                    .setLabel('Skip for Now')
                    .setStyle(2);

                const actionRow = new ActionRowBuilder().addComponents(setupRolesBtn, skipRolesBtn);

                return interaction.reply({
                    embeds: [roleSetupEmbed],
                    components: [actionRow],
                    flags: 64
                });
            }

            // Show next round selector
            cache.currentRound++;
            const nextRoundEmbed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Select Circuit for Round ${cache.currentRound}/${cache.totalRounds}`)
                .setDescription(`Previous round: ${circuit.name} (${circuit.country})\n\nNow select the circuit for round ${cache.currentRound}:`);

            const circuits_list = await F1Database.getAllCircuits();
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_circuit_for_round')
                .setPlaceholder('Choose a circuit')
                .setMaxValues(1);

            circuits_list.forEach(c => {
                selectMenu.addOptions({
                    label: `${c.name} (${c.country})`,
                    value: c.circuit_id.toString()
                });
            });

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                embeds: [nextRoundEmbed],
                components: [actionRow],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[select_circuit_for_round] ${error.message}`);
            await interaction.reply({ content: '❌ Error selecting circuit.', ephemeral: true }).catch(() => {});
        }
    }
};
