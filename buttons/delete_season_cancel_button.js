module.exports = {
    customID: 'delete_season_cancel',

    async execute(interaction, client) {
        try {
            await interaction.reply({
                content: '✅ Season deletion cancelled.',
                ephemeral: true
            });

        } catch (error) {
            client.logs.error(`[delete_season_cancel_button] ${error.message}`);
        }
    }
};
