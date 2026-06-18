'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const LOADING_MESSAGES = [
  'Connecting to August…',
  'Getting your health companion ready…',
  'Almost there…',
];

interface MessageSkeletonProps {
  isUser?: boolean;
  width?: 'short' | 'medium' | 'long';
}

function MessageSkeleton({ isUser = false, width = 'medium' }: MessageSkeletonProps) {
  const widthClass = {
    short: 'w-24',
    medium: 'w-48',
    long: 'w-64',
  }[width];

  return (
    <div
      className={cn(
        'flex px-3',
        isUser ? 'justify-end' : 'justify-start',
        'pt-4'
      )}
    >
      <Skeleton
        className={cn(
          'h-10',
          widthClass,
          isUser
            ? 'bg-[#D8DCDB] rounded-[12px_0_12px_12px]'
            : 'bg-[#D1D5D4] rounded-[0_12px_12px_12px]'
        )}
      />
    </div>
  );
}

interface ChatSkeletonProps {
  message?: string;
}

export function ChatSkeleton({ message }: ChatSkeletonProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const timeouts = [5000, 10000, 15000];
    const timers: NodeJS.Timeout[] = [];

    timeouts.forEach((delay, index) => {
      if (index < LOADING_MESSAGES.length - 1) {
        const timer = setTimeout(() => {
          setMessageIndex(index + 1);
        }, delay);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [message]);

  const displayMessage = message ?? LOADING_MESSAGES[messageIndex];

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-gray-100 flex items-center px-4 gap-3">
        <Skeleton className="h-6 w-6 rounded-md bg-[#D1D5D4]" />
        <Skeleton className="h-5 w-20 rounded-md bg-[#D1D5D4]" />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Loading message overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-sm text-gray-500 animate-pulse">
            {displayMessage}
          </p>
        </div>

        <div className="flex-1 flex flex-col min-h-0 w-full max-w-3xl mx-auto py-4 opacity-50">
          {/* Simulated message bubbles */}
          <MessageSkeleton isUser={false} width="long" />
          <MessageSkeleton isUser={true} width="medium" />
          <MessageSkeleton isUser={false} width="medium" />
          <MessageSkeleton isUser={false} width="short" />
          <MessageSkeleton isUser={true} width="short" />
          <MessageSkeleton isUser={false} width="long" />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="w-full max-w-3xl mx-auto px-3 pb-4">
        <Skeleton className="h-12 w-full rounded-full bg-[#D1D5D4]" />
      </div>
    </div>
  );
}
