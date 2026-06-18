"use client";

import { memo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { CATEGORY_BY_ID, FALLBACK_CATEGORY_ICON, categoryColorForTool, type ToolMeta } from "@/lib/tools";

export const ToolCard = memo(function ToolCard({
    tool,
    onOpen,
}: {
    tool: ToolMeta;
    onOpen: (t: ToolMeta) => void;
}) {
    const primary = tool.categories[0];
    const Icon = primary ? CATEGORY_BY_ID[primary].icon : FALLBACK_CATEGORY_ICON;
    return (
        <button
            type="button"
            onClick={() => onOpen(tool)}
            className="group text-left p-3.5 rounded-xl border transition-colors hover:bg-[var(--muted)] flex flex-col h-full w-full"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="flex items-start gap-2">
                <span
                    className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg"
                    style={{ background: categoryColorForTool(tool) }}
                >
                    <Icon
                        className="w-4 h-4"
                        style={{ color: "var(--foreground)", strokeWidth: 1.75 }}
                    />
                </span>
                <h3
                    className="flex-1 min-w-0 line-clamp-2"
                    style={{ color: "var(--foreground)", fontSize: 15, fontWeight: 500, lineHeight: 1.3, minHeight: "2.6em" }}
                >
                    {tool.label}
                </h3>
            </div>
            <p
                className="mt-1.5 line-clamp-2 pl-[36px]"
                style={{ color: "var(--muted-foreground)", fontSize: 13, lineHeight: 1.4, minHeight: "2.8em" }}
            >
                {tool.description}
            </p>
        </button>
    );
});

export function SearchResults({
    results,
    onOpen,
}: {
    results: readonly ToolMeta[];
    onOpen: (t: ToolMeta) => void;
}) {
    if (results.length === 0) {
        return (
            <p
                className="text-center text-sm py-10"
                style={{ color: "var(--muted-foreground)" }}
            >
                No tools match your search.
            </p>
        );
    }
    return (
        <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
            ))}
        </div>
    );
}

export function AllToolsSection({
    tools,
    onOpen,
}: {
    tools: readonly ToolMeta[];
    onOpen: (t: ToolMeta) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const INITIAL_COUNT = 6;
    const hasMore = tools.length > INITIAL_COUNT;
    const visibleTools = expanded ? tools : tools.slice(0, INITIAL_COUNT);

    return (
        <section className="mb-7">
            <h2
                className="text-[11px] font-bold uppercase mb-2.5"
                style={{ color: "var(--muted-foreground)", letterSpacing: "0.12em" }}
            >
                All Tools
            </h2>
            <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
                {visibleTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
                ))}
            </div>
            {hasMore && (
                <div className="flex justify-center mt-4">
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                        style={{
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                        }}
                    >
                        {expanded ? "Show less" : "View more"}
                        <ChevronRight
                            className="w-3.5 h-3.5 transition-transform"
                            style={{
                                strokeWidth: 1.75,
                                transform: expanded ? "rotate(-90deg)" : "rotate(90deg)",
                            }}
                        />
                    </button>
                </div>
            )}
        </section>
    );
}
