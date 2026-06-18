import axiosInstance from '@/lib/axios';
import { MESSAGE_SOURCE } from '@/lib/config';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from './error-reporter';

export type FeedbackDirection = 'up' | 'down';

export async function submitMessageFeedback({
  providerMessageId,
  type,
}: {
  providerMessageId: string;
  type: FeedbackDirection;
}): Promise<void> {
  try {
    const url = `user/${getActiveTenant()}/feedback`;
    await axiosInstance.post(
      url,
      {
        providerMessageId,
        feedback: type === 'up' ? 'THUMBS_UP' : 'THUMBS_DOWN',
        source: MESSAGE_SOURCE,
      },
      { withCredentials: true }
    );
  } catch (error) {
    logger.error('Failed to submit message feedback', serializeError(error));
    throw error;
  }
}
