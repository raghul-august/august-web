// Shared anon-chat access constants. Lives in a leaf module to avoid the
// circular import that would arise if both auth-service and login-modal-watcher
// tried to share state through one of them.

export const ANON_ALLOWED_KEY = 'august_anon_allowed';
export const TELEHEALTH_ANON_ROUTE_KEY = 'telehealth_anon_route';
export const ANON_TELEHEALTH_PARAM = 'anon_telehealth';

export const TOOL_WIDGET_SOURCES = new Set([
  'bill-analyser',
  'cost-estimator',
  'appeal-assistant',
]);
