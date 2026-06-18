import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { useChatStore } from '@/stores/chat-store';

let currentAudio: HTMLAudioElement | null = null;
let currentPlayingMessageId: string | null = null;
let currentPlayingGroupIds: string[] = [];

const TTS_TIMEOUT = 30000; // 30 seconds

function sanitizeMessage(message: string): string {
  let sanitized = message
    // Remove bold and italic
    .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1')
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/#{1,6}\s/g, '')
    // Remove blockquotes
    .replace(/>\s/g, '')
    // Remove horizontal rules
    .replace(/(?:^|\n)[-*_]{3,}\s*(?:\n|$)/g, '')
    // Remove ordered and unordered lists markers
    .replace(/^[\d.+-]\s+/gm, '');

  // Remove emojis
  sanitized = sanitized
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/:[a-zA-Z0-9_+-]+:/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized;
}

async function fetchAudioFromAzure(text: string): Promise<string> {
  const response = await axiosInstance.post(
    `/user/${getActiveTenant()}/azure-speech`,
    { text },
    {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // Convert ArrayBuffer to base64 string
  const base64 = btoa(
    new Uint8Array(response.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

  return `data:audio/mp3;base64,${base64}`;
}

export async function stopAudio(): Promise<void> {
  if (currentAudio) {
    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.removeAttribute('src');
    currentAudio.load();
    currentAudio = null;
  }
  currentPlayingMessageId = null;
  currentPlayingGroupIds = [];
  useChatStore.getState().setPlayingMessageId(null);
}

export function getCurrentPlayingMessageId(): string | null {
  return currentPlayingMessageId;
}

export function isMessagePlaying(messageId: string): boolean {
  return currentPlayingMessageId === messageId || currentPlayingGroupIds.includes(messageId);
}

export async function readMessage(
  text: string,
  messageId: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  try {
    await stopAudio();

    const sanitizedMessage = sanitizeMessage(text);

    if (!sanitizedMessage) {
      throw new Error('No text to read');
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TTS request timed out')), TTS_TIMEOUT);
    });

    logger.info('Sending TTS request to Azure');
    const audioUri = await Promise.race([
      fetchAudioFromAzure(sanitizedMessage),
      timeoutPromise,
    ]);

    if (!audioUri) {
      throw new Error('No audio URI returned from Azure');
    }

    currentPlayingMessageId = messageId;

    // Create and play audio
    currentAudio = new Audio(audioUri);

    currentAudio.onplay = () => {
      if (onStart) onStart();
    };

    currentAudio.onended = () => {
      currentPlayingMessageId = null;
      currentAudio = null;
      if (onEnd) onEnd();
    };

    currentAudio.onerror = () => {
      logger.error('Audio playback error');
      currentPlayingMessageId = null;
      currentAudio = null;
      if (onEnd) onEnd();
    };

    await currentAudio.play();
  } catch (error) {
    logger.error('Error during TTS request', serializeError(error));
    await stopAudio();
    throw error;
  }
}

export async function readMessageGroup(
  messages: { text: string; id: string }[],
  ownerId: string,
  onStart?: (messageId: string) => void,
  onEnd?: () => void
): Promise<void> {
  try {
    await stopAudio();

    currentPlayingGroupIds = messages.map((m) => m.id);
    currentPlayingMessageId = messages[0].id;
    useChatStore.getState().setPlayingMessageId(ownerId);

    // Combine all message texts with a pause between them
    const combinedText = messages.map((m) => m.text).join('. ... ');
    const sanitizedMessage = sanitizeMessage(combinedText);

    if (!sanitizedMessage) {
      throw new Error('No text to read');
    }

    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TTS request timed out')), TTS_TIMEOUT);
    });

    logger.info('Sending TTS request for message group', { messageIds: messages.map((m) => m.id) });
    const audioUri = await Promise.race([
      fetchAudioFromAzure(sanitizedMessage),
      timeoutPromise,
    ]);

    if (!audioUri) {
      throw new Error('No audio URI returned from Azure');
    }

    // Create and play audio
    currentAudio = new Audio(audioUri);

    currentAudio.onplay = () => {
      if (onStart) onStart(messages[0].id);
    };

    currentAudio.onended = () => {
      currentPlayingMessageId = null;
      currentPlayingGroupIds = [];
      currentAudio = null;
      useChatStore.getState().setPlayingMessageId(null);
      if (onEnd) onEnd();
    };

    currentAudio.onerror = () => {
      logger.error('Audio playback error');
      currentPlayingMessageId = null;
      currentPlayingGroupIds = [];
      currentAudio = null;
      useChatStore.getState().setPlayingMessageId(null);
      if (onEnd) onEnd();
    };

    await currentAudio.play();
  } catch (error) {
    logger.error('Error during group TTS', serializeError(error));
    await stopAudio();
    throw error;
  }
}
