'use client';

import { Suspense, use } from 'react';
import { PrePaymentFlow } from './pre-payment-flow';
import { BeautifulLoader } from '../../../consult/_components';

// Same loader UI as PrePaymentFlow / PaymentStep so a hard refresh
// doesn't cycle through three visually distinct loading states before
// Stripe paints. Generic label so it stays accurate whether the user
// lands on payment, intake, or login.
const ConsultLoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <BeautifulLoader label="Setting up your consult…" />
  </div>
);

export default function ConsultPrePaymentPage({
  params,
}: {
  params: Promise<{ ddId: string }>;
}) {
  const { ddId } = use(params);
  return (
    <div data-app="consult" className="consult-theme min-h-screen bg-surface-page">
      <Suspense fallback={<ConsultLoadingFallback />}>
        <PrePaymentFlow ddId={ddId} />
      </Suspense>
    </div>
  );
}
