"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers";
import axiosInstance from "@/lib/axios";
import { track } from "@/services/analytics-service";
import { trackClevertap } from "@/utils/clevertap";
import { getActiveTenant } from "@/lib/tenant";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Pill,
  Stethoscope,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Inbox,
  User,
  Thermometer,
  Scissors,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Wind,
  Flower2,
  Bug,
  Eye,
} from "lucide-react";
import "./explore.css";

type AlgoliaHit = Record<string, any>;

type SearchResponse = {
  hits?: AlgoliaHit[];
  page?: number;
  nbPages?: number;
  nbHits?: number;
};

type CarouselSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  tagFilter: string | null;
  hits: AlgoliaHit[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  accentColor: string;
  style: "spotlight" | "stack" | "scroll" | "tiles" | "focus" | "magazine";
};

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!;

const ALGOLIA_SEARCH_URL = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX_NAME}/query`;

// Seasonal health keywords
const SEASONAL_TOPICS = [
  { keyword: "seasonal allergies", icon: Wind, color: "#7C9885" },
  { keyword: "hay fever", icon: Flower2, color: "#B4956C" },
  { keyword: "pollen allergy", icon: Leaf, color: "#8BA17C" },
  { keyword: "asthma symptoms", icon: Wind, color: "#7A95A8" },
  { keyword: "pink eye", icon: Eye, color: "#C27D7D" },
  { keyword: "tick bite", icon: Bug, color: "#8B7355" },
];

// Section configs with varied styles
const SECTION_CONFIGS: Array<{
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  tagFilter: string | null;
  requireHealthLibrary: boolean;
  accentColor: string;
  style: "spotlight" | "stack" | "scroll" | "tiles" | "focus" | "magazine";
}> = [
  { id: "for-you", title: "For You", subtitle: "Personalized recommendations", icon: User, tagFilter: null, requireHealthLibrary: false, accentColor: "#206E55", style: "spotlight" },
  { id: "conditions", title: "Conditions", subtitle: "Common health conditions", icon: Stethoscope, tagFilter: "conditions", requireHealthLibrary: true, accentColor: "#206E55", style: "stack" },
  { id: "medications", title: "Medications", subtitle: "Drug information & guides", icon: Pill, tagFilter: "medications", requireHealthLibrary: true, accentColor: "#206E55", style: "scroll" },
  { id: "symptoms", title: "Symptoms", subtitle: "Understand your symptoms", icon: Thermometer, tagFilter: "symptoms", requireHealthLibrary: true, accentColor: "#206E55", style: "tiles" },
  { id: "procedures", title: "Procedures", subtitle: "Medical procedures explained", icon: Scissors, tagFilter: "procedures", requireHealthLibrary: true, accentColor: "#206E55", style: "scroll" },
  { id: "wellness", title: "Wellness", subtitle: "Tips for healthy living", icon: Sparkles, tagFilter: "blogs", requireHealthLibrary: false, accentColor: "#206E55", style: "magazine" },
];

const FALLBACK_TRENDING = [
  "GLP-1 medications",
  "Thyroid symptoms",
  "PCOS treatment",
  "Sleep apnea",
  "Migraine relief",
  "Blood pressure",
];

const LANG_MAP: Record<string, string> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  "pt-BR": "pt",
  "pt-PT": "pt",
};

const CARD_COLORS = ["#4D5B4D", "#5B5B64", "#2E6E5A", "#6B5B4A", "#4A5B6B", "#5A4D5A"];

const FALLBACK_IMAGES = [
  "https://assets.getbeyondhealth.com/articles/77908002.webp",
  "https://assets.getbeyondhealth.com/articles/77907002.webp",
  "https://assets.getbeyondhealth.com/articles/77906002.webp",
  "https://assets.getbeyondhealth.com/articles/77903002.webp",
];

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, "").trim();
const getPathValue = (hit: AlgoliaHit, path: string) => path.split(".").reduce<any>((acc, key) => (acc ? acc[key] : undefined), hit);
const getFirstString = (hit: AlgoliaHit, paths: string[]) => {
  for (const path of paths) {
    const value = getPathValue(hit, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const getHighlighted = (hit: AlgoliaHit, paths: string[]) => {
  for (const path of paths) {
    const value = getPathValue(hit, `_highlightResult.${path}.value`) || getPathValue(hit, `_snippetResult.${path}.value`);
    if (typeof value === "string" && value.trim()) return stripHtml(value);
  }
  return "";
};

const getTitle = (hit: AlgoliaHit, lang: string) => {
  const highlight = getHighlighted(hit, ["title", "headline", "name", "question", "name_en"]);
  if (highlight) return highlight;
  return getFirstString(hit, [`name_${lang}`, "name_en", "title", "headline", "name", "question"]) || "Untitled";
};

const getExcerpt = (hit: AlgoliaHit, lang: string) => {
  const highlight = getHighlighted(hit, ["summary", "excerpt", "description", "subtitle", "snippet", "content", "subtitle_en"]);
  if (highlight) return highlight;
  return getFirstString(hit, [`subtitle_${lang}`, "subtitle_en", "summary", "excerpt", "description", "subtitle"]);
};

const getImage = (hit: AlgoliaHit) => getFirstString(hit, ["image", "imageUrl", "thumbnail", "cover", "heroImage"]);
const getUrl = (hit: AlgoliaHit, lang: string) =>
  getFirstString(hit, ["url", "link", "permalink", "canonicalUrl", "canonical_url"]) ||
  (hit?.redirectslug ? `https://www.meetaugust.ai/${lang}/library${hit.redirectslug}?source=web` : hit?.slug ? `/articles/${hit.slug}` : "");

const toAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
};

const buildAttributes = (lang: string) => {
  const mappedLang = LANG_MAP[lang] || lang;
  return ["objectID", "redirectslug", "image", "name_en", `name_${mappedLang}`, "subtitle_en", `subtitle_${mappedLang}`, "url", "category", "topic", "section", "summary", "excerpt", "description", "_tags", "tags"];
};

const makeAlgoliaHeaders = () => ({
  "Content-Type": "application/json",
  "x-algolia-application-id": ALGOLIA_APP_ID,
  "x-algolia-api-key": ALGOLIA_SEARCH_KEY,
});

const CACHE_PREFIX = "algolia_v4_";
const CACHE_TTL_FOR_YOU = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_TTL_SECTIONS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

function getCacheKey(query: string, params: Record<string, unknown>): string {
  const tagFilters = params.tagFilters || "none";
  const page = params.page || 0;
  return `${CACHE_PREFIX}${query}_${JSON.stringify(tagFilters)}_p${page}`;
}

function getFromCache(key: string, ttl: number): SearchResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setToCache(key: string, data: SearchResponse): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Storage full or unavailable, ignore
  }
}

async function searchAlgolia(query: string, params: Record<string, unknown>, ttl: number = CACHE_TTL_SECTIONS): Promise<SearchResponse> {
  if (!ALGOLIA_SEARCH_URL) throw new Error("Missing Algolia environment variables.");

  const cacheKey = getCacheKey(query, params);
  const cached = getFromCache(cacheKey, ttl);
  if (cached) return cached;

  const response = await fetch(ALGOLIA_SEARCH_URL, {
    method: "POST",
    headers: makeAlgoliaHeaders(),
    body: JSON.stringify({ query, hitsPerPage: 8, attributesToRetrieve: ["*"], ...params }),
  });
  if (!response.ok) throw new Error("Search request failed.");
  const data = await response.json();
  setToCache(cacheKey, data);
  return data;
}

async function fetchPersonalizedTerms(): Promise<string[]> {
  try {
    const response = await axiosInstance.get(`/user/${getActiveTenant()}/recommend-health-articles`);
    if (response.data?.search_terms && Array.isArray(response.data.search_terms)) {
      return response.data.search_terms.slice(0, 4);
    }
    return [];
  } catch {
    return [];
  }
}

// ============================================
// CHAT ICON - Same as sidebar
// ============================================
function ChatIcon({ size = 24, color = "#206E55" }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.15375 11.6074H7.34625V10.1074H6.15375V11.6074ZM8.65375 13.6074H9.84625V8.10742H8.65375V13.6074ZM11.4038 15.6074H12.5963V6.10742H11.4038V15.6074ZM14.1538 13.6074H15.3463V8.10742H14.1538V13.6074ZM16.6538 11.6074H17.8463V10.1074H16.6538V11.6074ZM2.5 21.8959V5.16517C2.5 4.66 2.675 4.23242 3.025 3.88242C3.375 3.53242 3.80258 3.35742 4.30775 3.35742H19.6923C20.1974 3.35742 20.625 3.53242 20.975 3.88242C21.325 4.23242 21.5 4.66 21.5 5.16517V16.5497C21.5 17.0548 21.325 17.4824 20.975 17.8324C20.625 18.1824 20.1974 18.3574 19.6923 18.3574H6.0385L2.5 21.8959ZM5.4 16.8574H19.6923C19.7693 16.8574 19.8398 16.8253 19.9038 16.7612C19.9679 16.6972 20 16.6267 20 16.5497V5.16517C20 5.08817 19.9679 5.01767 19.9038 4.95367C19.8398 4.8895 19.7693 4.85742 19.6923 4.85742H4.30775C4.23075 4.85742 4.16025 4.8895 4.09625 4.95367C4.03208 5.01767 4 5.08817 4 5.16517V18.2422L5.4 16.8574Z" fill={color} />
    </svg>
  );
}

// ============================================
// CARD CTA ACTIONS - Read more text + Chat icon
// ============================================
function CardActions({
  title,
  onAskAugust,
  compact = false
}: {
  title: string;
  url?: string;
  onAskAugust: (title: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={`card-actions ${compact ? 'card-actions--compact' : ''}`}>
      <span className="card-actions__read">Read more <ArrowRight size={14} /></span>
      <button
        className="card-actions__chat"
        onClick={(e) => { e.stopPropagation(); onAskAugust(title); }}
        title="Ask August"
      >
        <ChatIcon size={20} />
      </button>
    </div>
  );
}

// ============================================
// SPOTLIGHT SECTION - For personalized "For You" content
// ============================================
function SpotlightSection({
  section,
  lang,
  onAskAugust,
  onLoadMore,
  onCardClick,
  personalizedTerms = [],
}: {
  section: CarouselSection;
  lang: string;
  onAskAugust: (title: string, options?: { position?: number; component_type?: string }) => void;
  onLoadMore: () => void;
  onCardClick: (url: string, title?: string, options?: { position?: number; component_type?: string }) => void;
  personalizedTerms?: string[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = section.icon;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Generate subtitle from personalized terms
  const subtitle = personalizedTerms.length > 0
    ? `Because you talked about ${personalizedTerms.join(", ")}`
    : section.subtitle;

  if (section.loading && section.hits.length === 0) {
    return (
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="explore-section__title">{section.title}</h2>
              <p className="explore-section__subtitle">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="card-scroll">
          {[1,2,3].map((i) => <div key={i} className="explore-skeleton" style={{width: "300px", height: "340px", borderRadius: "16px", flexShrink: 0}} />)}
        </div>
      </section>
    );
  }

  if (section.hits.length === 0) return null;

  return (
    <section className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__title-group">
          <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="explore-section__title">{section.title}</h2>
            <p className="explore-section__subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="explore-section__nav">
          <button className="explore-section__nav-btn" onClick={() => scroll("left")}><ArrowLeft size={18} /></button>
          <button className="explore-section__nav-btn" onClick={() => scroll("right")}><ArrowRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="card-scroll">
        {section.hits.map((hit, i) => {
          const image = getImage(hit);
          const title = getTitle(hit, lang);
          const excerpt = getExcerpt(hit, lang);
          const url = getUrl(hit, lang);
          const fallbackImage = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

          return (
            <div key={hit.objectID || i} className="content-card" onClick={() => url && onCardClick(url, title, { position: i, component_type: section.id })} style={{ cursor: url ? 'pointer' : 'default' }}>
              <div className="content-card__image">
                <img src={image || fallbackImage} alt={title} />
              </div>
              <div className="content-card__body">
                <h3 className="content-card__title">{title}</h3>
                {excerpt && <p className="content-card__excerpt">{excerpt}</p>}
                <CardActions title={title} url={url} onAskAugust={(t) => onAskAugust(t, { position: i, component_type: section.id })} />
              </div>
            </div>
          );
        })}
        {section.hasMore && (
          <button className="card-scroll__more" onClick={onLoadMore} disabled={section.loading}>
            {section.loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
            <span>More</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================
// CARD STACK SECTION - Auto-rotating with static side cards
// ============================================
function CardStackSection({
  section,
  lang,
  onAskAugust,
  onLoadMore,
  onCardClick,
}: {
  section: CarouselSection;
  lang: string;
  onAskAugust: (title: string, options?: { position?: number; component_type?: string }) => void;
  onLoadMore: () => void;
  onCardClick: (url: string, title?: string, options?: { position?: number; component_type?: string }) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const Icon = section.icon;

  // Detect mobile for auto-advance
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance only on mobile
  useEffect(() => {
    if (!isMobile || isPaused || section.hits.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => {
        const next = (i + 1) % section.hits.length;
        // Load more when nearing end
        if (next >= section.hits.length - 2 && section.hasMore) {
          onLoadMore();
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isMobile, isPaused, section.hits.length, section.hasMore, onLoadMore]);

  // Pause on hover (mobile only)
  const handleMouseEnter = () => isMobile && setIsPaused(true);
  const handleMouseLeave = () => isMobile && setIsPaused(false);

  const goPrev = () => {
    setActiveIndex((i) => (i - 1 + section.hits.length) % section.hits.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  const goNext = () => {
    setActiveIndex((i) => (i + 1) % section.hits.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  };

  if (section.loading && section.hits.length === 0) {
    return (
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="explore-section__title">{section.title}</h2>
              <p className="explore-section__subtitle">{section.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="card-stack">
          <div className="explore-skeleton" style={{ width: "340px", height: "400px", borderRadius: "20px" }} />
        </div>
      </section>
    );
  }

  if (section.hits.length === 0) return null;

  const len = section.hits.length;

  // Calculate offset for smooth circular animation
  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    // Handle circular wrapping
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  };

  return (
    <section className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__title-group">
          <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="explore-section__title">{section.title}</h2>
            <p className="explore-section__subtitle">{section.subtitle}</p>
          </div>
        </div>
        <div className="explore-section__nav">
          <button className="explore-section__nav-btn" onClick={goPrev}><ArrowLeft size={18} /></button>
          <button className="explore-section__nav-btn" onClick={goNext}><ArrowRight size={18} /></button>
        </div>
      </div>

      <div
        className="card-stack"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {section.hits.map((hit, i) => {
          const offset = getOffset(i);
          const isVisible = Math.abs(offset) <= 1;
          if (!isVisible) return null;

          const image = getImage(hit);
          const title = getTitle(hit, lang);
          const excerpt = getExcerpt(hit, lang);
          const url = getUrl(hit, lang);
          const bgColor = CARD_COLORS[i % CARD_COLORS.length];
          const isCenter = offset === 0;

          return (
            <div
              key={hit.objectID || i}
              className="stack-card"
              style={{
                transform: `translateX(${offset * 105}%) scale(${isCenter ? 1 : 0.92})`,
                opacity: isCenter ? 1 : 0.65,
                zIndex: isCenter ? 3 : 1,
                pointerEvents: 'auto',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (isCenter && url) {
                  onCardClick(url, title, { position: i, component_type: section.id });
                } else if (!isCenter) {
                  offset < 0 ? goPrev() : goNext();
                }
              }}
            >
              <div className="stack-card__image" style={{ backgroundColor: bgColor }}>
                {image ? <img src={image} alt={title} /> : <Icon size={48} />}
              </div>
              <div className="stack-card__content">
                <h3 className="stack-card__title">{title}</h3>
                {excerpt && <p className="stack-card__excerpt">{excerpt}</p>}
                <CardActions title={title} url={url} onAskAugust={(t) => onAskAugust(t, { position: i, component_type: section.id })} compact={!isCenter} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// SCROLL SECTION - Horizontal scrolling cards with CTAs
// ============================================
function ScrollSection({
  section,
  lang,
  onAskAugust,
  onLoadMore,
  onCardClick,
}: {
  section: CarouselSection;
  lang: string;
  onAskAugust: (title: string, options?: { position?: number; component_type?: string }) => void;
  onLoadMore: () => void;
  onCardClick: (url: string, title?: string, options?: { position?: number; component_type?: string }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = section.icon;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (section.loading && section.hits.length === 0) {
    return (
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="explore-section__title">{section.title}</h2>
              <p className="explore-section__subtitle">{section.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="card-scroll">
          {[1,2,3,4].map((i) => <div key={i} className="explore-skeleton" style={{width: "260px", height: "280px", borderRadius: "16px", flexShrink: 0}} />)}
        </div>
      </section>
    );
  }

  if (section.hits.length === 0) return null;

  return (
    <section className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__title-group">
          <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="explore-section__title">{section.title}</h2>
            <p className="explore-section__subtitle">{section.subtitle}</p>
          </div>
        </div>
        <div className="explore-section__nav">
          <button className="explore-section__nav-btn" onClick={() => scroll("left")}><ArrowLeft size={18} /></button>
          <button className="explore-section__nav-btn" onClick={() => scroll("right")}><ArrowRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="card-scroll">
        {section.hits.map((hit, i) => {
          const image = getImage(hit);
          const title = getTitle(hit, lang);
          const excerpt = getExcerpt(hit, lang);
          const url = getUrl(hit, lang);
          const bgColor = CARD_COLORS[i % CARD_COLORS.length];

          return (
            <div key={hit.objectID || i} className="content-card content-card--compact" onClick={() => url && onCardClick(url, title, { position: i, component_type: section.id })} style={{ cursor: url ? 'pointer' : 'default' }}>
              <div className="content-card__image" style={{ backgroundColor: bgColor }}>
                {image ? <img src={image} alt={title} /> : <Icon size={32} />}
              </div>
              <div className="content-card__body">
                <h3 className="content-card__title">{title}</h3>
                {excerpt && <p className="content-card__excerpt">{excerpt}</p>}
                <CardActions title={title} url={url} onAskAugust={(t) => onAskAugust(t, { position: i, component_type: section.id })} compact />
              </div>
            </div>
          );
        })}
        {section.hasMore && (
          <button className="card-scroll__more" onClick={onLoadMore} disabled={section.loading}>
            {section.loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
            <span>More</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================
// TILES SECTION - Horizontal scroll with title top-left, CTA bottom-left
// ============================================
function TilesSection({
  section,
  lang,
  onAskAugust,
  onLoadMore,
  onCardClick,
}: {
  section: CarouselSection;
  lang: string;
  onAskAugust: (title: string, options?: { position?: number; component_type?: string }) => void;
  onLoadMore: () => void;
  onCardClick: (url: string, title?: string, options?: { position?: number; component_type?: string }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = section.icon;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (section.loading && section.hits.length === 0) {
    return (
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="explore-section__title">{section.title}</h2>
              <p className="explore-section__subtitle">{section.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="tiles-scroll">
          {[1,2,3,4].map((i) => <div key={i} className="explore-skeleton" style={{width: "320px", height: "200px", borderRadius: "16px", flexShrink: 0}} />)}
        </div>
      </section>
    );
  }

  if (section.hits.length === 0) return null;

  return (
    <section className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__title-group">
          <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="explore-section__title">{section.title}</h2>
            <p className="explore-section__subtitle">{section.subtitle}</p>
          </div>
        </div>
        <div className="explore-section__nav">
          <button className="explore-section__nav-btn" onClick={() => scroll("left")}><ArrowLeft size={18} /></button>
          <button className="explore-section__nav-btn" onClick={() => scroll("right")}><ArrowRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="tiles-scroll">
        {section.hits.map((hit, i) => {
          const image = getImage(hit);
          const title = getTitle(hit, lang);
          const excerpt = getExcerpt(hit, lang);
          const url = getUrl(hit, lang);
          const bgColor = CARD_COLORS[i % CARD_COLORS.length];

          return (
            <div key={hit.objectID || i} className="tile-card" style={{ backgroundColor: bgColor, cursor: url ? 'pointer' : 'default' }} onClick={() => url && onCardClick(url, title, { position: i, component_type: section.id })}>
              {image && <img src={image} alt={title} className="tile-card__image" />}
              <div className="tile-card__overlay">
                <div className="tile-card__top">
                  <span className="tile-card__title">{title}</span>
                  {excerpt && <span className="tile-card__subtitle">{excerpt}</span>}
                </div>
                <div className="tile-card__bottom">
                  <span
                    className="tile-card__read-link"
                    onClick={(e) => { e.stopPropagation(); if (url) onCardClick(url, title, { position: i, component_type: section.id }); }}
                  >
                    Read more <ArrowRight size={14} />
                  </span>
                  <button className="tile-card__ask" onClick={(e) => { e.stopPropagation(); onAskAugust(title, { position: i, component_type: section.id }); }} title="Ask August">
                    <ChatIcon size={20} color="white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {section.hasMore && (
          <button className="tiles-scroll__more" onClick={onLoadMore} disabled={section.loading}>
            {section.loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
            <span>More</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================
// MAGAZINE SECTION - Horizontal scroll for blogs
// ============================================
function MagazineSection({
  section,
  lang,
  onAskAugust,
  onLoadMore,
  onCardClick,
}: {
  section: CarouselSection;
  lang: string;
  onAskAugust: (title: string, options?: { position?: number; component_type?: string }) => void;
  onLoadMore: () => void;
  onCardClick: (url: string, title?: string, options?: { position?: number; component_type?: string }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = section.icon;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (section.loading && section.hits.length === 0) {
    return (
      <section className="explore-section">
        <div className="explore-section__header">
          <div className="explore-section__title-group">
            <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="explore-section__title">{section.title}</h2>
              <p className="explore-section__subtitle">{section.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="card-scroll">
          {[1,2,3,4].map((i) => <div key={i} className="explore-skeleton" style={{width: "280px", height: "300px", borderRadius: "16px", flexShrink: 0}} />)}
        </div>
      </section>
    );
  }

  if (section.hits.length === 0) return null;

  return (
    <section className="explore-section">
      <div className="explore-section__header">
        <div className="explore-section__title-group">
          <div className="explore-section__icon" style={{ backgroundColor: `${section.accentColor}15`, color: section.accentColor }}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="explore-section__title">{section.title}</h2>
            <p className="explore-section__subtitle">{section.subtitle}</p>
          </div>
        </div>
        <div className="explore-section__nav">
          <button className="explore-section__nav-btn" onClick={() => scroll("left")}><ArrowLeft size={18} /></button>
          <button className="explore-section__nav-btn" onClick={() => scroll("right")}><ArrowRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="card-scroll">
        {section.hits.map((hit, i) => {
          const image = getImage(hit);
          const title = getTitle(hit, lang);
          const excerpt = getExcerpt(hit, lang);
          const url = getUrl(hit, lang);
          const bgColor = CARD_COLORS[i % CARD_COLORS.length];

          return (
            <div key={hit.objectID || i} className="blog-card" onClick={() => url && onCardClick(url, title, { position: i, component_type: section.id })} style={{ cursor: url ? 'pointer' : 'default' }}>
              <div className="blog-card__image" style={{ backgroundColor: bgColor }}>
                {image ? <img src={image} alt={title} /> : <Icon size={36} />}
              </div>
              <div className="blog-card__body">
                <h3 className="blog-card__title">{title}</h3>
                {excerpt && <p className="blog-card__excerpt">{excerpt}</p>}
                <div className="blog-card__actions">
                  <span className="blog-card__read-link">
                    Read more <ArrowRight size={14} />
                  </span>
                  <button className="blog-card__ask" onClick={(e) => { e.stopPropagation(); onAskAugust(title, { position: i, component_type: section.id }); }} title="Ask August">
                    <ChatIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {section.hasMore && (
          <button className="card-scroll__more" onClick={onLoadMore} disabled={section.loading}>
            {section.loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
            <span>More</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================
// TRENDING INTERLUDE - Visual break section
// ============================================
// ============================================
// MAIN PAGE
// ============================================
export default function ExplorePage() {
  const router = useRouter();
  const { i18n } = useI18n();
  const currentLang = LANG_MAP[i18n.language] || i18n.language || "en";

  const [sections, setSections] = useState<CarouselSection[]>(() =>
    SECTION_CONFIGS.map((config) => ({ ...config, hits: [], loading: true, hasMore: true, page: 0 }))
  );

  const [hasPersonalizedTerms, setHasPersonalizedTerms] = useState(false);
  const [personalizedTerms, setPersonalizedTerms] = useState<string[]>([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AlgoliaHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const missingAlgolia = !ALGOLIA_APP_ID || !ALGOLIA_INDEX_NAME || !ALGOLIA_SEARCH_KEY;

  const handleAskAugust = useCallback((title: string, options?: { position?: number; component_type?: string }) => {
    track("Explore Action", {
      type: "card",
      target: "ask_august",
      action: "tap",
      title,
      ...(options?.position !== undefined && { position: options.position }),
      ...(options?.component_type && { component_type: options.component_type }),
    });
    trackClevertap("Explore Action", { type: "card", target: "ask_august", title });
    router.push(`/chat?msg=${encodeURIComponent(title)}`);
  }, [router]);

  const handleCardClick = useCallback((url: string, title?: string, options?: { position?: number; component_type?: string }) => {
    track("Explore Action", {
      type: "card",
      target: "article",
      action: "read_more",
      ...(title && { title }),
      ...(options?.position !== undefined && { position: options.position }),
      ...(options?.component_type && { component_type: options.component_type }),
    });
    trackClevertap("Explore Action", { type: "card", target: "article", ...(title && { title }) });
    const absoluteUrl = toAbsoluteUrl(url);
    // Add source=webview param to the article URL
    const urlWithSource = new URL(absoluteUrl);
    urlWithSource.searchParams.set('source', 'webview');
    router.push(`/explore/view?url=${encodeURIComponent(urlWithSource.toString())}`);
  }, [router]);

  const fetchSection = useCallback(async (sectionId: string, page: number, append: boolean) => {
    if (missingAlgolia) return;
    const config = SECTION_CONFIGS.find((s) => s.id === sectionId);
    if (!config) return;

    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, loading: true } : s)));

    try {
      let params: Record<string, unknown> = { hitsPerPage: 8, page, attributesToRetrieve: buildAttributes(currentLang) };
      if (config.tagFilter) {
        params.tagFilters = config.requireHealthLibrary
          ? [[config.tagFilter], ["health_library"]]
          : [[config.tagFilter]];
      }

      const data = await searchAlgolia("", params);
      const hits = Array.isArray(data?.hits) ? data.hits : [];

      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, hits: append ? [...s.hits, ...hits] : hits, loading: false, hasMore: page < (data?.nbPages || 0) - 1, page }
            : s
        )
      );
    } catch (err) {
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, loading: false } : s)));
    }
  }, [currentLang, missingAlgolia]);

  const fetchForYouSection = useCallback(async (terms: string[]) => {
    if (missingAlgolia || terms.length === 0) {
      setSections((prev) => prev.map((s) => (s.id === "for-you" ? { ...s, loading: false, hits: [] } : s)));
      return;
    }

    setSections((prev) => prev.map((s) => (s.id === "for-you" ? { ...s, loading: true } : s)));

    try {
      const results = await Promise.all(terms.slice(0, 3).map((term) => searchAlgolia(term, { hitsPerPage: 4, page: 0, attributesToRetrieve: buildAttributes(currentLang) }, CACHE_TTL_FOR_YOU)));
      const seen = new Set<string>();
      const hits: AlgoliaHit[] = [];
      for (const result of results) {
        for (const hit of result.hits || []) {
          if (!seen.has(hit.objectID)) { seen.add(hit.objectID); hits.push(hit); }
        }
      }
      setSections((prev) => prev.map((s) => s.id === "for-you" ? { ...s, hits: hits.slice(0, 8), loading: false, hasMore: false } : s));
    } catch {
      setSections((prev) => prev.map((s) => (s.id === "for-you" ? { ...s, loading: false, hits: [] } : s)));
    }
  }, [currentLang, missingAlgolia]);

  useEffect(() => {
    if (missingAlgolia) {
      setSections((prev) => prev.map((s) => ({ ...s, loading: false })));
      return;
    }

    fetchPersonalizedTerms().then((terms) => {
      if (terms.length > 0) {
        setHasPersonalizedTerms(true);
        setPersonalizedTerms(terms);
        fetchForYouSection(terms);
      } else {
        setHasPersonalizedTerms(false);
        setPersonalizedTerms([]);
        setSections((prev) => prev.map((s) => (s.id === "for-you" ? { ...s, loading: false, hits: [] } : s)));
      }
    });

    SECTION_CONFIGS.filter((s) => s.id !== "for-you").forEach((config) => fetchSection(config.id, 0, false));
  }, [missingAlgolia]); // eslint-disable-line

  const handleLoadMore = useCallback((sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || section.loading || !section.hasMore) return;
    track("Load More", {
      source: "Discover Carousel",
      section: sectionId,
      currentOffset: section.page,
    });
    trackClevertap("Load More", { source: "Discover Carousel", section: sectionId });
    fetchSection(sectionId, section.page + 1, true);
  }, [sections, fetchSection]);

  const handlePillClick = useCallback((term: string, type: "seasonal" | "trending" = "seasonal") => {
    track("Explore Action", {
      type: "prompt",
      target: type,
      title: term,
    });
    trackClevertap("Explore Action", { type: "prompt", target: type, title: term });
    setSearchQuery(term);
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const handleSearchOpen = useCallback(() => {
    track("Discover Search Bar Tapped", {});
    trackClevertap("Discover Search Bar Tapped", {});
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);
  const handleSearchClose = useCallback(() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); setSearchError(null); }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const trimmed = searchQuery.trim();
    if (!trimmed) { setSearchResults([]); setSearchLoading(false); setSearchError(null); return; }

    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const data = await searchAlgolia(trimmed, { hitsPerPage: 12, page: 0, attributesToRetrieve: buildAttributes(currentLang) });
        setSearchResults(Array.isArray(data?.hits) ? data.hits : []);
      } catch (err: any) {
        setSearchError(err?.message || "Unable to fetch results.");
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery, searchOpen, currentLang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); handleSearchOpen(); }
      if (e.key === "Escape" && searchOpen) handleSearchClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSearchOpen, handleSearchClose, searchOpen]);

  const forYouSection = sections.find((s) => s.id === "for-you");
  const conditionsSection = sections.find((s) => s.id === "conditions");
  const medicationsSection = sections.find((s) => s.id === "medications");
  const symptomsSection = sections.find((s) => s.id === "symptoms");
  const proceduresSection = sections.find((s) => s.id === "procedures");
  const wellnessSection = sections.find((s) => s.id === "wellness");

  return (
    <div className="explore-page">
      <div className="explore-container">
        {/* Centered Header */}
        <header className="explore-header">
          <h1 className="explore-title">Health Library</h1>
          <p className="explore-subtitle">Trusted health content, curated for you</p>
          <div className="explore-search-bar">
            <button className="explore-search-trigger" type="button" onClick={handleSearchOpen}>
              <Search size={18} />
              <span className="explore-search-placeholder">Search Health Library</span>
              <span className="explore-search-kbd">⌘K</span>
            </button>
          </div>
        </header>

        {/* Seasonal Health Badges */}
        <div className="explore-badges">
          <div className="explore-badges__row">
            {SEASONAL_TOPICS.map((t) => {
              const TopicIcon = t.icon;
              return (
                <button key={t.keyword} className="explore-badge" onClick={() => handlePillClick(t.keyword, "seasonal")} style={{ '--accent': t.color } as React.CSSProperties}>
                  <TopicIcon size={14} /> {t.keyword}
                </button>
              );
            })}
          </div>
        </div>

        {/* For You - Spotlight with personalized subtitle */}
        {hasPersonalizedTerms && forYouSection && forYouSection.hits.length > 0 && (
          <SpotlightSection section={forYouSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("for-you")} onCardClick={handleCardClick} personalizedTerms={personalizedTerms} />
        )}

        {/* Conditions - Card Stack */}
        {conditionsSection && <CardStackSection section={conditionsSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("conditions")} onCardClick={handleCardClick} />}

        {/* Wellness/Blogs - Horizontal Scroll */}
        {wellnessSection && <MagazineSection section={wellnessSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("wellness")} onCardClick={handleCardClick} />}

        {/* Medications - Scroll horizontal */}
        {medicationsSection && <ScrollSection section={medicationsSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("medications")} onCardClick={handleCardClick} />}

        {/* Symptoms - Tiles */}
        {symptomsSection && <TilesSection section={symptomsSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("symptoms")} onCardClick={handleCardClick} />}

        {/* Procedures - Scroll horizontal */}
        {proceduresSection && <ScrollSection section={proceduresSection} lang={currentLang} onAskAugust={handleAskAugust} onLoadMore={() => handleLoadMore("procedures")} onCardClick={handleCardClick} />}

        {missingAlgolia && (
          <div className="explore-empty">
            <div className="explore-empty-icon"><AlertCircle size={48} /></div>
            <h3>Configuration Required</h3>
            <p>Configure Algolia environment variables to enable the health library.</p>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="explore-search-overlay" onClick={handleSearchClose}>
          <div className="explore-search-modal" onClick={(e) => e.stopPropagation()}>
            <p className="explore-search-info">Find trusted health articles, conditions, medications, and more</p>
            <div className="explore-search-modal-header">
              <div className="explore-search-modal-input">
                <Search size={18} />
                <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Health Library" />
              </div>
              <button className="explore-search-close" onClick={handleSearchClose}><X size={18} /></button>
            </div>
            <div className="explore-search-body">
              {!searchQuery && (
                <div className="explore-search-suggestions">
                  <h4>Trending searches</h4>
                  <div className="explore-badges__row explore-badges__row--modal">
                    {FALLBACK_TRENDING.map((term) => (
                      <button key={term} className="explore-badge" onClick={() => handlePillClick(term, "trending")}>
                        <TrendingUp size={14} /> {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="explore-search-results">
                {searchLoading && <div className="explore-search-loading"><Loader2 size={32} className="animate-spin" /><p>Searching...</p></div>}
                {searchError && <div className="explore-search-empty"><AlertCircle size={32} /><p>{searchError}</p></div>}
                {!searchLoading && !searchError && searchQuery && searchResults.length === 0 && <div className="explore-search-empty"><Inbox size={32} /><p>No results for "{searchQuery}"</p></div>}
                {searchResults.map((hit, index) => {
                  const url = getUrl(hit, currentLang);
                  const image = getImage(hit);
                  const title = getTitle(hit, currentLang);
                  const excerpt = getExcerpt(hit, currentLang);
                  return (
                    <div key={hit.objectID || title} className="explore-search-result" style={{ cursor: url ? 'pointer' : 'default' }} onClick={() => {
                      if (url) {
                        track("Discover Search Result Clicked", { title, position: index, query: searchQuery });
                        trackClevertap("Discover Search Result Clicked", { title, position: index, query: searchQuery });
                        handleSearchClose();
                        handleCardClick(url, title, { position: index, component_type: "search_result" });
                      }
                    }}>
                      {image ? <img src={image} alt={title} className="explore-search-result-img" loading="lazy" /> : <div className="explore-search-result-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={20} /></div>}
                      <div className="explore-search-result-content"><h4>{title}</h4><p>{excerpt}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
