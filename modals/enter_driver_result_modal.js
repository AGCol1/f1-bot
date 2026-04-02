const F1Database = require('../utils/F1Database');
const { showDriverResultModal } = require('../buttons/start_results_entry_button');

module.exports = {
    customID: /^enter_driver_result_\d+_\d+$/,

    async execute(interaction, client) {
        try {
            const parts = interaction.customId.split('_');
            const roundId = parseInt(parts[3]);
            const driverIndex = parseInt(parts[4]);

            const cache = interaction.client.resultsEntryCache[interaction.user.id];
            if (!cache || cache.roundId !== roundId) {
                return interaction.reply({
                    content: '❌ Results entry session expired.',
                    flags: 64
                });
            }

            // Get inputs
            const positionStr = interaction.fields.getTextInputValue('finishing_position').trim();
            const lapTimeDelta = interaction.fields.getTextInputValue('lap_time_delta').trim();
            const dnfStr = interaction.fields.getTextInputValue('dnf_status').trim().toLowerCase();

            // Validate position
            const position = parseInt(positionStr);
            if (isNaN(position) || position < 1 || position > cache.drivers.length) {
                return interaction.reply({
                    content: `❌ Invalid position. Must be 1-${cache.drivers.length}.`,
                    flags: 64
                });
            }

            // Validate lap time format
            if (!lapTimeDelta.match(/^\+?\d+:\d{2}\.\d{3}$/)) {
                return interaction.reply({
                    content: '❌ Invalid lap time format. Use: `+0:00.000` (winner) or `+MM:SS.SSS` for others.\n\nExample: `+1:23.456` means 1 minute 23.456 seconds behind winner.',
                    flags: 64
                });
            }

            // Fastest lap no longer awarded as bonus points
            const fastestLap = false;
            const dnf = dnfStr === 'yes' || dnfStr === 'y';

            // Save result
            const driver = cache.drivers[driverIndex];
            
            // Calculate points based on F1 2026 point system
            const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
            let points = position <= pointsTable.length ? pointsTable[position - 1] : 0;
            if (dnf) points = 0; // DNF gets no points
            
            await F1Database.enterRaceResult(
                cache.roundId,
                driver.driver_id,
                position,
                points,
                fastestLap,
                dnf,
                lapTimeDelta
            );
            
            // Update standings
            const round = await F1Database.getRoundById(cache.roundId);
            const season = await F1Database.getSeasonById(round.season_id);
            
            // Update driver and constructor standings to recalculate all points
            await F1Database.updateDriverStandings(season.season_id, driver.driver_id);
            
            // Get team for this driver and update team standings
            const pool = await require('./DatabasePool').getPool();
            const conn = await pool.getConnection();
            try {
                const teamDriver = await conn.query(
                    'SELECT team_id FROM team_drivers WHERE season_id = ? AND driver_id = ? LIMIT 1',
                    [season.season_id, driver.driver_id]
                );
                if (teamDriver && teamDriver.length > 0) {
                    await F1Database.updateConstructorStandings(season.season_id, teamDriver[0].team_id);
                }
            } finally {
                conn.release();
            }

            cache.results.push({
                driverId: driver.driver_id,
                driverName: driver.name,
                position,
                lapTime: lapTimeDelta,
                fastestLap,
                dnf
            });

            // Show next driver or summary
            await new Promise(resolve => setTimeout(resolve, 500));
            showDriverResultModal(interaction, client, cache, driverIndex + 1);

        } catch (error) {
            client.logs.error(`[enter_driver_result_modal] ${error.message}`);
            await interaction.reply({
                content: `❌ Error saving result: ${error.message}`,
                flags: 64
            }).catch(() => {});
        }
    }
};
