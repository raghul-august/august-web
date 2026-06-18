'use client';

import { RotateCcw } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { disconnectWebPubSub } from '@/services/webpubsub-service';

interface StartOverButtonProps {
  showDisclaimer: boolean;
}

export function StartOverButton({ showDisclaimer }: StartOverButtonProps) {
  const clearMessages = useChatStore((state) => state.clearMessages);
  const clearIncognitoData = useIncognitoStore((state) => state.clearIncognitoData);

  const handleStartOver = async () => {
    await disconnectWebPubSub();
    clearIncognitoData({ clearPersisted: true });
    clearMessages();
    window.location.assign('/prescription-refill');
  };

  return (
    <div className="mt-2 mb-3 flex max-w-[420px] flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleStartOver}
        className="inline-flex items-center gap-2 self-start rounded-[10px] border border-[rgba(4,5,5,0.12)] bg-transparent px-3.5 py-2 text-sm font-medium text-[#040505] transition-colors hover:bg-[#f3f3f3]"
      >
        <RotateCcw size={16} strokeWidth={2.4} />
        <span>Start over</span>
      </button>
      {showDisclaimer && (
        <p className="m-0 text-left text-xs italic leading-4 text-[rgba(4,5,5,0.52)]">
          <span className="block">
            Note: no real prescription is being generated.
          </span>
          <span className="block">
            This is a mock representation of the prescription refill flow.
          </span>
        </p>
      )}
    </div>
  );
}
