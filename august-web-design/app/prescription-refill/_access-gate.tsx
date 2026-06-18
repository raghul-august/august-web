'use client';

import { LockKey } from '@phosphor-icons/react';
import { COLORS } from './_palette';
import { useAuthStore } from '@/stores/auth-store';

export const ACCESS_FIELD = 'access';
const SUPPORT_EMAIL = 'support@meetaugust.ai';

/*
 * Whitelist gate. We mark every newly-verified user with `access: false`;
 * the gate stays up until an admin flips that to `true` in the user record.
 * Re-authenticating after being whitelisted is what refreshes the local
 * user state — no polling here.
 */
export function AccessGate() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow:
          '0 24px 56px rgba(13, 39, 64, 0.18), 0 6px 14px rgba(13, 39, 64, 0.1), 0 0 0 1px rgba(13, 39, 64, 0.08)',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: COLORS.surfaceMuted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LockKey size={26} color={COLORS.textOnSurface} weight="duotone" />
      </div>

      <h1
        style={{
          color: COLORS.textOnBg,
          fontSize: '24px',
          fontWeight: 500,
          lineHeight: '30px',
          letterSpacing: '-0.6px',
          margin: 0,
        }}
      >
        Hold tight — you need access
      </h1>

      <p
        style={{
          color: COLORS.textOnBg,
          fontSize: '15px',
          fontWeight: 400,
          lineHeight: '22px',
          margin: '12px auto 0',
          maxWidth: '320px',
          opacity: 0.7,
        }}
      >
        Your account isn&apos;t on the prescription-refill access list yet.
        Reach out and we&apos;ll get you in.
      </p>

      {user?.email && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: COLORS.surfaceMuted,
            color: COLORS.textOnSurface,
            fontSize: '13px',
            fontWeight: 500,
            display: 'inline-block',
          }}
        >
          {user.email}
        </div>
      )}

      <div style={{ marginTop: '28px' }}>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Prescription-refill access request')}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '48px',
            borderRadius: '10px',
            background: COLORS.actionBg,
            color: COLORS.actionText,
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Email {SUPPORT_EMAIL}
        </a>

        <button
          type="button"
          onClick={() => logout()}
          style={{
            marginTop: '14px',
            width: '100%',
            height: '40px',
            background: 'transparent',
            border: 'none',
            color: COLORS.textOnBg,
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            opacity: 0.7,
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
