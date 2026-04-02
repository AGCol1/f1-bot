const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const ComponentLoader = require('./utils/ComponentLoader');
const EventLoader = require('./utils/EventLoader');
const RegisterCommands = require('./utils/RegisterCommands');
const Logs = require('./utils/Logs');
const config = require('./config.json');
const https = require('https');
const path = require('node:path');

const PREFIX = '!';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Core properties
client.config = config;
client.logs = Logs;
client.cooldowns = new Map();

// Telegram helper
function logToTelegram(content) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${content}`;
    const telegramToken = client.config.TELEGRAM_API_TOKEN;
    const telegramChatId = client.config.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${telegramChatId}&text=${encodeURIComponent(message)}`;
    https.get(url).on('error', (e) => client.logs.error(`Telegram send failed: ${e.message}`));
}

// Startup
(async () => {
    try {
        // Initialize F1 database automatically if needed
        const { autoInitializeDatabase } = require('./utils/AutoInitializeDatabase');
        await autoInitializeDatabase(client);

        await ComponentLoader(client);
        require('./utils/hotReload.js')(client);
        await EventLoader(client);
        await RegisterCommands(client);
        await client.login(client.config.TOKEN);
    } catch (err) {
        client.logs.error(`[STARTUP] ${err.stack || err}`);
        process.exit(1);
    }
})();

// Ready event
client.once('clientReady', () => {
    client.logs.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(client.config.BOT_STATUS_MESSAGE, { type: ActivityType.Playing });
    logToTelegram(`🟢MP Bot Online!🟢`);
});

// Interaction handler
client.on('interactionCreate', async interaction => {
    try {
        let command;
        if (interaction.isCommand()) {
            command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply({ content: 'Command not found!', ephemeral: true });
            await command.execute(interaction, client);

            const fileName = path.basename(command.__filePath || '');
            if (fileName.startsWith('mod_')) {
                const args = interaction.options?._hoistedOptions?.map(o => `${o.name}=${o.value}`).join(' ') || 'No arguments';
                logToTelegram(`${interaction.user.tag} (${interaction.user.id}) ran /${interaction.commandName} ${args} in ${interaction.guild?.name || 'DM'} #${interaction.channel?.name || 'N/A'}`);
            }
        }

        if (interaction.isButton()) {
            let button = client.buttons.get(interaction.customId);
            // Check regex patterns if exact match not found
            if (!button) {
                for (const [key, value] of client.buttons) {
                    if (key instanceof RegExp && key.test(interaction.customId)) {
                        button = value;
                        break;
                    }
                }
            }
            if (!button) return;
            await button.execute(interaction, client);
        }

        if (interaction.isStringSelectMenu()) {
            let menu = client.menus.get(interaction.customId);
            // Check regex patterns if exact match not found
            if (!menu) {
                for (const [key, value] of client.menus) {
                    if (key instanceof RegExp && key.test(interaction.customId)) {
                        menu = value;
                        break;
                    }
                }
            }
            if (!menu) return;
            await menu.execute(interaction, client);
        }

        if (interaction.isModalSubmit()) {
            let modal = client.modals.get(interaction.customId);
            // Check regex patterns if exact match not found
            if (!modal) {
                for (const [key, value] of client.modals) {
                    if (key instanceof RegExp && key.test(interaction.customId)) {
                        modal = value;
                        break;
                    }
                }
            }
            if (!modal) return;
            await modal.execute(interaction, client);
        }
    } catch (error) {
        client.logs.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: 'There was an error executing this interaction.' }).catch(() => {});
        } else {
            await interaction.reply({ content: 'There was an error executing this interaction.', ephemeral: true }).catch(() => {});
        }
    }
});

// Prefix command handler
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = client.messages.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, client, args);

        const fileName = path.basename(command.__filePath || '');
        if (fileName.startsWith('mod_')) {
            const argString = args.join(' ') || 'No arguments';
            logToTelegram(`${message.author.tag} (${message.author.id}) ran !${commandName} ${argString} in ${message.guild?.name || 'DM'} #${message.channel?.name || 'N/A'}`);
        }
    } catch (error) {
        client.logs.error(error);
        await message.reply('There was an error executing this command.').catch(() => {});
    }
});

let pool;

async function getPool() {
    if (!pool) {
        const mariadb = await import("mariadb");

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

// ===== XP / Level System =====
const cooldown = new Set();

const XP_MIN = Number(client.config.XP_MIN);
const XP_MAX = Number(client.config.XP_MAX);
const XP_SCALING = Number(client.config.BASE_XP); // for MEE6 formula, BASE_XP acts as scaling
const LEVEL_MULTIPLIER = Number(client.config.EXPONENT); // optional, can use for tuning

function xpForLevel(level) {
    // MEE6-style adjusted: XP_needed = BASE_XP * level^2 (scaled)
    return Math.floor(XP_SCALING * level * level);
}

function getXpGain() {
    return Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
}

// Message XP listener
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    // 1-minute cooldown
    if (cooldown.has(userId)) return;
    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 60000);

    const xpGain = getXpGain();

    const db = await getPool();
    const conn = await db.getConnection();

    try {
        // Fetch or create user
        let rows = await conn.query('SELECT * FROM user_levels WHERE discord_id = ?', [userId]);

        if (rows.length === 0) {
            await conn.query('INSERT INTO user_levels (discord_id, xp, level) VALUES (?, 0, 0)', [userId]);
            rows = [{ xp: 0, level: 0 }];
        }

        let { xp, level } = rows[0];

        // Add XP
        xp += xpGain;

        // Level up once if enough XP
        const xpNeeded = xpForLevel(level + 1);
        if (xp >= xpNeeded) {
            level++;
            xp -= xpNeeded;
            message.channel.send(`${message.author}, you are now level ${level}!`);
        }

        await conn.query('UPDATE user_levels SET xp = ?, level = ? WHERE discord_id = ?', [xp, level, userId]);

    } catch (err) {
        console.error(err);
    } finally {
        conn.release();
    }
});