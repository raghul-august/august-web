'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';

function getCleanUrl(url) {
  try {
    const u = new URL(url || window.location.href);
    u.searchParams.delete('source');
    return u.toString();
  } catch {
    return url || window.location.href;
  }
}

export default function ShareButton({ copiedText = 'Link copied to clipboard', sharedText = 'Thanks for sharing!', title, text, url }) {
  const [tooltip, setTooltip] = useState('');
  const [open, setOpen] = useState(false);

  const show = (message) => {
    setTooltip(message);
    setOpen(true);
    setTimeout(() => setOpen(false), 2500);
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: title || document?.title,
        text: text,
        url: getCleanUrl(url),
      };

      if (navigator.share) {
        await navigator.share(shareData);
        show(sharedText);
        return;
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      show(copiedText);
    } catch (err) {
      // If user cancels share, do nothing; on other errors, fallback to copy
      try {
        const fallbackUrl = getCleanUrl(url);
        await navigator.clipboard.writeText(fallbackUrl);
        show(copiedText);
      } catch {
        show('Unable to share');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip
        open={open}
        title={tooltip || copiedText}
        placement="right"
        sx={{
          '& .MuiTooltip-tooltip': {
            backgroundColor: '#fff',
            color: 'text.primary',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
            padding: '8px 12px',
            fontSize: '0.875rem'
          }
        }}
      >
        <IconButton onClick={handleShare} size="small" aria-label="Share">
          <IosShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
