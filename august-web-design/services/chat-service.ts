import { v4 as uuidv4 } from 'uuid';
import axiosInstance from '@/lib/axios';
import { MESSAGE_SOURCE } from '@/lib/config';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { getActiveTenant } from '@/lib/tenant';
import { useIncognitoStore } from '@/stores/incognito-store';
import {
  ChatHistoryResponse,
  SendMessageRequest,
  WebhookResponse,
  Message,
} from '@/types';
import { notifyError, serializeError } from './error-reporter';
import logger from '@/utils/logger';
import type { UploadedFile } from '@/services/media-service';

// Track active poll interval to prevent multiple concurrent polls
let activePollInterval: NodeJS.Timeout | null = null;
let activePollTimeout: NodeJS.Timeout | null = null;

const HISTORY_TEXT_RECONCILE_WINDOW_MS = 4_000;

const previewText = (text?: string): string =>
  (text || '').replace(/\s+/g, ' ').slice(0, 120);

function getHistoryReconcileReason(
  existing: Message,
  serverMessage: Message
): { reason: string; timestampDeltaMs: number } | null {
  const timestampDeltaMs = Math.abs(existing.timestamp - serverMessage.timestamp);

  if (existing.id === serverMessage.id) {
    return { reason: 'id', timestampDeltaMs };
  }
  if (
    existing.providerMessageId &&
    serverMessage.providerMessageId &&
    existing.providerMessageId === serverMessage.providerMessageId
  ) {
    return { reason: 'providerMessageId', timestampDeltaMs };
  }

  if (
    existing.sender === 'bot' &&
      serverMessage.sender === 'bot' &&
      existing.text &&
      existing.text === serverMessage.text &&
      timestampDeltaMs <= HISTORY_TEXT_RECONCILE_WINDOW_MS
  ) {
    return { reason: 'sameBotTextWithinWindow', timestampDeltaMs };
  }

  return null;
}

/**
 * Fetch chat history from the server
 * @param limit - Number of messages to fetch
 * @param lastMessageId - ID of the last message for pagination
 * @param silent - If true, don't show loading indicator (used for background polling)
 */
export async function fetchChatHistory(
  limit: number = 50,
  lastMessageId?: string,
  silent: boolean = false
): Promise<void> {
  const chatStore = useChatStore.getState();

  try {
    if (!silent) {
      chatStore.setIsLoadingChats(true);
    }

    const params: Record<string, string | number> = { limit };
    if (lastMessageId) {
      params.last_message_id = lastMessageId;
    }

    const url = `/user/${getActiveTenant()}/get-chats?source=WEB_APP`;
    const response = await axiosInstance.get<ChatHistoryResponse>(url, { params });
    if (response.data.success) {
      const messages = chatStore.parseChatHistory(response.data.chats);
      const chatsArray = Object.values(response.data.chats);
      chatStore.setHasMoreMessages(chatsArray.length === limit);

      if (lastMessageId) {
        // Pagination - prepend older messages
        const existingMessages = chatStore.messages;
        const newMessages = messages.filter(
          (m) => !existingMessages.some((e) => e.id === m.id)
        );
        chatStore.setMessages([...newMessages, ...existingMessages]);
      } else if (silent) {
        // Background polling — merge with existing messages to preserve optimistic ones
        const existingMessages = chatStore.messages;
        const reconcileMatches: Array<{
          existingId: string;
          existingProviderMessageId?: string;
          existingText: string;
          serverId: string;
          serverProviderMessageId?: string;
          serverText: string;
          reason: string;
          timestampDeltaMs: number;
        }> = [];
        // Keep messages not yet confirmed by server. Server rows win when a
        // polling response races a live WebPubSub message with a different id.
        const optimisticMessages = existingMessages.filter((existingMessage) => {
          const match = messages
            .map((serverMessage) => ({
              serverMessage,
              reconcile: getHistoryReconcileReason(existingMessage, serverMessage),
            }))
            .find((candidate) => candidate.reconcile);

          if (match?.reconcile) {
            reconcileMatches.push({
              existingId: existingMessage.id,
              existingProviderMessageId: existingMessage.providerMessageId,
              existingText: previewText(existingMessage.text),
              serverId: match.serverMessage.id,
              serverProviderMessageId: match.serverMessage.providerMessageId,
              serverText: previewText(match.serverMessage.text),
              reason: match.reconcile.reason,
              timestampDeltaMs: match.reconcile.timestampDeltaMs,
            });
            return false;
          }

          return true;
        });

        const fuzzyReconcileMatches = reconcileMatches.filter(
          (match) => match.reason === 'sameBotTextWithinWindow'
        );
        if (fuzzyReconcileMatches.length > 0) {
          logger.info('[chat-service] Reconciled history messages by near-time text match', {
            reconciledCount: fuzzyReconcileMatches.length,
            reconcileWindowMs: HISTORY_TEXT_RECONCILE_WINDOW_MS,
            reconcileMatches: fuzzyReconcileMatches,
            should_change_messages_state_to: messages.length + optimisticMessages.length,
          });
        }

        chatStore.setMessages([...messages, ...optimisticMessages]);
      } else {
        // Initial load
        chatStore.setMessages(messages);
      }

      let oldestMessageId = response.data.last_message_id;

      if (!oldestMessageId && chatsArray.length > 0) {
        const sortedChats = chatsArray.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        oldestMessageId = sortedChats[0].id;
      }

      chatStore.setLastMessageId(oldestMessageId);
    }
  } catch (error) {
    const serialized = serializeError(error);
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== 401) {
      logger.error('Failed to fetch chat history', serialized);
      void notifyError('Failed to fetch chat history', {
        details: serialized,
      });
    }
    throw error;
  } finally {
    if (!silent) {
      chatStore.setIsLoadingChats(false);
    }
  }
}

/**
 * Get file extension from message type
 */
function getFileExtension(
  messageType: string,
  attachments?: Message['attachments']
): string | null {
  if (!attachments || attachments.length === 0) return null;

  switch (messageType) {
    case 'image':
      return '.jpg';
    case 'pdf':
      return '.pdf';
    case 'voice':
      return '.m4a';
    default:
      return null;
  }
}

/**
 * Determine message type from content
 */
function getMessageType(
  _text: string,
  attachments?: Message['attachments']
): string {
  if (!attachments || attachments.length === 0) {
    return 'text';
  }

  const attachment = attachments[0];
  return attachment.type;
}

/**
 * Send a message via webhook (non-streaming)
 */
export async function sendMessage(
  text: string,
  files?: UploadedFile[]
): Promise<WebhookResponse | null> {
  const chatStore = useChatStore.getState();
  const authStore = useAuthStore.getState();

  const messageId = uuidv4();
  const requestId = uuidv4();
  const timestamp = Date.now();

  // Convert file URLs to attachments format
  const attachments: Message['attachments'] = files?.map((file) => {
    const isPdf = file.mimeType === 'application/pdf' || file.fileName.toLowerCase().endsWith('.pdf');
    const isVoice = file.isVoice || file.mimeType?.startsWith('audio/');
    let type: 'image' | 'pdf' | 'voice' = 'image';
    if (isPdf) type = 'pdf';
    if (isVoice) type = 'voice';
    return {
      type,
      uri: file.signedURL || file.fileURL,
      serverUrl: file.fileURL,
      signedUrl: file.signedURL,
      name: file.fileName,
    };
  });

  // Add optimistic message
  chatStore.addMessage({
    id: messageId,
    text,
    sender: 'user',
    timestamp,
    attachments,
  });

  chatStore.setIsWaitingForResponse(true);
  chatStore.clearReportCitations(); // Clear citations when user sends a new message

  try {
    const messageType = getMessageType(text, attachments);

    const payload: SendMessageRequest = {
      text,
      providerMessageId: messageId,
      attachment: attachments?.[0]?.serverUrl || null,
      fileExtension: getFileExtension(messageType, attachments),
      messageType,
      sender: 'human',
      source: MESSAGE_SOURCE,
      phoneNumber: (() => {
        const incognitoState = useIncognitoStore.getState();
        if (incognitoState.isIncognitoMode && incognitoState.incognitoPhone) {
          return incognitoState.incognitoPhone;
        }
        return authStore.user?.phone || '';
      })(),
      timestamp,
      requestId,
    };

    if (messageType === 'voice') {
      logger.info('🎤 [DEBUG] Voice webhook payload', {
        attachment: payload.attachment,
        fileExtension: payload.fileExtension,
        messageType: payload.messageType,
        source: payload.source,
      });
    }

    const url = `/c/${getActiveTenant()}/webhook`;
    const response = await axiosInstance.post<WebhookResponse>(url, payload);

    return response.data;
  } catch (error) {
    const serialized = serializeError(error);
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 429) {
      useChatStore.getState().setIsWaitingForResponse(false);
    }
    logger.error('Failed to send message', serialized);
    void notifyError('Failed to send chat message', {
      details: serialized,
    });

    // Update the optimistic message to show error state
    chatStore.updateMessage(messageId, {
      systemType: 'error',
    });

    throw error;
  } finally {
    // Clear any existing poll from previous message
    if (activePollInterval) {
      clearInterval(activePollInterval);
      activePollInterval = null;
    }
    if (activePollTimeout) {
      clearTimeout(activePollTimeout);
      activePollTimeout = null;
    }

    // Skip polling in incognito mode — rely on WebPubSub only (matching mobile)
    const incognitoState = useIncognitoStore.getState();
    if (incognitoState.isIncognitoMode) {
      return null;
    }

    activePollInterval = setInterval(async () => {
      const state = useChatStore.getState();
      if (!state.isWaitingForResponse && !state.isProcessingFile) {
        if (activePollInterval) {
          clearInterval(activePollInterval);
          activePollInterval = null;
        }
        return;
      }
      try {
        await fetchChatHistory(50, undefined, true);
      } catch {
        // Silently ignore polling errors
      }
    }, 10000);

    activePollTimeout = setTimeout(() => {
      if (activePollInterval) {
        clearInterval(activePollInterval);
        activePollInterval = null;
      }
      activePollTimeout = null;
      const state = useChatStore.getState();
      if (state.isWaitingForResponse) {
        state.setIsWaitingForResponse(false);
      }
      if (state.isProcessingFile) {
        state.setIsProcessingFile(false);
      }
    }, 300000);
  }
}

/**
 * Fetch older messages for pagination
 */
export async function fetchOlderMessages(limit: number = 30): Promise<void> {
  const chatStore = useChatStore.getState();

  // Never fetch older messages in incognito mode — messages are purely in-memory
  if (useIncognitoStore.getState().isIncognitoMode) {
    return;
  }

  if (!chatStore.hasMoreMessages || chatStore.isLoadingChats) {
    return;
  }

  await fetchChatHistory(limit, chatStore.lastMessageId);
}

export async function refreshChatHistory(): Promise<void> {
  const chatStore = useChatStore.getState();

  chatStore.setLastMessageId(undefined);
  chatStore.setHasMoreMessages(true);
  await fetchChatHistory(50);
}
