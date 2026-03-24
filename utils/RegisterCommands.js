const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = async (client) => {

    if (!client.commands || !(client.commands instanceof Map)) {
        client.logs.error('[REGISTER] client.commands is not loaded yet');
        return;
    }

    client.logs.info('Started refreshing application (/) commands.');

    const commands = [];
    const devCommands = [];
    const commandNames = [];

    for (const [, command] of client.commands) {

        try {

            if (!command.data) throw 'No command.data found';

            const commandData = command.data.toJSON();

            commandData.dm_permission ??= false;

            if (commandNames.includes(commandData.name)) continue;

            commandNames.push(commandData.name);

            if (command.dev) {
                devCommands.push(commandData);
            } else {
                commands.push(commandData);
            }

        } catch (error) {

            client.logs.error(`[REGISTER] Failed to register command: ${error}`);

        }

    }

    if (devCommands.length > 0 && !client.config.DEV_GUILD_ID) {
        client.logs.warn('Dev commands exist but DEV_GUILD_ID is missing in config');
    }

    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);

    try {

        await rest.put(
            Routes.applicationCommands(client.config.APP_ID),
            { body: commands }
        );

        if (typeof client.config.DEV_GUILD_ID === 'string' && devCommands.length > 0) {

            await rest.put(
                Routes.applicationGuildCommands(
                    client.config.APP_ID,
                    client.config.DEV_GUILD_ID
                ),
                { body: devCommands }
            );

        }

        client.logs.info('Successfully reloaded application (/) commands.');

    } catch (error) {

        client.logs.error('[REGISTER] Failed to register commands');
        client.logs.error(error);

    }

};