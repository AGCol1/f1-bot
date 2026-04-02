const fs = require('fs');
const path = require('path');
const { getPool } = require('./DatabasePool');

/**
 * Auto-initialize F1 Bot database on startup
 * Checks if tables exist, creates them if not, initializes F1 data
 */
async function autoInitializeDatabase(client) {
    try {
        client.logs.info('🔍 Checking database schema...');

        const pool = await getPool();
        const conn = await pool.getConnection();

        try {
            // Check if any F1 tables exist
            const tables = await conn.query('SHOW TABLES');
            const tableNames = tables.map(t => Object.values(t)[0]);

            const f1TablesExist = tableNames.includes('seasons') && tableNames.includes('drivers');

            if (f1TablesExist) {
                client.logs.info('✅ F1 Bot database schema already exists');
                conn.release();
                return true;
            }

            client.logs.warn('⚠️ F1 tables not found. Creating schema...');

            // Read and execute schema
            const schemaPath = path.join(__dirname, '../Schemas/F1_Schema.sql');
            if (!fs.existsSync(schemaPath)) {
                throw new Error(`Schema file not found at ${schemaPath}`);
            }

            const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            
            // Split by semicolon and execute each statement
            const statements = schemaSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt && !stmt.startsWith('--'));

            client.logs.info(`📊 Executing ${statements.length} SQL statements...`);

            for (const statement of statements) {
                try {
                    await conn.query(statement);
                } catch (err) {
                    // Ignore "table already exists" and similar warnings
                    if (!err.message.includes('already exists')) {
                        client.logs.warn(`SQL Warning: ${err.message}`);
                    }
                }
            }

            client.logs.info('✅ Database schema created successfully');

            // Initialize F1 data
            client.logs.info('📥 Initializing F1 teams, drivers, and circuits...');
            await initializeF1Data(conn, client);

            client.logs.info('✅ F1 Bot database fully initialized and ready!');
            conn.release();
            return true;

        } catch (error) {
            conn.release();
            throw error;
        }

    } catch (error) {
        client.logs.error(`[AutoInitialize] Database initialization failed: ${error.message}`);
        throw error;
    }
}

/**
 * Initialize pre-loaded F1 data
 */
async function initializeF1Data(conn, client) {
    try {
        // Check if data already exists
        const teamCount = await conn.query('SELECT COUNT(*) as count FROM f1_teams');
        if (teamCount[0].count > 0) {
            client.logs.info('ℹ️ F1 data already populated');
            return;
        }

        // Insert F1 Teams
        const f1Teams = [
            ['Red Bull Racing', 'Austria'],
            ['Mercedes-AMG Petronas', 'Germany'],
            ['McLaren Formula 1 Team', 'United Kingdom'],
            ['Ferrari', 'Italy'],
            ['Alpine F1 Team', 'France'],
            ['Aston Martin F1 Team', 'United Kingdom'],
            ['RB F1 Team', 'Italy'],
            ['Haas F1 Team', 'United States'],
            ['Alfa Romeo Racing', 'Switzerland'],
            ['Williams Racing', 'United Kingdom']
        ];

        for (const [name, country] of f1Teams) {
            await conn.query(
                'INSERT IGNORE INTO f1_teams (name, country) VALUES (?, ?)',
                [name, country]
            );
        }
        client.logs.info('  ✓ F1 Teams inserted (10 teams)');

        // Insert F1 Drivers
        const f1Drivers = [
            ['Max', 'Verstappen', 1],
            ['Sergio', 'Pérez', 11],
            ['Lewis', 'Hamilton', 44],
            ['George', 'Russell', 63],
            ['Lando', 'Norris', 81],
            ['Oscar', 'Piastri', 81],
            ['Charles', 'Leclerc', 16],
            ['Carlos', 'Sainz', 55],
            ['Esteban', 'Ocon', 31],
            ['Pierre', 'Gasly', 10],
            ['Fernando', 'Alonso', 14],
            ['Lance', 'Stroll', 18],
            ['Yuki', 'Tsunoda', 22],
            ['Daniel', 'Ricciardo', 3],
            ['Nico', 'Hulkenberg', 27],
            ['Kevin', 'Magnussen', 20],
            ['Valtteri', 'Bottas', 77],
            ['Guanyu', 'Zhou', 24],
            ['Alexander', 'Albon', 23],
            ['Logan', 'Sargeant', 2]
        ];

        for (const [first, last, number] of f1Drivers) {
            await conn.query(
                'INSERT IGNORE INTO f1_drivers (first_name, last_name, number) VALUES (?, ?, ?)',
                [first, last, number]
            );
        }
        client.logs.info('  ✓ F1 Drivers inserted (20 drivers)');

        // Insert F1 Circuits
        const f1Circuits = [
            ['Albert Park Circuit', 'Australia'],
            ['Jeddah Corniche Circuit', 'Saudi Arabia'],
            ['Bahrain International Circuit', 'Bahrain'],
            ['Miami International Autodrome', 'United States'],
            ['Circuit de Barcelona-Catalunya', 'Spain'],
            ['Circuit de Monaco', 'Monaco'],
            ['Baku City Circuit', 'Azerbaijan'],
            ['Circuit Gilles Villeneuve', 'Canada'],
            ['Silverstone Circuit', 'United Kingdom'],
            ['Hungaroring', 'Hungary'],
            ['Spa-Francorchamps', 'Belgium'],
            ['Circuit Zandvoort', 'Netherlands'],
            ['Autodromo Nazionale di Monza', 'Italy'],
            ['Marina Bay Street Circuit', 'Singapore'],
            ['Suzuka International Racing Course', 'Japan'],
            ['Lusail International Circuit', 'Qatar'],
            ['Circuit of the Americas', 'United States'],
            ['Autodromo Hermanos Rodriguez', 'Mexico'],
            ['Autodromo José Maria Reyes', 'Brazil'],
            ['Las Vegas Street Circuit', 'United States'],
            ['Yas Marina Circuit', 'United Arab Emirates'],
            ['Melbourne Grand Prix Circuit', 'Australia']
        ];

        for (const [name, country] of f1Circuits) {
            await conn.query(
                'INSERT IGNORE INTO circuits (name, country) VALUES (?, ?)',
                [name, country]
            );
        }
        client.logs.info('  ✓ F1 Circuits inserted (22 circuits)');

    } catch (error) {
        client.logs.error(`[F1 Data Init] Failed to initialize F1 data: ${error.message}`);
        throw error;
    }
}

module.exports = { autoInitializeDatabase };
