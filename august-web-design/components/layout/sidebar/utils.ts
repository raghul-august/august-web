import { ROUTE_TO_NAV, type NavOptionId } from './constants';

export function resolveActiveNavId(pathname: string | null | undefined): NavOptionId {
  if (!pathname) return 'chat';
  if (pathname === '/chat' || pathname.startsWith('/chat/')) return 'chat';
  for (const [pattern, id] of ROUTE_TO_NAV) {
    if (pattern.test(pathname)) return id;
  }
  return 'chat';
}

export function formatRelativeShort(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const diff = Math.round((b - a) / 86_400_000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
