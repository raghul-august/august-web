import { v4 as uuidv4 } from 'uuid';
import { MESSAGE_SOURCE } from '@/lib/config';
import { getActiveTenant } from '@/lib/tenant';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { SendMessageRequest } from '@/types';
import { notifyError, serializeError } from './error-reporter';
import logger from '@/utils/logger';
import i18n from '@/lib/i18n';

interface StreamingChunk {
  chunkId?: number;
  providerMessageId?: string;
  text?: string;
  event?: string;
  august_message?: {
    text: string;
    processed_output?: string;
    thread_id?: string;
    provider_message_id?: string;
  };
}

const waitForCitationRelease = async () => {
  while (useChatStore.getState().isDisplayingCitations) {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
};

/**
 * Send a message via streaming webhook (SSE)
 */
export async function sendMessageStreaming(text: string): Promise<void> {
  const chatStore = useChatStore.getState();
  const authStore = useAuthStore.getState();

  const messageId = uuidv4();
  const requestId = uuidv4();
  const timestamp = Date.now();

  // Add optimistic user message
  chatStore.addMessage({
    id: messageId,
    text,
    sender: 'user',
    timestamp,
  });

  chatStore.setIsWaitingForResponse(true);
  chatStore.clearReportCitations(); // Clear citations when user sends a new message

  // Create a placeholder for the bot response
  const botMessageId = uuidv4();
  let fullText = '';

  try {
    // Use incognito token and phone when in incognito mode (matching mobile)
    const incognitoState = useIncognitoStore.getState();
    const accessToken = incognitoState.isIncognitoMode && incognitoState.incognitoToken
      ? incognitoState.incognitoToken
      : authStore.getAccessToken();

    const phoneNumber = incognitoState.isIncognitoMode && incognitoState.incognitoPhone
      ? incognitoState.incognitoPhone
      : authStore.user?.phone || '';

    const payload: SendMessageRequest = {
      text,
      providerMessageId: messageId,
      attachment: null,
      fileExtension: null,
      messageType: 'text',
      sender: 'human',
      source: MESSAGE_SOURCE,
      phoneNumber,
      timestamp,
      requestId,
    };

    // Use internal proxy route to handle location-aware streaming
    const url = `/api/chat/${getActiveTenant()}/webhook-stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status !== 429) {
        logger.error('[STREAM] Error response', { body: errorText });
        void notifyError('Streaming request failed', {
          details: {
            status: response.status,
            body: errorText.slice(0, 500),
          },
        });
      }
      if (response.status === 429 && typeof window !== 'undefined') {
        alert(i18n.t('common.loginRequired'));
      }
      throw new Error(`Streaming request failed: ${response.status}`);
    }

    await waitForCitationRelease();

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let botMessageAdded = false;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          await waitForCitationRelease();
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            // Stream complete
            chatStore.setIsWaitingForResponse(false);
            continue;
          }

          try {
            const chunk: StreamingChunk = JSON.parse(data);
            if (chunk.event === 'final_message' && chunk.august_message) {
              logger.info('[STREAM] Final message chunk', chunk.august_message);
              // Final message - update with complete text and processed output
              chatStore.updateMessage(botMessageId, {
                text: chunk.august_message.text,
                processedOutput: chunk.august_message.processed_output,
              });

              const providerId =
                chunk.providerMessageId ||
                chunk.august_message.provider_message_id;
              if (providerId) {
                chatStore.updateMessage(botMessageId, {
                  providerMessageId: providerId,
                });
              }

              chatStore.setIsWaitingForResponse(false);
            } else if (chunk.text !== undefined) {
              // Streaming chunk
              fullText += chunk.text;

              if (!botMessageAdded) {
                // Add the bot message on first chunk
                chatStore.addMessage({
                  id: botMessageId,
                  text: fullText,
                  sender: 'bot',
                  timestamp: Date.now(),
                  isStreaming: true,
                  providerMessageId: chunk.providerMessageId,
                });
                botMessageAdded = true;
                chatStore.setIsWaitingForResponse(false);
                chatStore.clearReportCitations(); // Clear citations when response starts
              } else {
                // Update the existing message with accumulated text
                chatStore.updateMessage(botMessageId, {
                  text: fullText,
                });
              }

              if (chunk.providerMessageId) {
                chatStore.updateMessage(botMessageId, {
                  providerMessageId: chunk.providerMessageId,
                });
              }

              // Yield to allow React to re-render with the new chunk
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          } catch (e) {
            logger.error('Failed to parse SSE chunk', {
              error: e instanceof Error ? serializeError(e) : { value: e },
              data,
            });
          }
        }
      }
    }

    // Mark streaming as complete
    if (botMessageAdded) {
      chatStore.updateMessage(botMessageId, {
        isStreaming: false,
      });
    }
  } catch (error) {
    const serialized = serializeError(error);
    const is429 = serialized.message === 'Streaming request failed: 429';
    const isNetwork = serialized.message === 'Failed to fetch';
    if (is429) {
      chatStore.setIsWaitingForResponse(false);
    }
    if (!is429 && !isNetwork) {
      logger.error('Streaming failed', serialized);
      void notifyError('Streaming service failed', {
        details: serialized,
      });
    }

    // Remove the optimistic user message so fallback can add its own
    chatStore.setMessages(
      chatStore.messages.filter((m) => m.id !== messageId)
    );

    chatStore.setIsWaitingForResponse(false);
    throw error;
  }
}
