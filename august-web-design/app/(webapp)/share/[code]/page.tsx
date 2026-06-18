'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SharedMessageSheet, PublicChatData } from '@/components/share/shared-message-sheet';
import { ShareCtaModal } from '@/components/share/share-cta-modal';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import { API_CONFIG } from '@/lib/config';
import { useI18n } from '@/components/providers';

type ViewState = 'loading' | 'sheet' | 'cta' | 'error';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const code = params.code as string;
  const exitHref = '/chat';

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [chatData, setChatData] = useState<PublicChatData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track('share_page_viewed', { code });
    fetchPublicChats();
  }, [code]);

  const fetchPublicChats = async () => {
    try {
      setViewState('loading');
      const response = await fetch(`/api/user/${API_CONFIG.TENANT}/public-chats?code=${encodeURIComponent(code)}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load shared message');
      }

      setChatData(data);
      setViewState('sheet');
    } catch (err) {
      console.error('Error fetching public chats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shared message');
      setViewState('error');
    }
  };

  const handleSheetClose = () => {
    track('share_sheet_dismissed', { code });
    router.push(exitHref);
  };

  const handleTalkToAugust = () => {
    track('share_talk_to_august_clicked', { code });
    router.push('/chat');
  };

  const handleCtaClose = () => {
    track('share_cta_dismissed', { code });
    trackClevertap('Modal Dismissed', { name: 'share-app' });
    router.push(exitHref);
  };

  const allMessages = chatData?.chats || [];
  const authorName = chatData?.user_name || chatData?.author_name || 'August User';

  if (viewState === 'loading') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#206E55]" />
          <p className="mt-2 text-sm text-gray-500">
            {t('share.loading', 'Loading shared message...')}
          </p>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {t('share.errorTitle', 'Unable to load shared message')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {error || t('share.errorDescription', 'This link may have expired or is invalid.')}
          </p>
          <button
            onClick={() => router.push(exitHref)}
            className="px-6 py-3 bg-[#206E55] text-white rounded-full font-medium hover:bg-[#1a5a46] transition-colors"
          >
            {t('share.goToAugust', 'Go to August')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 relative">
      {/* Background Chat Messages (visible when CTA is shown) */}
      {viewState === 'cta' && allMessages.length > 0 && (
        <div className="h-full overflow-y-auto px-4 py-6">
          {/* August Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span
              className="font-serif italic"
              style={{
                color: '#206E55',
                fontSize: '24px',
              }}
            >
              august
            </span>
            <button
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: '#206E55',
                color: 'white',
              }}
            >
              {t('common.login')}
            </button>
          </div>

          {/* Messages */}
          <div className="space-y-4 opacity-50">
            {allMessages.map((message, index) => {
              const isUser = message.role === 'human';
              return (
                <div
                  key={message.id || index}
                  className={isUser ? "flex justify-end" : ""}
                >
                  <div
                    className="text-sm"
                    style={isUser ? {
                      borderRadius: '12px 0 12px 12px',
                      background: '#E8EBEA',
                      padding: '12px 16px',
                      maxWidth: '85%',
                    } : undefined}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className={`mb-3 last:mb-0 ${isUser ? 'text-gray-900' : 'text-gray-800'}`}>{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.message}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sheet View */}
      {viewState === 'sheet' && chatData && (
        <SharedMessageSheet
          data={chatData}
          onClose={handleSheetClose}
          onTalkToAugust={handleTalkToAugust}
        />
      )}

      {/* CTA Modal View */}
      {viewState === 'cta' && (
        <ShareCtaModal onClose={handleCtaClose} />
      )}
    </div>
  );
}
