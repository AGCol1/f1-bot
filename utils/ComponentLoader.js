const ReadFolder = require('./ReadFolder.js');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { PermissionsBitField: { Flags: Permissions } } = require('discord.js');

const modules = [
	'commands',
	'buttons',
	'menus',
	'modals',
	'messages',
];

module.exports = async function(client, folder = null) {
	for (const module of modules) {
		if (typeof folder === 'string' && folder !== module) continue;

		client[module] = new Map();

		if (!existsSync(`${__dirname}/../${module}`)) {
			client.logs.warn(`No ${module} folder found - Skipping...`);
			continue;
		}

		const files = ReadFolder(module);
		for (const { path: filePath, data } of files) {
			try {
				if (!data.execute) throw `No execute function found`;
				if (typeof data.execute !== 'function') throw `Execute is not a function`;

				// Validation omitted for brevity (roles, users, perms, etc.)

				switch (module) {
					case 'messages':
						if (!data.name) throw 'No name property found';
						if (!data.description) throw 'No description property found';
						addComponent(client[module], data.name, data, filePath);
						break;
					case 'commands':
						if (!data.data) throw 'No data property found';
						addComponent(client[module], data.data.name, data, filePath);
						break;
					case 'buttons':
					case 'menus':
					case 'modals':
						if (!data.customID) throw 'No custom ID has been set';
						addComponent(client[module], data.customID, data, filePath);
						break;
				}
			} catch (error) {
				client.logs.error(`[${module.toUpperCase()}] Failed to load ./${filePath}: ${error.stack || error}`);
			}
		}

		client.logs.debug(`Loaded ${files.length} ${module}`);
	}
};

function addComponent(map, id, data, filePath) {
	const duplicateIDs = [];

	if (typeof id === 'string') {
		if (map.has(id)) duplicateIDs.push(id);
		map.set(id, Object.assign(data, { customID: id, __filePath: filePath }));
	}

	if (duplicateIDs.length > 0) throw `Duplicate IDs found: ${duplicateIDs.join(', ')}`;
}

function CheckPerms(perms, type) {
	if (!Array.isArray(perms)) return;
	const invalidPerms = [];
	for (let i = 0; i < perms.length; i++) {
		if (Permissions[perms[i]]) continue;
		invalidPerms.push(perms[i]);
	}
	if (invalidPerms.length > 0) throw `Invalid ${type} permissions found: ${invalidPerms.join(', ')}`;
}