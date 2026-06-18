'use client';

import { COLORS } from './_palette';

/*
 * Two-state primary action.
 *
 *   disabled  → quiet outlined ghost pill: hairline ring, transparent fill,
 *               muted text. Echoes the form input borders above it so the
 *               disabled CTA reads as part of the same field set, not as a
 *               separate visual object competing for attention.
 *
 *   enabled   → solid charcoal pill with the layered GLASS_SHADOW bevel.
 *               Owns all the visual weight on the page — there's exactly
 *               one of these visible at a time, and it's the only thing
 *               you can click.
 *
 * The 1.5px border is allocated in both states (transparent when enabled)
 * so flipping between states is a pure paint change, never a layout shift.
 */

const GLASS_SHADOW = `
  rgba(13, 39, 64, 0.1) 0px 1.2px 30px 0px,
  inset 3px 3px 2px -3px rgba(255, 255, 255, 0.8),
  inset -3px -3px 2px -3px rgba(255, 255, 255, 0.8),
  inset 2px 2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset -2px -2px 0.5px -2px rgba(38, 38, 38, 0.06),
  inset 0 0 0 1px rgba(255, 255, 255, 0.12),
  inset 0 0 12px 1px rgba(212, 212, 212, 0.08)
`;

const BUTTON_TRANSITION =
  'background 0.45s ease, color 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease';

export function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="prx-primary-button"
      style={{
        marginTop: '24px',
        width: '100%',
        height: '52px',
        borderRadius: '999px',
        background: disabled ? 'transparent' : COLORS.actionBg,
        color: disabled ? 'rgba(4, 5, 5, 0.36)' : COLORS.actionText,
        border: `1.5px solid ${disabled ? 'rgba(4, 5, 5, 0.14)' : 'transparent'}`,
        boxShadow: disabled ? 'none' : GLASS_SHADOW,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: BUTTON_TRANSITION,
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        fontSize: '16px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  );
}
