'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPinIcon, CaretRightIcon } from '@phosphor-icons/react/ssr';
import { checkCountry } from '@/app/utils/checkCountry';
import { track } from '@/app/utils/analytics';
import './telehealth-promo.css';

export default function TelehealthPromoBanner({ bannerId, pageType, articleSlug, language, onVisible }) {
  const [eligible, setEligible] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);
  const show = eligible && scrolledPast;

  useEffect(() => {
    if (checkCountry() !== 'US') return;
    setEligible(true);
    onVisible(bannerId);
  }, [bannerId, onVisible]);

  useEffect(() => {
    if (!eligible) return;
    const onScroll = () => setScrolledPast(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [eligible]);

  const handleCtaClick = () => {
    track('cta_clicked', {
      location: 'health_library_banner',
      copy: 'Get started',
      destination: '/chat?anon_telehealth=true',
      page_type: pageType,
      article_slug: articleSlug || '',
      banner_id: bannerId,
    });
  };

  if (!eligible) return null;

  return (
    <>
      <div className={`th-float-card${show ? ' show' : ''}`}>
        <div className="th-float-avatars">
          <Image src="/urgent-care/doctor-1.webp" alt="Licensed doctor" width={62} height={62} />
          <Image className="th-float-mid" src="/urgent-care/doctor-2.webp" alt="Licensed doctor" width={74} height={74} />
          <Image src="/urgent-care/doctor-3.webp" alt="Licensed doctor" width={62} height={62} />
        </div>
        <p className="th-float-title">Talk to a licensed doctor</p>
        <span className="th-float-coverage"><MapPinIcon size={16} weight="fill" aria-hidden /> Doctors available in 50 states + DC</span>
        <a href="/chat?anon_telehealth=true" className="th-float-cta" onClick={handleCtaClick}>Get started <CaretRightIcon size={14} weight="bold" aria-hidden /></a>
      </div>

      <div className={`th-sticky-bar${show ? ' show' : ''}`}>
        <div className="th-sticky-inner">
          <div className="th-sticky-trust">
            <div className="th-sticky-avatars">
              <Image src="/urgent-care/doctor-1.webp" alt="Licensed doctor" width={30} height={30} />
              <Image src="/urgent-care/doctor-2.webp" alt="Licensed doctor" width={30} height={30} />
              <Image src="/urgent-care/doctor-3.webp" alt="Licensed doctor" width={30} height={30} />
            </div>
            <span className="th-sticky-text"><MapPinIcon size={14} weight="fill" aria-hidden /> Doctors available in 50 states + DC</span>
          </div>
          <a href="/chat?anon_telehealth=true" className="th-sticky-cta" onClick={handleCtaClick}>Get started</a>
        </div>
      </div>
    </>
  );
}
