"use client";

import { memo, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colorForTool, type ToolMeta } from "@/lib/tools";

export function FeaturedCarousel({
    title,
    tools,
    onOpen,
}: {
    title: string;
    tools: readonly ToolMeta[];
    onOpen: (t: ToolMeta) => void;
}) {
    const hasMany = tools.length > 1;
    // Bookend the real slides with clones so both edges can wrap silently:
    //   [lastClone, ...tools, firstClone]
    // Real first lives at index REAL_FIRST, real last at REAL_LAST. When we
    // land on either clone we wait for the slide animation to finish and then
    // jump `index` to the matching real slide with the transition off, so the
    // viewer sees pure forward (or backward) motion with no visible reset.
    const slides = hasMany
        ? [tools[tools.length - 1], ...tools, tools[0]]
        : tools;
    const REAL_FIRST = hasMany ? 1 : 0;
    const REAL_LAST = hasMany ? slides.length - 2 : 0;

    const [index, setIndex] = useState(REAL_FIRST);
    const [animate, setAnimate] = useState(true);

    const goTo = (realIdx: number) => {
        setAnimate(true);
        setIndex(REAL_FIRST + realIdx);
    };
    const goNext = () => {
        setAnimate(true);
        setIndex((i) => i + 1);
    };
    const goPrev = () => {
        setAnimate(true);
        setIndex((i) => i - 1);
    };

    // Autoplay: advance one slide every 3.9s. The snap-back effects handle the
    // wrap if we step onto the forward clone.
    useEffect(() => {
        if (!hasMany) return;
        const id = setInterval(() => {
            setAnimate(true);
            setIndex((i) => i + 1);
        }, 3900);
        return () => clearInterval(id);
    }, [hasMany]);

    // Forward wrap: when we land on the forward clone, snap to the real first
    // slide with no animation.
    useEffect(() => {
        if (!hasMany) return;
        if (index !== slides.length - 1) return;
        const id = setTimeout(() => {
            setAnimate(false);
            setIndex(REAL_FIRST);
        }, 550);
        return () => clearTimeout(id);
    }, [index, slides.length, hasMany, REAL_FIRST]);

    // Backward wrap: when we land on the backward clone, snap to the real last
    // slide with no animation.
    useEffect(() => {
        if (!hasMany) return;
        if (index !== 0) return;
        const id = setTimeout(() => {
            setAnimate(false);
            setIndex(REAL_LAST);
        }, 550);
        return () => clearTimeout(id);
    }, [index, hasMany, REAL_LAST]);

    // Re-enable the transition on the next paint after a silent jump.
    useEffect(() => {
        if (animate) return;
        const id = requestAnimationFrame(() => {
            requestAnimationFrame(() => setAnimate(true));
        });
        return () => cancelAnimationFrame(id);
    }, [animate]);

    const canPrev = hasMany;
    const canNext = hasMany;
    const activeDot = hasMany
        ? (index - REAL_FIRST + tools.length) % tools.length
        : 0;

    return (
        <section className="mb-2">
            <h2
                className="text-[11px] font-bold uppercase mb-2.5"
                style={{ color: "var(--muted-foreground)", letterSpacing: "0.12em" }}
            >
                {title}
            </h2>
            <div className="relative">
                <CarouselArrow
                    direction="prev"
                    disabled={!canPrev}
                    onClick={goPrev}
                />
                <div className="overflow-hidden">
                    <div
                        className="flex"
                        style={{
                            transform: `translateX(-${index * 100}%)`,
                            transition: animate ? "transform 500ms ease-out" : "none",
                        }}
                    >
                        {slides.map((tool, i) => (
                            <div
                                key={`${tool.id}-${i}`}
                                aria-hidden={hasMany && i === slides.length - 1}
                                className="shrink-0 basis-full min-w-0"
                            >
                                <FeaturedToolCard tool={tool} onOpen={onOpen} />
                            </div>
                        ))}
                    </div>
                </div>
                <CarouselArrow
                    direction="next"
                    disabled={!canNext}
                    onClick={goNext}
                />
            </div>
            {hasMany && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {tools.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Go to page ${i + 1}`}
                            className="w-1.5 h-1.5 rounded-full transition-colors"
                            style={{
                                background:
                                    i === activeDot
                                        ? "var(--foreground)"
                                        : "var(--border)",
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function CarouselArrow({
    direction,
    disabled,
    onClick,
}: {
    direction: "prev" | "next";
    disabled: boolean;
    onClick: () => void;
}) {
    const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === "prev" ? "Previous" : "Next"}
            className="flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 rounded-full border bg-[var(--background)] transition-opacity disabled:opacity-30 disabled:cursor-default hover:bg-[var(--muted)]"
            style={{
                borderColor: "var(--border)",
                [direction === "prev" ? "left" : "right"]: "-1.5rem",
            }}
        >
            <Icon
                className="w-4 h-4"
                style={{ color: "var(--muted-foreground)", strokeWidth: 1.75 }}
            />
        </button>
    );
}

const FeaturedToolCard = memo(function FeaturedToolCard({
    tool,
    onOpen,
}: {
    tool: ToolMeta;
    onOpen: (t: ToolMeta) => void;
}) {
    const base = colorForTool(tool);
    return (
        <div
            className="rounded-2xl flex flex-col sm:flex-row sm:items-start gap-3 p-4 sm:p-5 sm:pb-3 sm:min-h-28 w-full h-full sm:max-w-2xl sm:mx-auto overflow-hidden"
            style={{
                background: `linear-gradient(to right, ${base} 25%, color-mix(in srgb, ${base} 65%, white) 100%)`,
            }}
        >
            <div className="w-full sm:basis-[65%] sm:shrink-0 min-w-0">
                <h3
                    className="text-md sm:text-lg md:text-xl font-semibold tracking-tight"
                    style={{ color: "#fff", lineHeight: 1.2 }}
                >
                    {tool.subheading ?? tool.label}
                </h3>
                <p
                    className="mt-1.5 text-sm line-clamp-1 sm:line-clamp-2"
                    style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.4 }}
                >
                    {tool.description}
                </p>
            </div>
            <button
                type="button"
                onClick={() => onOpen(tool)}
                className="self-start sm:self-end sm:ml-auto inline-flex items-center justify-center text-center min-h-9 sm:min-h-11 px-3.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-transform hover:scale-[1.02]"
                style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                }}
            >
                {tool.ctaLabel ?? `Open ${tool.label}`}
            </button>
        </div>
    );
});
