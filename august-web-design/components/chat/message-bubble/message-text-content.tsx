'use client';

import { memo } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { AttachmentPreview } from './attachment-preview';
import { MarkdownContent, messageMarkdownComponents } from './markdown-content';

interface FontSize {
  fontSize: number;
  lineHeight: number;
}

interface MessageTextContentProps {
  message: Message;
  isUser: boolean;
  isVoiceOnly: boolean;
  otherAttachments: NonNullable<Message['attachments']>;
  desktop: FontSize;
  mobile: FontSize;
  clampLines?: number;
}

function MessageTextContentImpl({
  message,
  isUser,
  isVoiceOnly,
  otherAttachments,
  desktop,
  mobile,
  clampLines,
}: MessageTextContentProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-1',
        isVoiceOnly && isUser ? 'items-end' : 'items-start',
        isUser && !isVoiceOnly ? 'bg-[#EDEBE5] text-[#141515]' : '',
        isVoiceOnly && 'w-[300px]'
      )}
      style={
        isUser
          ? {
              borderRadius: '12px',
              padding: isVoiceOnly ? '0px' : '12px',
            }
          : {
              borderRadius: '16px',
              padding: isVoiceOnly ? '0px' : '2px 0px',
            }
      }
    >
      {/* Non-image attachments */}
      {otherAttachments.length > 0 && (
        <div className="mb-2 space-y-2">
          {otherAttachments.map((attachment, index) => (
            <AttachmentPreview key={index} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Text content */}
      {message.text && (
        <div
          className={`break-words message-text-content ${isUser ? 'user-message' : 'bot-message'} ${clampLines ? 'clamp' : ''}`}
        >
          <style jsx>{`
            .message-text-content {
              font-family: "SF Pro", system-ui, -apple-system, sans-serif;
              font-weight: 400;
            }
            .clamp {
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: ${clampLines ?? 0};
              line-clamp: ${clampLines ?? 0};
              overflow: hidden;
            }
            .bot-message {
              font-size: ${mobile.fontSize}px;
              line-height: ${mobile.lineHeight}px;
              color: #272A29;
            }
            .user-message {
              font-size: ${mobile.fontSize}px;
              line-height: ${mobile.lineHeight}px;
            }
            @media (min-width: 1024px) {
              .bot-message {
                font-size: ${desktop.fontSize}px;
                line-height: ${desktop.lineHeight}px;
              }
              .user-message {
                font-size: ${desktop.fontSize}px;
                line-height: ${desktop.lineHeight}px;
              }
            }
          `}</style>
          <MarkdownContent text={message.text} components={messageMarkdownComponents} />
        </div>
      )}

      {/* Processed output (markdown) */}
      {message.processedOutput && (
        <div className="mt-2 border-t border-current/10 pt-2">
          <div className="prose prose-sm max-w-none">
            <MarkdownContent text={message.processedOutput} />
          </div>
        </div>
      )}

      {message.transcription && (
        <>
          <p
            className={cn(
              'mt-2 italic opacity-75 break-words transcription-text',
              isVoiceOnly ? 'pl-4 w-full' : 'max-w-[230px]',
              isVoiceOnly && isUser && 'text-right'
            )}
          >
            {message.transcription}
          </p>
          <style jsx>{`
            .transcription-text {
              font-size: ${mobile.fontSize - 2}px;
              line-height: ${mobile.lineHeight - 2}px;
            }
            @media (min-width: 1024px) {
              .transcription-text {
                font-size: ${desktop.fontSize - 2}px;
                line-height: ${desktop.lineHeight - 2}px;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

export const MessageTextContent = memo(MessageTextContentImpl);
