'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useBillAnalyserStore } from '@/stores/bill-analyser-store';
import { track } from '@/services/analytics-service';
import type { BillLineItem } from '@/types/bill-analyser';
import { formatCurrency } from '@/utils/file-helpers';

const ease = [0.16, 1, 0.3, 1] as const;

function isFlagged(item: BillLineItem): boolean {
    return item.severity === 'red' || item.severity === 'amber';
}

type StatusFilter = 'all' | 'flagged' | 'standard';

interface FilterBarProps {
    statusFilter: StatusFilter;
    setStatusFilter: (v: StatusFilter) => void;
    categoryFilter: string | null;
    setCategoryFilter: (v: string | null) => void;
    categoryNames: string[];
}

function FilterBar({ statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, categoryNames, webview }: FilterBarProps & { webview?: boolean }) {
    const statusOptions: { value: StatusFilter; label: string }[] = webview
        ? [
            { value: 'flagged', label: 'Flagged' },
            { value: 'all', label: 'All' },
            { value: 'standard', label: 'Standard' },
        ]
        : [
            { value: 'all', label: 'All' },
            { value: 'flagged', label: 'Flagged' },
            { value: 'standard', label: 'Standard' },
        ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 mb-2">
            {statusOptions.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className="flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all"
                    style={statusFilter === opt.value
                        ? { background: '#302e28', color: '#fff', borderColor: '#302e28', boxShadow: '0 1px 3px rgba(48,46,40,0.2)' }
                        : { background: '#faf8f3', color: '#7a756a', borderColor: '#d9d3c8', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }
                    }
                >
                    {opt.label}
                </button>
            ))}
            <div className="w-px h-5 bg-[#d9d3c8] flex-shrink-0 mx-0.5" />
            <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors appearance-none pr-7 cursor-pointer outline-none"
                style={{
                    backgroundColor: categoryFilter ? '#302e28' : '#faf8f3',
                    color: categoryFilter ? '#fff' : '#7a756a',
                    borderColor: categoryFilter ? '#302e28' : '#d9d3c8',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='${categoryFilter ? '%23fff' : '%237a756a'}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                }}
            >
                <option value="">All categories</option>
                {categoryNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>
        </div>
    );
}

const SEVERITY_BAR_COLORS: Record<string, string> = {
    red: '#dc2626',
    amber: '#f59e0b',
    green: '#16a34a',
    unknown: '#c8c1b5',
};

function LineItemRow({ item, index }: { item: BillLineItem; index: number }) {
    const hasRange = item.typicalRange && item.typicalRange[0] !== null && item.typicalRange[1] !== null;
    const barColor = SEVERITY_BAR_COLORS[item.severity] || SEVERITY_BAR_COLORS.unknown;

    return (
        <>
            {/* Desktop: grid layout with severity bar */}
            <button
                type="button"
                onClick={() => useBillAnalyserStore.getState().setSelectedItemIndex(index)}
                className="hidden sm:grid w-full text-left transition-all duration-150 hover:bg-[rgba(32,110,85,0.03)]"
                style={{
                    gridTemplateColumns: '6px 1fr auto',
                    padding: '20px 12px',
                    borderBottom: '1px solid #d9d3c8',
                    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)',
                }}
            >
                <div
                    className="self-stretch"
                    style={{
                        width: '4px',
                        background: barColor,
                        borderRadius: '2px',
                    }}
                />
                <div className="min-w-0 pl-4">
                    <div className="text-[15px] font-semibold text-[#302e28] leading-snug">
                        {item.description}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        {item.cptCode && (
                            <span className="text-[12px] font-medium text-[#7a756a] bg-[#f5f3ef] px-1.5 py-0.5 rounded" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}>{item.cptCode}</span>
                        )}
                        {item.category && (
                            <span className="text-[12px] text-[#7a756a]">{item.category}</span>
                        )}
                    </div>
                </div>
                <div className="text-right pl-6 flex-shrink-0 self-center">
                    <div className="text-[15px] font-semibold text-[#302e28]">
                        {formatCurrency(item.chargeAmount)}
                    </div>
                    {hasRange && (
                        <div className="text-[12px] text-[#7a756a] mt-1">
                            Typical {formatCurrency(item.typicalRange![0])}-{formatCurrency(item.typicalRange![1])}
                        </div>
                    )}
                </div>
            </button>

            {/* Mobile: flex layout with severity dot */}
            <button
                type="button"
                onClick={() => useBillAnalyserStore.getState().setSelectedItemIndex(index)}
                className="sm:hidden flex items-center w-full text-left transition-all duration-150 active:bg-[rgba(32,110,85,0.03)]"
                style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #d9d3c8',
                    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.02)',
                }}
            >
                <div
                    className="flex-shrink-0 self-start mt-1.5"
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: barColor,
                    }}
                />
                <div className="flex-1 min-w-0 pl-3">
                    <div className="text-[15px] font-semibold text-[#302e28] leading-tight">
                        {item.description}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {item.cptCode && (
                            <span className="text-[11px] text-[#7a756a]">CPT {item.cptCode}</span>
                        )}
                        {item.cptCode && item.category && (
                            <span className="text-[11px] text-[#7a756a]">·</span>
                        )}
                        {item.category && (
                            <span className="text-[11px] text-[#7a756a]">{item.category}</span>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 text-right pl-3">
                    <div className="text-[15px] font-semibold text-[#302e28]">
                        {formatCurrency(item.chargeAmount)}
                    </div>
                    {hasRange && (
                        <div className="text-[11px] text-[#7a756a] mt-0.5">
                            {formatCurrency(item.typicalRange![0])}-{formatCurrency(item.typicalRange![1])}
                        </div>
                    )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a756a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 ml-2">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>

            {item.duplicateFlag && (
                <div className="px-5 py-2.5 flex items-start gap-2" style={{ background: '#fffbeb', borderBottom: '1px solid #f5e6b8', borderLeft: '3px solid #d97706' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="text-[11px] text-[#92400e]">{item.duplicateFlag.message}</span>
                </div>
            )}
        </>
    );
}

function SummarySidebar({
    analysis,
    flaggedCount,
    savings,
    totalPatientOwes,
    onFilterFlagged,
    onShowRecap,
    onViewPdf,
    onReset,
    webview,
}: {
    analysis: { provider: string | null; dateOfService: string | null; totalBilled: number };
    flaggedCount: number;
    savings: number;
    totalPatientOwes: number | null;
    onFilterFlagged: () => void;
    onShowRecap: () => void;
    onViewPdf?: () => void;
    onReset: () => void;
    webview?: boolean;
}) {
    return (
        <div className="flex flex-col gap-5">
            {/* Yellow attention banner for flagged charges */}
            {flaggedCount > 0 && (
                <button
                    type="button"
                    onClick={onFilterFlagged}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: '#EAB308', boxShadow: '0 2px 8px rgba(234,179,8,0.25), 0 1px 2px rgba(0,0,0,0.06)' }}
                >
                    <div className="w-8 h-8 rounded-full bg-[#faf8f3]/25 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        {webview && savings > 0 ? (
                            <>
                                <div className="text-[17px] font-bold text-[#302e28] leading-tight">
                                    {formatCurrency(savings)} in potential savings
                                </div>
                                <div className="text-[12px] text-[#302e28]/70 mt-0.5">
                                    {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-[14px] font-semibold text-[#302e28] leading-tight">
                                    {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                </div>
                                {savings > 0 && (
                                    <div className="text-[12px] text-[#302e28]/70">
                                        {formatCurrency(savings)} in potential savings
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}

            {/* Totals */}
            <div className="pb-5" style={{ borderBottom: '1px solid #d9d3c8', boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}>
                {analysis.provider && (
                    <div
                        className="uppercase font-medium mb-4"
                        style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#206E55' }}
                    >
                        {analysis.provider}
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">Total Billed</div>
                        <div className={`font-bold text-[#302e28] leading-none tracking-tight ${webview ? 'text-[22px]' : 'text-[28px]'}`}>
                            {formatCurrency(analysis.totalBilled)}
                        </div>
                    </div>
                    {totalPatientOwes != null && (
                        <div>
                            <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">{webview ? 'You Owe' : 'Amount Due'}</div>
                            <div className={`font-bold text-[#dc2626] leading-none tracking-tight ${webview ? 'text-[22px]' : 'text-[28px]'}`}>
                                {formatCurrency(totalPatientOwes)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bill Details */}
            {(analysis.provider || analysis.dateOfService) && (
                <div className="rounded-2xl border border-[#d9d3c8] bg-[#faf8f3] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div className="text-[14px] font-semibold text-[#302e28] mb-3">Bill Details</div>
                    <div className="space-y-2.5">
                        {analysis.provider && (
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-[#7a756a]">Provider</span>
                                <span className="text-[13px] font-medium text-[#302e28]">{analysis.provider}</span>
                            </div>
                        )}
                        {analysis.dateOfService && (
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-[#7a756a]">Date of Service</span>
                                <span className="text-[13px] font-medium text-[#302e28]">{analysis.dateOfService}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onShowRecap}
                    className="h-[48px] rounded-full text-white text-[14px] font-medium transition-all flex items-center justify-center gap-2"
                    style={{ background: '#206E55' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#185544'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#206E55'; }}
                >
                    {webview ? 'Resolve' : 'View Summary'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </motion.button>
                {onViewPdf && (
                    <button
                        type="button"
                        onClick={onViewPdf}
                        className="h-[44px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] flex items-center justify-center gap-2 text-[13px] font-medium text-[#302e28] hover:bg-[#faf8f3] transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        View PDF
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => { track('bill_analyser_start_over'); onReset(); }}
                    className="h-[44px] rounded-full border border-[#d9d3c8] bg-[#faf8f3] flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start Over
                </button>
            </div>
        </div>
    );
}

interface ResultsStepProps {
    onShowRecap: () => void;

    onViewPdf?: () => void;
    compact?: boolean;
}

export function ResultsStep({ onShowRecap, onViewPdf, compact }: ResultsStepProps) {
    const analysis = useBillAnalyserStore((s) => s.analysis);
    const reset = useBillAnalyserStore((s) => s.reset);
    const isWebview = useBillAnalyserStore((s) => s.isWebview);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const categoryNames = useMemo(() => {
        if (!analysis) return [];
        const names = new Set<string>();
        analysis.items.forEach((item) => names.add(item.category || 'Other'));
        return Array.from(names).sort();
    }, [analysis]);

    const filteredItems = useMemo(() => {
        if (!analysis) return [];
        return analysis.items
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const flagged = isFlagged(item);
                const matchesStatus = statusFilter === 'all'
                    || (statusFilter === 'flagged' && flagged)
                    || (statusFilter === 'standard' && !flagged);
                const matchesCategory = !categoryFilter || (item.category || 'Other') === categoryFilter;
                return matchesStatus && matchesCategory;
            });
    }, [analysis, statusFilter, categoryFilter]);

    if (!analysis) return null;

    const savings = analysis.potentialSavings;
    const totalPatientOwes = analysis.totalPatientOwes;
    const flaggedCount = analysis.items.filter(isFlagged).length;

    const filterAndList = (
        <>
            <FilterBar
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categoryNames={categoryNames}
                webview={isWebview}
            />
            {filteredItems.map(({ item, index }) => (
                <LineItemRow key={item.id} item={item} index={index} />
            ))}
            {filteredItems.length > 0 && (
                <div className="pt-4 pb-2 px-1 text-[12px] text-[#7a756a]">
                    Showing {filteredItems.length} of {analysis.items.length} line items
                </div>
            )}
        </>
    );

    // Desktop two-column dashboard layout (non-compact only)
    if (!compact) {
        return (
            <div className="relative pb-24 lg:pb-0 lg:h-full lg:overflow-hidden">
                {/* Mobile: single column */}
                <div className="lg:hidden px-4 pt-5">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="mb-6"
                    >
                        {flaggedCount > 0 && (
                            <button
                                type="button"
                                onClick={() => setStatusFilter('flagged')}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-5"
                                style={{ background: '#EAB308', boxShadow: '0 2px 8px rgba(234,179,8,0.25), 0 1px 2px rgba(0,0,0,0.06)' }}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#faf8f3]/25 flex items-center justify-center flex-shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    {isWebview && savings > 0 ? (
                                        <>
                                            <div className="text-[17px] font-bold text-[#302e28] leading-tight">
                                                {formatCurrency(savings)} in potential savings
                                            </div>
                                            <div className="text-[12px] text-[#302e28]/70 mt-0.5">
                                                {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-[14px] font-semibold text-[#302e28] leading-tight">
                                                {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                            </div>
                                            {savings > 0 && (
                                                <div className="text-[12px] text-[#302e28]/70">
                                                    {formatCurrency(savings)} in potential savings
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        )}

                        <div className="px-1 pb-5" style={{ borderBottom: '1px solid #d9d3c8' }}>
                            <div className="flex items-center justify-between mb-4">
                                {analysis.provider && (
                                    <div
                                        className="uppercase font-medium"
                                        style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#206E55' }}
                                    >
                                        {analysis.provider}
                                    </div>
                                )}
                                {onViewPdf && (
                                    <button type="button" onClick={onViewPdf} className="text-[11px] underline text-[#302e28]/60 font-medium">
                                        View PDF
                                    </button>
                                )}
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">Total Billed</div>
                                    <div className="font-bold text-[#302e28]" style={{ fontSize: isWebview ? 'clamp(20px, 4vw, 28px)' : 'clamp(24px, 5vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                        {formatCurrency(analysis.totalBilled)}
                                    </div>
                                </div>
                                {totalPatientOwes != null && (
                                    <>
                                        <div className="w-px self-stretch bg-[#d9d3c8] my-1" />
                                        <div className="flex-1 text-right">
                                            <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">{isWebview ? 'You Owe' : 'Amount Due'}</div>
                                            <div className="font-bold text-[#dc2626]" style={{ fontSize: isWebview ? 'clamp(20px, 4vw, 28px)' : 'clamp(24px, 5vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                                {formatCurrency(totalPatientOwes)}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        {filterAndList}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35, ease }}
                        className={`fixed bottom-9 left-0 right-0 flex items-center gap-3 px-4 z-10 `}
                    >
                        <button
                            type="button"
                            onClick={() => { track('bill_analyser_start_over'); reset(); }}
                            className="h-[52px] px-5 rounded-full border border-[#d9d3c8] bg-[#faf8f3] flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-colors flex-shrink-0 shadow-lg shadow-black/15"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Start Over
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={onShowRecap}
                            className={`h-[52px] rounded-full text-white text-[15px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/15 flex-1`}
                            style={{ background: '#206E55' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#185544'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#206E55'; }}
                        >
                            {isWebview ? 'Resolve' : 'View Summary'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </div>

                {/* Desktop: two-column dashboard, fixed height */}
                <div className="hidden lg:flex gap-8 px-8 pt-8 h-full">
                    {/* Left sidebar — scrolls independently */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="w-[300px] flex-shrink-0 overflow-y-auto pb-8"
                    >
                        <SummarySidebar
                            analysis={analysis}
                            flaggedCount={flaggedCount}
                            savings={savings}
                            totalPatientOwes={totalPatientOwes}
                            onFilterFlagged={() => setStatusFilter('flagged')}
                            onShowRecap={onShowRecap}
                            onViewPdf={onViewPdf}
                            onReset={reset}
                            webview={isWebview}
                        />
                    </motion.div>

                    {/* Right: line-by-line analysis in scrollable container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease }}
                        className="flex-1 min-w-0 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-5 flex-shrink-0">
                            <h2 className="text-[18px] font-semibold text-[#302e28]">Line-by-Line Analysis</h2>
                            <div className="flex items-center gap-4 text-[12px] text-[#7a756a]">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                                    Standard
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                                    Discrepancy
                                </span>
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <FilterBar
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                categoryFilter={categoryFilter}
                                setCategoryFilter={setCategoryFilter}
                                categoryNames={categoryNames}
                                webview={isWebview}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto mt-2 pb-8 px-1 -mx-1">
                            {filteredItems.map(({ item, index }) => (
                                <LineItemRow key={item.id} item={item} index={index} />
                            ))}
                            {filteredItems.length > 0 && (
                                <div className="pt-4 pb-2 px-1 text-[12px] text-[#7a756a]">
                                    Showing {filteredItems.length} of {analysis.items.length} line items
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Compact layout (used inside split-view right panel)
    return (
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-8 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="mb-6"
            >
                {flaggedCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setStatusFilter('flagged')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-5"
                        style={{ background: '#EAB308', boxShadow: '0 2px 8px rgba(234,179,8,0.25), 0 1px 2px rgba(0,0,0,0.06)' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-[#faf8f3]/25 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            {isWebview && savings > 0 ? (
                                <>
                                    <div className="text-[17px] font-bold text-[#302e28] leading-tight">
                                        {formatCurrency(savings)} in potential savings
                                    </div>
                                    <div className="text-[12px] text-[#302e28]/70 mt-0.5">
                                        {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-[14px] font-semibold text-[#302e28] leading-tight">
                                        {flaggedCount} charge{flaggedCount !== 1 ? 's' : ''} need a closer look
                                    </div>
                                    {savings > 0 && (
                                        <div className="text-[12px] text-[#302e28]/70">
                                            {formatCurrency(savings)} in potential savings
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#302e28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                )}

                <div className="px-1 pb-5" style={{ borderBottom: '1px solid #d9d3c8' }}>
                    <div className="flex items-center justify-between mb-4">
                        {analysis.provider && (
                            <div className="uppercase font-medium" style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#206E55' }}>
                                {analysis.provider}
                            </div>
                        )}
                        {onViewPdf && (
                            <button type="button" onClick={onViewPdf} className="text-[11px] underline text-[#302e28]/60 font-medium">
                                View PDF
                            </button>
                        )}
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">Total Billed</div>
                            <div className="font-bold text-[#302e28]" style={{ fontSize: isWebview ? 'clamp(20px, 4vw, 28px)' : 'clamp(24px, 5vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                {formatCurrency(analysis.totalBilled)}
                            </div>
                        </div>
                        {totalPatientOwes != null && (
                            <>
                                <div className="w-px self-stretch bg-[#d9d3c8] my-1" />
                                <div className="flex-1 text-right">
                                    <div className="text-[11px] font-medium uppercase tracking-wider text-[#7a756a] mb-1">{isWebview ? 'You Owe' : 'Amount Due'}</div>
                                    <div className="font-bold text-[#dc2626]" style={{ fontSize: isWebview ? 'clamp(20px, 4vw, 28px)' : 'clamp(24px, 5vw, 36px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                        {formatCurrency(totalPatientOwes)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {filterAndList}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease }}
                className={`fixed bottom-9 left-0 right-0 flex items-center gap-3 px-4 z-10 `}
            >
                <button
                    type="button"
                    onClick={() => { track('bill_analyser_start_over'); reset(); }}
                    className="h-[52px] px-5 rounded-full border border-[#d9d3c8] bg-[#faf8f3] flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#7a756a] hover:text-[#302e28] hover:border-[#c8c1b5] transition-colors flex-shrink-0 shadow-lg shadow-black/15"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start Over
                </button>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onShowRecap}
                    className={`h-[52px] rounded-full text-white text-[15px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/15 flex-1`}
                    style={{ background: '#206E55' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#185544'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#206E55'; }}
                >
                    {isWebview ? 'Resolve' : 'View Summary'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </motion.button>
            </motion.div>
        </div>
    );
}
