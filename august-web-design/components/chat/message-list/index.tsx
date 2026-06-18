'use client';

import { useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { fetchOlderMessages, refreshChatHistory } from '@/services/chat-service';
import { Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { useI18n } from '@/components/providers';
import { PROCESSING_TEXT_KEYS } from './constants';
import { formatDateSeparator, getDateKey } from './date-utils';
import { MessageRow } from './message-row';
import { MessageSkeleton } from './message-skeleton';
import { TypingIndicator } from './typing-indicator';
import { FileProcessingIndicator } from './file-processing-indicator';
import { ReportCitationIndicator } from './report-citation-indicator';
import { TextSize } from '@/types';

interface MessageListProps {
  textSize?: TextSize;
}

const PULL_THRESHOLD = 50;
const SCROLL_BUTTON_THRESHOLD = 50;

export function MessageList({ textSize = 'small' }: MessageListProps) {
  // Granular selectors so the list only re-renders when a slice it actually
  // uses changes — not on every unrelated chat-store mutation.
  const messages = useChatStore((s) => s.messages);
  const isLoadingChats = useChatStore((s) => s.isLoadingChats);
  const isWaitingForResponse = useChatStore((s) => s.isWaitingForResponse);
  const isProcessingFile = useChatStore((s) => s.isProcessingFile);
  const processingFileTimestamp = useChatStore((s) => s.processingFileTimestamp);
  const hasMoreMessages = useChatStore((s) => s.hasMoreMessages);
  const reportCitations = useChatStore((s) => s.reportCitations);
  const setIsProcessingFile = useChatStore((s) => s.setIsProcessingFile);
  const setIsWaitingForResponse = useChatStore((s) => s.setIsWaitingForResponse);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const firstBotResponseRef = useRef<HTMLDivElement>(null);
  const [isAwaitingBotResponse, setIsAwaitingBotResponse] = useState(false);
  const [lastScrolledUserMsgId, setLastScrolledUserMsgId] = useState<string | null>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const touchStartY = useRef(0);
  const { t } = useI18n();
  const processingTexts = useMemo(
    () => PROCESSING_TEXT_KEYS.map((key) => t(key)),
    [t]
  );

  // Per-message render metadata. Derived solely from `messages`, so the (heavy)
  // grouping/date computation is not redone when the list re-renders from its
  // own scroll/pull state.
  const rows = useMemo(() => {
    const lastUserMsgIndex = messages.findLastIndex((m) => m.sender === 'user');
    return messages.map((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
      const isConsecutive = prevMessage?.sender === message.sender;
      const isLastInSenderGroup = !nextMessage || nextMessage.sender !== message.sender;

      const isLastUserMessage = message.sender === 'user' &&
        !messages.slice(index + 1).some((m) => m.sender === 'user');

      const isFirstBotAfterLastUser = message.sender === 'bot' &&
        lastUserMsgIndex !== -1 &&
        index === lastUserMsgIndex + 1;

      // For messages without timestamps, look ahead to find the next message with a timestamp
      const effectiveTimestamp = message.timestamp ||
        messages.slice(index + 1).find((m) => m.timestamp)?.timestamp ||
        Date.now();

      const prevEffectiveTimestamp = prevMessage
        ? (prevMessage.timestamp || messages.slice(index).find((m) => m.timestamp)?.timestamp || Date.now())
        : null;

      const showDateSeparator = !prevMessage ||
        !prevEffectiveTimestamp ||
        getDateKey(effectiveTimestamp) !== getDateKey(prevEffectiveTimestamp);

      return {
        message,
        isConsecutive,
        isLastInSenderGroup,
        isLastUserMessage,
        isFirstBotAfterLastUser,
        showDateSeparator,
        dateLabel: showDateSeparator ? formatDateSeparator(effectiveTimestamp) : '',
      };
    });
  }, [messages]);

  // Collapse consecutive collapsible bot messages (a consult turn's answer) into
  // a single group so they share ONE "Read more" toggle. Everything else stays a
  // standalone row.
  type Row = (typeof rows)[number];
  const renderItems = useMemo(() => {
    const items: Array<{ kind: 'row'; row: Row } | { kind: 'group'; anchorId: string; rows: Row[] }> = [];
    let i = 0;
    const isColl = (r: Row) => r.message.sender === 'bot' && !!r.message.collapsible;
    while (i < rows.length) {
      if (isColl(rows[i])) {
        const group: Row[] = [];
        const anchorId = rows[i].message.id;
        while (i < rows.length && isColl(rows[i])) {
          group.push(rows[i]);
          i++;
        }
        items.push({ kind: 'group', anchorId, rows: group });
      } else {
        items.push({ kind: 'row', row: rows[i] });
        i++;
      }
    }
    return items;
  }, [rows]);

  const toggleGroup = useCallback((anchorId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(anchorId)) next.delete(anchorId);
      else next.add(anchorId);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    const prevScrollHeight = prevScrollHeightRef.current;

    if (prevScrollHeight !== null && scrollContainer) {
      const newScrollHeight = scrollContainer.scrollHeight;
      const addedHeight = newScrollHeight - prevScrollHeight;
      scrollContainer.scrollTop = addedHeight;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    if (reportCitations.length === 0) return;
    if (isAwaitingBotResponse) return;
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [reportCitations, isAwaitingBotResponse]);

  // ChatGPT-style scroll: user message to top, response fills below
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current !== null) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id;
    const prevLastMessageId = lastMessageIdRef.current;
    const isNewMessage = lastMessageId !== prevLastMessageId;

    if (isNewMessage && lastMessage?.sender === 'user') {
      setIsAwaitingBotResponse(true);
      setLastScrolledUserMsgId(lastMessageId); // Track which message to scroll to
    } else if (isNewMessage && lastMessage?.sender === 'bot') {
      if (!isAwaitingBotResponse) {
        bottomRef.current?.scrollIntoView({
          behavior: prevLastMessageId ? 'smooth' : 'instant'
        });
      }
    } else if (!prevLastMessageId && messages.length > 0) {
      // Initial load - scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }

    lastMessageIdRef.current = lastMessageId;
  }, [messages, isAwaitingBotResponse]);

  useLayoutEffect(() => {
    if (!lastScrolledUserMsgId) return;

    setTimeout(() => {
      const container = scrollRef.current;
      const el = lastUserMessageRef.current;
      if (container && el) {
        container.scrollTo({
          top: el.offsetTop,
          behavior: 'smooth',
        });
      }
    }, 0);
  }, [lastScrolledUserMsgId]);

  useLayoutEffect(() => {
    if (!isAwaitingBotResponse) {
      setSpacerHeight(0);
      return;
    }

    const container = scrollRef.current;
    const userMsgEl = lastUserMessageRef.current;
    const bottomEl = bottomRef.current;

    if (!container || !userMsgEl || !bottomEl) {
      setSpacerHeight(container?.clientHeight || 0);
      return;
    }

    const viewportHeight = container.clientHeight;
    const userMsgTop = userMsgEl.offsetTop;
    const contentEnd = bottomEl.offsetTop;
    const contentBelowUserMsg = contentEnd - userMsgTop;
    const neededSpacer = Math.max(0, viewportHeight - contentBelowUserMsg);
    setSpacerHeight(neededSpacer);
  }, [isAwaitingBotResponse, messages, reportCitations]);

  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingOlderRef = useRef(false);

  const handleLoadMore = useCallback(async () => {
    if (!hasMoreMessages || isLoadingChats || isLoadingOlderRef.current) return;

    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }

    loadMoreTimeoutRef.current = setTimeout(async () => {
      if (!hasMoreMessages || isLoadingChats || isLoadingOlderRef.current) return;
      isLoadingOlderRef.current = true;
      prevScrollHeightRef.current = scrollRef.current?.scrollHeight || null;
      await fetchOlderMessages();
      await new Promise(resolve => setTimeout(resolve, 300));

      isLoadingOlderRef.current = false;
    }, 300);
  }, [hasMoreMessages, isLoadingChats]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setShowScrollButton(distanceFromBottom > SCROLL_BUTTON_THRESHOLD);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMessages && !isLoadingChats) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (topSentinelRef.current) {
      observerRef.current.observe(topSentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore, hasMoreMessages, isLoadingChats]);

  // Pull up to refresh handlers (at the bottom)
  const isAtBottom = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    return scrollHeight - scrollTop - clientHeight < 5;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAtBottom()) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isAtBottom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;

    if (diff > 0 && isAtBottom()) {
      setPullDistance(Math.min(diff * 0.5, PULL_THRESHOLD + 20));
    }
  }, [isPulling, isRefreshing, isAtBottom]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await refreshChatHistory();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, isRefreshing]);

  if (isLoadingChats && messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden p-4 space-y-4">
        <MessageSkeleton isUser={false} />
        <MessageSkeleton isUser={true} />
        <MessageSkeleton isUser={false} />
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Scroll to bottom button - positioned outside scroll container */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card text-muted-foreground rounded-full p-2 shadow-lg hover:bg-muted transition-all duration-200 z-20 border border-border"
          aria-label={t('chat.scrollToBottom')}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

      <div
        className="h-full overflow-y-auto scrollbar-hide-mobile"
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      <style jsx>{`
        @media (max-width: 1023px) {
          .scrollbar-hide-mobile::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide-mobile {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
      <div
        className="py-4 max-w-3xl mx-auto px-[4px]"
        style={{
          transform: `translateY(${-pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Top sentinel for infinite scroll */}
        <div ref={topSentinelRef} className="h-1" />

        {/* Loading indicator for older messages */}
        {isLoadingChats && hasMoreMessages && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#206E55]" />
          </div>
        )}

        {/* Messages */}
        {renderItems.map((item) => {
          if (item.kind === 'row') {
            const row = item.row;
            return (
              <div
                key={row.message.id}
                ref={
                  row.isLastUserMessage
                    ? lastUserMessageRef
                    : row.isFirstBotAfterLastUser
                      ? firstBotResponseRef
                      : undefined
                }
              >
                <MessageRow
                  message={row.message}
                  isConsecutive={row.isConsecutive}
                  isLastInSenderGroup={row.isLastInSenderGroup}
                  showDateSeparator={row.showDateSeparator}
                  dateLabel={row.dateLabel}
                  textSize={textSize}
                />
              </div>
            );
          }

          // Collapsible group — one clamp + one toggle for all its messages.
          const collapsed = !expandedGroups.has(item.anchorId);
          const anchorIsFirstBot = item.rows[0]?.isFirstBotAfterLastUser;
          return (
            <div key={`group:${item.anchorId}`} ref={anchorIsFirstBot ? firstBotResponseRef : undefined}>
              <div
                className="relative overflow-hidden transition-[max-height] duration-200"
                style={collapsed ? { maxHeight: 160 } : undefined}
              >
                {item.rows.map((row) => (
                  <MessageRow
                    key={row.message.id}
                    message={row.message}
                    isConsecutive={row.isConsecutive}
                    isLastInSenderGroup={row.isLastInSenderGroup}
                    showDateSeparator={row.showDateSeparator}
                    dateLabel={row.dateLabel}
                    textSize={textSize}
                  />
                ))}
                {collapsed && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                    style={{ background: 'linear-gradient(to bottom, rgba(250,249,245,0), #FAF9F5)' }}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleGroup(item.anchorId)}
                className="ml-3 mt-1 text-sm font-medium"
                style={{ color: '#206E55', cursor: 'pointer' }}
              >
                {collapsed ? 'Read more' : 'Read less'}
              </button>
            </div>
          );
        })}

        {/* Report citation indicator */}
        {reportCitations.length > 0 && (
          <div className="flex px-4 py-2 justify-start">
            <ReportCitationIndicator citations={reportCitations} />
          </div>
        )}

        {/* Typing indicator */}
        {isWaitingForResponse && reportCitations.length === 0 && (
          <div className="flex px-4 py-2 justify-start">
            <TypingIndicator />
          </div>
        )}

        {/* File processing indicator */}
        {isProcessingFile && !isWaitingForResponse && reportCitations.length === 0 && (
          <div className="flex px-4 py-2 justify-start">
            <FileProcessingIndicator
              startTime={processingFileTimestamp}
              onTimeout={() => {
                setIsProcessingFile(false);
                setIsWaitingForResponse(true);
              }}
              texts={processingTexts}
            />
          </div>
        )}

        {/* Bottom anchor for scroll-to-bottom (before spacer = end of actual content) */}
        <div ref={bottomRef} />

        {/* Dynamic spacer for ChatGPT-style scroll */}
        {/* Height shrinks as bot response grows, keeping user message scrollable to top */}
        <div
          className="overflow-hidden"
          style={{
            height: spacerHeight,
            transition: isAwaitingBotResponse ? 'none' : 'height 300ms ease-out',
          }}
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        />
      </div>

      {/* Pull up to refresh indicator */}
      <div
        className="flex justify-center items-center transition-all duration-200 overflow-hidden"
        style={{
          height: pullDistance,
        }}
      >
        <div
          className={`flex items-center gap-2 text-muted-foreground ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
            transform: `rotate(${isRefreshing ? 0 : 180 - (pullDistance / PULL_THRESHOLD) * 180}deg)`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
