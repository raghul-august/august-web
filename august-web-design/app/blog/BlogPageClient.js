'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { track } from '@/app/utils/analytics';
import './blog.css';

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4"/>
    </svg>
  );
}

function postHref(item) {
  if (item.link) return item.link;
  return `/blog/${item.slug}`;
}

function externalProps(item) {
  const isExternal = item.link && /^https?:\/\//.test(item.link);
  return isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function FeaturedArticle({ data, fading }) {
  const href = postHref(data);
  const Tag = externalProps(data).target ? 'a' : Link;
  return (
    <Tag href={href} {...externalProps(data)} className={`blog-featured blog-fade${fading ? ' blog-fade--out' : ''}`}>
      <div className="blog-featured__body">
        {data.category && <span className="blog-featured__category">{data.category}</span>}
        <h2 className="blog-featured__title">{data.title}</h2>
        <p className="blog-featured__description">{data.description}</p>
        <span className="blog-featured__meta">
          {data.published_at && <span className="blog-featured__date">{new Date(data.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
          <span className="blog-featured__cta">Read more <ChevronIcon /></span>
        </span>
      </div>
      {data.image
        ? <img className="blog-featured__image" src={data.image} alt={data.title} />
        : <div className="blog-featured__image">IMAGE</div>
      }
    </Tag>
  );
}

function ArticleCard({ article }) {
  const href = postHref(article);
  const Tag = externalProps(article).target ? 'a' : Link;
  return (
    <Tag className="blog-card" href={href} {...externalProps(article)}>
      {article.image
        ? <img className="blog-card__image" src={article.image} alt={article.title} />
        : <div className="blog-card__image">IMAGE</div>
      }
      <div className="blog-card__body">
        <h3 className="blog-card__title">{article.title}</h3>
        <p className="blog-card__description">{article.description}</p>
        <div className="blog-card__footer">
          <span className="blog-card__cta">Learn more <ChevronIcon /></span>
          <span className="blog-card__date">{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</span>
        </div>
      </div>
    </Tag>
  );
}

// Compact text row used in the "More reports" list beside a featured article
function ReportRow({ article }) {
  const href = postHref(article);
  const Tag = externalProps(article).target ? 'a' : Link;
  return (
    <Tag className="blog-report" href={href} {...externalProps(article)}>
      {article.image && <img className="blog-report__image" src={article.image} alt={article.title} />}
      <div className="blog-report__content">
        {article.category && <span className="blog-report__category">{article.category}</span>}
        <h3 className="blog-report__title">{article.title}</h3>
        {article.description && <p className="blog-report__description">{article.description}</p>}
        <span className="blog-report__meta">
          {article.published_at && <span className="blog-report__date">{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
          <span className="blog-report__cta">Read more <ChevronIcon /></span>
        </span>
      </div>
    </Tag>
  );
}

export default function BlogPageClient({ posts, categories }) {
  const [category, setCategory] = useState(categories[0] || 'updates');
  const [fading, setFading] = useState(false);
  const timeoutRef = useRef(null);

  const switchCategory = useCallback((newCat) => {
    if (newCat === category) return;
    track('blog_category_switched', { from_category: category, to_category: newCat });
    setFading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCategory(newCat);
      setFading(false);
    }, 150);
  }, [category]);

  const data = posts[category];

  if (!data) return null;

  return (
    <>
      <section className="blog-header">
        <div className="blog-container">
          <h1 className="blog-title">Latest from <span className="blog-title__brand">August</span></h1>
        </div>
      </section>

      <section className="blog-content-section">
        <div className="blog-container">
          <div className="blog-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => switchCategory(cat)}
                className={`blog-tab${cat === category ? ' blog-tab--active' : ''}`}
              >{cat}</button>
            ))}
          </div>

          <div className={`blog-layout${data.featured ? ' blog-layout--featured' : ' blog-layout--grid'}`}>
            {data.featured && (
              <div className="blog-featured-col">
                <FeaturedArticle data={data.featured} fading={fading} />
              </div>
            )}
            {data.featured ? (
              <div className={`blog-reports-col blog-fade${fading ? ' blog-fade--out' : ''}`}>
                {data.articles.length > 0 && (
                  <div className="blog-reports">
                    {data.articles.map((article, i) => (
                      <ReportRow key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`blog-articles-col blog-fade${fading ? ' blog-fade--out' : ''}`}>
                {data.articles.map((article, i) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
