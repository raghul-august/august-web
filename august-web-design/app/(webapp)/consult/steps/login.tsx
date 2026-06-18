'use client';

import { useEffect, useRef, useState } from 'react';
import { Stethoscope, PencilSimple, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { requestOtp, verifyOtp } from '@/services/auth-service';
import { fireEmailVerified } from '@/services/consultations-service';
import { CONSULT_PRICE_LABEL } from '@/lib/config';
import type { User } from '@/types';
import { Field, SuccessPopup } from '../_components';

interface Props {
  user: User | null;
  isAnonymous: boolean;
  episodeId: string;
  differentialDiagnosisId?: string;
  initialEmail?: string;
  onComplete: (verifiedEmail: string) => void;
}

const CODE_LEN = 6;
const RESEND_COOLDOWN = 30;

export function LoginStep({ user, episodeId, differentialDiagnosisId, initialEmail, onComplete }: Props) {
  const [email, setEmail] = useState(initialEmail || user?.email || '');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isCodeValid = code.length === CODE_LEN;

  async function sendOtp() {
    setBusy(true);
    setError(null);
    try {
      const r = await requestOtp({ method: 'email', email });
      if (r.skipped) {
        try {
          await fireEmailVerified({
            email,
            episode_id: episodeId,
            differential_diagnosis_id: differentialDiagnosisId,
          });
        } catch (err) {
          // non-fatal — the user is still verified server-side
        }
        setRequestId('skipped');
        setVerified(true);
        return;
      }
      if (r.requestId) {
        setRequestId(r.requestId);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to send OTP');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!requestId) return;
    setBusy(true);
    setError(null);
    try {
      await verifyOtp({ method: 'email', requestId, otp: code, email });
      await fireEmailVerified({ 
        email, 
        episode_id: episodeId,
        differential_diagnosis_id: differentialDiagnosisId,
      });
      setVerified(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Invalid code');
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[60vh]">
      {!requestId ? (
        <EmailEntry
          email={email}
          onChangeEmail={setEmail}
          isValid={isEmailValid}
          busy={busy}
          error={error}
          onSubmit={sendOtp}
        />
      ) : (
        <CodeEntry
          email={email}
          code={code}
          onChangeCode={(v) => { setCode(v); if (error) setError(null); }}
          isValid={isCodeValid}
          busy={busy}
          error={error}
          onSubmit={verify}
          onEditEmail={() => { setRequestId(null); setCode(''); setError(null); }}
          onResend={async () => {
            setCode('');
            try { await requestOtp({ method: 'email', email }); } catch {}
          }}
        />
      )}

      {/* Success stays an overlay popup — it's a transient confirmation that
          sits over whichever step the user just completed. */}
      {requestId && verified && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(28, 25, 23, 0.15)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <SuccessPopup
            title="Email verified"
            description={`Notifications will be sent to ${email}`}
            buttonText="Continue to payment"
            onButtonClick={() => onComplete(email)}
          />
        </div>
      )}
    </div>
  );
}


/* ── Email entry ────────────────────────────────────────────────────── */
function EmailEntry({
  email, onChangeEmail, isValid, busy, error, onSubmit,
}: {
  email: string;
  onChangeEmail: (v: string) => void;
  isValid: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-0 pb-10">
      <div className="flex justify-center">
        <div 
          style={{
            display: 'flex',
            padding: '5px 10px',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '999px',
            background: '#E8F2ED',
          }}
        >
         <Stethoscope size={14} weight="regular" color='#206E55'/> 
          <span 
            style={{
              color: '#206E55',
              textAlign: 'center',
              fontSize: '11px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '15px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Online Doctor Consult · {CONSULT_PRICE_LABEL}
          </span>
        </div>
      </div>

      <h1
        className="text-center mt-[12px]"
        style={{ 
          color: '#141515',
          fontSize: '30px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '36px',
          letterSpacing: '-0.5px',
        }}
      >
        Verify your email
      </h1>
      <p 
        className="text-center mt-1 mx-auto"
        style={{
          color: '#5A554A',
          textAlign: 'center',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '23px',
          letterSpacing: '-0.2px',
          maxWidth: '480px',
          margin: '4px auto 0',
        }}
      >
        We&apos;ll send you a 6-digit code to confirm it&apos;s you and use this email to notify you when your chat is ready.
      </p>

      <div className="mt-[32px]">
        <Field label="Email">
          <EmailInput
            value={email}
            onChange={(v) => onChangeEmail(v)}
            onEnter={onSubmit}
            isValid={isValid}
          />
        </Field>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div 
          style={{
            marginTop: '32px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%', maxWidth: '512px' }}>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!isValid || busy}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '999px',
                background: (!isValid || busy) ? '#E5E2DA' : '#206E55',
                color: (!isValid || busy) ? '#7A7468' : '#FFF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.2s ease-in-out',
                cursor: (!isValid || busy) ? 'not-allowed' : 'pointer',
                border: 'none',
                outline: 'none',
                marginBottom: '24px',
              }}
              className="t-label-lg"
            >
              {busy ? 'Sending…' : 'Get OTP'}
            </button>  
            <p className="mt-6 text-center t-paragraph-sm text-text-tertiary">
              We&apos;ll never share your email. See our{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#206E55', textDecoration: 'underline' }}>
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Code entry (centered card) ─────────────────────────────────────── */
function CodeEntry({
  email, code, onChangeCode, isValid, busy, error, onSubmit, onEditEmail, onResend,
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
    <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-0 pb-10 flex flex-col items-center">
      <div className="flex justify-center">
        <div
          style={{
            display: 'flex',
            padding: '5px 10px',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '999px',
            background: '#E8F2ED',
          }}
        >
          <Stethoscope size={14} weight="regular" color='#206E55' />
          <span
            style={{
              color: '#206E55',
              textAlign: 'center',
              fontSize: '11px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '15px',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            Online Doctor Consult · {CONSULT_PRICE_LABEL}
          </span>
        </div>
      </div>

      <h1
        className="text-center mt-6"
        style={{
          color: '#141515',
          fontSize: '30px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '36px',
          letterSpacing: '-0.5px',
          margin: '24px 0 0',
        }}
      >
        Verify your email
      </h1>
      <p
        style={{
          color: '#5A554A',
          textAlign: 'center',
          fontSize: '16px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '23px',
          letterSpacing: '-0.2px',
          margin: '4px 0 0',
        }}
      >
        Enter the 6-digit code sent to your email
      </p>
      <div className="flex items-center justify-center gap-1.5" style={{ marginTop: '6px' }}>
        <span 
          style={{
            color: '#7A7468',
            // fontFamily: 'Inter',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '18px',
          }}
        >
          {email}
        </span>
        <button
          type="button"
          onClick={onEditEmail}
          aria-label="Change email"
          className="inline-flex items-center justify-center transition-opacity hover:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.2069 4.58561L11.4144 1.79249C11.3215 1.6996 11.2113 1.62592 11.0899 1.57565C10.9686 1.52539 10.8385 1.49951 10.7072 1.49951C10.5759 1.49951 10.4458 1.52539 10.3245 1.57565C10.2031 1.62592 10.0929 1.6996 10 1.79249L2.29313 9.49998C2.19987 9.59251 2.12593 9.70265 2.0756 9.824C2.02528 9.94535 1.99959 10.0755 2.00001 10.2069V13C2.00001 13.2652 2.10536 13.5196 2.2929 13.7071C2.48043 13.8946 2.73479 14 3.00001 14H5.79313C5.9245 14.0004 6.05464 13.9747 6.17599 13.9244C6.29735 13.8741 6.40748 13.8001 6.50001 13.7069L14.2069 5.99999C14.2998 5.90712 14.3734 5.79687 14.4237 5.67553C14.474 5.55419 14.4999 5.42414 14.4999 5.2928C14.4999 5.16146 14.474 5.0314 14.4237 4.91006C14.3734 4.78872 14.2998 4.67847 14.2069 4.58561ZM5.79313 13H3.00001V10.2069L8.50001 4.70686L11.2931 7.49999L5.79313 13ZM12 6.79249L9.20688 3.99999L10.7069 2.49999L13.5 5.29249L12 6.79249Z" fill="#7A7468"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .otp-digit-row {
          display: flex;
          height: 56px;
          width: 100%;
          align-items: center;
          justify-content: center;
          align-self: stretch;
          box-sizing: border-box;
          /* Narrow screens: tight gap so all 6 boxes fit; inputs shrink. */
          gap: 16px;
        }
        .otp-digit-row :global(input) {
          /* Each box claims an equal share of the row, with a sane upper
             bound so a digit is still readable. */
          flex: 1 1 0;
          min-width: 0;
          max-width: 48px;
        }
        /* Only switch to the fixed 48px boxes + 26px spec gap once the
           viewport is wide enough to hold 6*48 + 5*26 = 418px plus the
           container's horizontal padding — otherwise the row overflows. */
        @media (min-width: 480px) {
          .otp-digit-row {
            gap: 26px;
          }
          .otp-digit-row :global(input) {
            flex: 0 0 48px;
          }
        }
      `}</style>
      <div className="otp-digit-row" style={{ marginTop: '28px' }}>
        {Array.from({ length: CODE_LEN }).map((_, i) => (
          <DigitInput
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            value={code[i] ?? ''}
            onChange={(v) => setDigit(i, v)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            ariaLabel={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 w-full max-w-[512px] rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || busy}
        style={{
          marginTop: '32px',
          width: '100%',
          maxWidth: '512px',
          height: '52px',
          borderRadius: '999px',
          background: (!isValid || busy) ? '#E5E2DA' : '#206E55',
          color: (!isValid || busy) ? '#7A7468' : '#FFF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.2s ease-in-out',
          cursor: (!isValid || busy) ? 'not-allowed' : 'pointer',
          border: 'none',
          outline: 'none',
        }}
        className="t-label-lg"
      >
        {busy ? 'Verifying…' : 'Continue'}
      </button>

      <button
        type="button"
        disabled={cooldown > 0}
        onClick={() => {
          onResend();
          setCooldown(RESEND_COOLDOWN);
          inputRefs.current[0]?.focus();
        }}
        style={{
          marginTop: '16px',
          color: '#7A7468',
          textAlign: 'center',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '16px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
        }}
      >
        Didn't receive a code?{' '}
        {cooldown > 0 ? (
          <span>Resend({cooldown}s)</span>
        ) : (
          <span
            style={{
              color: '#206E55',
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid',
              textDecorationSkipInk: 'auto',
              textUnderlinePosition: 'from-font',
            }}
          >
            Resend
          </span>
        )}
      </button>
    </div>
  );
}

/* ── Branded sub-components ────────────────────────────────────────── */

import { forwardRef } from 'react';

function EmailInput({ value, onChange, onEnter, isValid }: { value: string; onChange: (v: string) => void; onEnter: () => void; isValid: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <input
      type="email"
      autoComplete="email"
      inputMode="email"
      autoFocus
      placeholder="you@example.com"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => { if (e.key === 'Enter' && isValid) onEnter(); }}
      style={{
        width: '100%',
        height: '52px',
        borderRadius: '10px',
        border: isFocused ? '1px solid #141515' : '0.5px solid #D1CDC2',
        background: '#FFF',
        padding: '0 20px',
        outline: 'none',
        transition: 'border 0.2s ease-in-out',
      }}
      className="text-text-primary t-paragraph-md"
    />
  );
}

const DigitInput = forwardRef<HTMLInputElement, { value: string; onChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void; onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void; ariaLabel: string }>(
  ({ value, onChange, onKeyDown, onPaste, ariaLabel }, ref) => {
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
          // width is governed by .otp-digit-row's flex rules (mobile: equal
          // shares with max 48px; desktop: fixed 48px). Don't set it here
          // or it overrides the responsive flex basis.
          height: '56px',
          borderRadius: '5px',
          border: isFocused ? '1px solid #141515' : '1px solid #E5E2DA',
          background: '#FFF',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '500',
          outline: 'none',
          transition: 'border 0.2s ease-in-out',
        }}
        className="text-text-primary tabular-nums"
      />
    );
  }
);
DigitInput.displayName = 'DigitInput';
