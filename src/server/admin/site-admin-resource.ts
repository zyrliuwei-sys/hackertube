/**
 * Publish the portable admin client under neutral website naming. The local
 * CLI keeps its existing environment and credential-store contract; a newly
 * downloaded client uses its own SITE_ADMIN_* settings and private store.
 */
export function siteAdminResource(source: string): string {
  return source
    .replaceAll('SHIPANY_ADMIN_', 'SITE_ADMIN_')
    .replaceAll('shipany-admin', 'site-admin')
    .replaceAll('.shipany', '.site-admin')
    .replaceAll('ShipAny administration', 'Website administration')
    .replaceAll('ShipAny ', '');
}
