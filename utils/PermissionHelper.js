const F1Database = require('./F1Database');

/**
 * Check if both Manager and Steward roles are configured for the guild
 * Returns null if both configured, otherwise returns error message
 */
async function areRolesConfigured(guildId) {
    const trustedRoles = await F1Database.getTrustedRoles(guildId);
    const managerRoles = trustedRoles.filter(r => r.role_type === 'manager');
    const stewardRoles = trustedRoles.filter(r => r.role_type === 'steward');
    
    if (managerRoles.length === 0 || stewardRoles.length === 0) {
        return '❌ Manager and Steward roles must be configured first.\n\nRun `/manage-roles` to set them up.';
    }
    
    return null;
}

/**
 * Check if user has a trusted role (Manager or Steward)
 */
async function hasManagerRole(interaction) {
    const trustedRoles = await F1Database.getTrustedRoles(interaction.guildId);
    const managerRoles = trustedRoles.filter(r => r.role_type === 'manager');
    
    if (managerRoles.length === 0) {
        // No managers configured - FAIL
        return false;
    }
    
    return interaction.member.roles.cache.some(role => 
        managerRoles.some(tr => tr.role_id === role.id)
    );
}

/**
 * Check if user has steward role
 */
async function hasStewardRole(interaction) {
    const trustedRoles = await F1Database.getTrustedRoles(interaction.guildId);
    const stewardRoles = trustedRoles.filter(r => r.role_type === 'steward');
    
    if (stewardRoles.length === 0) {
        // No stewards configured - FAIL
        return false;
    }
    
    return interaction.member.roles.cache.some(role => 
        stewardRoles.some(tr => tr.role_id === role.id)
    );
}

/**
 * Check if user is admin
 */
function isAdmin(interaction) {
    return interaction.member.permissions.has('Administrator');
}

module.exports = {
    hasManagerRole,
    hasStewardRole,
    isAdmin,
    areRolesConfigured
};
