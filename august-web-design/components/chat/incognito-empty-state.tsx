'use client';

import { DetectiveIcon } from '@phosphor-icons/react';
import { useI18n } from '@/components/providers';

export function IncognitoEmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="mb-4" style={{ color: '#8A9390' }}>
        <DetectiveIcon size={32} />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-3" style={{ color: '#8A9390', lineHeight: '28.8px' }}>
        {t('chat.incognito.title')}
      </h2>

      {/* Description */}
      <p className="text-sm text-center max-w-sm" style={{ color: '#8E8E93', lineHeight: '20px' }}>
        {t('chat.incognito.description')}
      </p>
    </div>
  );
}
