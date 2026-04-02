const config = require('../config.json');
let pool;

async function getPool() {
    if (!pool) {
        const mariadb = await import('mariadb');
        pool = mariadb.createPool({
            host: config.MySQL.host,
            user: config.MySQL.user,
            password: config.MySQL.password,
            database: config.MySQL.database,
            connectionLimit: 10
        });
    }
    return pool;
}

module.exports = { getPool };
