export function hasRole(admin, role) {
    const roles = admin?.roles || [];
    return Array.isArray(roles) && roles.includes(role);
}

export function hasAnyRole(admin, roles) {
    const list = admin?.roles || [];
    if (!Array.isArray(list)) return false;
    return roles.some((r) => list.includes(r));
}

export function isSuperadmin(admin) {
    return hasRole(admin, "SUPERADMIN");
}

export function canMutateProducts(admin) {
    return hasAnyRole(admin, ["SUPERADMIN", "ADMIN"]);
}

export function canMutateRiders(admin) {
    return hasAnyRole(admin, ["SUPERADMIN", "ADMIN"]);
}

export function canManageWhitelist(admin) {
    return hasAnyRole(admin, ["SUPERADMIN", "ADMIN"]);
}
