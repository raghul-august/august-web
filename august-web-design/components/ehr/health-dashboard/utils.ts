export function formatRelationship(rel: string | null | undefined): string | null {
  if (!rel) return null;
  const normalized = rel.trim().toLowerCase();
  const allowed = new Set(['father', 'mother', 'parent', 'spouse', 'son', 'daughter', 'child', 'sibling', 'brother', 'sister']);
  if (!allowed.has(normalized)) return null;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

export function titleCaseName(s: string): string {
  return s.trim().split(/\s+/).map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').filter(Boolean).join(' ');
}

export function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
