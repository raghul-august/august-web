'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth-store';
import { useI18n } from '@/components/providers';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import {
  DOWNLOAD_CONTENT_CONFIG,
  DOWNLOAD_CTA_KEY,
  DOWNLOAD_CTA_DEFAULT,
  type NavOptionId,
} from './constants';
import { ChatIcon } from './icons';

function DownloadIllustration({ type }: { type: NavOptionId }) {
  const pngSources: Partial<Record<NavOptionId, { src: string; alt: string }>> = {
    explore: { src: '/assets/compass.png', alt: 'Explore illustration' },
    nutrition: { src: '/assets/food.png', alt: 'Nutrition illustration' },
  };

  if (pngSources[type]) {
    return (
      <img
        src={pngSources[type]!.src}
        width={60}
        height={60}
        alt={pngSources[type]!.alt}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #F1FFF7 0%, #D8F5E5 100%)' }}
    >
      <ChatIcon />
    </div>
  );
}

interface DownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  option: NavOptionId;
}

export function DownloadModal({ open, onOpenChange, option }: DownloadModalProps) {
  const { t } = useI18n();
  const { isAnonymous } = useAuthStore();
  const downloadUrl = isAnonymous
    ? 'https://join.meetaugust.ai/?c=web_app_anon'
    : 'https://join.meetaugust.ai/?c=web_app';
  const contentConfig = DOWNLOAD_CONTENT_CONFIG[option] ?? DOWNLOAD_CONTENT_CONFIG.chat!;
  const title = t(contentConfig.titleKey, { defaultValue: contentConfig.defaultTitle });
  const description = t(contentConfig.descriptionKey, { defaultValue: contentConfig.defaultDescription });
  const ctaText = t(DOWNLOAD_CTA_KEY, { defaultValue: DOWNLOAD_CTA_DEFAULT });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-8 text-center" showCloseButton>
        <DialogHeader className="items-center">
          <DownloadIllustration type={contentConfig.illustration} />
          <DialogTitle className="text-2xl font-semibold text-gray-900 mt-1">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-gray-600 whitespace-pre-line">{description}</p>
        <Button
          className="mt-6 w-full rounded-full bg-[#206E55] text-base font-semibold"
          style={{
            display: 'flex',
            height: '56px',
            padding: '16px 16px 17px 16px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            alignSelf: 'stretch',
          }}
          onClick={() => {
            track('download_tapped', { source: `${option}_modal` });
            trackClevertap('Download App Clicked', { source: `${option}_modal` });
            onOpenChange(false);
            window.open(downloadUrl, '_blank');
          }}
        >
          {ctaText}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
