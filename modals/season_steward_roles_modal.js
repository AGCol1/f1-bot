const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: 'season_steward_roles_modal',

    async execute(interaction, client) {
        try {
            const stewardRoleIdsStr = interaction.fields.getTextInputValue('steward_role_ids');
            const stewardRoles = stewardRoleIdsStr
                ? stewardRoleIdsStr.split(',').map(id => id.trim()).filter(id => id.match(/^\d+$/))
                : [];

            const cache = interaction.client.seasonCreationCache[interaction.user.id];

            // Get all circuits
            const circuits = await F1Database.getAllCircuits();

            if (circuits.length === 0) {
                return interaction.reply({
                    content: '❌ No circuits found in database. Please add circuits first.',
                    ephemeral: true
                });
            }

            // Show round selection UI
            const roundEmbed = new EmbedBuilder()
                .setColor('#FF1801')
                .setTitle(`Select Circuit for Round ${cache.currentRound}/${cache.totalRounds}`)
                .setDescription('Choose the circuit for this round:');

            // Create select menu with circuits
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_circuit_for_round')
                .setPlaceholder('Choose a circuit')
                .setMaxValues(1);

            circuits.forEach(circuit => {
                selectMenu.addOptions({
                    label: `${circuit.name} (${circuit.country})`,
                    value: circuit.circuit_id.toString()
                });
            });

            // Store steward roles in cache
            cache.stewardRoles = stewardRoles;

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({
                embeds: [roundEmbed],
                components: [actionRow],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[season_steward_roles_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error selecting steward roles.', ephemeral: true }).catch(() => {});
        }
    }
};
