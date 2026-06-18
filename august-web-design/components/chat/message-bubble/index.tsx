'use client';

import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Message, TextSize } from '@/types';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chat-store';
import { extractAllUrls, findMatchedDomain } from '@/utils/link-preview';
import { DoctorConsultCTA } from '../doctor-consult-cta';
import { LinkPreviewSlot } from '../link-preview-slot';
import {
  BOT_TEXT_SIZE_MAP,
  USER_TEXT_SIZE_MAP,
  MOBILE_BOT_TEXT_SIZE_MAP,
  MOBILE_USER_TEXT_SIZE_MAP,
} from './constants';
import { AttachmentPreview } from './attachment-preview';
import { MessageTextContent } from './message-text-content';
import { MessageActions } from './message-actions';
import { StartOverButton } from './start-over-button';


interface MessageBubbleProps {
  message: Message;
  isConsecutive?: boolean;
  isLastInSenderGroup?: boolean;
  textSize?: TextSize;
}

function MessageBubbleImpl({
  message,
  isConsecutive = false,
  isLastInSenderGroup = true,
  textSize = 'small',
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const desktop = isUser ? USER_TEXT_SIZE_MAP[textSize] : BOT_TEXT_SIZE_MAP[textSize];
  const mobile = isUser ? MOBILE_USER_TEXT_SIZE_MAP[textSize] : MOBILE_BOT_TEXT_SIZE_MAP[textSize];
  const pathname = usePathname();

  // Primitive/boolean selectors so this bubble only re-renders when the value
  // that actually affects it flips — not on every store message mutation.
  const isLastMessage = useChatStore(
    (state) => state.messages[state.messages.length - 1]?.id === message.id
  );
  const chatBlocked = useChatStore((state) => state.chatBlocked);
  const specialEvent = useChatStore((state) => state.specialEvent);

  // Only the most recent bot message should host the Start over button —
  // chatBlocked lives on the store, so without this guard every blocked
  // bubble in the thread would render its own copy. The approved event
  // also flips chatBlocked on, but the clinician's review card is still
  // pending — suppress Start over until the decision lands.
  const isAwaitingRefillDecision = specialEvent === 'prescription_refill_approved';
  const showBlockedStartOver =
    chatBlocked && !isUser && isLastMessage && !isAwaitingRefillDecision;
  const showPrescriptionRefillDisclaimer =
    showBlockedStartOver && pathname?.startsWith('/prescription-refill/chat');

  const providerMessageId = !isUser
    ? message.providerMessageId || undefined
    : undefined;
  const canShowFeedback = Boolean(
    !isUser && providerMessageId && !message.isStreaming && isLastInSenderGroup
    && !message.collapsible
  );

  // Separate media attachments (images and PDFs) from other content
  const mediaAttachments = message.attachments?.filter(a => a.type === 'image' || a.type === 'pdf') || [];
  const otherAttachments = message.attachments?.filter(a => a.type !== 'image' && a.type !== 'pdf') || [];
  const isVoiceOnly = otherAttachments.length === 1 && otherAttachments[0].type === 'voice' && !message.text && !message.processedOutput;
  const hasTextContent = message.text || message.processedOutput || message.transcription || otherAttachments.length > 0;

  // Link previews: only for bot messages, only for URLs in the allowlist
  // (mirrors the mobile pattern). Cards render below the bubble.
  const previewUrls = useMemo(
    () =>
      isUser
        ? []
        : extractAllUrls(message.text).filter((u) => findMatchedDomain(u)),
    [isUser, message.text]
  );

  // Spacing: bot-to-bot = 8px (pt-2), bot-after-user = 16px (pt-4)
  const spacingClass = isUser ? 'pt-2' : isConsecutive ? 'pt-2' : 'pt-4';

  if (message.messageType === 'doctor_consultation_component') {
    return (
      <div className={cn('flex justify-start pl-3 pr-6', spacingClass)}>
        <div className="w-full max-w-[600px] ">
          <DoctorConsultCTA consultation={message.consultation} textSize={textSize} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end px-3' : 'justify-start pl-3 pr-6',
        spacingClass
      )}
    >
      {/* Message content */}
      <div
        className={cn(
          'flex flex-col gap-1',
          isUser ? 'items-end max-w-[70%]' : 'items-start'
        )}
      >
        {/* Media attachments (images and PDFs) - outside the bubble */}
        {mediaAttachments.length > 0 && (
          <div className="space-y-2">
            {mediaAttachments.map((attachment, index) => (
              <AttachmentPreview key={index} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Text bubble - only show if there's text content. Collapse for a
            consult turn is handled at the group level in MessageList (one
            toggle for all the messages that precede the consult card). */}
        {hasTextContent && (
          <MessageTextContent
            message={message}
            isUser={isUser}
            isVoiceOnly={isVoiceOnly}
            otherAttachments={otherAttachments}
            desktop={desktop}
            mobile={mobile}
          />
        )}

        {previewUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {previewUrls.map((u) => (
              <LinkPreviewSlot key={u} url={u} />
            ))}
          </div>
        )}

        {showBlockedStartOver && (
          <StartOverButton showDisclaimer={Boolean(showPrescriptionRefillDisclaimer)} />
        )}

        {canShowFeedback && providerMessageId && (
          <MessageActions message={message} providerMessageId={providerMessageId} />
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleImpl);
