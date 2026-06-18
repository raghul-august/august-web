'use client';

import { LinkPreviewCard } from './link-preview-card';
import { useLinkPreview } from '@/hooks/use-link-preview';

interface Props {
  url: string;
  /** Optional caption rendered inside the card. */
  caption?: string;
}

/**
 * Wraps useLinkPreview + LinkPreviewCard so multiple previews can be rendered
 * inside a `.map()` (each Slot owns its own hook instance, satisfying the
 * rules-of-hooks "stable order" requirement). Returns null while loading or
 * if the fetch failed — matches mobile's "render nothing on failure" rule.
 */
export function LinkPreviewSlot({ url, caption }: Props) {
  const linkPreview = useLinkPreview(url);
  if (!linkPreview.data) return null;
  const data = linkPreview.data;
  return (
    <LinkPreviewCard
      url={data.url}
      title={data.title || data.domain}
      description={data.description || undefined}
      thumbnailUrl={data.image || undefined}
      domain={data.domain}
      caption={caption}
    />
  );
}
