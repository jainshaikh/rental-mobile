import { Role } from '../types/enums';

/** Where a user should land after login / on an authenticated cold start. */
export function roleHomePath(role: Role): string {
  // This app is user-only — an account that happens to hold role PROVIDER (e.g.
  // created via the web dashboard) still just gets the normal user experience here.
  if (role === Role.USER || role === Role.PROVIDER) return '/account/home';
  // ADMIN / SUPER_ADMIN: mobile doesn't build their dashboard (web remains authoritative).
  return '/';
}
