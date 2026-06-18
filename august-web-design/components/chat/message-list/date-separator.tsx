'use client';

import { memo } from 'react';
import { DATE_SEPARATOR_SIZE_MAP } from './constants';
import { TextSize } from '@/types';

function DateSeparatorImpl({ label, textSize = 'small' }: { label: string; textSize?: TextSize }) {
  const { fontSize } = DATE_SEPARATOR_SIZE_MAP[textSize];
  return (
    <div className="flex justify-center py-4">
      <span
        style={{
          display: 'inline-flex',
          padding: '6px 16px',
          alignItems: 'center',
          borderRadius: 48,
          border: '1px solid var(--color-border-subtle, #E5E2DA)',
          color: 'var(--color-text-disabled, #A8A39A)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: `${fontSize}px`,
          lineHeight: `${DATE_SEPARATOR_SIZE_MAP[textSize].lineHeight}px`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export const DateSeparator = memo(DateSeparatorImpl);
