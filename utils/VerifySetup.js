const { getPool } = require('./DatabasePool');

/**
 * Verification script to check F1 Bot system health
 * Run: node utils/VerifySetup.js
 */

async function verifySetup() {
    console.log('\n🏎️ F1 Bot Setup Verification\n');
    console.log('=' .repeat(50));

    const checks = {
        database: false,
        tables: false,
        f1_data: false,
        indexes: false
    };

    try {
        // 1. Database Connection
        console.log('\n✓ Checking database connection...');
        const pool = await getPool();
        const conn = await pool.getConnection();
        console.log('  ✅ Database connected');
        checks.database = true;

        // 2. Tables Exist
        console.log('\n✓ Checking tables...');
        const requiredTables = [
            'guilds', 'seasons', 'circuits', 'rounds',
            'teams', 'drivers', 'f1_teams', 'f1_drivers',
            'team_drivers', 'attendance', 'race_results',
            'driver_standings', 'constructor_standings',
            'penalties', 'incident_reports', 'settings',
            'season_settings', 'trusted_roles'
        ];

        const tables = await conn.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        let missingTables = 0;
        for (const table of requiredTables) {
            if (tableNames.includes(table)) {
                console.log(`  ✅ ${table}`);
            } else {
                console.log(`  ❌ ${table} - MISSING`);
                missingTables++;
            }
        }
        checks.tables = missingTables === 0;

        // 3. F1 Data
        console.log('\n✓ Checking F1 pre-loaded data...');
        const teamCount = await conn.query('SELECT COUNT(*) as count FROM f1_teams');
        const driverCount = await conn.query('SELECT COUNT(*) as count FROM f1_drivers');
        const circuitCount = await conn.query('SELECT COUNT(*) as count FROM circuits');

        console.log(`  📊 F1 Teams: ${teamCount[0].count}/10`);
        console.log(`  👤 F1 Drivers: ${driverCount[0].count}/20`);
        console.log(`  🏁 Circuits: ${circuitCount[0].count}/22`);

        checks.f1_data = teamCount[0].count > 0 && driverCount[0].count > 0 && circuitCount[0].count > 0;

        // 4. Indexes
        console.log('\n✓ Checking critical indexes...');
        const criticalIndexes = [
            { table: 'seasons', index: 'idx_season_guild' },
            { table: 'rounds', index: 'idx_round_season' },
            { table: 'race_results', index: 'idx_race_results_round' },
            { table: 'driver_standings', index: 'idx_driver_standing_season' }
        ];

        let indexIssues = 0;
        for (const idx of criticalIndexes) {
            try {
                await conn.query(`SHOW INDEX FROM ${idx.table} WHERE Key_name = '${idx.index}'`);
                console.log(`  ✅ ${idx.table}.${idx.index}`);
            } catch {
                console.log(`  ⚠️ ${idx.table}.${idx.index} - Missing`);
                indexIssues++;
            }
        }
        checks.indexes = indexIssues === 0;

        conn.release();

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('\n📋 Verification Summary:\n');

        const allPassed = Object.values(checks).every(v => v);

        console.log(`Database Connection: ${checks.database ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Table Schema: ${checks.tables ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`F1 Data: ${checks.f1_data ? '✅ PASS' : '⚠️ WARNING - Run: node utils/InitializeF1Data.js'}`);
        console.log(`Indexes: ${checks.indexes ? '✅ PASS' : '⚠️ WARNING'}`);

        console.log('\n' + '='.repeat(50));

        if (allPassed) {
            console.log('\n🎉 All checks passed! Bot is ready to use.\n');
            console.log('Next steps:');
            console.log('1. Run: node index.js');
            console.log('2. In Discord, use: /create-season');
            console.log('3. Check SETUP_GUIDE.md for detailed instructions\n');
        } else if (checks.database && checks.tables) {
            console.log('\n⚠️ Setup incomplete. Run initialization:\n');
            console.log('node utils/InitializeF1Data.js\n');
        } else {
            console.log('\n❌ Setup failed. Check errors above.\n');
        }

    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        console.log('\nMake sure:');
        console.log('1. MariaDB is running');
        console.log('2. config.json has correct credentials');
        console.log('3. F1_Schema.sql has been executed');
    }
}

// Run verification
verifySetup().catch(console.error);
