const ROUTE_TEMPLATES = [
  '/consults/e/{id}/prescriptions',
  '/consults/e/{id}',
  '/consults/d/{id}',
  '/consults',
  '/consult/steps',
  '/consult',
  '/chat',
  '/payment/{id}',
  '/payment',
  '/payments/{id}',
  '/payments',
];

function toRegex(tpl: string): RegExp {
  const escaped = tpl.replace(/\//g, '\\/').replace(/\{id\}/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

function stripIds(tpl: string): string {
  return tpl
    .split('/')
    .filter((seg) => seg !== '{id}')
    .join('/');
}

export function getCurrentPage(pathname?: string): string {
  const raw =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  if (!raw) return '/';
  const path = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
  for (const tpl of ROUTE_TEMPLATES) {
    if (toRegex(tpl).test(path)) return stripIds(tpl);
  }
  return path;
}
