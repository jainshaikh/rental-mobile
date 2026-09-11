import { Role } from '../types/enums';

/** Where a user should land after login / on an authenticated cold start. */
export function roleHomePath(role: Role): string {
  // This app is user-only — an account that happens to hold role PROVIDER (e.g.
  // created via the web dashboard) still just gets the normal user experience here.
  // '/' resolves to (public)/(tabs)/index.tsx — the vehicle listings tab, the
  // real landing screen (there is no separate "/account/home" route — a stale
  // reference to one here previously sent every fresh login to a dead route).
  if (role === Role.USER || role === Role.PROVIDER) return '/';
  // ADMIN / SUPER_ADMIN: mobile doesn't build their dashboard (web remains authoritative).
  return '/';
}
