const { getPool } = require('../../utils/DatabasePool');
const F1Database = require('../../utils/F1Database');

module.exports = {
    customId: 'manage_roles_modal',

    async execute(interaction, client) {
        try {
            const stewardRoleId = interaction.fields.getTextInputValue('steward_role_id') || null;
            const managerRoleId = interaction.fields.getTextInputValue('manager_role_id') || null;
            const adminRoleId = interaction.fields.getTextInputValue('admin_role_id') || null;

            const pool = await getPool();
            const conn = await pool.getConnection();

            try {
                // Ensure settings record exists
                await conn.query(
                    `INSERT INTO settings (guild_id) VALUES (?) ON DUPLICATE KEY UPDATE guild_id = guild_id`,
                    [interaction.guildId]
                );

                // Update settings
                await conn.query(
                    `UPDATE settings SET 
                     steward_role_id = ?, manager_role_id = ?, admin_role_id = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE guild_id = ?`,
                    [stewardRoleId, managerRoleId, adminRoleId, interaction.guildId]
                );

                let response = '✅ Roles configured:\n';
                if (stewardRoleId) response += `🔍 Steward Role: <@&${stewardRoleId}>\n`;
                if (managerRoleId) response += `⚙️ Manager Role: <@&${managerRoleId}>\n`;
                if (adminRoleId) response += `👑 Admin Role: <@&${adminRoleId}>\n`;

                await interaction.reply({
                    content: response || '⚠️ No roles configured.',
                    ephemeral: true
                });

            } finally {
                conn.release();
            }

        } catch (error) {
            client.logs.error(`[manage_roles_modal] ${error.message}`);
            await interaction.reply({ content: '❌ Error updating roles.', ephemeral: true }).catch(() => {});
        }
    }
};
