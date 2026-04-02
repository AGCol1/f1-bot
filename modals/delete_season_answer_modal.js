const { EmbedBuilder } = require('discord.js');
const F1Database = require('../utils/F1Database');

module.exports = {
    customID: 'delete_season_answer_modal',

    async execute(interaction, client) {
        try {
            const answer = parseInt(interaction.fields.getTextInputValue('math_answer'));
            const cache = interaction.client.deleteSeasonCache?.[interaction.user.id];

            if (!cache) {
                return interaction.reply({
                    content: '❌ Verification session expired. Please run `/delete-season` again.',
                    ephemeral: true
                });
            }

            // Check answer
            if (answer !== cache.correctAnswer) {
                cache.attempts = (cache.attempts || 0) + 1;

                if (cache.attempts >= 3) {
                    delete interaction.client.deleteSeasonCache[interaction.user.id];
                    return interaction.reply({
                        content: '❌ Too many incorrect attempts. Deletion cancelled. Run `/delete-season` to try again.',
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    content: `❌ Incorrect answer. You have **${3 - cache.attempts}** attempts remaining.`,
                    ephemeral: true
                });
            }

            // Correct answer! Now delete the season
            await F1Database.deleteSeason(cache.seasonId);
            delete interaction.client.deleteSeasonCache[interaction.user.id];

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Season Deleted Successfully')
                .setDescription('The season and all related data have been **permanently deleted**.')
                .addFields(
                    { name: 'What was deleted:', value: '• Season information\n• All rounds\n• All race results\n• All standings\n• All penalties\n• All incident reports', inline: false },
                    { name: 'Next Steps:', value: 'You can now create a new season using `/create-season`', inline: false }
                );

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[delete_season_answer_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error verifying answer.', ephemeral: true }).catch(() => {});
        }
    }
};
