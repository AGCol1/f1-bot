const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: /^start_results_entry_\d+$/,

    async execute(interaction, client) {
        try {
            const roundId = parseInt(interaction.customId.split('_')[3]);
            
            // Initialize cache if it doesn't exist
            if (!interaction.client.resultsEntryCache) {
                interaction.client.resultsEntryCache = {};
            }
            
            const cache = interaction.client.resultsEntryCache[interaction.user.id];

            if (!cache || cache.roundId !== roundId) {
                return interaction.reply({
                    content: '❌ Results entry session expired. Run `/enter-results` again.',
                    flags: 64
                });
            }

            // Show first driver selection
            showDriverResultModal(interaction, client, cache, 0);

        } catch (error) {
            client.logs.error(`[start_results_entry_button] ${error.message}`);
            await interaction.reply({
                content: '❌ Error starting results entry.',
                flags: 64
            }).catch(() => {});
        }
    }
};

async function showDriverResultModal(interaction, client, cache, driverIndex) {
    if (driverIndex >= cache.drivers.length) {
        // All done - show summary
        showResultsSummary(interaction, client, cache);
        return;
    }

    const driver = cache.drivers[driverIndex];
    const progress = `${driverIndex + 1}/${cache.drivers.length}`;

    const modal = new ModalBuilder()
        .setCustomId(`enter_driver_result_${cache.roundId}_${driverIndex}`)
        .setTitle(`Result ${progress}: ${driver.name}`)
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('finishing_position')
                    .setLabel('Finishing Position (1-' + cache.drivers.length + ')')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g., 1')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('lap_time_delta')
                    .setLabel('Lap Time Delta (+MM:SS.SSS)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Winner: +0:00.000, Others: +1:23.456')
                    .setRequired(true)
            ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('dnf_status')
                        .setLabel('DNF (Did Not Finish)? (yes/no)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('no')
                        .setRequired(false)
                )
        );

    await interaction.showModal(modal);
}

async function showResultsSummary(interaction, client, cache) {
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ All Results Entered!')
        .setDescription(`Round ${cache.roundNum} race results have been saved.`)
        .addFields(
            { name: '📊 Results Entered', value: cache.results.length.toString(), inline: true },
            { name: '🏁 Drivers', value: cache.drivers.length.toString(), inline: true },
            { name: '\n✨ What Happened:', value: '✅ Positions recorded\n✅ Lap times stored\n✅ Points calculated\n✅ Standings updated', inline: false },
            { name: '📈 Next Steps:', value: '1. `/driver-standings` - View current championship\n2. `/constructor-standings` - View team standings\n3. `/assign-penalty` - If stewards need to penalize drivers', inline: false },
            { name: '⚖️ About Penalties:', value: 'If stewards assign **time penalties**, race positions will **auto-recalculate** based on new lap times + penalty. Points and standings auto-update!', inline: false }
        );

    await interaction.reply({
        embeds: [embed],
        flags: 64
    });
}

module.exports.showDriverResultModal = showDriverResultModal;
