const fs = require('node:fs');
const path = require('path');

module.exports = (client) => {
	const folders = ['commands', 'buttons', 'menus', 'modals', 'messages'];

	folders.forEach(folder => {
		const folderPath = path.join(__dirname, '..', folder);

		if (!fs.existsSync(folderPath)) return;

		fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
			if (!filename.endsWith('.js')) return;

			const filePath = path.join(folderPath, filename);

			try {
				// Clear require cache
				delete require.cache[require.resolve(filePath)];

				// Re-import the component
				const newComponent = require(filePath);

				let key;
				switch (folder) {
					case 'commands':
						key = newComponent.data?.name;
						if (!key) return;
						client.commands.set(key, newComponent);
						break;

					case 'buttons':
					case 'menus':
					case 'modals':
						key = newComponent.customID;
						if (!key) return;
						client[folder].set(key, newComponent);
						break;

					case 'messages':
						key = newComponent.name;
						if (!key) return;
						client.messages.set(key, newComponent);
						break;
				}

				client.logs.info(`[HOTRELOAD] Reloaded ${folder.slice(0, -1)}: ${key}`);
			} catch (err) {
				client.logs.error(`[HOTRELOAD] Failed to reload ${folder}/${filename}: ${err.stack || err}`);
			}
		});
	});

	client.logs.info('[HOTRELOAD] Watching commands, buttons, menus, modals, and messages for changes...');
};