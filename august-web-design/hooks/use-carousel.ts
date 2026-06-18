'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface UseCarouselResult {
    pageCount: number;
    activePage: number;
    scrollByPage: (dir: 1 | -1) => void;
    scrollToPage: (page: number) => void;
}

export function useCarousel(
    scrollerRef: RefObject<HTMLDivElement | null>,
    depCount: number
): UseCarouselResult {
    const [pageCount, setPageCount] = useState(1);
    const [activePage, setActivePage] = useState(0);

    const recompute = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const pageWidth = el.clientWidth || 1;
        const pages = Math.max(1, Math.round(el.scrollWidth / pageWidth));
        setPageCount(pages);
        setActivePage(Math.round(el.scrollLeft / pageWidth));
    }, [scrollerRef]);

    useEffect(() => {
        recompute();
        const el = scrollerRef.current;
        if (!el) return;
        const onScroll = () => {
            const pageWidth = el.clientWidth || 1;
            setActivePage(Math.round(el.scrollLeft / pageWidth));
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        const ro = new ResizeObserver(recompute);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, [recompute, depCount, scrollerRef]);

    const scrollByPage = useCallback(
        (dir: 1 | -1) => {
            const el = scrollerRef.current;
            if (!el) return;
            el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
        },
        [scrollerRef]
    );

    const scrollToPage = useCallback(
        (page: number) => {
            const el = scrollerRef.current;
            if (!el) return;
            el.scrollTo({ left: page * el.clientWidth, behavior: 'smooth' });
        },
        [scrollerRef]
    );

    return { pageCount, activePage, scrollByPage, scrollToPage };
}
