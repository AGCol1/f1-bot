// F1 Bot Database Initialization Script
// Run this once to populate initial F1 teams and drivers

const { getPool } = require('./DatabasePool');

async function initializeF1Data() {
    const pool = await getPool();
    const conn = await pool.getConnection();

    try {
        console.log('🏎️ Initializing F1 Bot Database...');

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
        console.log('✅ F1 Teams inserted');

        // Insert F1 Drivers
        const f1Drivers = [
            // Red Bull Racing
            ['Max', 'Verstappen', 1],
            ['Sergio', 'Pérez', 11],
            // Mercedes
            ['Lewis', 'Hamilton', 44],
            ['George', 'Russell', 63],
            // McLaren
            ['Lando', 'Norris', 81],
            ['Oscar', 'Piastri', 81],
            // Ferrari
            ['Charles', 'Leclerc', 16],
            ['Carlos', 'Sainz', 55],
            // Alpine
            ['Esteban', 'Ocon', 31],
            ['Pierre', 'Gasly', 10],
            // Aston Martin
            ['Fernando', 'Alonso', 14],
            ['Lance', 'Stroll', 18],
            // RB
            ['Yuki', 'Tsunoda', 22],
            ['Daniel', 'Ricciardo', 3],
            // Haas
            ['Nico', 'Hulkenberg', 27],
            ['Kevin', 'Magnussen', 20],
            // Alfa Romeo
            ['Valtteri', 'Bottas', 77],
            ['Guanyu', 'Zhou', 24],
            // Williams
            ['Alexander', 'Albon', 23],
            ['Logan', 'Sargeant', 2]
        ];

        for (const [first, last, number] of f1Drivers) {
            await conn.query(
                'INSERT IGNORE INTO f1_drivers (first_name, last_name, number) VALUES (?, ?, ?)',
                [first, last, number]
            );
        }
        console.log('✅ F1 Drivers inserted');

        // Insert F1 Circuits
        const f1Circuits = [
            ['Albert Park Circuit', 'Australia'],
            ['Jeddah Corniche Circuit', 'Saudi Arabia'],
            ['Albert Park Circuit', 'Australia'],
            ['Bahrain International Circuit', 'Bahrain'],
            ['Miami International Autodrome', 'United States'],
            ['Circuit de Barcelona-Catalunya', 'Spain'],
            ['Circuit de Monaco', 'Monaco'],
            ['Baku City Circuit', 'Azerbaijan'],
            ['Circuit Gilles Villeneuve', 'Canada'],
            ['Silverstone Circuit', 'United Kingdom'],
            ['Hungaroring', 'Hungary'],
            ['Spa-Francorchamps', 'Belgium'],
            ['Zandvoort Circuit', 'Netherlands'],
            ['Autodromo Nazionale di Monza', 'Italy'],
            ['Marina Bay Street Circuit', 'Singapore'],
            ['Suzuka International Racing Course', 'Japan'],
            ['Lusail International Circuit', 'Qatar'],
            ['Circuit of the Americas', 'United States'],
            ['Autódromo José María Reyes', 'Mexico'],
            ['Interlagos', 'Brazil'],
            ['Las Vegas Street Circuit', 'United States'],
            ['Yas Marina Circuit', 'United Arab Emirates']
        ];

        for (const [name, country] of f1Circuits) {
            await conn.query(
                'INSERT IGNORE INTO circuits (name, country) VALUES (?, ?)',
                [name, country]
            );
        }
        console.log('✅ F1 Circuits inserted');

        console.log('🎉 Database initialization complete!');
        return true;

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        throw error;
    } finally {
        conn.release();
    }
}

module.exports = { initializeF1Data };

// Run if called directly
if (require.main === module) {
    initializeF1Data()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
