"use client";

import { useEffect, useRef, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { TOOL_CATEGORIES, type ToolCategoryId, type ToolMeta } from "@/lib/tools";
import { ToolCard } from "./tool-grid";

export function FilterDropdown({
    selected,
    onToggle,
    onClear,
}: {
    selected: ToolCategoryId[];
    onToggle: (id: ToolCategoryId) => void;
    onClear: () => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border text-xs font-medium transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
                <SlidersHorizontal className="w-3.5 h-3.5" style={{ strokeWidth: 1.75 }} />
                Filter
                {selected.length > 0 && (
                    <span
                        className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
                        style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground, #fff)",
                        }}
                    >
                        {selected.length}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute right-0 mt-2 w-72 max-h-[360px] overflow-auto rounded-xl border shadow-lg z-20 p-1.5"
                    style={{ background: "var(--background)", borderColor: "var(--border)" }}
                >
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <span
                            className="text-[11px] font-bold uppercase"
                            style={{ color: "var(--muted-foreground)", letterSpacing: "0.12em" }}
                        >
                            Filter by category
                        </span>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-[11px] font-medium hover:underline"
                                style={{ color: "var(--primary)" }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="h-px my-1" style={{ background: "var(--border)" }} />
                    {TOOL_CATEGORIES.map((c) => {
                        const isSel = selected.includes(c.id);
                        const Icon = c.icon;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                role="option"
                                aria-selected={isSel}
                                onClick={() => onToggle(c.id)}
                                className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-left transition-colors hover:bg-[var(--muted)]"
                            >
                                <span
                                    className="inline-flex items-center justify-center w-4 h-4 rounded border shrink-0"
                                    style={{
                                        borderColor: isSel ? "var(--primary)" : "var(--border)",
                                        background: isSel ? "var(--primary)" : "transparent",
                                    }}
                                >
                                    {isSel && (
                                        <Check
                                            className="w-3 h-3"
                                            style={{
                                                color: "var(--primary-foreground, #fff)",
                                                strokeWidth: 3,
                                            }}
                                        />
                                    )}
                                </span>
                                <Icon
                                    className="w-3.5 h-3.5 shrink-0"
                                    style={{ color: "var(--muted-foreground)", strokeWidth: 1.75 }}
                                />
                                <span className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                                    {c.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function FilterResultsView({
    selectedFilters,
    onToggleFilter,
    onClearFilters,
    results,
    onOpen,
}: {
    selectedFilters: ToolCategoryId[];
    onToggleFilter: (id: ToolCategoryId) => void;
    onClearFilters: () => void;
    results: readonly ToolMeta[];
    onOpen: (t: ToolMeta) => void;
}) {
    return (
        <>
            <h2
                className="text-[11px] font-bold uppercase mb-2.5"
                style={{ color: "var(--muted-foreground)", letterSpacing: "0.12em" }}
            >
                Filtered tools · {results.length}
            </h2>

            <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedFilters.map((id) => {
                    const meta = TOOL_CATEGORIES.find((c) => c.id === id);
                    if (!meta) return null;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onToggleFilter(id)}
                            className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full text-xs font-medium transition-colors"
                            style={{
                                background: "rgba(32,110,85,0.07)",
                                color: "var(--primary)",
                            }}
                        >
                            {meta.label}
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[var(--muted)]">
                                <X className="w-3 h-3" style={{ strokeWidth: 2 }} />
                            </span>
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium hover:underline"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    Clear all
                </button>
            </div>

            {results.length === 0 ? (
                <p
                    className="text-center text-sm py-10"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    No tools match the selected categories.
                </p>
            ) : (
                <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
                    {results.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
                    ))}
                </div>
            )}
        </>
    );
}
