'use client';

export interface LinkPreviewCardProps {
  url: string;
  title: string;
  description?: string;
  /** When omitted, renders the compact 300-wide text-only variant. */
  thumbnailUrl?: string;
  /** Domain shown in the footer row next to the link icon. e.g. "augusthealth.com". */
  domain: string;
  /** When true, overlays a play button on the thumbnail (for video links). Ignored if no thumbnail. */
  isVideo?: boolean;
  caption?: string;
}

export function LinkPreviewCard({
  url,
  title,
  description,
  thumbnailUrl,
  domain,
  isVideo = false,
  caption,
}: LinkPreviewCardProps) {
  const hasThumb = Boolean(thumbnailUrl);
  return (
    <div
      className={
        `link-preview-card ${caption ? 'has-caption' : 'no-caption'} ` +
        `${hasThumb ? 'with-thumb' : 'no-thumb'}`
      }
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="link-preview-card__link"
      >
        {hasThumb && (
          <div className="link-preview-card__thumb-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              className="link-preview-card__thumb"
              draggable={false}
            />
            {isVideo && (
              <div className="link-preview-card__play-overlay">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 4.5L15.5 10L6 15.5V4.5Z" fill="#FFFFFF" />
                </svg>
              </div>
            )}
          </div>
        )}
        <div className="link-preview-card__info">
          <div className="link-preview-card__title" title={title}>
            {title}
          </div>
          {description && (
            <div className="link-preview-card__description">
              {description}
            </div>
          )}
          <div className="link-preview-card__domain-row">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5.07 7.5a1.5 1.5 0 010-2.12l1.5-1.5a1.5 1.5 0 112.12 2.12l-.75.75M6.93 4.5a1.5 1.5 0 010 2.12l-1.5 1.5a1.5 1.5 0 11-2.12-2.12l.75-.75"
                stroke="#7A7468"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="link-preview-card__domain">{domain}</span>
          </div>
        </div>
      </a>
      {caption && (
        <div className="link-preview-card__caption">{caption}</div>
      )}

      <style jsx>{`
        .link-preview-card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 4px;
          gap: 4px;
          position: relative;
          width: 100%;
          background: #FFFFFF;
          border-radius: 12px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .link-preview-card.with-thumb {
          max-width: 408px;
        }
        .link-preview-card.no-thumb {
          max-width: 300px;
        }
        @media (max-width: 640px) {
          .link-preview-card.with-thumb {
            max-width: 280px;
          }
          .link-preview-card.no-thumb {
            max-width: 240px;
          }
          .link-preview-card.with-thumb .link-preview-card__caption {
            font-size: 15px;
            line-height: 22px;
          }
        }
        .link-preview-card__link {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-decoration: none;
        }
        .link-preview-card__thumb-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 1;
        }
        .link-preview-card__thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
          display: block;
        }
        .link-preview-card__play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .link-preview-card__play-overlay::before {
          content: '';
          position: absolute;
          width: 48px;
          height: 48px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
        }
        .link-preview-card__play-overlay svg {
          position: relative;
          margin-left: 3px; /* optical center for the triangle */
        }
        .link-preview-card__info {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 8px;
          gap: 8px;
          width: 100%;
          background: #F3F1EB;
          box-sizing: border-box;
        }
        .link-preview-card.with-thumb .link-preview-card__info {
          border-radius: 0 0 8px 8px;
        }
        .link-preview-card.no-thumb .link-preview-card__info {
          border-radius: 8px;
        }
        .link-preview-card__title {
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          line-height: 18px;
          color: #141515;
          overflow: hidden;
        }
        .link-preview-card.with-thumb .link-preview-card__title {
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .link-preview-card.no-thumb .link-preview-card__title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .link-preview-card__description {
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #5A554A;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .link-preview-card__domain-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          width: 100%;
        }
        .link-preview-card__domain {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 20px;
          color: #7A7468;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .link-preview-card__caption {
          display: block;
          width: 100%;
          box-sizing: border-box;
          font-family: 'SF Pro', system-ui, -apple-system, sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          letter-spacing: 0;
          color: #141515;
          word-break: break-word;
        }
        .link-preview-card.with-thumb .link-preview-card__caption {
          padding: 4px 8px;
        }
        .link-preview-card.no-thumb .link-preview-card__caption {
          padding: 4px 0 4px 6px;
        }
      `}</style>
    </div>
  );
}
