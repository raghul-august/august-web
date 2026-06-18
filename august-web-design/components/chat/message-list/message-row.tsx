'use client';

import { memo } from 'react';
import { Message, TextSize } from '@/types';
import { MessageBubble } from '../message-bubble';
import { DateSeparator } from './date-separator';

interface MessageRowProps {
  message: Message;
  isConsecutive: boolean;
  isLastInSenderGroup: boolean;
  showDateSeparator: boolean;
  dateLabel: string;
  textSize: TextSize;
}

function MessageRowImpl({
  message,
  isConsecutive,
  isLastInSenderGroup,
  showDateSeparator,
  dateLabel,
  textSize,
}: MessageRowProps) {
  return (
    <>
      {showDateSeparator && <DateSeparator label={dateLabel} textSize={textSize} />}
      <MessageBubble
        message={message}
        isConsecutive={isConsecutive && !showDateSeparator}
        isLastInSenderGroup={isLastInSenderGroup}
        textSize={textSize}
      />
    </>
  );
}

/**
 * Memoized so the per-message rows are not re-rendered when the list re-renders
 * purely from its own scroll/pull state (spacer height, scroll button, pull
 * distance). Combined with the memoized MessageBubble, scroll churn no longer
 * re-parses markdown for the whole thread.
 */
export const MessageRow = memo(MessageRowImpl);
