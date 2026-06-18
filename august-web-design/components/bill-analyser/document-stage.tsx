'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import logger from '@/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfjsLib = any;
let pdfjsLoaded: PdfjsLib | null = null;

async function loadPdfjsFromCDN(): Promise<PdfjsLib> {
    if (pdfjsLoaded) return pdfjsLoaded;
    // @ts-expect-error CDN dynamic import has no type declarations
    const lib = await import(/* webpackIgnore: true */ 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.min.mjs');
    lib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
    pdfjsLoaded = lib;
    return lib;
}

interface DocumentStageProps {
    fileUrl: string;
    mimeType: string;
}

export function DocumentStage({ fileUrl, mimeType }: DocumentStageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [pdfFallback, setPdfFallback] = useState(false);

    const isPdf = mimeType?.includes('pdf');

    const renderPdf = useCallback(async (url: string, container: HTMLDivElement) => {
        try {
            const pdfjsLib = await loadPdfjsFromCDN();
            const pdf = await pdfjsLib.getDocument(url).promise;
            const containerWidth = container.clientWidth || window.innerWidth;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                // get the natural page size at scale=1
                const baseViewport = page.getViewport({ scale: 1 });
                // compute scale to fit container width, with 2x device pixel ratio for sharpness
                const fitScale = containerWidth / baseViewport.width;
                const renderScale = fitScale * (window.devicePixelRatio || 2);
                const viewport = page.getViewport({ scale: renderScale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                // display at exactly the container width
                canvas.style.display = 'block';
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = 'auto';

                const ctx = canvas.getContext('2d')!;
                await page.render({ canvasContext: ctx, viewport }).promise;
                container.appendChild(canvas);
            }
        } catch (err) {
            logger.error('[DocumentStage] PDF render error, falling back to iframe:', { error: String(err) });
            setPdfFallback(true);
        }
    }, []);

    useEffect(() => {
        if (!fileUrl) return;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        setImageUrl(null);
        setPdfFallback(false);

        if (isPdf) {
            renderPdf(fileUrl, container);
        } else {
            setImageUrl(fileUrl);
        }
    }, [fileUrl, mimeType, isPdf, renderPdf]);

    if (isPdf && pdfFallback) {
        return (
            <div className="relative" style={{ backgroundColor: '#F5F5F4', minHeight: '100%' }}>
                <iframe
                    src={fileUrl}
                    title="PDF document"
                    style={{ width: '100%', minHeight: '100vh', border: 'none' }}
                />
            </div>
        );
    }

    return (
        <div
            className="relative"
            style={{ backgroundColor: '#F5F5F4', minHeight: '100%', overflow: 'hidden' }}
        >
            <div
                ref={containerRef}
                className="relative"
                style={{ width: '100%' }}
            >
                {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Uploaded document" style={{ width: '100%', height: 'auto', display: 'block' }} />
                )}
            </div>
        </div>
    );
}
