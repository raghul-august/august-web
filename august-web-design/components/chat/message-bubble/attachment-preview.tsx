'use client';

import { Message } from '@/types';
import { useI18n } from '@/components/providers';
import { AudioWaveformPlayer } from '../audio-waveform-player';
import { ChatImage } from '../chat-image';

export function AttachmentPreview({
  attachment,
}: {
  attachment: NonNullable<Message['attachments']>[0];
}) {
  const { t } = useI18n();
  const url = attachment.signedUrl || attachment.serverUrl || attachment.uri;

  switch (attachment.type) {
    case 'image':
      return (
        <ChatImage
          src={url || ''}
          alt={t('chat.attachments.imageAlt')}
          name={attachment.name}
        />
      );
    case 'pdf':
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:opacity-90 transition-opacity max-w-[240px]"
          style={{
            borderRadius: '12px 0 12px 12px',
            background: '#EDEBE5',
          }}
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#141515] truncate">
              {attachment.name || t('chat.attachments.pdfDefault')}
            </p>
            <p className="text-xs text-gray-500">{t('chat.attachments.pdfCta')}</p>
          </div>
        </a>
      );
    case 'voice':
      return <AudioWaveformPlayer url={url} />;
    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline"
        >
          {attachment.name || t('chat.attachments.defaultCta')}
        </a>
      );
  }
}
