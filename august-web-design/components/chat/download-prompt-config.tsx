import { DownloadPromptConfig, PromptMilestone, ChatBubbleIcon, DownloadIcon } from './download-prompt-modal';

export const downloadPromptConfigs: Record<PromptMilestone, DownloadPromptConfig> = {
  messages_5: {
    icon: <ChatBubbleIcon />,
    title: 'Download App to secure your chats',
    description: "Sign up on August App to keep chatting securely. It's free and takes under a minute.",
    primaryCtaText: 'Download App Now',
    secondaryCtaText: 'Remind me later',
  },
  messages_10: {
    icon: <DownloadIcon />,
    title: 'Let me help you better',
    description: 'Get access to advanced features such as voice notes, lab report analysis, meal planning and many more.',
    primaryCtaText: 'Download App Now',
    secondaryCtaText: 'I will do it later',
  },
  messages_15: {
    icon: <DownloadIcon />,
    title: "That's 15 messages for now",
    description: 'Download App to continue chatting with me. All your messages will be saved and be available after the log in.',
    primaryCtaText: 'Download App Now - Free',
    secondaryCtaText: 'Continue on web',
  },
};

export const MESSAGE_THRESHOLDS = [5, 10, 15] as const;
export const APP_DOWNLOAD_URL = 'https://join.meetaugust.ai/?c=web_app';
export const APP_DOWNLOAD_URL_ANON = 'https://join.meetaugust.ai/?c=web_app_anon';
