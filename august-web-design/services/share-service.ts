import axiosInstance from '@/lib/axios';
import { getActiveTenant } from '@/lib/tenant';
import logger from '@/utils/logger';
import { serializeError } from './error-reporter';

export interface ShareResponse {
  success: boolean;
  link: string;
  formatted_text: string;
  messages: Array<{
    role: 'human' | 'assistant';
    message: string;
    timestamp: string;
    message_type: string;
  }>;
}

export async function createPublicShare(messageIds: string[]): Promise<ShareResponse> {
  try {
    const url = `user/${getActiveTenant()}/public-chats`;
    const response = await axiosInstance.post<ShareResponse>(
      url,
      { message_ids: messageIds },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    logger.error('Failed to create public share', serializeError(error));
    throw error;
  }
}
