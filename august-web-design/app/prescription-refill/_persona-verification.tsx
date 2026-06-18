'use client';

import { useState } from 'react';
import { Check } from '@phosphor-icons/react';
import { PrimaryButton } from './_primary-button';
import { COLORS } from './_palette';
import { updateUserMetadata } from '@/services/user-service';
import { useAuthStore } from '@/stores/auth-store';
import { PRESCRIPTION_REFILL_TENANT } from '@/stores/incognito-store';

export const PERSONA_VERIFIED_FIELD = 'persona-verification-completed';

export function PersonaVerification() {
  const [isHumanChecked, setIsHumanChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleContinue() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateUserMetadata(PERSONA_VERIFIED_FIELD, 'true', PRESCRIPTION_REFILL_TENANT);
      if (user) {
        setUser({ ...user, [PERSONA_VERIFIED_FIELD]: 'true' });
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err as { message?: string })?.message ??
        'Failed to verify identity';
      setError(message);
      setBusy(false);
    }
  }

  return (
    <div>
      <h1
        style={{
          color: COLORS.textOnBg,
          fontSize: '30px',
          fontWeight: 500,
          lineHeight: '36px',
          letterSpacing: '-1.3px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Verify identity
      </h1>

      <p
        style={{
          color: COLORS.textOnBg,
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '23px',
          letterSpacing: '-0.2px',
          textAlign: 'center',
          margin: '8px 0 0',
        }}
      >
        We&apos;ll verify you before continuing with your refill.
      </p>

      <div style={{ marginTop: '32px' }}>
        <PersonaVerificationStyles />

        <PersonaHumanCheck
          checked={isHumanChecked}
          onChange={setIsHumanChecked}
        />

        {error && (
          <div
            style={{
              marginTop: '16px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.surfaceMuted}`,
              background: COLORS.surfaceMuted,
              padding: '10px 12px',
              color: COLORS.textOnSurface,
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <PrimaryButton
          disabled={!isHumanChecked || busy}
          onClick={handleContinue}
        >
          {busy ? 'Verifying…' : 'Continue'}
        </PrimaryButton>

        <p
          style={{
            marginTop: '16px',
            color: 'rgba(4, 5, 5, 0.52)',
            fontSize: '14px',
            fontStyle: 'italic',
            lineHeight: '20px',
            textAlign: 'center',
          }}
        >
          Note: identity verification is mocked in this sandbox. This is a
          placeholder, not a real ID check.
        </p>
      </div>
    </div>
  );
}

function PersonaHumanCheck({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="persona-check-card"
      style={{
        width: '100%',
        minHeight: '112px',
        border: '1px solid rgba(4, 5, 5, 0.12)',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.84)',
        boxShadow: '0 1px 2px rgba(4, 5, 5, 0.08)',
        cursor: 'pointer',
        padding: '28px 32px',
        textAlign: 'left',
      }}
    >
      <div
        className="persona-check-layout"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
        }}
      >
        <PersonaLogo />

        <div style={{ minWidth: 0, width: '100%' }}>
          <div
            className="persona-check-title-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span
              aria-hidden
              className="persona-check-box"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '7px',
                border: checked ? '2px solid #040505' : '2px solid #777',
                background: checked ? '#040505' : 'transparent',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '20px',
                lineHeight: 1,
              }}
            >
              {checked && <Check size={20} color="#fff" weight="bold" />}
            </span>

            <span
              className="persona-check-title"
              style={{
                color: COLORS.textOnSurface,
                fontSize: '26px',
                fontWeight: 600,
                lineHeight: '32px',
                letterSpacing: '-0.4px',
              }}
            >
              I am human
            </span>
          </div>

          <p
            className="persona-check-copy"
            style={{
              color: 'rgba(4, 5, 5, 0.52)',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '22px',
              margin: '28px 0 0',
            }}
          >
            You&apos;ll verify your information with Persona Relay to confirm the above.
          </p>
        </div>
      </div>
    </button>
  );
}

function PersonaLogo() {
  return (
    <div
      aria-label="Persona"
      className="persona-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: COLORS.textOnSurface,
        flexShrink: 0,
        fontSize: '25px',
        fontWeight: 700,
        lineHeight: '30px',
        letterSpacing: '-0.5px',
      }}
    >
      {/* Swap this mark for the Persona SVG when the asset is available. */}
      <span
        aria-hidden
        style={{
          color: '#635BFF',
          fontSize: '34px',
          lineHeight: '30px',
          transform: 'translateY(2px)',
        }}
      >
        *
      </span>
      <span>persona</span>
    </div>
  );
}

function PersonaVerificationStyles() {
  return (
    <style jsx global>{`
      @media (max-width: 520px) {
        .persona-check-card {
          min-height: 0 !important;
          padding: 24px !important;
        }

        .persona-check-layout {
          gap: 24px !important;
        }

        .persona-check-title-row {
          gap: 14px !important;
        }

        .persona-check-box {
          width: 40px !important;
          height: 40px !important;
          border-radius: 10px !important;
        }

        .persona-check-title {
          font-size: 28px !important;
          line-height: 34px !important;
          white-space: nowrap !important;
        }

        .persona-check-copy {
          margin-top: 20px !important;
          max-width: 300px !important;
          font-size: 16px !important;
          line-height: 24px !important;
        }

        .persona-logo {
          align-self: flex-start !important;
          font-size: 24px !important;
          line-height: 28px !important;
          margin-top: 0 !important;
        }
      }

      @media (max-width: 380px) {
        .persona-check-card {
          padding: 22px !important;
        }

        .persona-check-title {
          font-size: 25px !important;
          line-height: 31px !important;
        }

        .persona-logo {
          font-size: 22px !important;
        }
      }
    `}</style>
  );
}
