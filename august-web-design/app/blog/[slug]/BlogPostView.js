'use client';

import Link from 'next/link';
import './blog-post.css';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function readTime(html) {
  if (!html) return 1;
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPostView({ post, related = [] }) {
  const minutes = readTime(post.body_html);

  return (
    <div className="blog-post-view">
      <article className="bp-article">
        <Link href="/blog" className="bp-back">← Back to blog</Link>

        {post.category && <div className="bp-eyebrow">{post.category}</div>}
        <h1 className="bp-title">{post.title}</h1>

        <div className="bp-meta">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.published_at && <span className="bp-meta__dot" />}
          <span>{minutes} min read</span>
        </div>

        {post.image && (
          <div className="bp-hero">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div className="bp-body" dangerouslySetInnerHTML={{ __html: post.body_html || '' }} />
      </article>

      {related.length > 0 && (
        <div className="bp-end">
          <div className="bp-divider" />
          <div className="bp-more__label">More from August</div>
          <div className="bp-more__grid">
            {related.map((item) => {
              const href = item.link || `/blog/${item.slug}`;
              const isExternal = item.link && /^https?:\/\//.test(item.link);
              const ext = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
              const Tag = isExternal ? 'a' : Link;
              return (
                <Tag key={item.id} className="bp-more__card" href={href} {...ext}>
                  {item.image
                    ? <img className="bp-more__img" src={item.image} alt={item.title} />
                    : <div className="bp-more__img" />
                  }
                  <div className="bp-more__body">
                    <div className="bp-more__title">{item.title}</div>
                    <div className="bp-more__date">{formatDate(item.published_at)}</div>
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
