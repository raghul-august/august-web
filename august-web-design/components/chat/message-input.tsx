'use client';

import { useState, useRef, useCallback, KeyboardEvent, useEffect, memo } from 'react';
import { Plus, Loader2, FileText, X } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { sendMessage } from '@/services/chat-service';
import { sendMessageStreaming } from '@/services/streaming-service';
import { uploadMedia, isValidFileType, UploadedFile } from '@/services/media-service';
import { useSearchParams } from 'next/navigation';
import { track } from '@/services/analytics-service';
import { track as trackMeta } from '@/app/utils/analytics';
import { getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { trackClevertap } from '@/utils/clevertap';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useChatInputFocusStore } from '@/stores/chat-input-focus-store';
import { cn } from '@/lib/utils';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { useI18n } from '@/components/providers';
import { VoiceRecorderUI } from './voice-recorder-ui';
import { TextSize } from '@/types';
import { ANON_TELEHEALTH_PARAM, TELEHEALTH_ANON_ROUTE_KEY } from '@/lib/anon-access';



// Input is 3px smaller than bot message size 
const INPUT_SIZE_MAP: Record<TextSize, number> = {
  small: 15,
  medium: 17,
  large: 21,
};

interface MessageInputProps {
  centered?: boolean;
  textSize?: TextSize;
  prefillText?: string;
  onPrefillConsumed?: () => void;
  showDisabledSendWhenEmpty?: boolean;
}

interface AttachedFile {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded?: UploadedFile;
  error?: string;
}

function SendArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M13.1208 6.59398H0.8125C0.581931 6.59398 0.388917 6.51616 0.233458 6.36052C0.0778193 6.20506 0 6.01205 0 5.78148C0 5.55091 0.0778193 5.3579 0.233458 5.20244C0.388917 5.0468 0.581931 4.96898 0.8125 4.96898H13.1208L9.55419 1.40238C9.39313 1.24114 9.3136 1.05255 9.31559 0.836604C9.31775 0.62066 9.39729 0.42864 9.55419 0.260543C9.72229 0.092626 9.9153 0.00586778 10.1332 0.000270552C10.3513 -0.00532667 10.5444 0.0759234 10.7125 0.244021L15.5645 5.096C15.666 5.19747 15.7375 5.30445 15.779 5.41694C15.8207 5.52943 15.8416 5.65094 15.8416 5.78148C15.8416 5.91202 15.8207 6.03354 15.779 6.14602C15.7375 6.25851 15.666 6.36549 15.5645 6.46696L10.7125 11.3189C10.5513 11.48 10.36 11.5595 10.1386 11.5575C9.91711 11.5554 9.72229 11.4703 9.55419 11.3024C9.39729 11.1343 9.31604 10.944 9.31044 10.7315C9.30484 10.519 9.38609 10.3287 9.55419 10.1606L13.1208 6.59398Z" fill="white"/>
    </svg>
  );
}

function MessageInputImpl({ centered = false, textSize = 'small', prefillText, onPrefillConsumed, showDisabledSendWhenEmpty = false }: MessageInputProps) {
  const inputFontSize = INPUT_SIZE_MAP[textSize];
  const [text, setText] = useState(prefillText || '');
  const [isSending, setIsSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Granular selectors: the input only depends on these two flags, so it must
  // not re-render on every unrelated chat-store change (notably the per-token
  // `messages` updates while a bot response is streaming).
  const isWaitingForResponse = useChatStore((s) => s.isWaitingForResponse);
  const chatBlocked = useChatStore((s) => s.chatBlocked);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useI18n();
  const pendingFocus = useChatInputFocusStore((s) => s.pendingFocus);
  const consumeFocus = useChatInputFocusStore((s) => s.consumeFocus);
  const searchParams = useSearchParams();

  // Remember this session arrived via the telehealth widget
  // (?anon_telehealth=true) so the "telehealth_send_message" Meta event still
  // fires even if the param later drops from the URL after navigation.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (searchParams?.get(ANON_TELEHEALTH_PARAM) === 'true') {
      try { sessionStorage.setItem(TELEHEALTH_ANON_ROUTE_KEY, '1'); } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      onPrefillConsumed?.();
    }
  }, [prefillText, onPrefillConsumed]);

  // Honor an external focus request (e.g. the New Consult modal closing). Runs
  // both when the flag flips while mounted and on mount after a route change.
  useEffect(() => {
    if (pendingFocus && !chatBlocked) {
      inputRef.current?.focus();
      consumeFocus();
    }
  }, [pendingFocus, chatBlocked, consumeFocus]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!isValidFileType(file)) {
      alert(t('chat.input.invalidFileType'));
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    // Add file to attached files
    const newAttachedFile: AttachedFile = {
      file,
      preview,
      uploading: true,
    };

    setAttachedFiles((prev) => [...prev, newAttachedFile]);

    // Upload file
    try {
      const uploaded = await uploadMedia(file);
      setAttachedFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, uploading: false, uploaded } : f
        )
      );
      track('uploaded_media', {
        ...getTelehealthBaseParams(),
        source: isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
        file_type: file.type,
      });
      trackClevertap('Media Upload', { source: 'gallery' });
    } catch (error) {
      const serialized = serializeError(error);
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 401) {
        logger.error('Failed to upload file', serialized);
      }
      setAttachedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, uploading: false, error: t('chat.input.uploadFailed') }
            : f
        )
      );
    }
  }, [t]);

  const removeAttachedFile = useCallback((file: File) => {
    setAttachedFiles((prev) => {
      const toRemove = prev.find((f) => f.file === file);
      if (toRemove?.preview) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter((f) => f.file !== file);
    });
  }, []);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    const uploadedFiles = attachedFiles
      .filter((f) => f.uploaded)
      .map((f) => f.uploaded!);

    if (!trimmedText && uploadedFiles.length === 0) return;
    if (isSending || isWaitingForResponse || chatBlocked) return;

    // Check if any files are still uploading
    if (attachedFiles.some((f) => f.uploading)) {
      alert(t('chat.input.waitForUploads'));
      return;
    }

    // Check for upload errors
    if (attachedFiles.some((f) => f.error)) {
      alert(t('chat.input.removeFailedUploads'));
      return;
    }

    setIsSending(true);
    setText('');
    setAttachedFiles([]);

    const hasAttachments = uploadedFiles.length > 0;
    track('send_message', {
      ...getTelehealthBaseParams(),
      source: isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
      has_attachment: hasAttachments,
      context: 'manual_input',
      is_anon: !isAuthenticated,
    });
    trackClevertap('Sent Message', { type: hasAttachments ? 'attachment' : 'text', hasText: Boolean(trimmedText), message_length: trimmedText.length });

    // Meta Pixel: first message a telehealth-widget visitor sends here. Once
    // per session, anon_telehealth route only.
    if (typeof window !== 'undefined') {
      try {
        if (
          sessionStorage.getItem(TELEHEALTH_ANON_ROUTE_KEY) === '1' &&
          !sessionStorage.getItem('telehealth_send_message_fired')
        ) {
          sessionStorage.setItem('telehealth_send_message_fired', '1');
          trackMeta('telehealth_send_message');
        }
      } catch {}
    }

    try {
      await sendMessage(trimmedText, uploadedFiles);
    } catch (error) {
      logger.error('Failed to send message', serializeError(error));
    } finally {
      setIsSending(false);
      if (window.innerWidth < 1024) {
        inputRef.current?.blur();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [text, isSending, isWaitingForResponse, chatBlocked, attachedFiles, t]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = text.trim() || attachedFiles.some((f) => f.uploaded);
  const canSend = hasContent && !isSending && !isWaitingForResponse && !chatBlocked && !attachedFiles.some((f) => f.uploading);
  const showSendButton = hasContent || showDisabledSendWhenEmpty;

  return (
    <div className={cn('px-2 pb-2 lg:p-0', centered && 'w-full')}>
      <div className="w-full">
        {/* Chat input container*/}
        <div
          style={{
            borderRadius: isFocused ? '20px' : '24px',
            border: isFocused ? '0.5px solid #A8A39A' : '1px solid #E0DDD5',
            background: isFocused ? '#FFF' : '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 16px 12px 16px',
            alignSelf: 'stretch',
            boxShadow: isFocused
              ? '0 4px 12px 0 rgba(0, 0, 0, 0.06)'
              : '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
            transition: 'border-radius 120ms ease, border-color 120ms ease, background 120ms ease, box-shadow 120ms ease',
          }}
        >
          {/* Attached files preview - inside the input container */}
          {attachedFiles.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {attachedFiles.map((attachedFile, index) => (
                <div
                  key={index}
                  className="relative"
                  style={{ width: '64px', height: '64px' }}
                >
                  {attachedFile.preview ? (
                    <img
                      src={attachedFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '12px' }}
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-[#EDEBE5] flex items-center justify-center"
                      style={{ borderRadius: '12px' }}
                    >
                      <FileText className="h-6 w-6 text-[#5a564e]" />
                    </div>
                  )}
                  {/* Uploading overlay */}
                  {attachedFile.uploading && (
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center"
                      style={{ borderRadius: '12px' }}
                    >
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {/* Error overlay */}
                  {attachedFile.error && (
                    <div
                      className="absolute inset-0 bg-red-500/40 flex items-center justify-center"
                      style={{ borderRadius: '12px' }}
                    >
                      <span className="text-white text-xs">
                        {attachedFile.error || t('common.error')}
                      </span>
                    </div>
                  )}
                  {/* X button inside preview */}
                  <button
                    onClick={() => removeAttachedFile(attachedFile.file)}
                    className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Voice recorder or normal input */}
          {isVoiceRecording ? (
            <VoiceRecorderUI onClose={() => setIsVoiceRecording(false)} />
          ) : (
            <>
              {/* Top row: Text input area */}
              <div className="w-full mb-1">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    handleFileSelect(e.target.files);
                    e.target.value = '';
                  }}
                />

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { setIsFocused(true); trackClevertap('Chat Input Tapped', {}); }}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t('chat.input.placeholder')}
                  rows={1}
                  disabled={chatBlocked}
                  className={cn(
                    'w-full bg-transparent border-none outline-none chat-input-textarea resize-none overflow-y-auto pl-1 pt-[4px]',
                    chatBlocked && 'cursor-not-allowed opacity-60',
                  )}
                  style={{
                    fontWeight: 400,
                    lineHeight: '1.4',
                    background: 'transparent',
                    color: 'inherit',
                    maxHeight: '150px',
                    minHeight: '28px',
                    fieldSizing: 'content',
                  } as React.CSSProperties}
                />
                <style jsx>{`
                  .chat-input-textarea {
                    font-size: ${inputFontSize}px;
                  }
                  .chat-input-textarea::placeholder {
                    color: #4E5553 !important;
                    font-size: ${inputFontSize}px !important;
                    font-weight: 400 !important;
                  }
                `}</style>
              </div>

              {/* Bottom row: Attachment button on left, mic/send on right */}
              <div className="flex items-center justify-between w-full">
                {/* Left side: Attachment button */}
                <Tooltip content={t('chat.input.attachTooltip')} position="top">
                  <button
                    type="button"
                    onClick={() => { trackClevertap('Attach Button Clicked', {}); fileInputRef.current?.click(); }}
                    disabled={chatBlocked}
                    className={cn(
                      'h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors hover:bg-[#E8EBEA]',
                      chatBlocked && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                    )}
                    tabIndex={-1}
                    data-tour="attachment-button"
                  >
                    <Plus className="h-5 w-5 text-[#4E5553]" />
                  </button>
                </Tooltip>

                {/* Right side: Mic or Send button */}
                <div className="flex items-center">
                  {showSendButton ? (
                    /* Send button - usually shown with content; some flows keep it visible while empty as disabled */
                    <Tooltip content={t('chat.input.sendTooltip')} position="top">
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!canSend}
                        className={cn(
                          'h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors',
                          canSend
                            ? 'bg-[#206E55] text-white hover:bg-[#1a5a46]'
                            : 'bg-[#206E55]/50 text-white cursor-not-allowed'
                        )}
                      >
                        <SendArrowIcon />
                      </button>
                    </Tooltip>
                  ) : (
                    /* Mic button - only show when no content */
                    <Tooltip content={t('chat.input.voiceTooltip')} position="top">
                      <button
                        type="button"
                        onClick={() => {
                          track('voice_input_tapped', {
                            ...getTelehealthBaseParams(),
                            source: isAuthenticated ? 'telehealth_loggeinuser_chat' : 'telehealth_anon_chat',
                          });
                          trackClevertap('Voice Recording Started', {});
                          setIsVoiceRecording(true);
                        }}
                        disabled={chatBlocked}
                        className={cn(
                          'h-9 w-9 flex items-center justify-center rounded-full shrink-0 transition-colors hover:bg-[#E8EBEA]',
                          chatBlocked && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                        )}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 16.5C13.1931 16.4988 14.337 16.0243 15.1806 15.1806C16.0243 14.337 16.4988 13.1931 16.5 12V6C16.5 4.80653 16.0259 3.66193 15.182 2.81802C14.3381 1.97411 13.1935 1.5 12 1.5C10.8065 1.5 9.66193 1.97411 8.81802 2.81802C7.97411 3.66193 7.5 4.80653 7.5 6V12C7.50124 13.1931 7.97575 14.337 8.81939 15.1806C9.66303 16.0243 10.8069 16.4988 12 16.5ZM9 6C9 5.20435 9.31607 4.44129 9.87868 3.87868C10.4413 3.31607 11.2044 3 12 3C12.7956 3 13.5587 3.31607 14.1213 3.87868C14.6839 4.44129 15 5.20435 15 6V12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12V6ZM12.75 19.4625V22.5C12.75 22.6989 12.671 22.8897 12.5303 23.0303C12.3897 23.171 12.1989 23.25 12 23.25C11.8011 23.25 11.6103 23.171 11.4697 23.0303C11.329 22.8897 11.25 22.6989 11.25 22.5V19.4625C9.40091 19.2743 7.68728 18.4072 6.44048 17.0288C5.19368 15.6504 4.50228 13.8586 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25C5.44891 11.25 5.63968 11.329 5.78033 11.4697C5.92098 11.6103 6 11.8011 6 12C6 13.5913 6.63214 15.1174 7.75736 16.2426C8.88258 17.3679 10.4087 18 12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12C18 11.8011 18.079 11.6103 18.2197 11.4697C18.3603 11.329 18.5511 11.25 18.75 11.25C18.9489 11.25 19.1397 11.329 19.2803 11.4697C19.421 11.6103 19.5 11.8011 19.5 12C19.4977 13.8586 18.8063 15.6504 17.5595 17.0288C16.3127 18.4072 14.5991 19.2743 12.75 19.4625Z" fill="#7A7468"/>
                        </svg>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <p
          className="text-center mt-2 mb-1"
          style={{
            color: '#767F7C',
            fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '14px',
          }}
        >
          {t('chat.input.disclaimer')}
        </p>
      </div>
    </div>
  );
}

export const MessageInput = memo(MessageInputImpl);
