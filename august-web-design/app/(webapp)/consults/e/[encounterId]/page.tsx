'use client';

import { Suspense, use, useEffect } from 'react';
import { PostPaymentFlow } from './post-payment-flow';
import { BeautifulLoader } from '../../../consult/_components';
import { useRecentConsultStore } from '@/stores/recent-consult-store';

// No outer wrapper here — the chat branch needs to be the direct child of
// the chat-app shell so its flex layout sizes correctly. The wizard
// branches in PostPaymentFlow apply their own theme + scroll container.
export default function ConsultPostPaymentPage({
  params,
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const { encounterId } = use(params);

  useEffect(() => {
    if (encounterId) {
      useRecentConsultStore.getState().setLastOpenedConsultId(encounterId);
    }
  }, [encounterId]);

  return (
    <Suspense fallback={<BeautifulLoader label="Loading…" fullScreen />}>
      <PostPaymentFlow encounterId={encounterId} />
    </Suspense>
  );
}
