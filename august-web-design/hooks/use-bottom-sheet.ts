'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const SNAP_POINTS = { collapsed: 64, half: 0.5, expanded: 0.85 };
const FLICK_VELOCITY = 0.5; // px/ms

type SnapName = 'collapsed' | 'half' | 'expanded';

function resolveSnapPx(snap: number, windowHeight: number): number {
    return snap < 1 ? snap * windowHeight : snap;
}

export function useBottomSheet(initialSnap: SnapName = 'half') {
    const [snapPoint, setSnapPoint] = useState<SnapName>(initialSnap);
    const [sheetY, setSheetY] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startY: 0, startSheetY: 0, positions: [] as { y: number; t: number }[] });
    const sheetRef = useRef<HTMLDivElement>(null);

    const getWindowHeight = () => (typeof window !== 'undefined' ? window.innerHeight : 800);

    const getSnapPx = useCallback(
        (name: SnapName) => resolveSnapPx(SNAP_POINTS[name], getWindowHeight()),
        []
    );

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const currentHeight = mounted ? (sheetY ?? getSnapPx(snapPoint)) : SNAP_POINTS.collapsed;

    const snapTo = useCallback((name: SnapName) => {
        setSnapPoint(name);
        setSheetY(null);
        setIsDragging(false);
    }, []);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            const currentPx = sheetY ?? getSnapPx(snapPoint);
            dragRef.current = {
                startY: e.clientY,
                startSheetY: currentPx,
                positions: [{ y: e.clientY, t: Date.now() }],
            };
            setIsDragging(true);
        },
        [snapPoint, sheetY, getSnapPx]
    );

    const onPointerMove = useCallback(
        (e: PointerEvent) => {
            if (!isDragging) return;
            const delta = dragRef.current.startY - e.clientY;
            const newHeight = Math.max(
                SNAP_POINTS.collapsed,
                Math.min(dragRef.current.startSheetY + delta, getWindowHeight() * 0.95)
            );
            setSheetY(newHeight);
            const positions = dragRef.current.positions;
            positions.push({ y: e.clientY, t: Date.now() });
            if (positions.length > 4) positions.shift();
        },
        [isDragging]
    );

    const onPointerUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const positions = dragRef.current.positions;
        const wh = getWindowHeight();

        let velocity = 0;
        if (positions.length >= 2) {
            const last = positions[positions.length - 1];
            const prev = positions[0];
            const dt = last.t - prev.t;
            if (dt > 0) velocity = (prev.y - last.y) / dt;
        }

        const current = sheetY ?? getSnapPx(snapPoint);
        const halfPx = resolveSnapPx(SNAP_POINTS.half, wh);

        if (Math.abs(velocity) > FLICK_VELOCITY) {
            if (velocity > 0) {
                setSnapPoint(current < halfPx ? 'half' : 'expanded');
            } else {
                setSnapPoint(current > halfPx ? 'half' : 'collapsed');
            }
            setSheetY(null);
            return;
        }

        const collapsedPx = SNAP_POINTS.collapsed;
        const expandedPx = resolveSnapPx(SNAP_POINTS.expanded, wh);
        const distances: { name: SnapName; d: number }[] = [
            { name: 'collapsed', d: Math.abs(current - collapsedPx) },
            { name: 'half', d: Math.abs(current - halfPx) },
            { name: 'expanded', d: Math.abs(current - expandedPx) },
        ];
        distances.sort((a, b) => a.d - b.d);
        setSnapPoint(distances[0].name);
        setSheetY(null);
    }, [isDragging, sheetY, snapPoint, getSnapPx]);

    useEffect(() => {
        if (!isDragging) return;
        const handleMove = (e: PointerEvent) => onPointerMove(e);
        const handleUp = () => onPointerUp();
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [isDragging, onPointerMove, onPointerUp]);

    return { snapPoint, currentHeight, isDragging, snapTo, onPointerDown, sheetRef };
}
