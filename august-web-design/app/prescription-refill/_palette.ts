// Single source of truth for the prescription-refill flow palette.
// Names are semantic — change a value here and every place that references
// the token updates, regardless of what literal color it points to.
export const COLORS = {
  bgPrimary: '#fffefc',
  bgAccent: '#FFFFFF',
  textOnBg: '#040505',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F3',
  textOnSurface: '#040505',
  actionBg: '#040505',
  actionText: '#FFFFFF',
} as const;
