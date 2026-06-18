import { WebClient } from '@slack/web-api';
import logger from '@/utils/logger';

const token = process.env.SLACK_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;

let webClient: WebClient | null = null;

const ensureClient = () => {
  if (!token) {
    logger.error('SLACK TOKEN NOT SET');
    return null;
  }

  if (!webClient) {
    webClient = new WebClient(token);
  }

  return webClient;
};

export const sendSlackNotification = async (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[Slack] Dev mode, skipping notification', { message });
    return null;
  }

  if (!channelId) {
    logger.error('SLACK CHANNEL ID NOT SET');
    return null;
  }

  const client = ensureClient();
  if (!client) {
    return null;
  }

  try {
    const result = await client.chat.postMessage({
      channel: channelId,
      text: message,
    });
    logger.info('SENT SLACK NOTIFICATION');
    return result;
  } catch (error) {
    logger.error('FAILED TO SEND SLACK NOTIFICATION', {
      errorMessage: (error as Error).message,
      message,
      channelId,
    });
    throw error;
  }
};
