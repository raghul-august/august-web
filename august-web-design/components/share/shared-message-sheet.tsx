'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/providers';

export interface SharedChat {
  id: string;
  title?: string;
  message: string;
  role: 'human' | 'assistant';
  timestamp: string;
  author_name?: string;
}

export interface PublicChatData {
  success: boolean;
  chats: SharedChat[];
  formatted_text?: string;
  user_name?: string;
  first_timestamp?: string;
  title?: string;
  author_name?: string;
  created_at?: string;
}

interface SharedMessageSheetProps {
  data: PublicChatData;
  onClose: () => void;
  onTalkToAugust: () => void;
}

export function SharedMessageSheet({ data, onClose, onTalkToAugust }: SharedMessageSheetProps) {
  const { t } = useI18n();
  const authorName = data.user_name || data.author_name || t('share.defaultAuthor', 'August User');
  const createdAt = data.first_timestamp;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-4">
          <h1 className="text-xl font-semibold text-center text-gray-900">
            {t('share.sheetTitle', 'Shared Message')}
          </h1>
        </div>

        {/* Content - Pill container with max height */}
        <div className="px-6 pb-4">
          <div
            style={{
              borderRadius: '16px',
              border: '1px solid #FFF',
              background: '#FAFAFA',
              boxShadow: '0 6px 16px 1px rgba(0, 0, 0, 0.03)',
              maxHeight: 'calc(100vh - 280px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Question Section */}
            <div className="p-4">
              <p className="text-sm text-gray-500">
                {authorName}
                {createdAt && (
                  <>
                    <span className="mx-2">·</span>
                    {formatDate(createdAt)}
                  </>
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Messages Content - Scrollable */}
            <div
              style={{
                overflowY: 'auto',
                flex: 1,
              }}
              className="p-4 space-y-4"
            >
              {data.chats.map((message, index) => {
                const isUser = message.role === 'human';
                return (
                  <div
                    key={message.id || index}
                    className={cn(
                      "text-sm",
                      isUser ? "flex justify-end" : ""
                    )}
                  >
                    <div
                      className={cn(
                        isUser ? "max-w-[85%]" : ""
                      )}
                      style={isUser ? {
                        borderRadius: '12px 0 12px 12px',
                        background: '#E8EBEA',
                        padding: '12px 16px',
                      } : undefined}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className={cn("mb-3 last:mb-0", isUser ? "text-gray-900" : "text-gray-800")}>{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          h1: ({ children }) => <p className="font-bold text-lg mb-2">{children}</p>,
                          h2: ({ children }) => <p className="font-bold text-base mb-2">{children}</p>,
                          h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                          code: ({ children }) => (
                            <code className="px-1 py-0.5 rounded bg-gray-100 text-sm">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="p-3 rounded-lg bg-gray-100 overflow-x-auto my-2">
                              {children}
                            </pre>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#206E55] underline"
                            >
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-gray-100">{children}</thead>
                          ),
                          tbody: ({ children }) => <tbody>{children}</tbody>,
                          tr: ({ children }) => (
                            <tr className="border-b border-gray-300">{children}</tr>
                          ),
                          th: ({ children }) => (
                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-gray-300 px-3 py-2">{children}</td>
                          ),
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
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 pt-2">
          <p
            className="text-center mb-2"
            style={{
              color: '#8A9390',
              fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontSize: '16px',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: '22px',
              letterSpacing: '-0.16px',
            }}
          >
            {t('share.followUpQuestion')}
          </p>
          <button
            onClick={onTalkToAugust}
            className={cn(
              "w-full py-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2",
              "bg-[#206E55] text-white hover:bg-[#1a5a46]"
            )}
            style={{ fontSize: '18px' }}
          >
            {t('share.talkToAugust')}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
