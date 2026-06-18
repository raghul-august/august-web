'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BeautifulLoader } from '../_components';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { createCheckoutSession } from '@/services/consultations-service';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { track as trackMeta } from '@/app/utils/analytics';

interface Props {
  episodeId: string;
  ddId: string;
  patientId: string;
  visitReason?: string;
  skipDl?: boolean;
  email?: string;
  onComplete: (checkoutSessionId: string, encounterId: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

let stripePromiseSingleton: Promise<Stripe | null> | null = null;
function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromiseSingleton) {
    stripePromiseSingleton = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);
  }
  return stripePromiseSingleton;
}

export function PaymentStep({ episodeId, ddId, patientId, visitReason, email, onComplete, onProcessingChange }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pending, setPending] = useState<{ checkoutSessionId: string; encounterId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    trackTelehealth('payment_page_shown');
  }, []);

  useEffect(() => {
    onProcessingChange?.(confirmed);
  }, [confirmed, onProcessingChange]);

  useEffect(() => {
    if (!clientSecret) {
      setStripeReady(false);
      return;
    }
    const t = setTimeout(() => setStripeReady(true), 900);
    return () => clearTimeout(t);
  }, [clientSecret]);

  const stripePromise = useMemo(() => getStripePromise(), []);

  const createdRef = useRef(false);
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    (async () => {
      try {
        const session = await createCheckoutSession({
          episode_id: episodeId,
          differential_diagnosis_id: ddId,
          patient_id: patientId,
          email: email || undefined,
        });
        setPending({
          checkoutSessionId: session.checkout_session_id,
          encounterId: session.encounter_id,
        });
        setClientSecret(session.client_secret);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Could not start checkout');
      }
    })();
  }, [episodeId, ddId, patientId]);

  const handleComplete = () => {
    if (!pending) return;
    trackTelehealth('payment_completed');
    trackMeta('telehealth_payment_success');
    onProcessingChange?.(true);
    setConfirmed(true);
    onComplete(pending.checkoutSessionId, pending.encounterId);
  };

  if (!STRIPE_PK) {
    return (
      <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-6 pb-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Payment Issue. Please contact support to complete your consult.
        </div>
      </div>
    );
  }

  const overlayVisible = !error && (!clientSecret || !stripeReady);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#FFFFFF',
      }}
    >
      {error && (
        <div className="mx-auto w-full max-w-lg px-5 md:px-6 pt-16">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {clientSecret && (
        <div style={{ minHeight: '100vh', visibility: stripeReady ? 'visible' : 'hidden' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret, onComplete: handleComplete }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {overlayVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <BeautifulLoader label="Setting up secure checkout…" />
        </div>
      )}
    </div>
  );
}
