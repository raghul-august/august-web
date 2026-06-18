'use client';

import { SignOut } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth-store';
import { COLORS } from './_palette';

/*
 * Signed-in account control in the top-right of the prescription-refill page.
 * Renders just a sign-out button; the email itself is hidden. The `email`
 * prop is still threaded through so the parent can gate rendering on an
 * authenticated user and so the button carries the email as an accessible
 * label for screen readers.
 */
export function EmailMenu({ email }: { email: string }) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        type="button"
        onClick={() => logout()}
        aria-label={`Sign out of ${email}`}
        title={email}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          height: '36px',
          padding: '0 14px',
          borderRadius: '10px',
          background: 'transparent',
          border: `1px solid rgba(4, 5, 5, 0.12)`,
          color: COLORS.textOnBg,
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '18px',
          cursor: 'pointer',
          transition: 'background 0.15s ease-in-out, border-color 0.15s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.surfaceMuted;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <SignOut size={16} weight="bold" />
        Sign out
      </button>
    </div>
  );
}
