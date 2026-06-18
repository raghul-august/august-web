'use client';

import { memo, useState } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/providers';
import { ThumbsUp, ThumbsDown, Share2, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { submitMessageFeedback } from '@/services/feedback-service';
import { createPublicShare } from '@/services/share-service';
import { useChatStore } from '@/stores/chat-store';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import { readMessageGroup, stopAudio } from '@/services/tts-service';

interface MessageActionsProps {
  message: Message;
  providerMessageId: string;
}

// The contiguous run of bot messages ending at `messageId`, used by copy/share/
// read-aloud to operate on the whole answer group. Reads the store
// imperatively so this component does not re-render on every message change.
function getMessageGroup(messageId: string): Message[] {
  const { messages } = useChatStore.getState();
  const currentIndex = messages.findIndex((m) => m.id === messageId);
  const groupMessages: Message[] = [];

  for (let i = currentIndex; i >= 0; i--) {
    const msg = messages[i];
    if (msg.sender !== 'bot') break;
    groupMessages.unshift(msg);
  }

  return groupMessages;
}

function MessageActionsImpl({ message, providerMessageId }: MessageActionsProps) {
  const { t } = useI18n();
  const updateMessage = useChatStore((state) => state.updateMessage);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isPlayingAudio = useChatStore(
    (state) => state.playingMessageId === message.id
  );

  const handleFeedback = async (direction: 'up' | 'down') => {
    if (!providerMessageId || isSubmittingFeedback) return;
    const value = direction === 'up' ? 'THUMBS_UP' : 'THUMBS_DOWN';
    if (message.feedback === value) return;

    try {
      setIsSubmittingFeedback(true);
      await submitMessageFeedback({
        providerMessageId,
        type: direction,
      });
      updateMessage(message.id, { feedback: value });
      track('message_feedback', {
        feedback_value: value,
        provider_message_id: providerMessageId,
      });
      trackClevertap('Message Feedback Submitted', { feedbackType: value, messageId: providerMessageId, messageLength: (message.processedOutput || message.text || '').length });
    } catch (error) {
      logger.error('Feedback submission error', serializeError(error));
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCopy = async () => {
    if (isCopied) return;
    const groupMessages = getMessageGroup(message.id);
    const textContent = groupMessages
      .map((msg) => msg.processedOutput || msg.text || '')
      .filter(Boolean)
      .join('\n\n');

    if (textContent) {
      await navigator.clipboard.writeText(textContent);
      trackClevertap('Message Copied', { messageId: providerMessageId || message.id, messageLength: textContent.length, messageCount: groupMessages.length });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (isSharing || !providerMessageId) return;

    try {
      setIsSharing(true);
      const groupMessages = getMessageGroup(message.id);
      const groupMessageIds = groupMessages
        .map((msg) => msg.providerMessageId)
        .filter((id): id is string => Boolean(id));

      if (groupMessageIds.length === 0) {
        logger.error('No message IDs to share');
        return;
      }

      const response = await createPublicShare(groupMessageIds);

      if (response.success) {
        const shareText = `${response.formatted_text}\n\n\n${response.link}`;
        if (navigator.share) {
          await navigator.share({
            title: 'Shared conversation with August',
            text: response.formatted_text,
            url: response.link,
          });
        } else {
          await navigator.clipboard.writeText(shareText);
        }

        track('message_share', {
          message_count: groupMessageIds.length,
          share_link: response.link,
        });
        trackClevertap('Message Share Button Pressed', { messageCount: groupMessageIds.length, messageId: providerMessageId });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        logger.error('Share error', serializeError(error));
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleReadAloud = async () => {
    if (isPlayingAudio) {
      await stopAudio();
      return;
    }

    try {
      const groupMessages = getMessageGroup(message.id);
      const messagesToRead = groupMessages
        .map((msg) => ({
          text: msg.processedOutput || msg.text || '',
          id: msg.id,
        }))
        .filter((m) => m.text);

      if (messagesToRead.length === 0) return;

      await readMessageGroup(messagesToRead, message.id);

      track('message_read_aloud', {
        message_count: messagesToRead.length,
      });
      trackClevertap('TTS Audio Played', { messageId: message.id, messageLength: messagesToRead.map(m => m.text).join('').length, messageCount: messagesToRead.length });
    } catch (error) {
      logger.error('TTS error', serializeError(error));
    }
  };

  return (
    <div className="flex items-stretch text-[#141515]/50 mt-0.5 mb-3">
      <div className="relative group">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-md transition-colors relative before:absolute before:inset-[-6px] before:content-[""]',
            isCopied
              ? 'text-[#206E55]'
              : 'hover:bg-[#EDEBE5] hover:text-[#141515]'
          )}
          aria-label={t('chat.feedback.copyMessage')}
        >
          {isCopied ? (
            <Check className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {isCopied ? t('chat.feedback.copied') : t('chat.feedback.copy')}
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-md transition-colors relative before:absolute before:inset-[-6px] before:content-[""]',
            'hover:bg-[#EDEBE5] hover:text-[#141515]',
            isSharing && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={t('chat.feedback.shareConversation')}
          data-tour="share-button"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {t('chat.feedback.share')}
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleFeedback('up')}
          disabled={isSubmittingFeedback}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-md transition-colors relative before:absolute before:inset-[-6px] before:content-[""]',
            message.feedback === 'THUMBS_UP'
              ? 'text-[#206E55]'
              : 'hover:bg-[#EDEBE5] hover:text-[#141515]'
          )}
          aria-pressed={message.feedback === 'THUMBS_UP'}
          data-tour="thumbs-up-button"
        >
          <ThumbsUp
            className="h-4 w-4"
            fill={message.feedback === 'THUMBS_UP' ? 'currentColor' : 'none'}
            strokeWidth={message.feedback === 'THUMBS_UP' ? 0 : 1.5}
          />
        </button>
        <span className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {t('chat.feedback.helpfulAnswer')}
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleFeedback('down')}
          disabled={isSubmittingFeedback}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-md transition-colors relative before:absolute before:inset-[-6px] before:content-[""]',
            message.feedback === 'THUMBS_DOWN'
              ? 'text-gray-400'
              : 'hover:bg-[#EDEBE5] hover:text-[#141515]'
          )}
          aria-pressed={message.feedback === 'THUMBS_DOWN'}
        >
          <ThumbsDown
            className="h-4 w-4"
            fill={message.feedback === 'THUMBS_DOWN' ? 'currentColor' : 'none'}
            strokeWidth={message.feedback === 'THUMBS_DOWN' ? 0 : 1.5}
          />
        </button>
        <span className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {t('chat.feedback.notHelpful')}
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={handleReadAloud}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-md transition-colors relative before:absolute before:inset-[-6px] before:content-[""]',
            isPlayingAudio
              ? 'text-[#206E55]'
              : 'hover:bg-[#EDEBE5] hover:text-[#141515]'
          )}
          aria-label={isPlayingAudio ? t('chat.feedback.stopReading') : t('chat.feedback.readAloud')}
        >
          {isPlayingAudio ? (
            <VolumeX className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Volume2 className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {isPlayingAudio ? t('chat.feedback.stop') : t('chat.feedback.readAloud')}
        </span>
      </div>
    </div>
  );
}

export const MessageActions = memo(MessageActionsImpl);
