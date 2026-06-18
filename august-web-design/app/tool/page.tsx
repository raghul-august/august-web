"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import {
    TOOLS,
    TOOL_CATEGORIES,
    type ToolMeta,
    type ToolCategoryId,
    type ToolId,
} from "@/lib/tools";
import { useToolsStore } from "@/stores/tools-store";
import { ChatAppProviders } from "@/app/components/chat-app-providers";
import { ToolsShell } from "./shell";
import { FeaturedCarousel } from "@/app/components/tool/featured-carousel";
import { FilterDropdown, FilterResultsView } from "@/app/components/tool/filter";
import { AllToolsSection, SearchResults, ToolCard } from "@/app/components/tool/tool-grid";

// null = category landing; "all" or a category id = drilled-in tool list.
type ActiveCat = ToolCategoryId | "all" | null;

// Fixed order: Featured first, then New, then the rest (stable within each rank).
const tagRank = (t: ToolMeta) => (t.tag === "Featured" ? 0 : t.tag === "New" ? 1 : 2);

export default function ToolsExplorePage() {
    const router = useRouter();
    const setLastUsedTool = useToolsStore((s) => s.setLastUsedTool);

    const [activeCat, setActiveCat] = useState<ActiveCat>(null);
    const [query, setQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<ToolCategoryId[]>([]);

    const handleOpen = useCallback((tool: ToolMeta) => {
        setLastUsedTool(tool.id as ToolId);
        router.push(tool.href);
    }, [router, setLastUsedTool]);

    const toggleFilter = useCallback((id: ToolCategoryId) => {
        setSelectedFilters((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }, []);

    const clearFilters = useCallback(() => setSelectedFilters([]), []);

    const sortedTools = useMemo(
        () =>
            TOOLS.map((t, i) => [t, i] as const)
                .sort((a, b) => tagRank(a[0]) - tagRank(b[0]) || a[1] - b[1])
                .map(([t]) => t),
        []
    );

    const newTools = useMemo(() => sortedTools.filter((t) => t.tag === "New"), [sortedTools]);
    const featuredTools = useMemo(
        () => sortedTools.filter((t) => t.tag === "Featured"),
        [sortedTools]
    );

    const filtered = useMemo(() => {
        if (activeCat === null || activeCat === "all") return sortedTools;
        return sortedTools.filter((t) => t.categories.includes(activeCat));
    }, [sortedTools, activeCat]);

    const trimmedQuery = query.trim().toLowerCase();
    const hasQuery = trimmedQuery.length > 0;
    const hasFilters = selectedFilters.length > 0;

    const matchedTools = useMemo(() => {
        if (!hasQuery && !hasFilters) return null;
        return sortedTools.filter((t) => {
            if (hasQuery) {
                const hit =
                    t.label.toLowerCase().includes(trimmedQuery) ||
                    t.description.toLowerCase().includes(trimmedQuery);
                if (!hit) return false;
            }
            if (hasFilters) {
                const inCat = t.categories.some((c) => selectedFilters.includes(c));
                if (!inCat) return false;
            }
            return true;
        });
    }, [sortedTools, hasQuery, hasFilters, trimmedQuery, selectedFilters]);

    const searchResults = hasQuery && !hasFilters ? matchedTools : null;
    const filterResults = hasFilters ? matchedTools : null;

    const activeCatMeta =
        activeCat && activeCat !== "all"
            ? TOOL_CATEGORIES.find((c) => c.id === activeCat) ?? null
            : null;

    return (
        <ChatAppProviders>
            <ToolsShell>
                <div className="max-w-3xl mx-auto px-6 sm:px-6 md:px-8 py-8 md:py-12">
                    {activeCat === null ? (
                        <CategoryLanding
                            allTools={sortedTools}
                            newTools={newTools}
                            featuredTools={featuredTools}
                            query={query}
                            onQueryChange={setQuery}
                            searchResults={searchResults}
                            onOpen={handleOpen}
                            selectedFilters={selectedFilters}
                            onToggleFilter={toggleFilter}
                            onClearFilters={clearFilters}
                            filterResults={filterResults}
                        />
                    ) : (
                        <CategoryTools
                            title={activeCatMeta ? activeCatMeta.label : "All tools"}
                            count={filtered.length}
                            tools={filtered}
                            groupByCategory={activeCat === "all"}
                            onBack={() => setActiveCat(null)}
                            onOpen={handleOpen}
                        />
                    )}
                </div>
            </ToolsShell>
        </ChatAppProviders>
    );
}

function CategoryLanding({
    allTools,
    newTools,
    featuredTools,
    query,
    onQueryChange,
    searchResults,
    onOpen,
    selectedFilters,
    onToggleFilter,
    onClearFilters,
    filterResults,
}: {
    allTools: readonly ToolMeta[];
    newTools: readonly ToolMeta[];
    featuredTools: readonly ToolMeta[];
    query: string;
    onQueryChange: (q: string) => void;
    searchResults: readonly ToolMeta[] | null;
    onOpen: (t: ToolMeta) => void;
    selectedFilters: ToolCategoryId[];
    onToggleFilter: (id: ToolCategoryId) => void;
    onClearFilters: () => void;
    filterResults: readonly ToolMeta[] | null;
}) {
    return (
        <>
            <header className="mb-6">
                <h1
                    className="text-3xl md:text-4xl font-medium tracking-tight"
                    style={{ color: "var(--foreground)" }}
                >
                    All Tools
                </h1>
                <p
                    className="mt-2 text-sm md:text-base max-w-xl"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    Browse by category to find the right helper for your health, finances, and care navigation.
                </p>
            </header>

            <div className="mb-7 max-w-2xl flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search tools…"
                        className="w-full h-11 pl-4 pr-11 rounded-full border bg-transparent text-sm outline-none transition-colors focus:border-[var(--primary)]"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        aria-label="Search tools"
                    />
                    <Search
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: "var(--muted-foreground)", strokeWidth: 1.75 }}
                    />
                </div>
                <FilterDropdown
                    selected={selectedFilters}
                    onToggle={onToggleFilter}
                    onClear={onClearFilters}
                />
            </div>

            {searchResults ? (
                <SearchResults results={searchResults} onOpen={onOpen} />
            ) : filterResults ? (
                <FilterResultsView
                    selectedFilters={selectedFilters}
                    onToggleFilter={onToggleFilter}
                    onClearFilters={onClearFilters}
                    results={filterResults}
                    onOpen={onOpen}
                />
            ) : (
                <>
                    {newTools.length > 0 && (
                        <FeaturedCarousel title="New" tools={newTools} onOpen={onOpen} />
                    )}
                    {featuredTools.length > 0 && (
                        <FeaturedCarousel title="Featured" tools={featuredTools} onOpen={onOpen} />
                    )}
                    {allTools.length > 0 && (
                        <AllToolsSection tools={allTools} onOpen={onOpen} />
                    )}
                </>
            )}
        </>
    );
}


function CategoryTools({
    title,
    count,
    tools,
    groupByCategory,
    onBack,
    onOpen,
}: {
    title: string;
    count: number;
    tools: readonly ToolMeta[];
    groupByCategory: boolean;
    onBack: () => void;
    onOpen: (t: ToolMeta) => void;
}) {
    return (
        <>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-sm font-medium mb-4 transition-colors hover:text-[var(--primary)]"
                style={{ color: "var(--muted-foreground)" }}
            >
                <ChevronLeft className="h-4 w-4" />
                All categories
            </button>

            <header className="mb-5">
                <h1
                    className="text-2xl md:text-3xl font-medium tracking-tight"
                    style={{ color: "var(--foreground)" }}
                >
                    {title}
                </h1>
                <p className="mt-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <strong className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {count}
                    </strong>{" "}
                    {count === 1 ? "tool" : "tools"}
                </p>
            </header>

            {groupByCategory ? (
                <div className="space-y-7">
                    {TOOL_CATEGORIES.map((cat) => {
                        const categoryTools = tools.filter((t) => t.categories[0] === cat.id);
                        if (categoryTools.length === 0) return null;
                        return (
                            <div key={cat.id}>
                                <h2
                                    className="text-[11px] font-bold uppercase mb-2.5"
                                    style={{ color: "var(--muted-foreground)", letterSpacing: "0.12em" }}
                                >
                                    {cat.label}
                                </h2>
                                <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
                                    {categoryTools.map((tool) => (
                                        <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
                    ))}
                </div>
            )}
        </>
    );
}
