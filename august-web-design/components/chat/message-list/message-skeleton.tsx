'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function MessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className={`space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <Skeleton className="h-16 w-48 rounded-2xl" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
