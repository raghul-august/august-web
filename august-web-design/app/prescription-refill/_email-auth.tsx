'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { requestOtp, verifyOtp } from '@/services/auth-service';
import { PRESCRIPTION_REFILL_TENANT } from '@/stores/incognito-store';
import { COLORS } from './_palette';
import { PrimaryButton } from './_primary-button';

const CODE_LEN = 6;
const RESEND_COOLDOWN = 30;

export function EmailAuth() {
  const [email, setEmail] = useState('');
  const [isCodeStep, setIsCodeStep] = useState(false);
  const [requestId, setRequestId] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isCodeValid = code.length === CODE_LEN;

  async function sendOtp() {
    setBusy(true);
    setError(null);
    try {
      const r = await requestOtp({
        method: 'email',
        email,
        tenant: PRESCRIPTION_REFILL_TENANT,
      });
      if (r.skipped) {
        setRequestId(undefined);
        setIsCodeStep(true);
        return;
      }
      if (r.requestId) {
        setRequestId(r.requestId);
      }

      /*
       * Email OTP can return `{}` on success. In that flow the backend verifies
       * by email + code, so there may be no requestId to store.
       */
      setIsCodeStep(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to send code');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await verifyOtp({
        method: 'email',
        requestId,
        otp: code,
        email,
        tenant: PRESCRIPTION_REFILL_TENANT,
      });
      // auth-store flips isAuthenticated; the parent gate swaps in the next step.
      // Backend stamps `access: false` on user creation for this tenant —
      // we don't need to write it here.
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Invalid code');
    } finally {
      setBusy(false);
    }
  }

  if (isCodeStep) {
    return (
      <CodeEntry
        email={email}
        code={code}
        onChangeCode={setCode}
        isValid={isCodeValid}
        busy={busy}
        error={error}
        onSubmit={verify}
        onEditEmail={() => {
          setIsCodeStep(false);
          setRequestId(undefined);
          setCode('');
          setError(null);
        }}
        onResend={async () => {
          setCode('');
          setError(null);
          try {
            await requestOtp({
              method: 'email',
              email,
              tenant: PRESCRIPTION_REFILL_TENANT,
            });
          } catch {}
        }}
      />
    );
  }

  return (
    <EmailEntry
      email={email}
      onChangeEmail={setEmail}
      isValid={isEmailValid}
      busy={busy}
      error={error}
      onSubmit={sendOtp}
    />
  );
}

function EmailEntry({
  email,
  onChangeEmail,
  isValid,
  busy,
  error,
  onSubmit,
}: {
  email: string;
  onChangeEmail: (v: string) => void;
  isValid: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
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
        Sandbox Prescription Refill
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
        Enter your email to get started. We&apos;ll send you a 6-digit code to verify it&apos;s you.
      </p>

      <div style={{ marginTop: '32px' }}>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            color: COLORS.textOnBg,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '18px',
            marginBottom: '8px',
            marginLeft: '4px',
          }}
        >
          Email
        </label>
        <EmailInput
          value={email}
          onChange={onChangeEmail}
          onEnter={onSubmit}
          isValid={isValid}
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

        <PrimaryButton onClick={onSubmit} disabled={!isValid || busy}>
          {busy ? 'Sending…' : 'Send code'}
        </PrimaryButton>

        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            color: COLORS.textOnBg,
            fontSize: '12px',
            lineHeight: '16px',
          }}
        >
          By continuing you agree to our{' '}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textOnBg, textDecoration: 'underline' }}
          >
            Terms
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textOnBg, textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function CodeEntry({
  email,
  code,
  onChangeCode,
  isValid,
  busy,
  error,
  onSubmit,
  onEditEmail,
  onResend,
}: {
  email: string;
  code: string;
  onChangeCode: (v: string) => void;
  isValid: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
  onEditEmail: () => void;
  onResend: () => void;
}) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function setDigit(i: number, v: string) {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = (code + '      ').slice(0, CODE_LEN).split('');
    next[i] = digit;
    const joined = next.join('').replace(/\s/g, '');
    onChangeCode(joined.slice(0, CODE_LEN));
    if (digit && i < CODE_LEN - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < CODE_LEN - 1) inputRefs.current[i + 1]?.focus();
    if (e.key === 'Enter' && isValid) onSubmit();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LEN);
    if (!text) return;
    e.preventDefault();
    onChangeCode(text);
    const last = Math.min(text.length, CODE_LEN - 1);
    inputRefs.current[last]?.focus();
  }

  return (
    <div>
      <h2
        style={{
          color: COLORS.textOnBg,
          fontSize: '24px',
          fontWeight: 500,
          lineHeight: '28px',
          letterSpacing: '-0.4px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Verify your email
      </h2>
      <p
        style={{
          color: COLORS.textOnBg,
          fontSize: '15px',
          fontWeight: 400,
          lineHeight: '24px',
          textAlign: 'center',
          margin: '8px 0 0',
        }}
      >
        Enter the 6-digit code we sent to
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '4px',
        }}
      >
        <span
          style={{
            color: COLORS.textOnBg,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          {email}
        </span>
        <button
          type="button"
          onClick={onEditEmail}
          aria-label="Change email"
          style={{
            color: COLORS.textOnBg,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Edit
        </button>
      </div>

      <style jsx>{`
        .otp-digit-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 8px;
          margin-top: 28px;
        }
        .otp-digit-row :global(input) {
          flex: 1 1 0;
          min-width: 0;
          max-width: 48px;
        }
        @media (min-width: 420px) {
          .otp-digit-row {
            gap: 16px;
          }
          .otp-digit-row :global(input) {
            flex: 0 0 48px;
          }
        }
      `}</style>
      <div className="otp-digit-row">
        {Array.from({ length: CODE_LEN }).map((_, i) => (
          <DigitInput
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            value={code[i] ?? ''}
            onChange={(v) => setDigit(i, v)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            ariaLabel={`Digit ${i + 1}`}
          />
        ))}
      </div>

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
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <PrimaryButton onClick={onSubmit} disabled={!isValid || busy}>
        {busy ? 'Verifying…' : 'Continue'}
      </PrimaryButton>

      <button
        type="button"
        disabled={cooldown > 0}
        onClick={() => {
          onResend();
          setCooldown(RESEND_COOLDOWN);
          inputRefs.current[0]?.focus();
        }}
        style={{
          marginTop: '20px',
          width: '100%',
          color: COLORS.textOnBg,
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 400,
          lineHeight: '16px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
        }}
      >
        Didn&apos;t receive a code?{' '}
        {cooldown > 0 ? (
          <span>Resend ({cooldown}s)</span>
        ) : (
          <span style={{ color: COLORS.textOnBg, textDecoration: 'underline' }}>Resend</span>
        )}
      </button>
    </div>
  );
}

function EmailInput({
  value,
  onChange,
  onEnter,
  isValid,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  isValid: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <input
      id="email"
      type="email"
      autoComplete="email"
      inputMode="email"
      autoFocus
      placeholder="you@example.com"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && isValid) onEnter();
      }}
      style={{
        width: '100%',
        height: '52px',
        borderRadius: '10px',
        border: isFocused
          ? `1px solid ${COLORS.textOnSurface}`
          : `1px solid ${COLORS.surfaceMuted}`,
        background: COLORS.surface,
        padding: '0 20px',
        outline: 'none',
        fontSize: '16px',
        color: COLORS.textOnSurface,
        transition: 'border 0.2s ease-in-out',
      }}
    />
  );
}

const DigitInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (v: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    ariaLabel: string;
  }
>(({ value, onChange, onKeyDown, onPaste, ariaLabel }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label={ariaLabel}
      style={{
        height: '56px',
        borderRadius: '5px',
        border: isFocused
          ? `1px solid ${COLORS.textOnSurface}`
          : `1px solid ${COLORS.surfaceMuted}`,
        background: COLORS.surface,
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 500,
        color: COLORS.textOnSurface,
        outline: 'none',
        transition: 'border 0.2s ease-in-out',
      }}
    />
  );
});
DigitInput.displayName = 'DigitInput';
