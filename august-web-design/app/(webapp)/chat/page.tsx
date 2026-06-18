'use client';

import { Suspense } from 'react';
import { ChatContainer, ChatSkeleton } from '@/components/chat';
import { VisitTransitionOverlay, PendingIntakeOverlay, DisqualifiedOverlay } from './overlays';

function ChatContainerWrapper() {
  return <ChatContainer />;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<ChatSkeleton />}>
        <ChatContainerWrapper />
      </Suspense>
      <Suspense fallback={null}>
        <VisitTransitionOverlay />
      </Suspense>
      <Suspense fallback={null}>
        <PendingIntakeOverlay />
      </Suspense>
      <Suspense fallback={null}>
        <DisqualifiedOverlay />
      </Suspense>
    </>
  );
}
