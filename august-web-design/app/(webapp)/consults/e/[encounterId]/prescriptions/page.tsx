'use client';

import { Suspense, use } from 'react';
import { BeautifulLoader } from '../../../../consult/_components';
import { PrescriptionsPageView } from './prescriptions-page-view';

export default function PrescriptionsPage({
  params,
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const { encounterId } = use(params);
  return (
    <Suspense fallback={<BeautifulLoader label="Loading…" fullScreen />}>
      <PrescriptionsPageView encounterId={encounterId} />
    </Suspense>
  );
}
